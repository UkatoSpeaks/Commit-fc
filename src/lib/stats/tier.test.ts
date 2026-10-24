import { describe, expect, it } from "vitest";
import { tierFor } from "./tier";

describe("tierFor", () => {
  it.each([
    [40, "bronze"],
    [64, "bronze"],
    [65, "silver"],
    [74, "silver"],
    [75, "gold"],
    [84, "gold"],
    [85, "special"],
    [99, "special"],
  ] as const)("%i → %s", (overall, tier) => {
    expect(tierFor(overall)).toBe(tier);
  });
});
