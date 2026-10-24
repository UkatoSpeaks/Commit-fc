import type { Cache } from "./types";

/** The few Redis commands we use. @upstash/redis's Redis client satisfies this. */
export interface RedisLike {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts: { px: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

/**
 * Shared cache backed by Redis (Upstash REST in production), so every server
 * instance sees the same entries. Values are stored as JSON.
 *
 * Never throws: a Redis error is logged and treated as a miss / no-op, so the
 * cache can't fail a request.
 */
export class RedisCache<T> implements Cache<T> {
  constructor(
    private readonly redis: RedisLike,
    private readonly defaultTtlMs: number,
    private readonly log: (message: string, err: unknown) => void = (m, e) => console.error(m, e),
  ) {}

  async get(key: string): Promise<T | undefined> {
    try {
      const value = await this.redis.get<T>(key);
      return value ?? undefined;
    } catch (err) {
      this.log(`[cache] Redis GET ${key} failed; continuing without cache`, err);
      return undefined;
    }
  }

  async set(key: string, value: T, ttlMs = this.defaultTtlMs): Promise<void> {
    try {
      await this.redis.set(key, value, { px: ttlMs });
    } catch (err) {
      this.log(`[cache] Redis SET ${key} failed; continuing without cache`, err);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.log(`[cache] Redis DEL ${key} failed`, err);
    }
  }
}
