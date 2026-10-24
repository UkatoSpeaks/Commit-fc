import "server-only";

import { connection } from "next/server";
import { cache } from "react";
import { playerCache } from "@/lib/cache";
import { fetchGitHubProfile, GitHubError, isValidUsername } from "@/lib/github";
import { buildPlayer } from "@/lib/stats";
import type { PlayerResult } from "./types";

// Concurrent requests for the same user share one GitHub call.
const inflight = new Map<string, Promise<PlayerResult>>();

/**
 * Load without request-time APIs (no connection/cookies/headers), so it is safe inside
 * "use cache". Most callers want getPlayer() instead.
 */
export async function loadPlayer(username: string): Promise<PlayerResult> {
  if (!isValidUsername(username)) {
    return {
      ok: false,
      error: { code: "INVALID_USERNAME", status: 400, message: `"${username}" is not a valid GitHub username.` },
    };
  }

  const key = `player:${username.toLowerCase()}`;
  const cached = await playerCache.get(key);
  if (cached) return { ok: true, player: cached, cacheHit: true };

  try {
    const player = buildPlayer(await fetchGitHubProfile(username));
    await playerCache.set(key, player);
    return { ok: true, player, cacheHit: false };
  } catch (err) {
    if (err instanceof GitHubError) {
      return {
        ok: false,
        error: {
          code: err.code,
          status: err.status,
          message: err.message,
          ...(err.retryAfter === undefined ? {} : { retryAfter: err.retryAfter }),
        },
      };
    }
    console.error("Unexpected error building player", err);
    return { ok: false, error: { code: "INTERNAL", status: 500, message: "Something went wrong." } };
  }
}

/**
 * Load a player by username. Never throws: returns data or a typed error.
 * Wrapped in React cache() so generateMetadata and the page share one call per request.
 */
export const getPlayer = cache(async (username: string): Promise<PlayerResult> => {
  // Cache TTLs and the stats engine read the clock, so this must run at request time, not during prerender.
  await connection();
  const key = username.toLowerCase();
  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = loadPlayer(username).finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
});

export type { PlayerError, PlayerErrorCode, PlayerResult } from "./types";
