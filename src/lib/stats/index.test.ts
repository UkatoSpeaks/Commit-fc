import { describe, expect, it } from "vitest";
import { calendar, makeProfile, NOW, repo, yearsAgo } from "./__fixtures__/profile";
import { buildPlayer } from "./index";

describe("buildPlayer", () => {
  it("assembles stats, overall, position, tier and extras", () => {
    const profile = makeProfile({
      location: "Berlin, Germany",
      createdAt: yearsAgo(8),
      followers: 900,
      publicRepos: 45,
      repos: [
        repo("small-lib", { Go: 20_000 }, 120, 10),
        repo("big-server", { Go: 80_000, Shell: 5_000 }, 3_400, 210),
        repo("site", { TypeScript: 9_000 }, 15, 2),
      ],
      contributions: { total: 1_400, issues: 80, prReviews: 120, calendar: calendar(new Array(365).fill(4)) },
      externalPRs: { opened: 60, merged: 41 },
    });

    const player = buildPlayer(profile, NOW);

    expect(player.position.label).toBe("Backend ST");
    expect(player.extras.club).toBe("big-server");
    expect(player.extras.location).toBe("Berlin, Germany");
    expect(player.extras.topLanguages.map((l) => l.name)).toEqual(["Go", "TypeScript", "Shell"]);
    expect(player.extras.streaks).toEqual({ current: 365, longest: 365 });
    expect(player.extras.mergedExternalPRs).toBe(41);
    expect(player.overall).toBeGreaterThanOrEqual(40);
    expect(player.overall).toBeLessThanOrEqual(99);
    expect(["bronze", "silver", "gold", "special"]).toContain(player.tier);
  });

  it("gives an empty account a bronze SUB GK card with no club", () => {
    const player = buildPlayer(makeProfile(), NOW);
    expect(player).toMatchObject({ overall: 40, tier: "bronze", position: { code: "SUB" }, extras: { club: null } });
  });
});
