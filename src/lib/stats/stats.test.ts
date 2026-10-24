import { describe, expect, it } from "vitest";
import { calendar, makeProfile, NOW, repo, yearsAgo } from "./__fixtures__/profile";
import { languageShares } from "./languages";
import { POSITION_OVERALL_WEIGHTS, SHO } from "./config";
import { logRating } from "./normalize";
import { computeOverall, computeStats, defending, dribbling, pace, passing, physical, shooting } from "./stats";

const empty = makeProfile();

describe("PAC (activity)", () => {
  it("is 40 for an inactive account", () => {
    expect(pace(empty)).toBe(40);
  });

  it("blends last-90-day contributions (70%) and current streak (30%)", () => {
    // 10 days of 5 contributions at the end: 50 recent, streak of 10.
    // Older activity outside the 90-day window must be ignored.
    const counts = [...new Array(355).fill(0), ...new Array(10).fill(5)];
    counts[0] = 1000;
    const p = makeProfile({ contributions: { calendar: calendar(counts) } });
    expect(pace(p)).toBeCloseTo(0.7 * logRating(50, 500) + 0.3 * logRating(10, 100), 10);
  });

  it("hits 99 at both caps", () => {
    const p = makeProfile({ contributions: { calendar: calendar(new Array(365).fill(10)) } });
    expect(pace(p)).toBeCloseTo(99, 10);
  });
});

describe("SHO (impact)", () => {
  it("is 40 with no stars", () => {
    expect(shooting(empty)).toBe(40);
  });

  it("sums stars across owned repos", () => {
    const p = makeProfile({ repos: [repo("a", {}, 600), repo("b", {}, 400)] });
    expect(shooting(p)).toBeCloseTo(logRating(1000, SHO.starsCap), 10);
  });

  it("caps at 99", () => {
    expect(shooting(makeProfile({ repos: [repo("huge", {}, 200_000)] }))).toBe(99);
  });

  it("does not max out at 10k stars", () => {
    expect(shooting(makeProfile({ repos: [repo("popular", {}, 10_000)] }))).toBeLessThan(90);
  });
});

describe("PAS (collaboration)", () => {
  it("blends external PRs (60%) and forks received (40%)", () => {
    const p = makeProfile({ externalPRs: { opened: 20, merged: 10 }, repos: [repo("a", {}, 0, 30), repo("b", {}, 0, 20)] });
    expect(passing(p)).toBeCloseTo(0.6 * logRating(20, 200) + 0.4 * logRating(50, 1000), 10);
  });

  it("is 40 with no collaboration", () => {
    expect(passing(empty)).toBe(40);
  });

  it("is capped at 50 when the user owns no repos (e.g. the ghost account)", () => {
    expect(passing(makeProfile({ externalPRs: { opened: 5_000, merged: 3_000 } }))).toBe(50);
  });

  it("is not capped once the user owns a repo", () => {
    const p = makeProfile({ externalPRs: { opened: 5_000, merged: 3_000 }, repos: [repo("a", { Go: 1 })] });
    expect(passing(p)).toBeGreaterThan(50);
  });
});

describe("DRI (versatility)", () => {
  it("is 40 with no languages", () => {
    expect(dribbling([])).toBe(40);
  });

  it("is 45 for one language", () => {
    expect(dribbling(languageShares([repo("a", { Go: 100 })]))).toBe(45);
  });

  it("scales linearly and caps at 95 for 10+ languages", () => {
    const five = Object.fromEntries(["A", "B", "C", "D", "E"].map((l) => [l, 100]));
    expect(dribbling(languageShares([repo("a", five)]))).toBeCloseTo(45 + (4 * 50) / 9, 10);

    const twelve = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`L${i}`, 100]));
    expect(dribbling(languageShares([repo("a", twelve)]))).toBe(95);
  });

  it("ignores languages at or below 2% share", () => {
    const shares = languageShares([repo("a", { Go: 980, Shell: 20 })]);
    expect(dribbling(shares)).toBe(45);
  });

  it("down-weights Jupyter Notebook bytes", () => {
    // Raw: Notebook 15% of bytes. Weighted x0.1: ~1.7%, so below the 2% bar.
    const shares = languageShares([repo("a", { Go: 850, "Jupyter Notebook": 150 })]);
    expect(dribbling(shares)).toBe(45);
  });
});

describe("DEF (reliability)", () => {
  it("blends issues + reviews (60%) and account age (40%)", () => {
    const p = makeProfile({ createdAt: yearsAgo(6), contributions: { issues: 40, prReviews: 60 } });
    expect(defending(p, NOW)).toBeCloseTo(0.6 * logRating(100, 300) + 0.4 * logRating(6, 12), 6);
  });

  it("is 40 for a brand-new silent account", () => {
    expect(defending(empty, NOW)).toBe(40);
  });
});

describe("PHY (stamina)", () => {
  it("blends contributions (50%), public repos (25%) and followers (25%)", () => {
    const p = makeProfile({ publicRepos: 30, followers: 250, contributions: { total: 800 } });
    expect(physical(p)).toBeCloseTo(
      0.5 * logRating(800, 2000) + 0.25 * logRating(30, 100) + 0.25 * logRating(250, 5000),
      10,
    );
  });
});

describe("computeStats / computeOverall", () => {
  it("gives a brand-new account 40 everywhere", () => {
    const stats = computeStats(empty, [], NOW);
    expect(stats).toEqual({ PAC: 40, SHO: 40, PAS: 40, DRI: 40, DEF: 40, PHY: 40 });
    expect(computeOverall(stats, "SUB")).toBe(40);
  });

  it("returns whole-number stats", () => {
    const p = makeProfile({ followers: 123, publicRepos: 7, repos: [repo("a", { Go: 1 }, 37, 3)] });
    for (const v of Object.values(computeStats(p, languageShares(p.repos), NOW))) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  const sample = { PAC: 90, SHO: 80, PAS: 70, DRI: 60, DEF: 50, PHY: 40 };

  it("uses the default weights for GK", () => {
    // .2*90 + .2*80 + .15*(70+60+50+40) = 18 + 16 + 33 = 67
    expect(computeOverall(sample, "SUB")).toBe(67);
  });

  it("uses position weights", () => {
    // ST: .3*80 + .2*90 + .15*60 + .15*40 + .1*70 + .1*50 = 24+18+9+6+7+5 = 69
    expect(computeOverall(sample, "BE")).toBe(69);
    // CB: .35*50 + .25*40 + .15*70 + .1*90 + .1*80 + .05*60 = 17.5+10+10.5+9+8+3 = 58
    expect(computeOverall(sample, "OPS")).toBe(58);
    // LW: .3*90 + .25*60 + .2*80 + .15*70 + .05*40 + .05*50 = 27+15+16+10.5+2+2.5 = 73
    expect(computeOverall(sample, "FE")).toBe(73);
  });

  it("position weights each add up to 1", () => {
    for (const weights of Object.values(POSITION_OVERALL_WEIGHTS)) {
      expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    }
  });

  it("is 99 when every stat is 99, at every position", () => {
    const all99 = { PAC: 99, SHO: 99, PAS: 99, DRI: 99, DEF: 99, PHY: 99 };
    for (const code of Object.keys(POSITION_OVERALL_WEIGHTS) as (keyof typeof POSITION_OVERALL_WEIGHTS)[]) {
      expect(computeOverall(all99, code)).toBe(99);
    }
  });
});
