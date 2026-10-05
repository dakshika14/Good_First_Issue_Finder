const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function buildQuery(params) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "Any") search.set(key, value);
  });

  return search.toString();
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export async function getIssues(filters) {
  const query = buildQuery(filters);
  return parseResponse(
    await fetch(`${API_BASE_URL}/issues?${query}`),
    "Unable to load issues."
  );
}

export async function getFilters() {
  return parseResponse(
    await fetch(`${API_BASE_URL}/filters`),
    "Unable to load filters."
  );
}

export async function getAiSummary(issue) {
  const response = await fetch(`${API_BASE_URL}/ai/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue })
  });

  return parseResponse(response, "Unable to generate the issue summary.");
}
