# Good First Issue Finder

A beginner-focused web application that discovers open GitHub issues suitable for first-time contributors.

## Project idea

The project follows the proposed ROSP solution:

User preferences → Node/Express backend → GitHub REST API → beginner-label filtering → rule-based difficulty/skill classification → structured issue cards → GitHub contribution link.

The frontend never calls GitHub directly. The backend owns GitHub API communication, filtering, classification, caching, and error handling.

## Tech stack

- Frontend: React + Vite + JavaScript + plain CSS
- Backend: Node.js + Express
- Data source: GitHub REST API
- Classification: transparent rule-based logic
- Cache: lightweight in-memory TTL cache
- Demo mode: built-in sample issues
- Persistence: browser localStorage for the contribution tracker
- AI assistance: optional issue summarization endpoint; mock summaries work without an AI key

## Added polished features

### 1. Personalized Dashboard
The dashboard summarizes discovered issues, tracked contributions, active work and completed contributions. It also shows the languages represented in the tracker and high-suitability recommendations from the latest discovery results.

### 2. Contribution Tracker
A user can add an issue directly from a result card and move it through:

`Interested → Working → PR Submitted → Completed`

Tracker data is intentionally lightweight and stored in the browser's localStorage, so no database/authentication is required for the ROSP demo.

### 3. AI Issue Explainer
Each issue has an **Explain with AI** action. The backend returns a beginner-friendly explanation containing:

- what the issue is
- the problem being addressed
- suggested tasks
- likely skills
- difficulty
- expected outcome
- a practical "before you start" tip

In mock mode the response is deterministic demo data. In live mode, an `OPENAI_API_KEY` can be supplied to use an AI provider; if no AI key is present, the backend safely falls back to the same explainable demo-style summary.

## Requirements

- Node.js 20+
- npm
- A GitHub Personal Access Token is strongly recommended for live mode because GitHub rate limits unauthenticated API requests more heavily.

## Folder structure

```text
good-first-issue-finder/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config.js
│       ├── server.js
│       ├── routes/
│       │   └── issueRoutes.js
│       ├── services/
│       │   ├── classifier.js
│       │   ├── githubService.js
│       │   └── issueService.js
│       └── utils/
│           ├── cache.js
│           └── mockData.js
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── FilterBar.jsx
│       │   ├── IssueCard.jsx
│       │   ├── IssueGrid.jsx
│       │   ├── Dashboard.jsx
│       │   ├── ContributionTracker.jsx
│       │   └── AiSummaryModal.jsx
│       │   ├── LoadingState.jsx
│       │   └── EmptyState.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── formatters.js
└── .gitignore
```

## 1. Backend setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Put your GitHub token in `.env`:

```env
GITHUB_TOKEN=github_pat_your_token_here
```

For a guaranteed demo without GitHub:

```env
USE_MOCK_DATA=true
```

Then:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

## 3. Live GitHub mode

Set:

```env
USE_MOCK_DATA=false
GITHUB_TOKEN=your_token
```

The frontend sends requests to the Express backend. Example:

```text
GET /api/issues?language=Python&topic=machine%20learning&difficulty=Beginner
```

The backend searches GitHub using beginner-friendly labels, enriches repository metadata, applies topic filtering, calculates difficulty and extracts likely skills.

## 4. Optional AI mode

The project does **not** require an AI key to run.

For the ROSP demo, keep:

```env
USE_MOCK_DATA=true
```

The **Explain with AI** button then returns a polished deterministic demo summary.

For live GitHub + AI mode:

```env
USE_MOCK_DATA=false
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_ai_key
OPENAI_MODEL=gpt-5-mini
```

The AI layer is only an explanation assistant. GitHub retrieval, filtering, difficulty classification and suitability scoring remain rule-based and explainable.

## 5. Demo mode

With:

```env
USE_MOCK_DATA=true
```

the same frontend works without a GitHub token. This is useful for UI development, screenshots and presentations.

## 6. Main API endpoints

### Health

```text
GET /api/health
```

### Issues

```text
GET /api/issues
```

Optional query parameters:

- `language`
- `topic`
- `difficulty`
- `label`
- `page`
- `perPage`

Example:

```text
/api/issues?language=JavaScript&difficulty=Beginner&perPage=12
```

### Supported filter metadata

```text
GET /api/filters
```

## 7. Rule-based difficulty

The classifier is intentionally explainable.

Signals include:

- beginner-oriented labels such as `good first issue`
- `documentation`
- `help wanted`
- issue comment count
- issue age
- issue text signals such as `refactor`, `architecture`, `migration`, `breaking change`, etc.

The final difficulty is mapped to:

- Beginner
- Easy
- Intermediate
- Advanced
- Expert

This is a heuristic, not a claim that GitHub has officially assigned the difficulty.

## 8. Important design decision

The proposed solution explicitly avoids an AI/LLM dependency. The classifier is therefore implemented as ordinary JavaScript rules that can be inspected, tested and explained during the ROSP evaluation.

## 9. Suggested demo

1. Start backend.
2. Start frontend.
3. Select Python.
4. Select Beginner.
5. Enter a topic such as `machine learning`.
6. Click Find Issues.
7. Open an issue using the GitHub button.
8. Change difficulty or language and search again.

## 10. Troubleshooting

### CORS error

Make sure backend is running on port 5000 and frontend uses:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### GitHub 401

Check that `GITHUB_TOKEN` is present and valid.

### GitHub 403 / rate limit

Use an authenticated token and wait for the reset window if the API limit has already been reached.

### No live results

Try a broader search such as:

- Language: JavaScript
- Topic: blank
- Difficulty: Any

Or temporarily use `USE_MOCK_DATA=true`.

## Academic alignment

The implementation covers the modules described in the project documents: GitHub API integration, issue retrieval, filtering, difficulty/skill classification, issue information processing, search UI, direct issue/repository linking, testing-friendly demo mode, and final integration.
