const API_BASE_URL = "http://127.0.0.1:5000";

async function parseResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The Flask server returned a response that was not valid JSON.",
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        `The request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function createPressReleaseRequest({
  file,
  prompt,
}) {
  const formData = new FormData();

  if (file) {
    formData.append("word_doc", file);
  }

  if (prompt?.trim()) {
    formData.append("prompt", prompt.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/api/requests`,
    {
      method: "POST",
      body: formData,
    },
  );

  return parseResponse(response);
}

export async function getLatestPressReleaseRequest() {
  const response = await fetch(
    `${API_BASE_URL}/api/requests/latest`,
    {
      method: "GET",
    },
  );

  return parseResponse(response);
}

export function buildBackendUrl(path) {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}