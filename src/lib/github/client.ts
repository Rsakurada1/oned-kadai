import "server-only";

import { createGitHubHeaders } from "./headers";
import { GitHubApiError } from "./errors";

type GitHubFetchOptions = {
  revalidate: number;
  searchParams?: Record<string, number | string | undefined>;
};

const DEFAULT_GITHUB_API_BASE_URL = "https://api.github.com";

export async function githubFetch<T>(
  path: string,
  options: GitHubFetchOptions,
): Promise<T> {
  const url = createGitHubUrl(path, options.searchParams);

  const response = await fetch(url, {
    headers: createGitHubHeaders(),
    next: {
      revalidate: options.revalidate,
    },
  });

  if (!response.ok) {
    throw new GitHubApiError(response.status, await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

function createGitHubUrl(
  path: string,
  searchParams?: GitHubFetchOptions["searchParams"],
): URL {
  const baseUrl = process.env.GITHUB_API_BASE_URL ?? DEFAULT_GITHUB_API_BASE_URL;
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(normalizedPath, `${baseUrl.replace(/\/$/, "")}/`);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

