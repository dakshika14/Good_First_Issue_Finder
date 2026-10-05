import express from "express";
import cors from "cors";
import { config } from "./config.js";
import issueRoutes from "./routes/issueRoutes.js";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Good First Issue Finder API",
    status: "running",
    docs: {
      health: "/api/health",
      filters: "/api/filters",
      issues: "/api/issues"
    }
  });
});

app.use("/api", issueRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  const status = error.status === 403 ? 503 : error.status || 500;

  res.status(status).json({
    success: false,
    message:
      error.status === 403
        ? "GitHub API rate limit or permission limit reached. Add/use a GitHub token or wait for the reset window."
        : error.message || "Internal server error"
  });
});

app.listen(config.port, () => {
  console.log(`Good First Issue Finder backend running at http://localhost:${config.port}`);
  console.log(`Mock mode: ${config.useMockData}`);
});
