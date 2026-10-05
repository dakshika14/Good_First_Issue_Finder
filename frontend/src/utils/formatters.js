export function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function truncate(text, length = 180) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();

  if (clean.length <= length) return clean;
  return `${clean.slice(0, length).trim()}...`;
}
