import type { ContributionDay } from "@/lib/github/types";

export const GRID_DAYS = 28;

/** Opacity for each of the last 28 days (oldest first), relative to the busiest day. */
export function commitGridOpacities(calendar: readonly ContributionDay[]): number[] {
  const days = calendar.slice(-GRID_DAYS).map((d) => d.count);
  while (days.length < GRID_DAYS) days.unshift(0);
  const max = Math.max(...days);

  return days.map((count) => {
    if (count === 0 || max === 0) return 0.14;
    const level = count / max;
    if (level > 0.75) return 1;
    if (level > 0.5) return 0.78;
    if (level > 0.25) return 0.58;
    return 0.38;
  });
}
