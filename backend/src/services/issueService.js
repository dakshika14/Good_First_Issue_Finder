import { config } from "../config.js";
import { getCache, setCache } from "../utils/cache.js";
import { mockIssues } from "../utils/mockData.js";
import {
  calculateSuitabilityScore,
  classifyDifficulty,
  extractSkills,
  normalizeLabels
} from "./classifier.js";
import { getRepository, searchIssues } from "./githubService.js";

function parseRepository(fullName) {
  const [owner, repo] = String(fullName || "").split("/");
  return { owner, repo };
}

function matchesTopic(issue, topic) {
  if (!topic) return true;

  const wanted = topic.toLowerCase().trim();
  if (!wanted) return true;

  const searchable = [
    issue.repository,
    issue.title,
    issue.description,
    ...(issue.topics || [])
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(wanted);
}

function matchesLanguage(issue, language) {
  if (!language) return true;
  return String(issue.language || "").toLowerCase() === language.toLowerCase();
}

function matchesDifficulty(issue, difficulty) {
  if (!difficulty || difficulty === "Any") return true;
  return issue.difficulty === difficulty;
}

function mapGitHubIssue(item, repository) {
  const labels = normalizeLabels((item.labels || []).map((label) => label.name));

  const classification = classifyDifficulty({
    labels,
    comments: item.comments,
    createdAt: item.created_at,
    title: item.title,
    description: item.body || ""
  });

  const issue = {
    id: item.id,
    number: item.number,
    title: item.title,
    description: item.body || "No description provided.",
    repository: item.repository_url?.replace("https://api.github.com/repos/", "") || "",
    repositoryUrl: item.html_url?.split("/issues/")[0] || "",
    issueUrl: item.html_url,
    language: repository?.language || "Unknown",
    topics: repository?.topics || [],
    labels,
    stars: repository?.stargazers_count || 0,
    contributors: null,
    updatedAt: item.updated_at,
    createdAt: item.created_at,
    comments: item.comments || 0,
    difficulty: classification.level,
    difficultyScore: classification.score,
    difficultyReasons: classification.reasons,
    skills: extractSkills({
      language: repository?.language,
      labels,
      title: item.title,
      description: item.body || "",
      topics: repository?.topics || []
    })
  };

  issue.score = calculateSuitabilityScore(issue);
  return issue;
}

async function enrichItems(items) {
  const repositoryCache = new Map();

  const output = [];

  for (const item of items) {
    const fullName = item.repository_url?.replace("https://api.github.com/repos/", "");

    if (!fullName) continue;

    let repository = repositoryCache.get(fullName);

    if (!repository) {
      const { owner, repo } = parseRepository(fullName);
      repository = await getRepository(owner, repo);
      repositoryCache.set(fullName, repository);
    }

    output.push(mapGitHubIssue(item, repository));
  }

  return output;
}

export async function getIssues(filters) {
  const normalized = {
    language: filters.language?.trim() || "",
    topic: filters.topic?.trim() || "",
    difficulty: filters.difficulty || "Any",
    label: filters.label?.trim() || "",
    page: Number(filters.page) || 1,
    perPage: Math.min(Math.max(Number(filters.perPage) || 20, 1), config.maxResults)
  };

  const cacheKey = JSON.stringify(normalized);
  const cached = getCache(cacheKey);

  if (cached) return cached;

  if (config.useMockData) {
    let data = [...mockIssues];

    if (normalized.language) {
      data = data.filter((issue) => matchesLanguage(issue, normalized.language));
    }

    if (normalized.topic) {
      data = data.filter((issue) => matchesTopic(issue, normalized.topic));
    }

    if (normalized.difficulty !== "Any") {
      data = data.filter((issue) => matchesDifficulty(issue, normalized.difficulty));
    }

    if (normalized.label) {
      data = data.filter((issue) =>
        issue.labels.some((current) => current.toLowerCase() === normalized.label.toLowerCase())
      );
    }

    data.sort((a, b) => b.score - a.score);

    const result = {
      source: "mock",
      count: data.length,
      page: normalized.page,
      perPage: normalized.perPage,
      issues: data.slice(0, normalized.perPage)
    };

    setCache(cacheKey, result, config.cacheTtlMs);
    return result;
  }

  const rawIssues = await searchIssues(normalized);
  let issues = await enrichItems(rawIssues);

  issues = issues.filter((issue) => matchesLanguage(issue, normalized.language));
  issues = issues.filter((issue) => matchesTopic(issue, normalized.topic));
  issues = issues.filter((issue) => matchesDifficulty(issue, normalized.difficulty));

  if (normalized.label) {
    issues = issues.filter((issue) =>
      issue.labels.includes(normalized.label.toLowerCase())
    );
  }

  issues.sort((a, b) => b.score - a.score);

  const result = {
    source: "github",
    count: issues.length,
    page: normalized.page,
    perPage: normalized.perPage,
    issues
  };

  setCache(cacheKey, result, config.cacheTtlMs);
  return result;
}
