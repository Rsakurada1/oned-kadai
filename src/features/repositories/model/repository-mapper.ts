import type {
  GitHubRepository,
  GitHubRepositoryLanguages,
} from "@/lib/github/types";
import type {
  RepositoryDetail,
  RepositoryLanguage,
  RepositoryListItem,
} from "./repository";

/** GitHub API の snake_case response を UI 用の camelCase model に寄せます。 */
export function toRepositoryListItem(
  repository: GitHubRepository,
): RepositoryListItem {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    ownerLogin: repository.owner.login,
    ownerAvatarUrl: repository.owner.avatar_url,
    description: repository.description,
    language: repository.language,
    updatedAt: repository.updated_at ?? null,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    openIssues: repository.open_issues_count,
    htmlUrl: repository.html_url,
  };
}

/** Watcher 数は GitHub API 仕様に合わせ、watchers_count ではなく subscribers_count を使います。 */
export function toRepositoryDetail(
  repository: GitHubRepository,
  languages: GitHubRepositoryLanguages = {},
): RepositoryDetail {
  return {
    ...toRepositoryListItem(repository),
    watchers: repository.subscribers_count ?? 0,
    licenseName: repository.license?.name ?? null,
    topics: repository.topics ?? [],
    homepageUrl: repository.homepage || null,
    defaultBranch: repository.default_branch ?? null,
    createdAt: repository.created_at ?? null,
    pushedAt: repository.pushed_at ?? null,
    sizeKb: repository.size ?? null,
    visibility: repository.visibility ?? null,
    isArchived: repository.archived ?? false,
    cloneUrl: repository.clone_url ?? null,
    languages: toRepositoryLanguages(languages),
  };
}

export function toRepositoryLanguages(
  languages: GitHubRepositoryLanguages,
): RepositoryLanguage[] {
  const entries = Object.entries(languages).filter(([, bytes]) => bytes > 0);
  const totalBytes = entries.reduce((total, [, bytes]) => total + bytes, 0);

  if (totalBytes === 0) {
    return [];
  }

  return entries
    .sort(([, a], [, b]) => b - a)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 1_000) / 10,
    }));
}
