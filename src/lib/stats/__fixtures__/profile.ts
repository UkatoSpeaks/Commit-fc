import type { ContributionDay, GitHubProfile, Repo } from "@/lib/github/types";

export const NOW = new Date("2026-10-24T12:00:00Z");

/** Build a calendar ending on NOW from daily counts (oldest first). */
export function calendar(counts: readonly number[]): ContributionDay[] {
  return counts.map((count, i) => {
    const d = new Date(NOW);
    d.setUTCDate(d.getUTCDate() - (counts.length - 1 - i));
    return { date: d.toISOString().slice(0, 10), count };
  });
}

/** A repo with language byte sizes, e.g. repo("api", { Go: 1000 }). */
export function repo(name: string, languages: Record<string, number>, stars = 0, forks = 0): Repo {
  const langs = Object.entries(languages).map(([lang, bytes]) => ({ name: lang, bytes }));
  const primary = [...langs].sort((a, b) => b.bytes - a.bytes)[0]?.name ?? null;
  return { name, stars, forks, primaryLanguage: primary, languages: langs };
}

export function yearsAgo(years: number): string {
  return new Date(NOW.getTime() - years * 365.25 * 24 * 60 * 60 * 1000).toISOString();
}

type ProfileOverrides = Partial<Omit<GitHubProfile, "contributions" | "externalPRs">> & {
  contributions?: Partial<GitHubProfile["contributions"]>;
  externalPRs?: Partial<GitHubProfile["externalPRs"]>;
};

/** An empty, brand-new account. Override what each test cares about. */
export function makeProfile(overrides: ProfileOverrides = {}): GitHubProfile {
  const { contributions, externalPRs, ...rest } = overrides;
  return {
    login: "tester",
    name: "Test User",
    avatarUrl: "https://example.com/a.png",
    location: null,
    bio: null,
    createdAt: NOW.toISOString(),
    followers: 0,
    publicRepos: 0,
    repos: [],
    ...rest,
    contributions: { total: 0, calendar: calendar(new Array(365).fill(0)), prReviews: 0, issues: 0, ...contributions },
    externalPRs: { opened: 0, merged: 0, ...externalPRs },
  };
}
