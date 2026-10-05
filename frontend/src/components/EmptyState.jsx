export default function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔎</div>
      <h3>No matching issues found</h3>
      <p>{message}</p>
      <p>Try removing the topic or difficulty filter and search again.</p>
    </div>
  );
}
