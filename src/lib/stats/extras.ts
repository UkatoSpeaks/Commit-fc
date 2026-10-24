import type { GitHubProfile } from "@/lib/github/types";
import type { LanguageShare } from "./languages";
import { calculateStreaks, type Streaks } from "./streak";

export interface Extras {
  location: string | null;
  /** Most-starred owned repo */
  club: string | null;
  topLanguages: { name: string; share: number }[];
  streaks: Streaks;
  mergedExternalPRs: number;
}

export function computeExtras(profile: GitHubProfile, shares: readonly LanguageShare[]): Extras {
  const club = profile.repos.reduce<GitHubProfile["repos"][number] | null>(
    (best, r) => (best === null || r.stars > best.stars ? r : best),
    null,
  );

  return {
    location: profile.location,
    club: club?.name ?? null,
    topLanguages: shares.slice(0, 3).map((s) => ({ name: s.name, share: Math.round(s.share * 1000) / 1000 })),
    streaks: calculateStreaks(profile.contributions.calendar),
    mergedExternalPRs: profile.externalPRs.merged,
  };
}
