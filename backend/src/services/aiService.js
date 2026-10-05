import { config } from "../config.js";

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function inferTaskType(issue) {
  const text = `${issue.title || ""} ${issue.description || ""} ${(issue.labels || []).join(" ")}`.toLowerCase();

  if (/document|readme|docs|guide/.test(text)) return "Documentation";
  if (/test|testing|spec|coverage/.test(text)) return "Testing";
  if (/bug|fix|error|incorrect|broken|crash/.test(text)) return "Bug Fix";
  if (/feature|add|implement|support/.test(text)) return "Feature";
  if (/ui|css|style|design|frontend/.test(text)) return "UI / Frontend";
  return "Code / Maintenance";
}

function buildMockSummary(issue) {
  const description = cleanText(issue.description);
  const skills = (issue.skills || []).slice(0, 5);
  const type = inferTaskType(issue);

  return {
    mode: "mock",
    summary: description
      ? `This ${type.toLowerCase()} issue asks the contributor to work on "${issue.title}". The main task can be understood from the issue description and repository context.`
      : `This issue is a ${type.toLowerCase()} task titled "${issue.title}". Open the original issue for the full implementation context.`,
    problem: description || "The issue does not provide a detailed description.",
    tasks: [
      `Understand the existing implementation related to "${issue.title}".`,
      `Make the smallest change needed to address the issue.`,
      type === "Documentation"
        ? "Check the updated documentation for clarity and completeness."
        : "Run or add relevant tests before opening a pull request."
    ],
    skills: skills.length ? skills : [issue.language || "General development", "Git"],
    difficulty: issue.difficulty || "Beginner",
    outcome: "A focused change that resolves the issue while keeping the existing project behaviour intact.",
    tip: "Read the repository's CONTRIBUTING.md and inspect nearby code before making changes."
  };
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string") return data.output_text;

  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

async function generateWithOpenAI(issue) {
  if (!config.openAiApiKey) return null;

  const prompt = [
    "You are an onboarding assistant for a beginner open-source contributor.",
    "Summarize the supplied GitHub issue without inventing requirements.",
    "Return strict JSON with keys: summary, problem, tasks, skills, difficulty, outcome, tip.",
    "tasks and skills must be arrays of short strings.",
    "difficulty must use the supplied difficulty when present.",
    "",
    `Repository: ${issue.repository}`,
    `Language: ${issue.language}`,
    `Difficulty: ${issue.difficulty}`,
    `Skills detected by the app: ${(issue.skills || []).join(", ")}`,
    `Labels: ${(issue.labels || []).join(", ")}`,
    `Title: ${issue.title}`,
    `Description: ${cleanText(issue.description)}`
  ].join("\n");

  const response = await fetch(config.openAiApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      input: prompt
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`AI provider request failed: ${response.status} ${detail}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = extractResponseText(data);
  if (!text) return null;

  try {
    return { mode: "ai", ...JSON.parse(text) };
  } catch {
    return {
      mode: "ai",
      summary: text,
      problem: cleanText(issue.description) || "See the original issue for the full problem statement.",
      tasks: ["Read the summary and verify the details against the original GitHub issue."],
      skills: issue.skills || [],
      difficulty: issue.difficulty || "Unknown",
      outcome: "Understand the requested change before starting work.",
      tip: "Treat the original GitHub issue as the source of truth."
    };
  }
}

export async function summarizeIssue(issue) {
  if (config.useMockData || !config.openAiApiKey) {
    return buildMockSummary(issue);
  }

  try {
    return (await generateWithOpenAI(issue)) || buildMockSummary(issue);
  } catch (error) {
    console.warn("AI summary unavailable; using fallback:", error.message);
    return {
      ...buildMockSummary(issue),
      mode: "fallback"
    };
  }
}
