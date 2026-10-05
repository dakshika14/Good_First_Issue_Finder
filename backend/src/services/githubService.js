import { config } from "../config.js";

const beginnerLabels = [
  "good first issue",
  "beginner",
  "help wanted",
  "documentation"
];

function headers() {
  const result = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Good-First-Issue-Finder/1.0"
  };

  if (config.githubToken) {
    result.Authorization = `Bearer ${config.githubToken}`;
  }

  return result;
}

async function githubFetch(path) {
  const response = await fetch(`${config.githubApiUrl}${path}`, {
    headers: headers()
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.message || "";
    } catch {
      // Keep the original status when GitHub returns a non-JSON response.
    }

    const error = new Error(`GitHub API request failed: ${response.status} ${detail}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function encodeQuery(params) {
  return encodeURIComponent(params);
}

export async function searchIssues({ language, topic, label, perPage = 30 }) {
  const selectedLabels = label
    ? [label]
    : beginnerLabels;

  const searches = selectedLabels.map((selectedLabel) => {
    const parts = ["is:issue", "is:open", `label:"${selectedLabel}"`];

    if (language) {
      parts.push(`language:${language}`);
    }

    if (topic) {
      parts.push(`"${topic}"`);
    }

    return parts.join(" ");
  });

  const results = [];

  for (const search of searches) {
    const data = await githubFetch(
      `/search/issues?q=${encodeQuery(search)}&sort=updated&order=desc&per_page=${Math.min(perPage, 30)}`
    );

    results.push(...(data.items || []));
  }

  const unique = new Map();

  for (const item of results) {
    if (!unique.has(item.id)) {
      unique.set(item.id, item);
    }
  }

  return [...unique.values()].slice(0, perPage);
}

export async function getRepository(owner, repo) {
  return githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}
