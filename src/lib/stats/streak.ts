import type { ContributionDay } from "@/lib/github/types";

export interface Streaks {
  current: number;
  longest: number;
}

/**
 * Calendar is oldest-first and ends today. A zero today doesn't break the
 * current streak (the day isn't over yet); it then counts back from yesterday.
 */
export function calculateStreaks(calendar: readonly ContributionDay[]): Streaks {
  let longest = 0;
  let run = 0;
  for (const day of calendar) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let i = calendar.length - 1;
  if (calendar[i]?.count === 0) i -= 1;
  let current = 0;
  while (i >= 0 && (calendar[i]?.count ?? 0) > 0) {
    current += 1;
    i -= 1;
  }

  return { current, longest };
}

/** Sum of the last `days` entries of the calendar. */
export function recentContributions(calendar: readonly ContributionDay[], days: number): number {
  return calendar.slice(-days).reduce((sum, d) => sum + d.count, 0);
}
