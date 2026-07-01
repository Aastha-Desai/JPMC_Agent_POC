import os
import shutil

DRAFT_FOLDER = "output/draft"
PUBLISHED_FOLDER = "output/published"

DRAFT_HTML = os.path.join(DRAFT_FOLDER, "press_release.html")
DRAFT_CSS = os.path.join(DRAFT_FOLDER, "style.css")

PUBLISHED_HTML = os.path.join(PUBLISHED_FOLDER, "press_release.html")
PUBLISHED_CSS = os.path.join(PUBLISHED_FOLDER, "style.css")

def create_draft_page(html_content, css_source_path):
    os.makedirs(DRAFT_FOLDER, exist_ok = True)

    with open(DRAFT_HTML, "w", encoding = "utf-8") as file:
        file.write(html_content)
    
    shutil.copyfile(css_source_path, DRAFT_CSS)

    return{
        "draft_path": DRAFT_HTML,
        "draft_url": "/draft/press_release.html",
        "status": "DRAFT_CREATED"
    }

def publish_page():
    if not os.path.exists(DRAFT_HTML):
        return{
            "success": False,
            "reason": "Draft HTML does not exist."
        }
    
    if not os.path.exists(DRAFT_CSS):
        return{
            "success": False,
            "reason": "Draft CSS does not exist."
        }
    
    os.makedirs(PUBLISHED_FOLDER, exist_ok = True)

    shutil.copyfile(DRAFT_HTML, PUBLISHED_HTML)
    shutil.copyfile(DRAFT_CSS, PUBLISHED_CSS)

    return{
        "success": True,
        "published_path": PUBLISHED_HTML,
        "published_url": "/published/press_release.html",
        "status": "PUBLISHED"
    }