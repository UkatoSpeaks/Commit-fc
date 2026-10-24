/** Shape of the GitHub GraphQL response for PLAYER_QUERY. */

export interface RawRepo {
  name: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  languages: { edges: { size: number; node: { name: string } }[] } | null;
}

export interface RawUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  location: string | null;
  bio: string | null;
  createdAt: string;
  followers: { totalCount: number };
  publicRepos: { totalCount: number };
  repositories: { nodes: (RawRepo | null)[] | null };
  contributionsCollection: {
    totalPullRequestReviewContributions: number;
    totalIssueContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
    };
  };
}

export interface RawSearchCount {
  issueCount: number;
}

export interface RawPlayerData {
  user: RawUser | null;
  externalPRs: RawSearchCount | null;
  mergedPRs: RawSearchCount | null;
}

export interface RawGraphQLError {
  type?: string;
  message: string;
  path?: (string | number)[];
}

export interface RawGraphQLResponse {
  data?: RawPlayerData | null;
  errors?: RawGraphQLError[];
}
