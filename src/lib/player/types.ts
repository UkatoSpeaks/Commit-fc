import type { GitHubErrorCode } from "@/lib/github/errors";
import type { Player } from "@/lib/stats";

/** Safe to import from client components (no server-only deps). */

export type PlayerErrorCode = GitHubErrorCode | "INVALID_USERNAME" | "INTERNAL";

export interface PlayerError {
  code: PlayerErrorCode;
  status: number;
  message: string;
  /** Seconds until the rate limit resets, when known */
  retryAfter?: number;
}

export type PlayerResult =
  | { ok: true; player: Player; cacheHit: boolean }
  | { ok: false; error: PlayerError };
