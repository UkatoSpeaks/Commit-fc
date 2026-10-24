import type { GitHubProfile } from "@/lib/github/types";
import { DEF, DRI, OVERALL_WEIGHTS, PAC, PAS, PHY, RATING, SHO } from "./config";
import type { LanguageShare } from "./languages";
import { blend, clamp, logRating } from "./normalize";
import { calculateStreaks, recentContributions } from "./streak";

export type StatKey = keyof typeof OVERALL_WEIGHTS;
export type Stats = Record<StatKey, number>;

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Activity: recent contributions + current streak. */
export function pace(profile: GitHubProfile): number {
  const { calendar } = profile.contributions;
  return blend([
    { rating: logRating(recentContributions(calendar, PAC.recentDays), PAC.recentCap), weight: PAC.recentWeight },
    { rating: logRating(calculateStreaks(calendar).current, PAC.streakCap), weight: PAC.streakWeight },
  ]);
}

/** Impact: stars on owned non-fork repos. */
export function shooting(profile: GitHubProfile): number {
  const stars = profile.repos.reduce((sum, r) => sum + r.stars, 0);
  return logRating(stars, SHO.starsCap);
}

/** Collaboration: PRs to others' repos + forks received. */
export function passing(profile: GitHubProfile): number {
  const forks = profile.repos.reduce((sum, r) => sum + r.forks, 0);
  return blend([
    { rating: logRating(profile.externalPRs.opened, PAS.prCap), weight: PAS.prWeight },
    { rating: logRating(forks, PAS.forksCap), weight: PAS.forksWeight },
  ]);
}

/** Versatility: languages above the min share, linear scale. */
export function dribbling(shares: readonly LanguageShare[]): number {
  const count = shares.filter((s) => s.share > DRI.minShare).length;
  if (count === 0) return RATING.min;
  const step = (DRI.maxRating - DRI.oneLanguageRating) / (DRI.maxLanguages - 1);
  return clamp(DRI.oneLanguageRating + (count - 1) * step, RATING.min, DRI.maxRating);
}

export function accountAgeYears(createdAt: string, now: Date): number {
  return Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / MS_PER_YEAR);
}

/** Reliability: issues + PR reviews, and account age. */
export function defending(profile: GitHubProfile, now: Date): number {
  const { issues, prReviews } = profile.contributions;
  return blend([
    { rating: logRating(issues + prReviews, DEF.activityCap), weight: DEF.activityWeight },
    { rating: logRating(accountAgeYears(profile.createdAt, now), DEF.ageYearsCap), weight: DEF.ageWeight },
  ]);
}

/** Stamina: yearly contributions, public repos, followers. */
export function physical(profile: GitHubProfile): number {
  return blend([
    { rating: logRating(profile.contributions.total, PHY.contributionsCap), weight: PHY.contributionsWeight },
    { rating: logRating(profile.publicRepos, PHY.publicReposCap), weight: PHY.publicReposWeight },
    { rating: logRating(profile.followers, PHY.followersCap), weight: PHY.followersWeight },
  ]);
}

export function computeStats(profile: GitHubProfile, shares: readonly LanguageShare[], now: Date): Stats {
  return {
    PAC: Math.round(pace(profile)),
    SHO: Math.round(shooting(profile)),
    PAS: Math.round(passing(profile)),
    DRI: Math.round(dribbling(shares)),
    DEF: Math.round(defending(profile, now)),
    PHY: Math.round(physical(profile)),
  };
}

/** Weighted average of the (rounded) card stats. */
export function computeOverall(stats: Stats): number {
  const keys = Object.keys(OVERALL_WEIGHTS) as StatKey[];
  return Math.round(blend(keys.map((k) => ({ rating: stats[k], weight: OVERALL_WEIGHTS[k] }))));
}
