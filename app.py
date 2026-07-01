import os
from flask import Flask, render_template, request, send_from_directory
from docx import Document
from mcp.request_store import advance_latest_request, get_latest_request, get_report
from agents.agent1_router import handle_request

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
DRAFT_FOLDER = "output/draft"
PUBLISHED_FOLDER = "output/published"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DRAFT_FOLDER, exist_ok=True)
os.makedirs(PUBLISHED_FOLDER, exist_ok=True)


def extract_text_from_docx(file_path):
    document = Document(file_path)
    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    user_prompt = request.form.get("prompt", "").strip()

    uploaded_file = request.files.get("word_doc")
    document_text = ""

    if uploaded_file and uploaded_file.filename.endswith(".docx"):
        file_path = os.path.join(UPLOAD_FOLDER, uploaded_file.filename)
        uploaded_file.save(file_path)
        document_text = extract_text_from_docx(file_path)

    if document_text and not user_prompt:
        user_prompt = "Create a press release draft using the uploaded Word document."

    combined_input = f"""
User instructions:
{user_prompt}

Word document content:
{document_text}
"""

    workflow_result = handle_request(combined_input)

    return render_template(
        "index.html",
        message=workflow_result.get("status"),
        result=workflow_result,
        draft_link=workflow_result.get("draft_link"),
        request_record=workflow_result.get("agent_2", {}).get("mcp_result", {}).get("request"),
        report = get_report()
    )


@app.route("/publish", methods=["POST"])
def publish():
    latest_request = get_latest_request()

    if not latest_request or latest_request.get("status") != "READY_FOR_PUBLISH":
        return render_template(
            "index.html",
            message="Publishing blocked. Manager approval is required before publishing.",
            request_record=latest_request,
            draft_link="/draft/press_release.html",
            report=get_report()
        )

    publish_input = "Publish the approved current draft press release."

    workflow_result = handle_request(publish_input)

    return render_template(
        "index.html",
        message=workflow_result.get("status"),
        result=workflow_result,
        published_link=workflow_result.get("published_link"),
        request_record=get_latest_request(),
        report=get_report()
    )


@app.route("/draft/<path:filename>")
def draft_file(filename):
    return send_from_directory(DRAFT_FOLDER, filename)


@app.route("/published/<path:filename>")
def published_file(filename):
    return send_from_directory(PUBLISHED_FOLDER, filename)

@app.route("/requester-approve", methods=["POST"])
def requester_approve():
    updated_request = advance_latest_request("PEER_REVIEW")

    return render_template(
        "index.html",
        message="Requester approved. Sent to peer review.",
        request_record=updated_request,
        draft_link="/draft/press_release.html",
        report=get_report()
    )


@app.route("/peer-approve", methods=["POST"])
def peer_approve():
    updated_request = advance_latest_request("MANAGER_REVIEW")

    return render_template(
        "index.html",
        message="Peer approved. Sent to manager review.",
        request_record=updated_request,
        draft_link="/draft/press_release.html",
        report=get_report()
    )


@app.route("/manager-approve", methods=["POST"])
def manager_approve():
    updated_request = advance_latest_request(
        "READY_FOR_PUBLISH",
        status="READY_FOR_PUBLISH"
    )

    return render_template(
        "index.html",
        message="Manager approved. Ready for publishing.",
        request_record=updated_request,
        draft_link="/draft/press_release.html",
        report=get_report()
    )

@app.route("/report", methods=["GET"])
def report():
    return render_template(
        "index.html",
        message = "Workflow report loaded.",
        request_record = get_latest_request(),
        report = get_report()
    )

if __name__ == "__main__":
    app.run(debug=True)