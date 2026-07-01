import json
import os
from datetime import datetime

REQUEST_STORE_PATH = "output/request_store.json"

def _ensure_store_exists():
    os.makedirs("output", exist_ok=True)
    
    if not os.path.exists(REQUEST_STORE_PATH):
        with open(REQUEST_STORE_PATH, "w", encoding="utf-8") as file:
            json.dump([], file, indent=2)

def load_requests():
    _ensure_store_exists()

    with open(REQUEST_STORE_PATH, "r", encoding = "utf-8") as file:
        return json.load(file)
    
def save_requests(request):
    _ensure_store_exists()

    with open(REQUEST_STORE_PATH, "w", encoding = "utf-8") as file:
        json.dump(request, file, indent = 2)

def create_request_record(title, draft_path):
    request = load_requests()

    request_id = f"REQ-{len(request) + 1:04d}"

    record = {
        "request_id": request_id,
        "title": title,
        "status": "DRAFT_CREATED",
        "draft_path": draft_path,
        "published_path": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "review_stage": "REQUESTER_REVIEW"
    }

    request.append(record)
    save_requests(request)

    return record

def update_request_status(request_id, status, review_stage=None, published_path=None):
    requests = load_requests()

    for record in requests:
        if record["request_id"] == request_id:
            record["status"] = status
            record["updated_at"] = datetime.now().isoformat()

            if review_stage:
                record["review_stage"] = review_stage
            if published_path:
                record["published_path"] = published_path
            
            save_requests(requests)
            return record

    return None


def get_latest_request():
    requests = load_requests()

    if not requests:
        return None
    return requests[-1]


def get_report():
    requests = load_requests()

    report = {
        "total_requests": len(requests),
        "draft_created": 0,
        "requester_review": 0,
        "peer_review": 0,
        "manager_review": 0,
        "published": 0
    }

    for record in requests:
        if record["status"] == "DRAFT_CREATED":
            report["draft_created"] += 1
        if record["review_stage"] == "REQUESTER_REVIEW":
            report["requester_review"] += 1
        if record["review_stage"] == "PEER_REVIEW":
            report["peer_review"] += 1
        if record["review_stage"] == "MANAGER_REVIEW":
            report["manager_review"] += 1
        if record["status"] == "PUBLISHED":
            report["published"] += 1

    return report
