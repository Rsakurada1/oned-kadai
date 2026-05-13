type BuildRepositorySearchQueryInput = {
  q: string;
  language: string;
  topic: string;
  minStars: number | null;
};

export function buildRepositorySearchQuery({
  q,
  language,
  topic,
  minStars,
}: BuildRepositorySearchQueryInput): string {
  const parts = [q.trim()];
  const normalizedLanguage = language.trim();
  const normalizedTopic = topic.trim();

  if (normalizedLanguage) {
    parts.push(`language:${formatQualifierValue(normalizedLanguage)}`);
  }

  if (normalizedTopic) {
    parts.push(`topic:${formatQualifierValue(normalizedTopic)}`);
  }

  if (minStars !== null) {
    parts.push(`stars:>=${minStars}`);
  }

  return parts.filter(Boolean).join(" ");
}

function formatQualifierValue(value: string): string {
  if (!/\s/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}
