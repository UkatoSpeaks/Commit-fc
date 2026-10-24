import { describe, expect, it } from "vitest";
import type { Tier } from "@/lib/stats";
import { REVEAL, STAT_COUNT, revealBeats, revealDuration, statsDuration } from "./reveal-config";

const TARGET: Record<Tier, number> = { bronze: 2.5, silver: 3.5, gold: 5, special: 6.5 };
const TIERS = Object.keys(TARGET) as Tier[];
const holds = (tier: Tier) => {
  const t = REVEAL.tiers[tier];
  return [t.nationHold, t.positionHold, t.clubHold];
};

describe("reveal timing", () => {
  it.each(TIERS)("%s lasts about its target length", (tier) => {
    expect(revealDuration(REVEAL.tiers[tier])).toBeCloseTo(TARGET[tier], 1);
  });

  it("gets longer with each tier", () => {
    const totals = TIERS.map((t) => revealDuration(REVEAL.tiers[t]));
    expect(totals).toEqual([...totals].sort((a, b) => a - b));
  });

  it("total is the sum of every beat", () => {
    for (const tier of TIERS) {
      const t = REVEAL.tiers[tier];
      const sum =
        t.pack + t.nation + t.nationHold + t.position + t.positionHold + t.club + t.clubHold + t.burst + t.card +
        statsDuration(t) + t.overall + t.hold;
      expect(revealDuration(t)).toBeCloseTo(sum, 6);
    }
  });

  it("beats run in walkout order", () => {
    expect(revealBeats(REVEAL.tiers.gold).map(([name]) => name)).toEqual([
      "pack", "nation", "nationHold", "position", "positionHold", "club", "clubHold", "burst", "card", "stats", "overall", "hold",
    ]);
  });

  it("holds are 300–400ms, shorter on bronze", () => {
    for (const tier of ["silver", "gold", "special"] as const) {
      for (const h of holds(tier)) {
        expect(h).toBeGreaterThanOrEqual(0.3);
        expect(h).toBeLessThanOrEqual(0.4);
      }
    }
    expect(Math.max(...holds("bronze"))).toBeLessThan(0.3);
  });

  it("stats count up one by one with a 60–80ms stagger", () => {
    for (const tier of TIERS) {
      const t = REVEAL.tiers[tier];
      expect(t.statStagger).toBeGreaterThanOrEqual(0.06);
      expect(t.statStagger).toBeLessThanOrEqual(0.08);
      expect(statsDuration(t)).toBeCloseTo(t.statCount + (STAT_COUNT - 1) * t.statStagger, 6);
    }
  });

  it("screen shake only on gold and special", () => {
    expect(REVEAL.tiers.bronze.slamShake).toBe(0);
    expect(REVEAL.tiers.silver.slamShake).toBe(0);
    expect(REVEAL.tiers.gold.slamShake).toBeGreaterThan(0);
    expect(REVEAL.tiers.special.slamShake).toBeGreaterThan(0);
  });

  it("idle rumble grows with tier", () => {
    const shakes = TIERS.map((t) => REVEAL.tiers[t].shake);
    expect(shakes).toEqual([...shakes].sort((a, b) => a - b));
    expect(new Set(shakes).size).toBe(TIERS.length);
  });

  it("the card spin ends on its front", () => {
    for (const tier of TIERS) expect(REVEAL.tiers[tier].spin % 360).toBe(180);
  });
});
