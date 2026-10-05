import { useEffect, useMemo, useState } from "react";
import FilterBar from "./components/FilterBar.jsx";
import IssueGrid from "./components/IssueGrid.jsx";
import LoadingState from "./components/LoadingState.jsx";
import EmptyState from "./components/EmptyState.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ContributionTracker from "./components/ContributionTracker.jsx";
import AiSummaryModal from "./components/AiSummaryModal.jsx";
import { getFilters, getIssues } from "./services/api.js";

const initialFilters = {
  languages: ["Any"],
  difficulties: ["Any", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"],
  labels: ["Any", "good first issue", "beginner", "help wanted", "documentation"]
};

const initialValues = {
  language: "Any",
  topic: "",
  difficulty: "Any",
  label: "Any"
};

const STORAGE_KEY = "gfi-contribution-tracker-v1";
const HISTORY_KEY = "gfi-completed-contributions-v1";
const SEARCH_COUNT_KEY = "gfi-search-count-v1";

function readStoredTracker() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function readStoredHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function buildInitialHistory() {
  const history = readStoredHistory();
  if (history.length > 0) return history;

  // One-time migration: preserve any issues that were already marked
  // Completed in the old tracker-only implementation.
  return readStoredTracker()
    .filter((item) => item.status === "Completed")
    .map((item) => ({
      ...item,
      completedAt: item.completedAt || item.updatedAt || new Date().toISOString()
    }));
}

export default function App() {
  const [activePage, setActivePage] = useState("discover");
  const [filters, setFilters] = useState(initialFilters);
  const [values, setValues] = useState(initialValues);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [tracker, setTracker] = useState(readStoredTracker);
  const [completedHistory, setCompletedHistory] = useState(buildInitialHistory);
  const [searchedCount, setSearchedCount] = useState(
    () => Number(localStorage.getItem(SEARCH_COUNT_KEY)) || 0
  );
  const [summaryIssue, setSummaryIssue] = useState(null);

  useEffect(() => {
    getFilters()
      .then((data) => {
        setFilters({
          languages: data.languages || initialFilters.languages,
          difficulties: data.difficulties || initialFilters.difficulties,
          labels: data.labels || initialFilters.labels
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
  }, [tracker]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(completedHistory));
  }, [completedHistory]);

  function incrementSearchCount(count) {
    const next = searchedCount + count;
    setSearchedCount(next);
    localStorage.setItem(SEARCH_COUNT_KEY, String(next));
  }

  async function searchIssues() {
    setActivePage("discover");
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const data = await getIssues({
        language: values.language,
        topic: values.topic,
        difficulty: values.difficulty,
        label: values.label,
        perPage: 20
      });

      setIssues(data.issues || []);
      setSource(data.source || "");
      incrementSearchCount(data.count || data.issues?.length || 0);
    } catch (requestError) {
      setIssues([]);
      setSource("");
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function trackIssue(issue) {
    setTracker((current) => {
      if (current.some((item) => String(item.id) === String(issue.id))) return current;
      return [
        {
          ...issue,
          status: "Interested",
          trackedAt: new Date().toISOString()
        },
        ...current
      ];
    });
  }

  function updateTrackerStatus(id, status) {
    setTracker((current) =>
      current.map((item) =>
        String(item.id) === String(id)
          ? { ...item, status, ...(status === "Completed" ? { completedAt: item.completedAt || new Date().toISOString() } : {}) }
          : item
      )
    );

    if (status === "Completed") {
      setCompletedHistory((current) => {
        const item = tracker.find((entry) => String(entry.id) === String(id));
        if (!item || current.some((entry) => String(entry.id) === String(id))) return current;

        return [
          {
            ...item,
            status: "Completed",
            completedAt: item.completedAt || new Date().toISOString()
          },
          ...current
        ];
      });
    }
  }

  function removeFromTracker(id) {
    setTracker((current) => current.filter((item) => String(item.id) !== String(id)));
  }

  const trackedIds = useMemo(
    () => new Set(tracker.map((item) => String(item.id))),
    [tracker]
  );

  const recommendations = useMemo(
    () => [...issues].sort((a, b) => b.score - a.score),
    [issues]
  );

  return (
    <div className="app-shell">
      <header className="hero compact-hero">
        <nav className="navbar">
          <button className="brand brand-button" onClick={() => setActivePage("discover")}>
            <span className="brand-mark">GF</span>
            <span>Good First Issue Finder</span>
          </button>

          <div className="nav-links">
            <button className={activePage === "discover" ? "nav-link active" : "nav-link"} onClick={() => setActivePage("discover")}>
              Discover
            </button>
            <button className={activePage === "dashboard" ? "nav-link active" : "nav-link"} onClick={() => setActivePage("dashboard")}>
              Dashboard
            </button>
            <button className={activePage === "tracker" ? "nav-link active" : "nav-link"} onClick={() => setActivePage("tracker")}>
              Tracker {tracker.length > 0 && <span className="nav-count">{tracker.length}</span>}
            </button>
          </div>

          <span className="nav-badge">ROSP Project</span>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">BEGINNER-FRIENDLY OPEN SOURCE</p>
            <h1>{activePage === "discover" ? "Find your first GitHub contribution." : activePage === "dashboard" ? "Your contribution journey." : "Turn issues into contributions."}</h1>
            <p className="hero-text">
              {activePage === "discover"
                ? "Discover beginner-friendly GitHub issues using transparent difficulty, skill and suitability signals."
                : activePage === "dashboard"
                  ? "A simple overview of the issues you discovered and the contributions you are building."
                  : "Track selected issues from your first interest to a submitted pull request and completion."}
            </p>
          </div>

          <div className="hero-visual">
            <div className="orbit-card">
              <span>{activePage === "discover" ? "✓" : activePage === "dashboard" ? "📊" : "🚀"}</span>
              <div>
                <strong>{activePage === "discover" ? "Good First Issue" : activePage === "dashboard" ? "Open Source Dashboard" : "Contribution Tracker"}</strong>
                <small>{activePage === "discover" ? "Ready to explore" : "Built for beginners"}</small>
              </div>
            </div>
            <div className="orbit-card secondary-orbit">
              <span>✨</span>
              <div>
                <strong>AI Explainer</strong>
                <small>Understand issues faster</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activePage === "discover" && (
          <>
            <section className="intro-section">
              <div>
                <p className="section-kicker">DISCOVER</p>
                <h2>What are you ready to contribute?</h2>
                <p>Choose your preferences and the backend will collect and classify matching GitHub issues.</p>
              </div>
              <div className="architecture-mini">
                <span>User</span><b>→</b><span>Express API</span><b>→</b><span>GitHub</span>
              </div>
            </section>

            <FilterBar
              filters={filters}
              values={values}
              onChange={updateValue}
              onSearch={searchIssues}
              loading={loading}
            />

            {error && (
              <div className="error-box">
                <strong>Could not load issues.</strong>
                <span>{error}</span>
              </div>
            )}

            <section className="results-section">
              <div className="results-header">
                <div>
                  <p className="section-kicker">RESULTS</p>
                  <h2>{hasSearched ? `${issues.length} opportunities found` : "Start exploring"}</h2>
                </div>
                {source && <span className="source-badge">Source: {source}</span>}
              </div>

              {loading && <LoadingState />}

              {!loading && !error && hasSearched && issues.length === 0 && (
                <EmptyState message="Your filters are valid, but no issues matched them." />
              )}

              {!loading && !error && !hasSearched && (
                <div className="welcome-grid">
                  <div><span>01</span><h3>Choose a language</h3><p>Python, JavaScript, Java, TypeScript and more.</p></div>
                  <div><span>02</span><h3>Add a topic</h3><p>Try React, machine learning, testing or documentation.</p></div>
                  <div><span>03</span><h3>Understand & track</h3><p>Use the AI explainer and save promising issues to your contribution tracker.</p></div>
                </div>
              )}

              {!loading && !error && issues.length > 0 && (
                <IssueGrid
                  issues={issues}
                  onSummarize={setSummaryIssue}
                  onTrack={trackIssue}
                  trackedIds={trackedIds}
                />
              )}
            </section>
          </>
        )}

        {activePage === "dashboard" && (
          <Dashboard
            tracker={tracker}
            completedHistory={completedHistory}
            searchedCount={searchedCount}
            recommendations={recommendations}
            onTrack={trackIssue}
          />
        )}

        {activePage === "tracker" && (
          <ContributionTracker
            tracker={tracker}
            completedHistory={completedHistory}
            onStatusChange={updateTrackerStatus}
            onRemove={removeFromTracker}
          />
        )}
      </main>

      <footer className="footer">
        <span>Good First Issue Finder</span>
        <span>GitHub remains the source of truth for the actual issue.</span>
      </footer>

      {summaryIssue && (
        <AiSummaryModal issue={summaryIssue} onClose={() => setSummaryIssue(null)} />
      )}
    </div>
  );
}
