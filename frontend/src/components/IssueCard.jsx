import { formatDate, truncate } from "../utils/formatters.js";

const difficultyClass = {
  Beginner: "difficulty beginner",
  Easy: "difficulty easy",
  Intermediate: "difficulty intermediate",
  Advanced: "difficulty advanced",
  Expert: "difficulty expert"
};

export default function IssueCard({
  issue,
  onSummarize,
  onTrack,
  isTracked = false
}) {
  return (
    <article className="issue-card">
      <div className="card-top">
        <span className="repo-name">{issue.repository}</span>
        <span className={difficultyClass[issue.difficulty] || "difficulty"}>
          {issue.difficulty}
        </span>
      </div>

      <h3>{issue.title}</h3>
      <p className="description">{truncate(issue.description)}</p>

      <div className="metadata">
        <span>💻 {issue.language}</span>
        <span>⭐ {Number(issue.stars || 0).toLocaleString()}</span>
        <span>💬 {issue.comments ?? 0}</span>
        <span>📅 {formatDate(issue.updatedAt)}</span>
      </div>

      <div className="tag-row">
        {(issue.labels || []).slice(0, 4).map((label) => (
          <span className="tag" key={label}>{label}</span>
        ))}
      </div>

      <div className="skill-section">
        <strong>Skills</strong>
        <div className="tag-row">
          {(issue.skills || []).map((skill) => (
            <span className="skill-tag" key={skill}>{skill}</span>
          ))}
        </div>
      </div>

      <div className="score-row">
        <span>Beginner suitability</span>
        <strong>{issue.score}/100</strong>
      </div>

      <div className="reason">
        <strong>Why this rating?</strong>
        <ul>
          {(issue.difficultyReasons || []).slice(0, 3).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="card-actions">
        <a className="primary-link" href={issue.issueUrl} target="_blank" rel="noreferrer">
          Open Issue ↗
        </a>
        <button
          className={`secondary-link action-button ${isTracked ? "tracked" : ""}`}
          onClick={() => onTrack(issue)}
        >
          {isTracked ? "✓ Tracked" : "+ Track"}
        </button>
      </div>

      <button className="ai-button" onClick={() => onSummarize(issue)}>
        ✨ Explain with AI
      </button>
    </article>
  );
}
