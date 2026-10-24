import "server-only";

import { cacheLife } from "next/cache";
import { FEATURED_REVALIDATE_SECONDS, FEATURED_USERNAMES, pickFeatured, type FeaturedPlayer } from "@/lib/ui/featured";
import { loadPlayer } from "./index";

/**
 * Featured players for the landing ticker, cached for 24h. Uses loadPlayer(), not
 * getPlayer(): getPlayer() calls connection(), which isn't allowed inside "use cache".
 */
export async function getFeaturedPlayers(): Promise<FeaturedPlayer[]> {
  "use cache";
  cacheLife({ revalidate: FEATURED_REVALIDATE_SECONDS });
  const results = await Promise.all(FEATURED_USERNAMES.map((u) => loadPlayer(u)));
  return pickFeatured(FEATURED_USERNAMES, results);
}
