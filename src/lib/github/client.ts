import "server-only";

import { GitHubError } from "./errors";
import { mapProfile } from "./mapper";
import { externalPRQueries, PLAYER_QUERY } from "./query";
import { isValidUsername } from "./username";
import type { RawGraphQLResponse, RawPlayerData } from "./raw-types";
import type { GitHubProfile } from "./types";

const GRAPHQL_URL = "https://api.github.com/graphql";
const TIMEOUT_MS = 10_000;

function getToken(): string {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    throw new GitHubError("MISSING_TOKEN", "GITHUB_TOKEN is not set. Add it to .env.local.");
  }
  return token;
}

function secondsUntilReset(res: Response): number | undefined {
  const retryAfter = Number(res.headers.get("retry-after"));
  if (retryAfter > 0) return retryAfter;
  const reset = Number(res.headers.get("x-ratelimit-reset"));
  if (!reset) return undefined;
  return Math.max(0, Math.ceil(reset - Date.now() / 1000));
}

function rateLimited(res: Response): GitHubError {
  const wait = secondsUntilReset(res);
  const when = wait === undefined ? "later" : `in ${Math.ceil(wait / 60)} min`;
  return new GitHubError("RATE_LIMITED", `GitHub rate limit hit. Try again ${when}.`, wait);
}

async function post(token: string, login: string): Promise<Response> {
  try {
    return await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "commit-fc",
      },
      body: JSON.stringify({ query: PLAYER_QUERY, variables: { login, ...externalPRQueries(login) } }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new GitHubError("NETWORK", `Could not reach GitHub: ${reason}`);
  }
}

function checkHttpStatus(res: Response): void {
  if (res.ok) return;
  const outOfQuota = res.headers.get("x-ratelimit-remaining") === "0";
  if (res.status === 429 || (res.status === 403 && outOfQuota)) throw rateLimited(res);
  if (res.status === 401) throw new GitHubError("BAD_TOKEN", "GITHUB_TOKEN was rejected by GitHub.");
  throw new GitHubError("UPSTREAM", `GitHub returned HTTP ${res.status}.`);
}

/** Fetch everything needed to build a player card. Server-only. */
export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  if (!isValidUsername(username)) {
    throw new GitHubError("USER_NOT_FOUND", `"${username}" is not a valid GitHub username.`);
  }
  const token = getToken();
  const res = await post(token, username);
  checkHttpStatus(res);

  let body: RawGraphQLResponse;
  try {
    body = (await res.json()) as RawGraphQLResponse;
  } catch {
    throw new GitHubError("UPSTREAM", "GitHub returned an invalid response.");
  }

  const errors = body.errors ?? [];
  if (errors.some((e) => e.type === "RATE_LIMITED")) throw rateLimited(res);

  const data: RawPlayerData | null | undefined = body.data;
  if (!data?.user) {
    if (errors.length === 0 || errors.some((e) => e.type === "NOT_FOUND")) {
      throw new GitHubError("USER_NOT_FOUND", `GitHub user "${username}" not found.`);
    }
    throw new GitHubError("UPSTREAM", errors.map((e) => e.message).join("; "));
  }

  // Errors on the PR search fields alone are non-fatal: counts fall back to 0.
  return mapProfile({ ...data, user: data.user });
}
