import re
from typing import Any


REQUIRED_FIELDS = {
    "title": re.compile(
        r"^\s*title\s*:\s*(.+)$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "announcement_date": re.compile(
        r"^\s*announcement\s+date\s*:\s*(.+)$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "location": re.compile(
        r"^\s*location\s*:\s*(.+)$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "key_points": re.compile(
        r"^\s*key\s+points?\s*:\s*$",
        re.IGNORECASE | re.MULTILINE,
    ),
}


def _build_issue(
    *,
    code: str,
    field: str,
    message: str,
) -> dict[str, str]:
    return {
        "code": code,
        "field": field,
        "message": message,
    }


def _extract_key_points(document_text: str) -> list[str]:
    """
    Return non-empty lines appearing after the Key Points heading
    and before another recognized section such as Quote or Contact.
    """
    lines = [
        line.strip()
        for line in document_text.splitlines()
    ]

    key_points: list[str] = []
    inside_key_points = False

    ending_headings = {
        "quote:",
        "contact:",
        "contacts:",
        "media contact:",
        "about:",
    }

    for line in lines:
        normalized_line = line.lower()

        if normalized_line in {"key points:", "key point:"}:
            inside_key_points = True
            continue

        if inside_key_points and normalized_line in ending_headings:
            break

        if inside_key_points and line:
            key_points.append(line)

    return key_points


def validate_document_structure(
    document_text: str,
) -> dict[str, Any]:
    """
    Validate the minimum structure required before the agent
    authoring workflow may begin.
    """
    issues: list[dict[str, str]] = []

    cleaned_text = document_text.strip()

    if not cleaned_text:
        return {
            "valid": False,
            "status": "STRUCTURE_REJECTED",
            "issues": [
                _build_issue(
                    code="EMPTY_DOCUMENT",
                    field="document",
                    message=(
                        "The uploaded document contains no readable text."
                    ),
                )
            ],
        }

    if len(cleaned_text) < 100:
        issues.append(
            _build_issue(
                code="DOCUMENT_TOO_SHORT",
                field="document",
                message=(
                    "The document is too short to create a complete "
                    "press release."
                ),
            )
        )

    title_match = REQUIRED_FIELDS["title"].search(cleaned_text)

    if not title_match or not title_match.group(1).strip():
        issues.append(
            _build_issue(
                code="MISSING_TITLE",
                field="title",
                message=(
                    'Add a title using the format "Title: Your title".'
                ),
            )
        )

    date_match = REQUIRED_FIELDS["announcement_date"].search(
        cleaned_text
    )

    if not date_match or not date_match.group(1).strip():
        issues.append(
            _build_issue(
                code="MISSING_ANNOUNCEMENT_DATE",
                field="announcement_date",
                message=(
                    "Add an announcement date using the format "
                    '"Announcement Date: Month Day, Year".'
                ),
            )
        )

    location_match = REQUIRED_FIELDS["location"].search(
        cleaned_text
    )

    if not location_match or not location_match.group(1).strip():
        issues.append(
            _build_issue(
                code="MISSING_LOCATION",
                field="location",
                message=(
                    'Add a location using the format '
                    '"Location: City, State".'
                ),
            )
        )

    if not REQUIRED_FIELDS["key_points"].search(cleaned_text):
        issues.append(
            _build_issue(
                code="MISSING_KEY_POINTS_SECTION",
                field="key_points",
                message='Add a section labeled "Key Points:".',
            )
        )
    else:
        key_points = _extract_key_points(cleaned_text)

        if len(key_points) < 2:
            issues.append(
                _build_issue(
                    code="INSUFFICIENT_KEY_POINTS",
                    field="key_points",
                    message=(
                        "Include at least two separate items under "
                        "the Key Points section."
                    ),
                )
            )

    return {
        "valid": len(issues) == 0,
        "status": (
            "STRUCTURE_VALID"
            if len(issues) == 0
            else "STRUCTURE_REJECTED"
        ),
        "issues": issues,
    }