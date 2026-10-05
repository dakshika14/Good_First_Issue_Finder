const BEGINNER_LABELS = [
  "good first issue",
  "good-first-issue",
  "first issue",
  "beginner",
  "beginner friendly",
  "beginner-friendly",
  "easy"
];

const SKILL_RULES = [
  { skill: "Python", keywords: ["python", "pip", "pytest", "django", "flask", "pandas", "numpy"] },
  { skill: "JavaScript", keywords: ["javascript", "js", "node", "npm", "express"] },
  { skill: "TypeScript", keywords: ["typescript", "tsx"] },
  { skill: "React", keywords: ["react", "jsx", "component", "hooks"] },
  { skill: "Vue", keywords: ["vue", "nuxt"] },
  { skill: "Angular", keywords: ["angular"] },
  { skill: "Java", keywords: ["java", "spring", "maven", "gradle"] },
  { skill: "C++", keywords: ["c++", "cpp", "cmake"] },
  { skill: "C", keywords: ["c language", "gcc", "clang"] },
  { skill: "Go", keywords: ["golang", "go module"] },
  { skill: "Rust", keywords: ["rust", "cargo"] },
  { skill: "SQL", keywords: ["sql", "postgres", "postgresql", "mysql", "database", "query"] },
  { skill: "HTML/CSS", keywords: ["html", "css", "scss", "stylesheet", "frontend"] },
  { skill: "Git", keywords: ["git", "github", "pull request", "branch", "commit"] },
  { skill: "Docker", keywords: ["docker", "container", "dockerfile"] },
  { skill: "Testing", keywords: ["test", "testing", "pytest", "jest", "cypress", "unit test"] },
  { skill: "Documentation", keywords: ["readme", "documentation", "docs", "markdown"] },
  { skill: "REST API", keywords: ["api", "rest", "endpoint", "http"] },
  { skill: "Machine Learning", keywords: ["machine learning", "ml", "model", "classification", "regression", "neural network"] }
];

const HARD_SIGNALS = [
  "architecture",
  "migration",
  "breaking change",
  "performance optimization",
  "concurrency",
  "distributed",
  "security vulnerability",
  "refactor core",
  "database schema",
  "major redesign"
];

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function normalizeLabels(labels = []) {
  return [...new Set(labels.map((label) => normalize(label)).filter(Boolean))];
}

function hasAny(labels, candidates) {
  return candidates.some((candidate) => labels.includes(candidate));
}

export function classifyDifficulty({ labels = [], comments = 0, createdAt, title = "", description = "" }) {
  const normalizedLabels = normalizeLabels(labels);
  const text = `${title} ${description}`.toLowerCase();

  let score = 3;
  const reasons = [];

  if (hasAny(normalizedLabels, BEGINNER_LABELS)) {
    score -= 1;
    reasons.push("Beginner-oriented label");
  }

  if (normalizedLabels.includes("documentation")) {
    score -= 1;
    reasons.push("Documentation task");
  }

  if (normalizedLabels.includes("help wanted")) {
    reasons.push("Help wanted label");
  }

  const commentCount = Number(comments) || 0;
  if (commentCount <= 5) {
    score -= 1;
    reasons.push("Low comment count");
  } else if (commentCount >= 20) {
    score += 1;
    reasons.push("Higher comment count");
  }

  const ageDays = createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000))
    : 0;

  if (ageDays > 365) {
    score += 1;
    reasons.push("Issue is older than one year");
  }

  if (HARD_SIGNALS.some((signal) => text.includes(signal))) {
    score += 1;
    reasons.push("Contains a higher-complexity technical signal");
  }

  score = Math.max(1, Math.min(5, score));

  const names = ["", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"];

  return {
    score,
    level: names[score],
    reasons: reasons.length ? reasons : ["General issue metadata"]
  };
}

export function extractSkills({ language, labels = [], title = "", description = "", topics = [] }) {
  const text = [
    language,
    ...labels,
    title,
    description,
    ...topics
  ].join(" ").toLowerCase();

  const skills = [];

  for (const rule of SKILL_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      skills.push(rule.skill);
    }
  }

  if (language && !skills.includes(language)) {
    skills.unshift(language);
  }

  return [...new Set(skills)].slice(0, 7);
}

export function calculateSuitabilityScore(issue) {
  let score = 50;
  const labels = normalizeLabels(issue.labels);

  if (hasAny(labels, BEGINNER_LABELS)) score += 20;
  if (labels.includes("documentation")) score += 8;
  if (labels.includes("help wanted")) score += 5;

  const difficultyWeight = {
    Beginner: 15,
    Easy: 10,
    Intermediate: 4,
    Advanced: -8,
    Expert: -15
  };

  score += difficultyWeight[issue.difficulty] || 0;

  const stars = Number(issue.stars) || 0;
  if (stars >= 10000) score += 5;
  else if (stars >= 1000) score += 3;

  const comments = Number(issue.comments) || 0;
  if (comments <= 5) score += 5;
  else if (comments >= 30) score -= 5;

  return Math.max(0, Math.min(100, score));
}
