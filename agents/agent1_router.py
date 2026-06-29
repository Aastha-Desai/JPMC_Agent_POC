import os
import sys
import json
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from groq_client import call_groq, load_prompt
from agents.agent2_author import author_press_release
from agents.agent3_publish import publish_press_release

PROMPT_PATH = "prompts/agent1_intake_prompt.txt"


def clean_json_response(raw_response: str) -> str:
    text = raw_response.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "", 1).strip()

    if text.startswith("```"):
        text = text.replace("```", "", 1).strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    return text


def route_request(user_input: str) -> dict:
    system_prompt = load_prompt(PROMPT_PATH)

    raw_response = call_groq(
        system_prompt=system_prompt,
        user_input=user_input
    )

    cleaned_response = clean_json_response(raw_response)

    try:
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        return {
            "intent": "NEEDS_MORE_INFO",
            "validation": "FAILED",
            "reason": f"Agent 1 returned invalid JSON: {raw_response}",
            "next_agent": "NONE"
        }


def handle_request(user_input: str) -> dict:
    router_result = route_request(user_input)
    next_agent = router_result.get("next_agent")

    if router_result.get("validation") != "PASSED":
        return {
            "status": "failed",
            "agent_1": router_result,
            "message": router_result.get("reason")
        }

    if next_agent == "AUTHOR":
        author_result = author_press_release(user_input)

        return {
            "status": "draft_created",
            "agent_1": router_result,
            "agent_2": author_result,
            "draft_link": "/draft/press_release.html"
        }

    if next_agent == "PUBLISH":
        publish_result = publish_press_release(user_input)

        return {
            "status": "published",
            "agent_1": router_result,
            "agent_3": publish_result,
            "published_link": "/published/press_release.html"
        }

    return {
        "status": "unsupported",
        "agent_1": router_result,
        "message": "No downstream agent was selected."
    }


if __name__ == "__main__":
    user_input = input("Enter request: ")
    result = handle_request(user_input)
    print(json.dumps(result, indent=2))