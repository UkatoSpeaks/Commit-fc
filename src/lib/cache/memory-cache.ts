import type { Cache } from "./types";

interface Entry<T> {
  value: T;
  expiresAt: number;
}

/** Per-process TTL cache. Oldest entry is evicted once maxEntries is reached. */
export class MemoryCache<T> implements Cache<T> {
  private readonly store = new Map<string, Entry<T>>();

  constructor(
    private readonly defaultTtlMs: number,
    private readonly maxEntries = 1_000,
    private readonly now: () => number = Date.now,
  ) {}

  async get(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(key: string, value: T, ttlMs = this.defaultTtlMs): Promise<void> {
    this.store.delete(key);
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }
    this.store.set(key, { value, expiresAt: this.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
