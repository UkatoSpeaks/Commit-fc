import { RATING } from "./config";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Log-scale a raw count to 40–99. `cap` and above map to 99. */
export function logRating(value: number, cap: number): number {
  const x = Math.max(0, value);
  const span = RATING.max - RATING.min;
  return clamp(RATING.min + (span * Math.log10(x + 1)) / Math.log10(cap + 1), RATING.min, RATING.max);
}

/** Weighted sum of already-normalized ratings. Weights should sum to 1. */
export function blend(parts: readonly { rating: number; weight: number }[]): number {
  return parts.reduce((sum, p) => sum + p.rating * p.weight, 0);
}
