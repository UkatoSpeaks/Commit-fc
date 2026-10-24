import { describe, expect, it } from "vitest";
import { countryFromLocation } from "./flags";
import { clubInitials } from "./card-data";
import { commitGridOpacities } from "./commit-grid";
import { calendar } from "@/lib/stats/__fixtures__/profile";

describe("countryFromLocation", () => {
  it.each([
    ["Berlin, Germany", "DE"],
    ["Bengaluru", "IN"],
    ["San Francisco, CA", "US"],
    ["Austin, TX", "US"],
    ["Toronto, CA", "CA"],
    ["London, UK", "GB"],
    ["Greater London Area", "GB"],
    ["Lagos · Nigeria", "NG"],
    ["Tokyo/Japan", "JP"],
    ["DE", "DE"],
  ])("%s → %s", (loc, code) => {
    expect(countryFromLocation(loc)?.code).toBe(code);
  });

  it.each([null, "", "Earth", "the internet", "de"])("unknown: %s", (loc) => {
    expect(countryFromLocation(loc)).toBeNull();
  });
});

describe("clubInitials", () => {
  it.each([
    ["commit-fc", "CF"],
    ["react", "RE"],
    ["myCoolApp", "MC"],
    ["dot.files", "DF"],
    [null, "FA"],
  ])("%s → %s", (repo, initials) => {
    expect(clubInitials(repo)).toBe(initials);
  });
});

describe("commitGridOpacities", () => {
  it("returns 28 cells scaled to the busiest day", () => {
    const counts = new Array(28).fill(0);
    counts[27] = 8;
    counts[26] = 1;
    const cells = commitGridOpacities(calendar(counts));
    expect(cells).toHaveLength(28);
    expect(cells[27]).toBe(1);
    expect(cells[26]).toBe(0.38);
    expect(cells[0]).toBe(0.14);
  });

  it("pads short calendars", () => {
    expect(commitGridOpacities(calendar([3]))).toHaveLength(28);
  });
});
