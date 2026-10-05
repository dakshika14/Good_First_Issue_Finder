import "dotenv/config";

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: toNumber(process.env.PORT, 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  githubApiUrl: process.env.GITHUB_API_URL || "https://api.github.com",
  githubToken: process.env.GITHUB_TOKEN || "",
  useMockData: toBoolean(process.env.USE_MOCK_DATA, false),
  cacheTtlMs: toNumber(process.env.CACHE_TTL_MS, 120000),
  maxResults: Math.min(toNumber(process.env.MAX_RESULTS, 30), 100),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiApiUrl: process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses",
  openAiModel: process.env.OPENAI_MODEL || "gpt-5-mini"
};
