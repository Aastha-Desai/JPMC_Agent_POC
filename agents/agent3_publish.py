import os
import sys
import json
import shutil

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from groq_client import call_groq, load_prompt

PROMPT_PATH = "prompts/agent3_publish_prompt.txt"

DRAFT_FOLDER = "output/draft"
PUBLISHED_FOLDER = "output/published"

DRAFT_HTML = os.path.join(DRAFT_FOLDER, "press_release.html")
DRAFT_CSS = os.path.join(DRAFT_FOLDER, "style.css")

PUBLISHED_HTML = os.path.join(PUBLISHED_FOLDER, "press_release.html")
PUBLISHED_CSS = os.path.join(PUBLISHED_FOLDER, "style.css")


def clean_json_response(raw_response: str) -> str:
    text = raw_response.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "", 1).strip()

    if text.startswith("```"):
        text = text.replace("```", "", 1).strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:
        text = text[start:end + 1]

    return text.strip()


def publish_press_release(user_input: str) -> dict:
    if not os.path.exists(DRAFT_HTML):
        return {
            "publish_decision": "DO_NOT_PUBLISH",
            "is_ready": False,
            "reason": "No draft HTML file exists.",
            "required_action": "request_missing_draft"
        }

    if not os.path.exists(DRAFT_CSS):
        return {
            "publish_decision": "DO_NOT_PUBLISH",
            "is_ready": False,
            "reason": "No draft CSS file exists.",
            "required_action": "request_missing_draft"
        }

    system_prompt = load_prompt(PROMPT_PATH)

    raw_response = call_groq(
        system_prompt=system_prompt,
        user_input=user_input
    )

    cleaned_response = clean_json_response(raw_response)

    try:
        decision = json.loads(cleaned_response)
    except json.JSONDecodeError:
        print("\nRAW AGENT 3 RESPONSE:")
        print(raw_response)
        print("\nCLEANED RESPONSE:")
        print(cleaned_response)

        return {
            "publish_decision": "DO_NOT_PUBLISH",
            "is_ready": False,
            "reason": "Agent 3 returned invalid JSON.",
            "required_action": "none"
        }

    if decision.get("publish_decision") != "APPROVE_PUBLISH":
        return decision

    os.makedirs(PUBLISHED_FOLDER, exist_ok=True)

    shutil.copyfile(DRAFT_HTML, PUBLISHED_HTML)
    shutil.copyfile(DRAFT_CSS, PUBLISHED_CSS)

    decision["published_html"] = PUBLISHED_HTML
    decision["published_css"] = PUBLISHED_CSS

    return decision


if __name__ == "__main__":
    user_input = input("Publish request: ")
    result = publish_press_release(user_input)
    print(json.dumps(result, indent=2))