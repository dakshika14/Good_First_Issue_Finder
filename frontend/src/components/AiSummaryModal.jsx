import { useEffect, useState } from "react";
import { getAiSummary } from "../services/api.js";

export default function AiSummaryModal({ issue, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAiSummary(issue)
      .then((data) => {
        if (!cancelled) setSummary(data.summary);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="summary-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="mini-label">AI ISSUE EXPLAINER</span>
            <h2>{issue.title}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading && (
          <div className="summary-loading">
            <div className="summary-spinner" />
            <p>Preparing a beginner-friendly explanation...</p>
          </div>
        )}

        {error && <div className="error-box"><strong>Summary unavailable.</strong><span>{error}</span></div>}

        {summary && !error && (
          <div className="summary-content">
            <div className="summary-mode">
              {summary.mode === "mock" && "Demo summary"}
              {summary.mode === "ai" && "AI generated"}
              {summary.mode === "fallback" && "Fallback explanation"}
            </div>

            <section>
              <h4>What is the issue?</h4>
              <p>{summary.summary}</p>
            </section>

            <section>
              <h4>The problem</h4>
              <p>{summary.problem}</p>
            </section>

            <section>
              <h4>What you need to do</h4>
              <ul>{(summary.tasks || []).map((task) => <li key={task}>{task}</li>)}</ul>
            </section>

            <div className="summary-two-col">
              <section>
                <h4>Skills</h4>
                <div className="tag-row">{(summary.skills || []).map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div>
              </section>
              <section>
                <h4>Difficulty</h4>
                <span className="difficulty beginner">{summary.difficulty}</span>
              </section>
            </div>

            <section className="tip-box">
              <strong>💡 Before you start</strong>
              <p>{summary.tip}</p>
            </section>

            <a className="primary-link modal-github-link" href={issue.issueUrl} target="_blank" rel="noreferrer">
              Read Original GitHub Issue ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
