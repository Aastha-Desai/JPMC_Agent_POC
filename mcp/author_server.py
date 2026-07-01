from mcp.aem_stub import create_draft_page
from mcp.request_store import create_request_record

CSS_PATH = "static/style.css"

def create_press_release_draft(title, html_content):
    """
    This simulates an MCP Author Server
    """
    draft_result = create_draft_page(
        html_content = html_content,
        css_source_path = CSS_PATH
    )

    request_record = create_request_record(
        title = title,
        draft_path = draft_result["draft_path"]
    )

    return{
        "mcp_server": "author_server",
        "message": "Draft created through Author MCP Server.",
        "draft_url": draft_result["draft_url"],
        "request": request_record
    }