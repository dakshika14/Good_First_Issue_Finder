import IssueCard from "./IssueCard.jsx";

export default function IssueGrid({ issues, onSummarize, onTrack, trackedIds }) {
  return (
    <div className="issue-grid">
      {issues.map((issue) => (
        <IssueCard
          issue={issue}
          key={issue.id}
          onSummarize={onSummarize}
          onTrack={onTrack}
          isTracked={trackedIds.has(String(issue.id))}
        />
      ))}
    </div>
  );
}
