const STATUSES = ["Interested", "Working", "PR Submitted", "Completed"];

export default function ContributionTracker({ tracker, completedHistory = [], onStatusChange, onRemove }) {
  return (
    <section className="page-panel tracker-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">MY CONTRIBUTIONS</p>
          <h2>Contribution Tracker</h2>
          <p>Move an issue from discovery to a completed contribution.</p>
        </div>
        <div className="journey-badge">Discover → Work → PR → Complete</div>
      </div>

      {tracker.length === 0 ? (
        <div className="tracker-empty">
          <div className="empty-icon">🚀</div>
          <h3>Your tracker is empty</h3>
          <p>Find an issue and click <strong>+ Track</strong> to add it to your contribution journey.</p>
        </div>
      ) : (
        <div className="tracker-list">
          {tracker.map((item) => (
            <article className="tracker-item" key={item.id}>
              <div className="tracker-main">
                <div className="tracker-title-row">
                  <div>
                    <span className="repo-name">{item.repository}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <span className="tracker-score">{item.score}/100</span>
                </div>

                <div className="progress-steps">
                  {STATUSES.map((status, index) => {
                    const active = STATUSES.indexOf(item.status) >= index;
                    return (
                      <div className={`progress-step ${active ? "active" : ""}`} key={status}>
                        <span>{active ? "✓" : index + 1}</span>
                        <small>{status}</small>
                      </div>
                    );
                  })}
                </div>

                <div className="tracker-actions">
                  <label>
                    <span>Status</span>
                    <select
                      value={item.status}
                      onChange={(event) => onStatusChange(item.id, event.target.value)}
                    >
                      {STATUSES.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <a className="secondary-link" href={item.issueUrl} target="_blank" rel="noreferrer">
                    View Issue ↗
                  </a>
                  <button className="remove-button" onClick={() => onRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {completedHistory.length > 0 && (
        <div className="completed-history-panel">
          <div className="page-heading compact-heading">
            <div>
              <p className="section-kicker">HISTORY</p>
              <h3>Completed contributions</h3>
              <p>Completed contributions are kept separately from your active tracker, so removing one does not reset your history.</p>
            </div>
            <span className="history-count">{completedHistory.length}</span>
          </div>
          <div className="completed-history-list">
            {completedHistory.map((item) => (
              <div className="completed-history-row" key={`${item.id}-${item.completedAt || "completed"}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.repository}</span>
                </div>
                <span className="completed-badge">✓ Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
