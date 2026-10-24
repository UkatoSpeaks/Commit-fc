import { Redis } from "@upstash/redis";
import type { GitHubProfile } from "@/lib/github/types";
import { MemoryCache } from "./memory-cache";
import { RedisCache } from "./redis-cache";
import type { Cache } from "./types";

export const PROFILE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * We cache the raw GitHub profile, not the rated player, so rating changes apply
 * immediately. Bump the version only when the GitHubProfile shape changes.
 */
export function profileCacheKey(login: string): string {
  return `profile:v1:${login.toLowerCase()}`;
}

function createProfileCache(): Cache<GitHubProfile> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    return new RedisCache<GitHubProfile>(new Redis({ url, token }), PROFILE_TTL_MS);
  }
  console.warn(
    "[cache] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set; using an in-memory cache (per instance, not shared).",
  );
  return new MemoryCache<GitHubProfile>(PROFILE_TTL_MS);
}

// Kept on globalThis so dev hot reloads don't wipe the memory cache or repeat the warning.
const globalForCache = globalThis as typeof globalThis & { profileCache?: Cache<GitHubProfile> };

export const profileCache: Cache<GitHubProfile> =
  globalForCache.profileCache ?? (globalForCache.profileCache = createProfileCache());

export type { Cache } from "./types";
export { MemoryCache } from "./memory-cache";
export { RedisCache } from "./redis-cache";
