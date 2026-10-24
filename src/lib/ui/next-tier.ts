import { RATING, TIERS } from "@/lib/stats/config";
import type { Tier } from "@/lib/stats";

export interface TierMarker {
  tier: Tier;
  min: number;
  /** 0–100 position on the progress bar */
  percent: number;
}

export interface TierProgress {
  tier: Tier;
  /** null when already in the top tier */
  next: { tier: Tier; min: number; pointsNeeded: number } | null;
  /** 0–100 bar fill for the overall rating */
  percent: number;
  markers: TierMarker[];
}

/** Where a rating sits on the 40–99 bar, as 0–100. */
export function barPercent(rating: number): number {
  const p = ((rating - RATING.min) / (RATING.max - RATING.min)) * 100;
  return Math.min(100, Math.max(0, p));
}

/** Tiers from lowest to highest. */
const ASCENDING = [...TIERS].sort((a, b) => a.min - b.min);

export function tierProgress(overall: number): TierProgress {
  const current = [...ASCENDING].reverse().find((t) => overall >= t.min) ?? ASCENDING[0]!;
  const nextDef = ASCENDING.find((t) => t.min > overall);

  return {
    tier: current.tier,
    next: nextDef ? { tier: nextDef.tier, min: nextDef.min, pointsNeeded: nextDef.min - overall } : null,
    percent: barPercent(overall),
    markers: ASCENDING.filter((t) => t.min > RATING.min).map((t) => ({
      tier: t.tier,
      min: t.min,
      percent: barPercent(t.min),
    })),
  };
}
