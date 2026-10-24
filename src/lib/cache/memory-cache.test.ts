import { describe, expect, it } from "vitest";
import { MemoryCache } from "./memory-cache";

describe("MemoryCache", () => {
  it("returns values until the TTL expires", async () => {
    let now = 0;
    const cache = new MemoryCache<string>(1000, 10, () => now);
    await cache.set("k", "v");
    expect(await cache.get("k")).toBe("v");
    now = 999;
    expect(await cache.get("k")).toBe("v");
    now = 1000;
    expect(await cache.get("k")).toBeUndefined();
  });

  it("evicts the oldest entry when full", async () => {
    const cache = new MemoryCache<number>(1000, 2);
    await cache.set("a", 1);
    await cache.set("b", 2);
    await cache.set("c", 3);
    expect(await cache.get("a")).toBeUndefined();
    expect(await cache.get("c")).toBe(3);
  });
});
