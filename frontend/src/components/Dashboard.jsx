function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ tracker, completedHistory = [], searchedCount, recommendations, onTrack }) {
  const completed = completedHistory.length;
  const active = tracker.filter((item) => ["Interested", "Working", "PR Submitted"].includes(item.status)).length;

  const languageCounts = tracker.reduce((acc, item) => {
    const language = item.language || "Other";
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  const languages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <section className="page-panel dashboard-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">OVERVIEW</p>
          <h2>Your open-source journey</h2>
          <p>Track what you discovered and what you are ready to contribute.</p>
        </div>
        <div className="journey-badge">🌱 Keep contributing</div>
      </div>

      <div className="stats-grid">
        <StatCard value={searchedCount} label="Issues discovered" icon="🔎" />
        <StatCard value={tracker.length} label="Tracked issues" icon="📌" />
        <StatCard value={active} label="Active contributions" icon="🚀" />
        <StatCard value={completed} label="Completed" icon="✓" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="mini-label">YOUR FOCUS</span>
              <h3>Languages in your tracker</h3>
            </div>
          </div>
          {languages.length === 0 ? (
            <div className="dashboard-empty">Track an issue to start building your contribution profile.</div>
          ) : (
            <div className="language-bars">
              {languages.map(([language, count]) => (
                <div className="language-row" key={language}>
                  <div><span>{language}</span><strong>{count}</strong></div>
                  <div className="bar"><i style={{ width: `${Math.min(100, count * 25)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="mini-label">RECOMMENDED NEXT</span>
              <h3>High-suitability issues</h3>
            </div>
          </div>
          {recommendations.length === 0 ? (
            <div className="dashboard-empty">Search for issues to get recommendations here.</div>
          ) : (
            <div className="recommendation-list">
              {recommendations.slice(0, 3).map((issue) => (
                <div className="recommendation-item" key={issue.id}>
                  <div>
                    <strong>{issue.title}</strong>
                    <span>{issue.repository}</span>
                  </div>
                  <button onClick={() => onTrack(issue)}>+ Track</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card completed-history-card">
        <div className="card-heading">
          <div>
            <span className="mini-label">CONTRIBUTION HISTORY</span>
            <h3>Completed contributions</h3>
          </div>
          <span className="history-count">{completedHistory.length}</span>
        </div>
        {completedHistory.length === 0 ? (
          <div className="dashboard-empty">Completed contributions will stay here even after you remove them from the active tracker.</div>
        ) : (
          <div className="recommendation-list">
            {completedHistory.slice(0, 5).map((item) => (
              <div className="recommendation-item history-item" key={`${item.id}-${item.completedAt || "completed"}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.repository}</span>
                </div>
                <span className="completed-badge">✓ Completed</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
