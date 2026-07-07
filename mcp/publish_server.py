from mcp.aem_client import AEMClient
from mcp.request_store import get_latest_request, update_request_status


def publish_press_release_page():
    """
    MCP Publish Server

    Current prototype:
    - Uses the AEMClient stub to simulate publishing.

    Future:
    - The AEMClient will call the organization's real AEM Publish APIs.
    """

    latest_request = get_latest_request()

    if not latest_request:
        return {
            "mcp_server": "publish_server",
            "success": False,
            "reason": "No request exists to publish."
        }

    aem_client = AEMClient()
    aem_client.authenticate()

    publish_result = aem_client.publish_page(
        page_path=latest_request.get("draft_path")
    )

    if not publish_result.get("success"):
        return {
            "mcp_server": "publish_server",
            "success": False,
            "reason": publish_result.get("reason")
        }

    updated_record = update_request_status(
        request_id=latest_request["request_id"],
        status="PUBLISHED",
        review_stage="PUBLISHED",
        published_path=publish_result.get("published_path")
    )

    return {
        "mcp_server": "publish_server",
        "success": True,
        "message": "Page published through Publish MCP Server.",
        "published_url": publish_result.get("live_url"),
        "aem_result": publish_result,
        "request": updated_record
    }