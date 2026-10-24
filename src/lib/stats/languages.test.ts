import { describe, expect, it } from "vitest";
import { repo } from "./__fixtures__/profile";
import { languageShares, repoWeight } from "./languages";

describe("repoWeight", () => {
  it("is 1 for an unstarred repo and grows by 1 per 10x stars", () => {
    expect(repoWeight(0)).toBe(1);
    expect(repoWeight(9)).toBeCloseTo(2, 10);
    expect(repoWeight(999)).toBeCloseTo(4, 10);
  });
});

describe("languageShares", () => {
  it("is empty with no language data", () => {
    expect(languageShares([])).toEqual([]);
    expect(languageShares([repo("empty", {})])).toEqual([]);
  });

  it("normalizes each repo, so repo size doesn't matter", () => {
    const shares = languageShares([repo("huge", { HTML: 50_000_000 }), repo("tiny", { Python: 10 })]);
    expect(shares.map((s) => [s.name, s.share])).toEqual([
      ["HTML", 0.5],
      ["Python", 0.5],
    ]);
  });

  it("splits a repo by its own byte mix", () => {
    const shares = languageShares([repo("app", { Go: 750, Shell: 250 })]);
    expect(shares.find((s) => s.name === "Go")?.share).toBeCloseTo(0.75, 10);
  });

  it("weights repos by 1 + log10(stars + 1)", () => {
    const shares = languageShares([repo("a", { Go: 1 }, 99), repo("b", { Rust: 1 }, 0)]);
    // Go weight 3, Rust weight 1
    expect(shares.find((s) => s.name === "Go")?.share).toBeCloseTo(0.75, 10);
  });

  it("applies the Jupyter byte weight inside a repo", () => {
    // 1000 notebook bytes count as 100, so the repo is 50/50
    const shares = languageShares([repo("nb", { "Jupyter Notebook": 1000, Python: 100 })]);
    expect(shares.find((s) => s.name === "Python")?.share).toBeCloseTo(0.5, 10);
  });

  it("shares add up to 1 and are sorted largest first", () => {
    const shares = languageShares([repo("a", { Go: 3, C: 1 }, 50), repo("b", { Python: 5, C: 5 }, 2)]);
    expect(shares.reduce((s, l) => s + l.share, 0)).toBeCloseTo(1, 10);
    expect(shares.map((s) => s.share)).toEqual([...shares.map((s) => s.share)].sort((a, b) => b - a));
  });
});
