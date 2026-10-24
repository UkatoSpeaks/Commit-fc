export const PLAYER_QUERY = /* GraphQL */ `
  query Player($login: String!, $prQuery: String!, $mergedQuery: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      location
      bio
      createdAt
      followers {
        totalCount
      }
      publicRepos: repositories(ownerAffiliations: OWNER, privacy: PUBLIC) {
        totalCount
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        privacy: PUBLIC
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          name
          stargazerCount
          forkCount
          primaryLanguage {
            name
          }
          languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
      contributionsCollection {
        totalPullRequestReviewContributions
        totalIssueContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
    externalPRs: search(query: $prQuery, type: ISSUE, first: 1) {
      issueCount
    }
    mergedPRs: search(query: $mergedQuery, type: ISSUE, first: 1) {
      issueCount
    }
  }
`;

/** Search strings for PRs opened to repos the user doesn't own. */
export function externalPRQueries(login: string): { prQuery: string; mergedQuery: string } {
  const base = `is:pr author:${login} -user:${login}`;
  return { prQuery: base, mergedQuery: `${base} is:merged` };
}
