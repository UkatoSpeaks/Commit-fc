import type { PlayerResult } from "@/lib/player/types";
import type { Tier } from "@/lib/stats";

/** Players shown on the landing page LED ticker. */
export const FEATURED_USERNAMES = [
  "torvalds",
  "karpathy",
  "sindresorhus",
  "antirez",
  "shadcn",
  "mitchellh",
  "kelseyhightower",
  "twostraws",
] as const;

/** Hide the ticker if fewer than this many load. */
export const MIN_FEATURED = 4;

/** Ticker ratings can be up to this stale. */
export const FEATURED_REVALIDATE_SECONDS = 24 * 60 * 60;

export interface FeaturedPlayer {
  username: string;
  overall: number;
  pitch: string;
  tier: Tier;
}

/** Keep the ones that loaded, in config order. Empty if too few to fill the ticker. */
export function pickFeatured(usernames: readonly string[], results: readonly PlayerResult[]): FeaturedPlayer[] {
  const players: FeaturedPlayer[] = [];
  usernames.forEach((username, i) => {
    const r = results[i];
    if (!r?.ok) return;
    players.push({ username, overall: r.player.overall, pitch: r.player.position.pitch, tier: r.player.tier });
  });
  return players.length >= MIN_FEATURED ? players : [];
}
