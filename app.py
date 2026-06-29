import os
from flask import Flask, render_template, request, send_from_directory
from docx import Document

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
        draft_link=workflow_result.get("draft_link")
    )


@app.route("/publish", methods=["POST"])
def publish():
    publish_input = "Publish the approved current draft press release."

    workflow_result = handle_request(publish_input)

    return render_template(
        "index.html",
        message=workflow_result.get("status"),
        result=workflow_result,
        published_link=workflow_result.get("published_link")
    )


@app.route("/draft/<path:filename>")
def draft_file(filename):
    return send_from_directory(DRAFT_FOLDER, filename)


@app.route("/published/<path:filename>")
def published_file(filename):
    return send_from_directory(PUBLISHED_FOLDER, filename)


if __name__ == "__main__":
    app.run(debug=True)