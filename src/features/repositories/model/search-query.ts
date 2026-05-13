type BuildRepositorySearchQueryInput = {
  q: string;
  language: string;
  topic: string;
  minStars: number | null;
};

/**
 * UI の filter 状態を GitHub Search API の q 文字列へ変換します。
 * sort/order は q ではなく API query param 側で渡すため、ここには含めません。
 */
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

/** 空白を含む qualifier 値は GitHub Search syntax に合わせて quote します。 */
function formatQualifierValue(value: string): string {
  if (!/\s/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}
