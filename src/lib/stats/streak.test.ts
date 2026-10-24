import { describe, expect, it } from "vitest";
import { calendar } from "./__fixtures__/profile";
import { calculateStreaks, recentContributions } from "./streak";

describe("calculateStreaks", () => {
  it("returns zeros for an empty calendar", () => {
    expect(calculateStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it("returns zeros when there are no contributions", () => {
    expect(calculateStreaks(calendar([0, 0, 0]))).toEqual({ current: 0, longest: 0 });
  });

  it("counts a current streak ending today", () => {
    expect(calculateStreaks(calendar([0, 1, 2, 3])).current).toBe(3);
  });

  it("keeps the streak alive when today is still zero", () => {
    expect(calculateStreaks(calendar([0, 1, 1, 0])).current).toBe(2);
  });

  it("breaks the streak after a missed day before today", () => {
    expect(calculateStreaks(calendar([1, 1, 0, 0])).current).toBe(0);
  });

  it("finds the longest streak anywhere in the year", () => {
    expect(calculateStreaks(calendar([1, 1, 1, 1, 0, 1, 1, 0, 1]))).toEqual({ current: 1, longest: 4 });
  });

  it("handles every day being active", () => {
    expect(calculateStreaks(calendar(new Array(365).fill(2)))).toEqual({ current: 365, longest: 365 });
  });
});

describe("recentContributions", () => {
  it("sums only the last N days", () => {
    expect(recentContributions(calendar([100, 100, 1, 2, 3]), 3)).toBe(6);
  });

  it("sums everything when the calendar is shorter than N", () => {
    expect(recentContributions(calendar([1, 2]), 90)).toBe(3);
  });
});
