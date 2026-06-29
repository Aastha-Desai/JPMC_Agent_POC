from mcp.aem_stub import publish_page
from mcp.request_store import get_latest_request, update_request_status

def publish_press_release_page():
    """
    This simulates an MCP Publish Server
    """
    latest_request = get_latest_request()
    if not latest_request:
        return{
            "mcp_server": "publish_server",
            "success": False,
            "reason": "No request exists to publish."
        }
    
    publish_result = publish_page()

    if not publish_result["success"]:
        return{
            "mcp_server": "publish_server",
            "success": False,
            "reason": publish_result["reason"]
        }
    
    updated_record = update_request_status(
        request_id = latest_request["request_id"],
        status = "PUBLISHED",
        review_stage = "PUBLISHED",
        published_path = publish_result["published_path"]
    )

    return{
        "mcp_server": "publish_server",
        "success": True,
        "message": "Page published through Publish MCP Server.",
        "published_url": publish_result["published_url"],
        "request": updated_record
    }