import os
from pathlib import Path

from docx import Document
from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    send_from_directory,
)
from flask_cors import CORS
from werkzeug.utils import secure_filename
from validation.document_validator import validate_document_structure
from agents.agent1_router import handle_request
from mcp.request_store import (
    advance_latest_request,
    get_latest_request,
    get_report,
)

app = Flask(__name__)

# Allow the Vite React development server to call Flask.
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
)

BASE_DIRECTORY = Path(__file__).resolve().parent

UPLOAD_FOLDER = BASE_DIRECTORY / "uploads"
DRAFT_FOLDER = BASE_DIRECTORY / "output" / "draft"
PUBLISHED_FOLDER = BASE_DIRECTORY / "output" / "published"

ALLOWED_EXTENSIONS = {".docx"}

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
DRAFT_FOLDER.mkdir(parents=True, exist_ok=True)
PUBLISHED_FOLDER.mkdir(parents=True, exist_ok=True)


def extract_text_from_docx(file_path):
    """
    Extract non-empty paragraphs from a Word document.
    """
    document = Document(file_path)

    paragraphs = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs)


def is_allowed_word_document(filename):
    """
    Check whether the uploaded filename has an accepted extension.
    """
    if not filename:
        return False

    extension = Path(filename).suffix.lower()
    return extension in ALLOWED_EXTENSIONS


def build_combined_input(user_prompt, document_text):
    """
    Create the input sent to the router agent.
    """
    return f"""
User instructions:
{user_prompt}

Word document content:
{document_text}
""".strip()


def get_request_record(workflow_result):
    """
    Safely retrieve the request record returned through Agent 2/MCP.
    """
    if not isinstance(workflow_result, dict):
        return None

    agent_2_result = workflow_result.get("agent_2", {})

    if not isinstance(agent_2_result, dict):
        return None

    mcp_result = agent_2_result.get("mcp_result", {})

    if not isinstance(mcp_result, dict):
        return None

    return mcp_result.get("request")


def create_api_response(
    *,
    success,
    message,
    workflow_result=None,
    source_text="",
    source_filename=None,
    status_code=200,
):
    """
    Return a consistent JSON response for React.
    """
    workflow_result = (
        workflow_result if isinstance(workflow_result, dict) else {}
    )

    request_record = (
        get_request_record(workflow_result)
        or get_latest_request()
    )

    response_body = {
        "success": success,
        "message": message,
        "source": {
            "filename": source_filename,
            "text": source_text,
        },
        "workflow_result": workflow_result,
        "request": request_record,
        "draft_link": workflow_result.get("draft_link"),
        "published_link": workflow_result.get("published_link"),
        "report": get_report(),
    }

    return jsonify(response_body), status_code


# -------------------------------------------------------------------
# Existing Flask template routes
# -------------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    user_prompt = request.form.get("prompt", "").strip()

    uploaded_file = request.files.get("word_doc")
    document_text = ""

    if (
        uploaded_file
        and uploaded_file.filename
        and is_allowed_word_document(uploaded_file.filename)
    ):
        safe_filename = secure_filename(uploaded_file.filename)
        file_path = UPLOAD_FOLDER / safe_filename

        uploaded_file.save(file_path)
        document_text = extract_text_from_docx(file_path)

    if document_text and not user_prompt:
        user_prompt = (
            "Create a press release draft using the uploaded Word document."
        )

    combined_input = build_combined_input(
        user_prompt=user_prompt,
        document_text=document_text,
    )

    workflow_result = handle_request(combined_input)

    return render_template(
        "index.html",
        message=workflow_result.get("status"),
        result=workflow_result,
        draft_link=workflow_result.get("draft_link"),
        request_record=get_request_record(workflow_result),
        report=get_report(),
    )


@app.route("/publish", methods=["POST"])
def publish():
    latest_request = get_latest_request()

    if (
        not latest_request
        or latest_request.get("status") != "READY_FOR_PUBLISH"
    ):
        return render_template(
            "index.html",
            message=(
                "Publishing blocked. Manager approval is required "
                "before publishing."
            ),
            request_record=latest_request,
            draft_link="/draft/press_release.html",
            report=get_report(),
        )

    workflow_result = handle_request(
        "Publish the approved current draft press release."
    )

    return render_template(
        "index.html",
        message=workflow_result.get("status"),
        result=workflow_result,
        published_link=workflow_result.get("published_link"),
        request_record=get_latest_request(),
        report=get_report(),
    )


@app.route("/requester-approve", methods=["POST"])
def requester_approve():
    updated_request = advance_latest_request("PEER_REVIEW")

    return render_template(
        "index.html",
        message="Requester approved. Sent to peer review.",
        request_record=updated_request,
        draft_link="/draft/press_release.html",
        report=get_report(),
    )


@app.route("/peer-approve", methods=["POST"])
def peer_approve():
    updated_request = advance_latest_request("MANAGER_REVIEW")

    return render_template(
        "index.html",
        message="Peer approved. Sent to manager review.",
        request_record=updated_request,
        draft_link="/draft/press_release.html",
        report=get_report(),
    )


@app.route("/manager-approve", methods=["POST"])
def manager_approve():
    updated_request = advance_latest_request(
        "READY_FOR_PUBLISH",
        status="READY_FOR_PUBLISH",
    )

    return render_template(
        "index.html",
        message="Manager approved. Ready for publishing.",
        request_record=updated_request,
        draft_link="/draft/press_release.html",
        report=get_report(),
    )


@app.route("/report", methods=["GET"])
def report():
    return render_template(
        "index.html",
        message="Workflow report loaded.",
        request_record=get_latest_request(),
        report=get_report(),
    )


# -------------------------------------------------------------------
# React JSON API routes
# -------------------------------------------------------------------

@app.route("/api/requests", methods=["POST"])
def api_create_request():
    """
    Receive a Word document or prompt from React and run the agent
    workflow.
    """
    try:
        user_prompt = request.form.get("prompt", "").strip()
        uploaded_file = request.files.get("word_doc")

        document_text = ""
        source_filename = None

        if uploaded_file and uploaded_file.filename:
            if not is_allowed_word_document(uploaded_file.filename):
                return create_api_response(
                    success=False,
                    message="Only .docx Word documents are supported.",
                    status_code=400,
                )

            source_filename = secure_filename(uploaded_file.filename)

            if not source_filename:
                return create_api_response(
                    success=False,
                    message="The uploaded filename is invalid.",
                    status_code=400,
                )

            file_path = UPLOAD_FOLDER / source_filename
            uploaded_file.save(file_path)

            document_text = extract_text_from_docx(file_path)

            if not document_text:
                return create_api_response(
                    success=False,
                    message=(
                        "The Word document was uploaded, but no readable "
                        "paragraph text was found."
                    ),
                    source_filename=source_filename,
                    status_code=400,
                )
            structure_result = validate_document_structure(
                document_text
            )

            if not structure_result["valid"]:
                return jsonify(
                    {
                        "success": False,
                        "status": "STRUCTURE_REJECTED",
                        "stage": "AI_VALIDATION",
                        "message": (
                            "The document was rejected because it "
                            "does not match the required press release "
                            "structure."
                        ),
                        "issues": structure_result["issues"],
                        "source": {
                            "filename": source_filename,
                            "text": document_text,
                        },
                        "workflow": {
                            "validation": "rejected",
                            "authoring": "blocked",
                            "approval": "blocked",
                            "publish": "blocked",
                        },
                        "can_continue": False,
                    }
                ), 422

        if not document_text and not user_prompt:
            return create_api_response(
                success=False,
                message=(
                    "Upload a .docx document or provide instructions "
                    "before starting the workflow."
                ),
                status_code=400,
            )

        if document_text and not user_prompt:
            user_prompt = (
                "Create a press release draft using the uploaded "
                "Word document."
            )

        combined_input = build_combined_input(
            user_prompt=user_prompt,
            document_text=document_text,
        )

        workflow_result = handle_request(combined_input)

        if not isinstance(workflow_result, dict):
            return create_api_response(
                success=False,
                message="The agent workflow returned an invalid response.",
                source_text=document_text,
                source_filename=source_filename,
                status_code=500,
            )

        return create_api_response(
            success=True,
            message=(
                workflow_result.get("status")
                or "The press release workflow completed."
            ),
            workflow_result=workflow_result,
            source_text=document_text,
            source_filename=source_filename,
            status_code=201,
        )

    except Exception as error:
        app.logger.exception(
            "An error occurred while creating a press release request."
        )

        return create_api_response(
            success=False,
            message=f"Unable to process the request: {str(error)}",
            status_code=500,
        )


@app.route("/api/requests/latest", methods=["GET"])
def api_get_latest_request():
    latest_request = get_latest_request()

    if not latest_request:
        return jsonify(
            {
                "success": False,
                "message": "No press release request was found.",
                "request": None,
                "report": get_report(),
            }
        ), 404

    return jsonify(
        {
            "success": True,
            "message": "Latest press release request loaded.",
            "request": latest_request,
            "draft_link": "/draft/press_release.html",
            "report": get_report(),
        }
    )


@app.route(
    "/api/requests/requester-approve",
    methods=["POST"],
)
def api_requester_approve():
    latest_request = get_latest_request()

    if not latest_request:
        return jsonify(
            {
                "success": False,
                "message": "No request is available for approval.",
            }
        ), 404

    updated_request = advance_latest_request("PEER_REVIEW")

    return jsonify(
        {
            "success": True,
            "message": "Requester approved. Sent to peer review.",
            "request": updated_request,
            "draft_link": "/draft/press_release.html",
            "report": get_report(),
        }
    )


@app.route(
    "/api/requests/peer-approve",
    methods=["POST"],
)
def api_peer_approve():
    latest_request = get_latest_request()

    if not latest_request:
        return jsonify(
            {
                "success": False,
                "message": "No request is available for approval.",
            }
        ), 404

    updated_request = advance_latest_request("MANAGER_REVIEW")

    return jsonify(
        {
            "success": True,
            "message": "Peer approved. Sent to manager review.",
            "request": updated_request,
            "draft_link": "/draft/press_release.html",
            "report": get_report(),
        }
    )


@app.route(
    "/api/requests/manager-approve",
    methods=["POST"],
)
def api_manager_approve():
    latest_request = get_latest_request()

    if not latest_request:
        return jsonify(
            {
                "success": False,
                "message": "No request is available for approval.",
            }
        ), 404

    updated_request = advance_latest_request(
        "READY_FOR_PUBLISH",
        status="READY_FOR_PUBLISH",
    )

    return jsonify(
        {
            "success": True,
            "message": "Manager approved. Ready for publishing.",
            "request": updated_request,
            "draft_link": "/draft/press_release.html",
            "report": get_report(),
        }
    )


@app.route("/api/requests/publish", methods=["POST"])
def api_publish_request():
    latest_request = get_latest_request()

    if not latest_request:
        return jsonify(
            {
                "success": False,
                "message": "No request is available to publish.",
            }
        ), 404

    if latest_request.get("status") != "READY_FOR_PUBLISH":
        return jsonify(
            {
                "success": False,
                "message": (
                    "Publishing is blocked until manager approval "
                    "is completed."
                ),
                "request": latest_request,
            }
        ), 409

    try:
        workflow_result = handle_request(
            "Publish the approved current draft press release."
        )

        return create_api_response(
            success=True,
            message=(
                workflow_result.get("status")
                or "The press release was published."
            ),
            workflow_result=workflow_result,
        )

    except Exception as error:
        app.logger.exception(
            "An error occurred while publishing the press release."
        )

        return jsonify(
            {
                "success": False,
                "message": f"Unable to publish: {str(error)}",
                "request": latest_request,
            }
        ), 500


# -------------------------------------------------------------------
# Draft and published file routes
# -------------------------------------------------------------------

@app.route("/draft/<path:filename>")
def draft_file(filename):
    return send_from_directory(DRAFT_FOLDER, filename)


@app.route("/published/<path:filename>")
def published_file(filename):
    return send_from_directory(PUBLISHED_FOLDER, filename)


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )