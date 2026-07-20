import os
import shutil
import requests


class AEMClient:
    """
    AEM Client used by MCP Author and Publish Servers.

    Current prototype:
    - Uses local file operations to simulate AEM behavior.

    Future production version:
    - Replace the placeholder AEM URLs and authentication values.
    - Replace local file operations with real AEM API calls.
    """

    def __init__(self):
        # Replace these environment variables with real AEM configuration.
        self.aem_base_url = os.getenv("AEM_BASE_URL", "<REPLACE_WITH_AEM_BASE_URL>")
        self.aem_auth_url = os.getenv("AEM_AUTH_URL", "<REPLACE_WITH_AEM_AUTH_URL>")
        self.aem_client_id = os.getenv("AEM_CLIENT_ID", "<REPLACE_WITH_AEM_CLIENT_ID>")
        self.aem_client_secret = os.getenv("AEM_CLIENT_SECRET", "<REPLACE_WITH_AEM_CLIENT_SECRET>")

        self.access_token = None

        # Local prototype folders.
        self.draft_folder = "output/draft"
        self.published_folder = "output/published"

        self.draft_html = os.path.join(self.draft_folder, "press_release.html")
        self.draft_css = os.path.join(self.draft_folder, "style.css")

        self.published_html = os.path.join(self.published_folder, "press_release.html")
        self.published_css = os.path.join(self.published_folder, "style.css")

    def authenticate(self):
        """
        Authenticate with AEM.

        Prototype:
        - Returns a placeholder access token.

        Production:
        - Replace this method with the organization's AEM authentication method.
        - This may use OAuth 2.0, Adobe IMS, service credentials, or internal enterprise auth.
        """

        if self.aem_auth_url.startswith("<REPLACE"):
            self.access_token = "STUB_ACCESS_TOKEN"
            return self.access_token

        response = requests.post(
            self.aem_auth_url,
            headers={
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data={
                "client_id": self.aem_client_id,
                "client_secret": self.aem_client_secret,
                "grant_type": "client_credentials"
            },
            timeout=30
        )

        response.raise_for_status()
        self.access_token = response.json().get("access_token")

        if not self.access_token:
            raise ValueError("AEM authentication succeeded but no access_token was returned.")

        return self.access_token

    def _headers(self):
        if not self.access_token:
            self.authenticate()

        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    def create_press_release_page(self, title, html_content, css_source_path):
        """
        Create a draft press release page.

        Prototype:
        - Writes the generated press release HTML locally.
        - Copies CSS locally.
        - Returns a local draft preview URL.

        Production:
        - Replace the stub section with AEM Author API calls.
        - Expected AEM actions:
          1. Create page under the correct press release path.
          2. Apply the approved press release template.
          3. Populate title, subtitle, date, location, and body components.
          4. Return the AEM preview URL.
        """

        payload = {
            "title": title,
            "html_content": html_content,
            "template": "<REPLACE_WITH_AEM_PRESS_RELEASE_TEMPLATE>",
            "parent_path": "<REPLACE_WITH_AEM_PRESS_RELEASE_PARENT_PATH>",
            "components": {
                "body": html_content
            }
        }

        # Prototype stub behavior.
        # Remove this block when real AEM APIs are connected.
        if self.aem_base_url.startswith("<REPLACE"):
            os.makedirs(self.draft_folder, exist_ok=True)

            with open(self.draft_html, "w", encoding="utf-8") as file:
                file.write(html_content)

            shutil.copyfile(css_source_path, self.draft_css)

            return {
                "success": True,
                "mode": "STUB",
                "message": "Stub AEM draft page created locally.",
                "title": title,
                "aem_path": "/content/news/press-releases/stub-page",
                "preview_url": "/draft/press_release.html",
                "draft_path": self.draft_html,
                "payload_preview": payload
            }

        # Production-style AEM API call. 
        # Replace endpoint path with the organization's real AEM page creation endpoint.
        create_page_url = f"{self.aem_base_url}/<REPLACE_WITH_AEM_CREATE_PAGE_ENDPOINT>"

        response = requests.post(
            create_page_url,
            headers=self._headers(),
            json=payload,
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        return {
            "success": True,
            "mode": "AEM",
            "message": "AEM draft page created.",
            "aem_path": data.get("aem_path"),
            "preview_url": data.get("preview_url"),
            "raw_response": data
        }

    def update_press_release_component(self, page_path, component_payload):
        """
        Update AEM page components.

        Prototype:
        - Returns a stub success response.

        Production:
        - Replace endpoint with the organization's real component update endpoint.
        - Expected AEM actions:
          1. Locate the press release page.
          2. Update title/subtitle/body/date/location components.
          3. Return update status.
        """

        if self.aem_base_url.startswith("<REPLACE"):
            return {
                "success": True,
                "mode": "STUB",
                "message": "Stub AEM component update completed.",
                "page_path": page_path,
                "component_payload": component_payload
            }

        update_component_url = f"{self.aem_base_url}/<REPLACE_WITH_AEM_COMPONENT_UPDATE_ENDPOINT>"

        response = requests.post(
            update_component_url,
            headers=self._headers(),
            json={
                "page_path": page_path,
                "components": component_payload
            },
            timeout=30
        )

        response.raise_for_status()

        return {
            "success": True,
            "mode": "AEM",
            "message": "AEM components updated.",
            "raw_response": response.json()
        }

    def publish_page(self, page_path=None):
        """
        Publish an approved press release page.

        Prototype:
        - Copies local draft files into the published folder.

        Production:
        - Replace the stub section with AEM Publish API calls.
        - Expected AEM actions:
          1. Validate the draft page exists.
          2. Trigger AEM publish/replication workflow.
          3. Return live page URL.
        """

        page_path = page_path or "/content/news/press-releases/stub-page"

        # Prototype stub behavior.
        # Remove this block when real AEM APIs are connected.
        if self.aem_base_url.startswith("<REPLACE"):
            if not os.path.exists(self.draft_html):
                return {
                    "success": False,
                    "mode": "STUB",
                    "reason": "Draft HTML does not exist."
                }

            if not os.path.exists(self.draft_css):
                return {
                    "success": False,
                    "mode": "STUB",
                    "reason": "Draft CSS does not exist."
                }

            os.makedirs(self.published_folder, exist_ok=True)

            shutil.copyfile(self.draft_html, self.published_html)
            shutil.copyfile(self.draft_css, self.published_css)

            return {
                "success": True,
                "mode": "STUB",
                "message": "Stub AEM page published locally.",
                "aem_path": page_path,
                "live_url": "/published/press_release.html",
                "published_path": self.published_html
            }

        publish_url = f"{self.aem_base_url}/<REPLACE_WITH_AEM_PUBLISH_ENDPOINT>"

        response = requests.post(
            publish_url,
            headers=self._headers(),
            json={
                "page_path": page_path
            },
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        return {
            "success": True,
            "mode": "AEM",
            "message": "AEM page published.",
            "live_url": data.get("live_url"),
            "aem_path": data.get("aem_path", page_path),
            "raw_response": data
        }