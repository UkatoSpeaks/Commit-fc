import type { RawPlayerData, RawRepo, RawUser } from "./raw-types";
import type { ContributionDay, GitHubProfile, Repo } from "./types";

function mapRepo(raw: RawRepo): Repo {
  return {
    name: raw.name,
    stars: raw.stargazerCount,
    forks: raw.forkCount,
    primaryLanguage: raw.primaryLanguage?.name ?? null,
    languages: (raw.languages?.edges ?? []).map((e) => ({ name: e.node.name, bytes: e.size })),
  };
}

function mapCalendar(user: RawUser): ContributionDay[] {
  return user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount }));
}

export function mapProfile(data: RawPlayerData & { user: RawUser }): GitHubProfile {
  const { user } = data;
  const repos = (user.repositories.nodes ?? [])
    .filter((r): r is RawRepo => r !== null)
    .map(mapRepo);

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    location: user.location,
    bio: user.bio,
    createdAt: user.createdAt,
    followers: user.followers.totalCount,
    publicRepos: user.publicRepos.totalCount,
    repos,
    contributions: {
      total: user.contributionsCollection.contributionCalendar.totalContributions,
      calendar: mapCalendar(user),
      prReviews: user.contributionsCollection.totalPullRequestReviewContributions,
      issues: user.contributionsCollection.totalIssueContributions,
    },
    externalPRs: {
      opened: data.externalPRs?.issueCount ?? 0,
      merged: data.mergedPRs?.issueCount ?? 0,
    },
  };
}
