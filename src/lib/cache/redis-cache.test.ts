import { describe, expect, it, vi } from "vitest";
import { RedisCache, type RedisLike } from "./redis-cache";

function fakeRedis(): RedisLike & { store: Map<string, { value: unknown; px: number }> } {
  const store = new Map<string, { value: unknown; px: number }>();
  return {
    store,
    async get<T>(key: string) {
      return (store.get(key)?.value as T | undefined) ?? null;
    },
    async set(key, value, opts) {
      store.set(key, { value: JSON.parse(JSON.stringify(value)), px: opts.px });
      return "OK";
    },
    async del(key) {
      return store.delete(key) ? 1 : 0;
    },
  };
}

function brokenRedis(): RedisLike {
  const fail = async () => {
    throw new Error("ECONNRESET");
  };
  return { get: fail, set: fail, del: fail };
}

describe("RedisCache", () => {
  it("round-trips values and uses the default TTL", async () => {
    const redis = fakeRedis();
    const cache = new RedisCache<{ a: number }>(redis, 5_000);
    await cache.set("k", { a: 1 });
    expect(await cache.get("k")).toEqual({ a: 1 });
    expect(redis.store.get("k")?.px).toBe(5_000);
  });

  it("returns undefined on a miss", async () => {
    expect(await new RedisCache(fakeRedis(), 1000).get("missing")).toBeUndefined();
  });

  it("honors a per-call TTL and delete", async () => {
    const redis = fakeRedis();
    const cache = new RedisCache<string>(redis, 5_000);
    await cache.set("k", "v", 10);
    expect(redis.store.get("k")?.px).toBe(10);
    await cache.delete("k");
    expect(await cache.get("k")).toBeUndefined();
  });

  it("never throws when Redis fails; logs and acts like a miss", async () => {
    const log = vi.fn();
    const cache = new RedisCache<string>(brokenRedis(), 1000, log);
    await expect(cache.get("k")).resolves.toBeUndefined();
    await expect(cache.set("k", "v")).resolves.toBeUndefined();
    await expect(cache.delete("k")).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledTimes(3);
  });
});
