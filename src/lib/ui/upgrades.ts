import type { GitHubProfile } from "@/lib/github/types";
import type { StatKey, Stats } from "@/lib/stats";
import { languageShares } from "@/lib/stats/languages";
import { computeOverall, computeStats } from "@/lib/stats/stats";

/** Stats at or above this are never suggested. */
export const UPGRADE_CEILING = 90;
export const MAX_UPGRADES = 3;

export interface Upgrade {
  stat: StatKey;
  /** What to do, e.g. "Open 3 PRs to other repos" */
  action: string;
  from: number;
  to: number;
  overallFrom: number;
  overallTo: number;
}

interface Scenario {
  action: (profile: GitHubProfile) => string;
  apply: (profile: GitHubProfile) => GitHubProfile;
}

const NEW_LANGUAGE_CANDIDATES = ["Rust", "Go", "TypeScript", "Python", "Kotlin", "Swift", "C++", "Elixir"];
const NEW_LANGUAGE_SHARE = 0.06;

function pickNewLanguage(profile: GitHubProfile): string {
  const present = new Set(languageShares(profile.repos).map((s) => s.name));
  return NEW_LANGUAGE_CANDIDATES.find((l) => !present.has(l)) ?? "Zig";
}

/** One "what if" per stat. Each returns a modified copy; the input is never mutated. */
export const SCENARIOS: Record<StatKey, Scenario> = {
  PAC: {
    action: () => "Keep a 14-day contribution streak",
    apply: (p) => {
      const cal = p.contributions.calendar.map((d, i, all) =>
        i >= all.length - 14 && d.count === 0 ? { ...d, count: 1 } : d,
      );
      return { ...p, contributions: { ...p.contributions, calendar: cal } };
    },
  },
  SHO: {
    action: () => "Earn 20 more stars on your repos",
    apply: (p) => {
      const [first, ...rest] = p.repos;
      const repos = first
        ? [{ ...first, stars: first.stars + 20 }, ...rest]
        : [{ name: "new-project", stars: 20, forks: 0, primaryLanguage: null, languages: [] }];
      return { ...p, repos };
    },
  },
  PAS: {
    action: () => "Open 3 PRs to other repos",
    apply: (p) => ({ ...p, externalPRs: { ...p.externalPRs, opened: p.externalPRs.opened + 3 } }),
  },
  DRI: {
    action: (p) => `Ship a small project in ${pickNewLanguage(p)}`,
    apply: (p) => {
      const lang = pickNewLanguage(p);
      const total = languageShares(p.repos).reduce((sum, s) => sum + s.bytes, 0);
      const bytes = total === 0 ? 10_000 : Math.ceil((total * NEW_LANGUAGE_SHARE) / (1 - NEW_LANGUAGE_SHARE));
      const repo = { name: "side-project", stars: 0, forks: 0, primaryLanguage: lang, languages: [{ name: lang, bytes }] };
      return { ...p, repos: [...p.repos, repo] };
    },
  },
  DEF: {
    action: () => "Review 15 pull requests",
    apply: (p) => ({ ...p, contributions: { ...p.contributions, prReviews: p.contributions.prReviews + 15 } }),
  },
  PHY: {
    action: () => "Make 150 more contributions this year",
    apply: (p) => ({ ...p, contributions: { ...p.contributions, total: p.contributions.total + 150 } }),
  },
};

function statsFor(profile: GitHubProfile, now: Date): Stats {
  return computeStats(profile, languageShares(profile.repos), now);
}

/**
 * Real estimates: re-run the stat engine on an improved copy of the profile.
 * Picks the weakest stats (below the ceiling) that actually move.
 */
export function suggestUpgrades(profile: GitHubProfile, now: Date, limit = MAX_UPGRADES): Upgrade[] {
  const before = statsFor(profile, now);
  const overallFrom = computeOverall(before);

  const keys = (Object.keys(SCENARIOS) as StatKey[])
    .filter((k) => before[k] < UPGRADE_CEILING)
    .sort((a, b) => before[a] - before[b]);

  const result: Upgrade[] = [];
  for (const stat of keys) {
    if (result.length >= limit) break;
    const scenario = SCENARIOS[stat];
    const after = statsFor(scenario.apply(profile), now);
    if (after[stat] <= before[stat]) continue;
    result.push({
      stat,
      action: scenario.action(profile),
      from: before[stat],
      to: after[stat],
      overallFrom,
      overallTo: computeOverall(after),
    });
  }
  return result;
}

/**
 * A stable "now" for a player: the last day of their contribution calendar
 * (it always ends today). Keeps server and client renders identical.
 */
export function referenceDate(profile: GitHubProfile): Date {
  const last = profile.contributions.calendar.at(-1)?.date;
  return last ? new Date(`${last}T12:00:00Z`) : new Date(profile.createdAt);
}
