import type { Player } from "@/lib/stats";
import { MemoryCache } from "./memory-cache";
import type { Cache } from "./types";

export const PLAYER_TTL_MS = 24 * 60 * 60 * 1000;

// Kept on globalThis so dev hot reloads don't wipe it. Swap for Redis here later.
const globalForCache = globalThis as typeof globalThis & { playerCache?: Cache<Player> };

export const playerCache: Cache<Player> =
  globalForCache.playerCache ?? (globalForCache.playerCache = new MemoryCache<Player>(PLAYER_TTL_MS));

export type { Cache } from "./types";
export { MemoryCache } from "./memory-cache";
