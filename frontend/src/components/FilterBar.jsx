export default function FilterBar({
  filters,
  values,
  onChange,
  onSearch,
  loading
}) {
  return (
    <section className="filter-panel">
      <div className="filter-grid">
        <label>
          <span>Programming Language</span>
          <select
            value={values.language}
            onChange={(event) => onChange("language", event.target.value)}
          >
            {filters.languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Topic / Technology</span>
          <input
            value={values.topic}
            onChange={(event) => onChange("topic", event.target.value)}
            placeholder="e.g. machine learning, React"
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch();
            }}
          />
        </label>

        <label>
          <span>Difficulty</span>
          <select
            value={values.difficulty}
            onChange={(event) => onChange("difficulty", event.target.value)}
          >
            {filters.difficulties.map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Issue Label</span>
          <select
            value={values.label}
            onChange={(event) => onChange("label", event.target.value)}
          >
            {filters.labels.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-actions">
        <button className="primary-button" onClick={onSearch} disabled={loading}>
          {loading ? "Finding..." : "Find Issues"}
        </button>

        <button
          className="secondary-button"
          onClick={() => {
            onChange("language", "Any");
            onChange("topic", "");
            onChange("difficulty", "Any");
            onChange("label", "Any");
          }}
          disabled={loading}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
