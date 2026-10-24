import { describe, expect, it } from "vitest";
import { calendar, makeProfile, NOW, repo, yearsAgo } from "@/lib/stats/__fixtures__/profile";
import { languageShares } from "@/lib/stats/languages";
import { computeStats } from "@/lib/stats/stats";
import { referenceDate, SCENARIOS, suggestUpgrades, UPGRADE_CEILING } from "./upgrades";

const statsOf = (p: ReturnType<typeof makeProfile>) => computeStats(p, languageShares(p.repos), NOW);

describe("suggestUpgrades", () => {
  it("suggests the three weakest stats, weakest first, each with a real gain", () => {
    const profile = makeProfile({
      createdAt: yearsAgo(3),
      followers: 40,
      publicRepos: 20,
      repos: [repo("api", { TypeScript: 9000, Python: 1000 }, 5, 1)],
      contributions: { total: 400, calendar: calendar(new Array(365).fill(1)), issues: 10, prReviews: 5 },
    });
    const before = statsOf(profile);
    const ups = suggestUpgrades(profile, NOW);

    expect(ups).toHaveLength(3);
    const values = ups.map((u) => before[u.stat]);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    for (const u of ups) {
      expect(u.from).toBe(before[u.stat]);
      expect(u.to).toBeGreaterThan(u.from);
      expect(u.overallTo).toBeGreaterThanOrEqual(u.overallFrom);
    }
  });

  it("matches a manual re-run of the stat engine (PAS: +3 PRs to other repos)", () => {
    const profile = makeProfile({ externalPRs: { opened: 0, merged: 0 } });
    const pas = suggestUpgrades(profile, NOW, 6).find((u) => u.stat === "PAS");
    expect(pas?.action).toBe("Open 3 PRs to other repos");
    expect(pas?.to).toBe(statsOf(makeProfile({ externalPRs: { opened: 3, merged: 0 } })).PAS);
  });

  it("never suggests a stat at or above the ceiling", () => {
    const profile = makeProfile({
      repos: [repo("big", { Go: 1000 }, 200_000, 2_000)],
      externalPRs: { opened: 500, merged: 400 },
    });
    const before = statsOf(profile);
    expect(before.SHO).toBeGreaterThanOrEqual(UPGRADE_CEILING);
    expect(before.PAS).toBeGreaterThanOrEqual(UPGRADE_CEILING);

    const ups = suggestUpgrades(profile, NOW, 6);
    expect(ups.map((u) => u.stat)).not.toContain("SHO");
    expect(ups.map((u) => u.stat)).not.toContain("PAS");
  });

  it("skips stats the scenario can't move and returns [] when everything is maxed", () => {
    const maxed = makeProfile({
      createdAt: yearsAgo(15),
      followers: 10_000,
      publicRepos: 200,
      repos: [
        repo("a", Object.fromEntries(["Go", "Rust", "C", "C++", "Python", "TypeScript", "Java", "Ruby", "PHP", "Swift"].map((l) => [l, 1000])), 200_000, 2_000),
      ],
      contributions: { total: 5_000, calendar: calendar(new Array(365).fill(20)), issues: 300, prReviews: 300 },
      externalPRs: { opened: 500, merged: 400 },
    });
    const before = statsOf(maxed);
    const ups = suggestUpgrades(maxed, NOW);
    for (const u of ups) expect(before[u.stat]).toBeLessThan(UPGRADE_CEILING);
    expect(ups.every((u) => u.to > u.from)).toBe(true);
  });

  it("does not mutate the input profile", () => {
    const profile = makeProfile({ repos: [repo("x", { Go: 100 }, 1)] });
    const snapshot = JSON.stringify(profile);
    for (const s of Object.values(SCENARIOS)) s.apply(profile);
    suggestUpgrades(profile, NOW);
    expect(JSON.stringify(profile)).toBe(snapshot);
  });

  it("DRI scenario adds a language that clears the minimum share", () => {
    const profile = makeProfile({ repos: [repo("only-ts", { TypeScript: 50_000 })] });
    const after = SCENARIOS.DRI.apply(profile);
    const shares = languageShares(after.repos);
    expect(shares).toHaveLength(2);
    expect(shares[1]!.share).toBeGreaterThan(0.02);
    expect(SCENARIOS.DRI.action(profile)).toBe("Ship a small project in Rust");
  });

  it("PAC scenario fills only the last 14 days", () => {
    const profile = makeProfile();
    const cal = SCENARIOS.PAC.apply(profile).contributions.calendar;
    expect(cal.slice(-14).every((d) => d.count > 0)).toBe(true);
    expect(cal.slice(0, -14).every((d) => d.count === 0)).toBe(true);
  });
});

describe("referenceDate", () => {
  it("uses the last calendar day so server and client agree", () => {
    expect(referenceDate(makeProfile()).toISOString().slice(0, 10)).toBe("2026-10-24");
  });
});
