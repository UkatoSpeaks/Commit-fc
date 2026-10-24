import "server-only";

import { cacheLife } from "next/cache";
import {
  FEATURED_REVALIDATE_SECONDS,
  FEATURED_USERNAMES,
  MIN_FEATURED,
  pickFeatured,
  type FeaturedPlayer,
} from "@/lib/ui/featured";
import type { PlayerResult } from "./types";
import { loadPlayer } from "./index";

/** GitHub's GraphQL API dislikes many heavy queries at once (timeouts, secondary limits). */
const CONCURRENCY = 3;

async function loadAll(usernames: readonly string[]): Promise<PlayerResult[]> {
  const results: PlayerResult[] = new Array(usernames.length);
  let next = 0;
  async function worker() {
    while (next < usernames.length) {
      const i = next++;
      results[i] = await loadPlayer(usernames[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, usernames.length) }, worker));
  return results;
}

/**
 * Featured players for the landing ticker. Uses loadPlayer(), not getPlayer():
 * getPlayer() calls connection(), which isn't allowed inside "use cache".
 *
 * A full result is cached for 24h and baked into the static page. If too few load
 * (e.g. GITHUB_TOKEN missing at build time, or GitHub timing out), we log why and
 * cache the empty result for seconds only, which also keeps it out of the prerender,
 * so the next request tries again instead of hiding the ticker for a day.
 */
export async function getFeaturedPlayers(): Promise<FeaturedPlayer[]> {
  "use cache";
  const results = await loadAll(FEATURED_USERNAMES);
  const players = pickFeatured(FEATURED_USERNAMES, results);

  if (players.length === 0) {
    const failures = results
      .map((r, i) => (r.ok ? null : `${FEATURED_USERNAMES[i]}: ${r.error.code} (${r.error.message})`))
      .filter(Boolean);
    console.warn(
      `[featured] Only ${results.length - failures.length}/${results.length} featured players loaded ` +
        `(need ${MIN_FEATURED}); hiding the ticker and retrying soon.\n  ${failures.join("\n  ")}`,
    );
    cacheLife("seconds");
    return [];
  }

  cacheLife({ revalidate: FEATURED_REVALIDATE_SECONDS });
  return players;
}
