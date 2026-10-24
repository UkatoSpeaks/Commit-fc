/** Clean, app-facing GitHub data. Everything the stats engine needs, nothing more. */

export interface RepoLanguage {
  name: string;
  bytes: number;
}

export interface Repo {
  name: string;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  languages: RepoLanguage[];
}

export interface ContributionDay {
  /** ISO date, e.g. "2026-10-24" */
  date: string;
  count: number;
}

export interface Contributions {
  /** Total contributions in the last year */
  total: number;
  /** Daily counts, oldest first, ending today */
  calendar: ContributionDay[];
  prReviews: number;
  issues: number;
}

export interface ExternalPRs {
  /** PRs the user opened to repos they don't own */
  opened: number;
  /** How many of those were merged */
  merged: number;
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  location: string | null;
  bio: string | null;
  createdAt: string;
  followers: number;
  /** All public repos the user owns, forks included */
  publicRepos: number;
  /** Owned non-fork public repos, up to 100, most-starred first */
  repos: Repo[];
  contributions: Contributions;
  externalPRs: ExternalPRs;
}
