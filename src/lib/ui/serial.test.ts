import { describe, expect, it } from "vitest";
import { SEASON, serialNumber, serialStamp } from "./serial";

describe("serialNumber", () => {
  it("is always 4 digits", () => {
    for (const login of ["a", "torvalds", "gaearon", "x".repeat(39), "sindresorhus", "0"]) {
      expect(serialNumber(login)).toMatch(/^\d{4}$/);
    }
  });

  it("is stable for the same login", () => {
    // Pinned so a change to the hash (which would renumber every card) is caught.
    expect(serialNumber("octocat")).toBe("2070");
  });

  it("ignores case and surrounding whitespace", () => {
    expect(serialNumber("OctoCat")).toBe(serialNumber("octocat"));
    expect(serialNumber(" octocat ")).toBe(serialNumber("octocat"));
  });

  it("spreads different logins out", () => {
    const logins = Array.from({ length: 500 }, (_, i) => `user-${i}`);
    expect(new Set(logins.map(serialNumber)).size).toBeGreaterThan(470);
  });
});

describe("serialStamp", () => {
  it("formats number and season", () => {
    expect(serialStamp("octocat")).toBe(`#${serialNumber("octocat")} · ${SEASON}`);
  });
});
