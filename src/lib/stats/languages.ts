import type { Repo } from "@/lib/github/types";
import { LANGUAGE_BYTE_WEIGHTS } from "./config";

export interface LanguageShare {
  name: string;
  /** Summed repo weight for this language (see languageShares) */
  weight: number;
  /** 0–1 share of all weight */
  share: number;
}

/** How much one repo counts: 1 for an unstarred repo, +1 per 10x stars. */
export function repoWeight(stars: number): number {
  return 1 + Math.log10(Math.max(0, stars) + 1);
}

/**
 * Language mix across repos, largest first.
 *
 * Each repo's bytes are turned into shares that add up to 1 (after LANGUAGE_BYTE_WEIGHTS),
 * then scaled by repoWeight(stars) and summed. So one huge repo (e.g. generated HTML)
 * counts as one repo, not as most of the profile.
 */
export function languageShares(repos: readonly Repo[]): LanguageShare[] {
  const totals = new Map<string, number>();
  for (const repo of repos) {
    const weighted = repo.languages.map((l) => ({ name: l.name, bytes: l.bytes * (LANGUAGE_BYTE_WEIGHTS[l.name] ?? 1) }));
    const repoBytes = weighted.reduce((sum, l) => sum + l.bytes, 0);
    if (repoBytes <= 0) continue;

    const w = repoWeight(repo.stars);
    for (const l of weighted) {
      totals.set(l.name, (totals.get(l.name) ?? 0) + (l.bytes / repoBytes) * w);
    }
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];

  return [...totals.entries()]
    .map(([name, weight]) => ({ name, weight, share: weight / sum }))
    .sort((a, b) => b.weight - a.weight);
}
