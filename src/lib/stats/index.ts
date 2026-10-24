import type { GitHubProfile } from "@/lib/github/types";
import { computeExtras, type Extras } from "./extras";
import { languageShares } from "./languages";
import { detectPosition, type Position } from "./position";
import { computeOverall, computeStats, type Stats } from "./stats";
import { tierFor, type Tier } from "./tier";

export interface Player {
  profile: GitHubProfile;
  stats: Stats;
  overall: number;
  position: Position;
  tier: Tier;
  extras: Extras;
}

/** Turn a GitHub profile into a player card. Pure: pass `now` for account age. */
export function buildPlayer(profile: GitHubProfile, now: Date = new Date()): Player {
  const shares = languageShares(profile.repos);
  const stats = computeStats(profile, shares, now);
  const position = detectPosition(shares);
  const overall = computeOverall(stats, position.code);
  return {
    profile,
    stats,
    overall,
    position,
    tier: tierFor(overall),
    extras: computeExtras(profile, shares),
  };
}

export type { Extras, Position, Stats, Tier };
export type { StatKey } from "./stats";
