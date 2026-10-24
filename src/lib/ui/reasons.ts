import type { GitHubProfile } from "@/lib/github/types";
import type { StatKey } from "@/lib/stats";
import { DRI, PAC } from "@/lib/stats/config";
import { languageShares } from "@/lib/stats/languages";
import { accountAgeYears } from "@/lib/stats/stats";
import { calculateStreaks, recentContributions } from "@/lib/stats/streak";

const fmt = new Intl.NumberFormat("en-US");

function plural(n: number, one: string, many = `${one}s`): string {
  return `${fmt.format(n)} ${n === 1 ? one : many}`;
}

export function ratingColor(value: number): "good" | "ok" | "low" {
  if (value >= 75) return "good";
  if (value >= 60) return "ok";
  return "low";
}

/** One-line, human explanation per stat, built from the same inputs the engine uses. */
export function ratingReasons(profile: GitHubProfile, now: Date): Record<StatKey, string> {
  const { calendar, issues, prReviews, total } = profile.contributions;
  const stars = profile.repos.reduce((s, r) => s + r.stars, 0);
  const forks = profile.repos.reduce((s, r) => s + r.forks, 0);
  const shares = languageShares(profile.repos);
  const counted = shares.filter((s) => s.share > DRI.minShare).length;
  const years = Math.floor(accountAgeYears(profile.createdAt, now));

  const topLangs = shares
    .slice(0, 3)
    .map((s) => `${s.name} ${s.share < 0.01 ? "<1" : Math.round(s.share * 100)}%`)
    .join(" · ");

  return {
    PAC: `${plural(recentContributions(calendar, PAC.recentDays), "contribution")} in the last ${PAC.recentDays} days · current streak ${plural(calculateStreaks(calendar).current, "day")}`,
    SHO: `${plural(stars, "star")} across ${plural(profile.repos.length, "repo")}`,
    PAS: `${plural(profile.externalPRs.opened, "PR")} opened to other repos (${fmt.format(profile.externalPRs.merged)} merged) · ${plural(forks, "fork")}`,
    DRI: shares.length === 0 ? "No language data in public repos yet" : `${topLangs} · ${plural(counted, "language")} counted`,
    DEF: `${plural(issues, "issue")} · ${plural(prReviews, "PR review")} · ${plural(years, "year")} on GitHub`,
    PHY: `${plural(total, "contribution")} this year · ${plural(profile.publicRepos, "public repo")} · ${plural(profile.followers, "follower")}`,
  };
}
