export const GITHUB_API_VERSION = "2022-11-28";

export function createGitHubHeaders(token = process.env.GITHUB_TOKEN): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

