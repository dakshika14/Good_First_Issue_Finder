import { Router } from "express";
import { config } from "../config.js";
import { getIssues } from "../services/issueService.js";
import { summarizeIssue } from "../services/aiService.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "good-first-issue-finder-backend",
    githubConfigured: Boolean(config.githubToken),
    mockMode: config.useMockData,
    aiConfigured: Boolean(config.openAiApiKey),
    timestamp: new Date().toISOString()
  });
});

router.get("/filters", (req, res) => {
  res.json({
    languages: [
      "Any",
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "C",
      "Go",
      "Rust"
    ],
    difficulties: ["Any", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"],
    labels: [
      "Any",
      "good first issue",
      "beginner",
      "help wanted",
      "documentation"
    ]
  });
});

router.get("/issues", async (req, res, next) => {
  try {
    const result = await getIssues(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post("/ai/summary", async (req, res, next) => {
  try {
    if (!req.body?.issue) {
      return res.status(400).json({
        success: false,
        message: "Issue data is required."
      });
    }

    const summary = await summarizeIssue(req.body.issue);
    return res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
});

export default router;
