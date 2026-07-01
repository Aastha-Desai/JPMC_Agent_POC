import os
import sys
import json
import shutil
import re
from mcp.author_server import create_press_release_draft

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from groq_client import call_groq, load_prompt

PROMPT_PATH = "prompts/agent2_author_prompt.txt"
TEMPLATE_PATH = "templates/press_release.html"
CSS_PATH = "static/style.css"

DRAFT_FOLDER = "output/draft"
DRAFT_HTML_PATH = "output/draft/press_release.html"
DRAFT_CSS_PATH = "output/draft/style.css"


def clean_json_response(raw_response: str) -> str:
    text = raw_response.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "", 1).strip()

    if text.startswith("```"):
        text = text.replace("```", "", 1).strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    return text


def generate_press_release_content(user_input: str) -> dict:
    system_prompt = load_prompt(PROMPT_PATH)

    raw_response = call_groq(
        system_prompt=system_prompt,
        user_input=user_input
    )

    cleaned_response = clean_json_response(raw_response)

    try:
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        print("RAW AGENT 2 RESPONSE:")
        print(raw_response)
        raise ValueError("Agent 2 returned invalid JSON.")


def fill_template(content: dict) -> str:
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as file:
        html = file.read()

    replacements = {
        "{{TITLE}}": content.get("title", ""),
        "{{SUBTITLE_1}}": content.get("subtitle_1", ""),
        "{{SUBTITLE_2}}": content.get("subtitle_2", ""),
        "{{YEAR}}": content.get("year", ""),
        "{{DATE}}": content.get("date", ""),
        "{{LOCATION}}": content.get("location", ""),
        "{{BODY}}": content.get("body_html", "")
    }

    for placeholder, value in replacements.items():
        html = html.replace(placeholder, value)

    html = html.replace("../static/style.css", "style.css")

    return html


def author_press_release(user_input: str) -> dict:
    content = generate_press_release_content(user_input)
    final_html = fill_template(content)

    mcp_result = create_press_release_draft(
        title= content.get("title", ""),
        html_content = final_html
    )

    return{
        "status" : "success",
        "message": "Draft press release created through Author MCP Server.",
        "draft_path": mcp_result["draft_url"],
        "title": content.get("title", ""),
        "mcp_result": mcp_result
    }


if __name__ == "__main__":
    user_input = input("Enter press release content/prompt: ")
    result = author_press_release(user_input)
    print(json.dumps(result, indent=2))