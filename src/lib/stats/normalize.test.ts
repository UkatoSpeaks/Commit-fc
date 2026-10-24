import { describe, expect, it } from "vitest";
import { blend, clamp, logRating } from "./normalize";

describe("logRating", () => {
  it("maps 0 to the 40 floor", () => {
    expect(logRating(0, 500)).toBe(40);
  });

  it("maps the cap to 99", () => {
    expect(logRating(500, 500)).toBeCloseTo(99, 10);
  });

  it("clamps values above the cap to 99", () => {
    expect(logRating(1_000_000, 500)).toBe(99);
  });

  it("treats negative input as 0", () => {
    expect(logRating(-5, 500)).toBe(40);
  });

  it("follows the log formula in between", () => {
    // 40 + 59 * log10(100) / log10(10001)
    expect(logRating(99, 10_000)).toBeCloseTo(40 + (59 * 2) / Math.log10(10_001), 10);
  });

  it("is monotonic", () => {
    const values = [0, 1, 5, 20, 100, 400].map((x) => logRating(x, 500));
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

describe("clamp / blend", () => {
  it("clamps to range", () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
    expect(clamp(15, 10, 20)).toBe(15);
  });

  it("blends weighted ratings", () => {
    expect(blend([{ rating: 40, weight: 0.5 }, { rating: 80, weight: 0.5 }])).toBe(60);
  });
});
