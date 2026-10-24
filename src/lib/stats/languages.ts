import type { Repo } from "@/lib/github/types";
import { LANGUAGE_BYTE_WEIGHTS } from "./config";

export interface LanguageShare {
  name: string;
  /** Weighted bytes (see LANGUAGE_BYTE_WEIGHTS) */
  bytes: number;
  /** 0–1 share of all weighted bytes */
  share: number;
}

/** Weighted byte share per language across all repos, largest first. */
export function languageShares(repos: readonly Repo[]): LanguageShare[] {
  const totals = new Map<string, number>();
  for (const repo of repos) {
    for (const lang of repo.languages) {
      const weighted = lang.bytes * (LANGUAGE_BYTE_WEIGHTS[lang.name] ?? 1);
      totals.set(lang.name, (totals.get(lang.name) ?? 0) + weighted);
    }
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];

  return [...totals.entries()]
    .map(([name, bytes]) => ({ name, bytes, share: bytes / sum }))
    .sort((a, b) => b.bytes - a.bytes);
}
