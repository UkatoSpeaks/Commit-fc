/** Async so a Redis (or any remote) store can implement it unchanged. */
export interface Cache<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
