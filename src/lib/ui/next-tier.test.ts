import { describe, expect, it } from "vitest";
import { barPercent, tierProgress } from "./next-tier";

describe("tierProgress", () => {
  it("counts points to the next tier from bronze", () => {
    const p = tierProgress(61);
    expect(p.tier).toBe("bronze");
    expect(p.next).toEqual({ tier: "silver", min: 65, pointsNeeded: 4 });
  });

  it("treats a tier's minimum as inside that tier", () => {
    expect(tierProgress(65).tier).toBe("silver");
    expect(tierProgress(65).next).toEqual({ tier: "gold", min: 75, pointsNeeded: 10 });
    expect(tierProgress(74).next?.pointsNeeded).toBe(1);
    expect(tierProgress(84).next).toEqual({ tier: "special", min: 85, pointsNeeded: 1 });
  });

  it("has no next tier at special", () => {
    expect(tierProgress(85).tier).toBe("special");
    expect(tierProgress(85).next).toBeNull();
    expect(tierProgress(99).next).toBeNull();
  });

  it("places markers for silver, gold and special on the 40–99 bar", () => {
    const markers = tierProgress(50).markers;
    expect(markers.map((m) => [m.tier, m.min])).toEqual([
      ["silver", 65],
      ["gold", 75],
      ["special", 85],
    ]);
    expect(markers[0]!.percent).toBeCloseTo((25 / 59) * 100);
  });
});

describe("barPercent", () => {
  it("maps 40 → 0 and 99 → 100, clamped", () => {
    expect(barPercent(40)).toBe(0);
    expect(barPercent(99)).toBe(100);
    expect(barPercent(10)).toBe(0);
    expect(barPercent(120)).toBe(100);
  });
});
