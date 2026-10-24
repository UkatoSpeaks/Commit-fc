export type GitHubErrorCode =
  | "USER_NOT_FOUND"
  | "RATE_LIMITED"
  | "MISSING_TOKEN"
  | "BAD_TOKEN"
  | "NETWORK"
  | "UPSTREAM";

const STATUS_BY_CODE: Record<GitHubErrorCode, number> = {
  USER_NOT_FOUND: 404,
  RATE_LIMITED: 429,
  MISSING_TOKEN: 500,
  BAD_TOKEN: 500,
  NETWORK: 502,
  UPSTREAM: 502,
};

export class GitHubError extends Error {
  readonly code: GitHubErrorCode;
  readonly status: number;
  /** Seconds until the rate limit resets, when known */
  readonly retryAfter?: number;

  constructor(code: GitHubErrorCode, message: string, retryAfter?: number) {
    super(message);
    this.name = "GitHubError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.retryAfter = retryAfter;
  }
}
