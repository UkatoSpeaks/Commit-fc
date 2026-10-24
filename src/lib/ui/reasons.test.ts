import { describe, expect, it } from "vitest";
import { calendar, makeProfile, NOW, repo, yearsAgo } from "@/lib/stats/__fixtures__/profile";
import { ratingColor, ratingReasons } from "./reasons";

describe("ratingReasons", () => {
  it("builds lines from the real raw numbers", () => {
    const counts = new Array(365).fill(0);
    counts.fill(2, -10); // last 10 days, 2 each
    const profile = makeProfile({
      createdAt: yearsAgo(4.5),
      followers: 1,
      publicRepos: 12,
      repos: [repo("a", { TypeScript: 54, Python: 39, JavaScript: 7 }, 30, 4), repo("b", {}, 2, 1)],
      contributions: { total: 214, calendar: calendar(counts), issues: 3, prReviews: 1 },
      externalPRs: { opened: 6, merged: 2 },
    });
    const r = ratingReasons(profile, NOW);

    expect(r.PAC).toBe("20 contributions in the last 90 days · current streak 10 days");
    expect(r.SHO).toBe("32 stars across 2 repos");
    expect(r.PAS).toBe("6 PRs opened to other repos (2 merged) · 5 forks");
    expect(r.DRI).toBe("TypeScript 54% · Python 39% · JavaScript 7% · 3 languages counted");
    expect(r.DEF).toBe("3 issues · 1 PR review · 4 years on GitHub");
    expect(r.PHY).toBe("214 contributions this year · 12 public repos · 1 follower");
  });

  it("handles an empty account", () => {
    const r = ratingReasons(makeProfile(), NOW);
    expect(r.PAS).toBe("0 PRs opened to other repos (0 merged) · 0 forks");
    expect(r.DRI).toBe("No language data in public repos yet");
  });
});

describe("ratingColor", () => {
  it("green ≥75, yellow 60–74, orange <60", () => {
    expect(ratingColor(75)).toBe("good");
    expect(ratingColor(74)).toBe("ok");
    expect(ratingColor(60)).toBe("ok");
    expect(ratingColor(59)).toBe("low");
  });
});
