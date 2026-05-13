import type { GitHubRepository } from "@/lib/github/types";
import type {
  RepositoryDetail,
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
): RepositoryDetail {
  return {
    ...toRepositoryListItem(repository),
    watchers: repository.subscribers_count ?? 0,
  };
}
