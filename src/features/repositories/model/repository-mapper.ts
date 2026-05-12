import type { GitHubRepository } from "@/lib/github/types";
import type {
  RepositoryDetail,
  RepositoryListItem,
} from "./repository";

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
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    openIssues: repository.open_issues_count,
    htmlUrl: repository.html_url,
  };
}

export function toRepositoryDetail(
  repository: GitHubRepository,
): RepositoryDetail {
  return {
    ...toRepositoryListItem(repository),
    watchers: repository.subscribers_count ?? 0,
  };
}

