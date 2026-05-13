import { createServer } from "node:http";

import { githubRepositoryResponse } from "../test/fixtures/github-repository-response";
import { githubSearchResponse } from "../test/fixtures/github-search-response";

const host = "127.0.0.1";
const port = Number(process.env.MOCK_GITHUB_PORT ?? 4010);

const repositories = new Map([
  [githubRepositoryResponse.full_name, githubRepositoryResponse],
  [
    "facebook/react",
    {
      ...githubSearchResponse.items[1],
      subscribers_count: 6_400,
    },
  ],
]);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname === "/search/repositories") {
    handleSearch(url, response);
    return;
  }

  if (url.pathname.startsWith("/repos/")) {
    handleRepositoryDetail(url, response);
    return;
  }

  sendJson(response, 404, { message: "Not Found" });
});

server.listen(port, host);

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});

function handleSearch(url: URL, response: Parameters<typeof sendJson>[0]) {
  const q = url.searchParams.get("q") ?? "";

  if (q === "empty") {
    sendJson(response, 200, {
      total_count: 0,
      incomplete_results: false,
      items: [],
    });
    return;
  }

  if (q === "ratelimit") {
    sendJson(response, 403, {
      message: "API rate limit exceeded for test client.",
    });
    return;
  }

  if (q === "invalid") {
    sendJson(response, 422, {
      message: "Validation Failed",
    });
    return;
  }

  sendJson(response, 200, githubSearchResponse);
}

function handleRepositoryDetail(
  url: URL,
  response: Parameters<typeof sendJson>[0],
) {
  const [, , owner, repo] = url.pathname.split("/").map(decodeURIComponent);
  const repository = repositories.get(`${owner}/${repo}`);

  if (!repository) {
    sendJson(response, 404, { message: "Not Found" });
    return;
  }

  sendJson(response, 200, repository);
}

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  body: unknown,
) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-GitHub-Request-Id": "mock-request-id",
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": status === 403 || status === 429 ? "0" : "42",
    "X-RateLimit-Reset": "1710000000",
    "X-RateLimit-Resource": "search",
    "X-RateLimit-Used": status === 403 || status === 429 ? "60" : "18",
  });
  response.end(JSON.stringify(body));
}
