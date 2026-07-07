from mcp.aem_client import AEMClient
from mcp.request_store import create_request_record

CSS_PATH = "static/style.css"


def create_press_release_draft(title, html_content):
    aem_client = AEMClient()
    aem_client.authenticate()

    draft_result = aem_client.create_press_release_page(
        title=title,
        html_content=html_content,
        css_source_path=CSS_PATH
    )

    request_record = create_request_record(
        title=title,
        draft_path=draft_result.get("draft_path")
    )

    return {
        "mcp_server": "author_server",
        "message": "Draft created through Author MCP Server.",
        "draft_url": draft_result.get("preview_url"),
        "aem_result": draft_result,
        "request": request_record
    }