/**
 * Every tunable number in the stats engine lives here.
 * Caps are the raw value that maps to a 99 rating (log scale).
 * Weights inside a stat must add up to 1.
 */

export const RATING = { min: 40, max: 99 } as const;

export const PAC = {
  recentDays: 90,
  recentCap: 500,
  recentWeight: 0.7,
  streakCap: 100,
  streakWeight: 0.3,
} as const;

export const SHO = { starsCap: 10_000 } as const;

export const PAS = {
  prCap: 200,
  prWeight: 0.6,
  forksCap: 1_000,
  forksWeight: 0.4,
} as const;

export const DRI = {
  /** A language counts only if it has more than this share of total bytes */
  minShare: 0.02,
  /** Linear scale: 1 language = oneLanguageRating, maxLanguages+ = maxRating */
  oneLanguageRating: 45,
  maxLanguages: 10,
  maxRating: 95,
} as const;

export const DEF = {
  activityCap: 300,
  activityWeight: 0.6,
  ageYearsCap: 12,
  ageWeight: 0.4,
} as const;

export const PHY = {
  contributionsCap: 2_000,
  contributionsWeight: 0.5,
  publicReposCap: 100,
  publicReposWeight: 0.25,
  followersCap: 5_000,
  followersWeight: 0.25,
} as const;

export const OVERALL_WEIGHTS = {
  PAC: 0.2,
  SHO: 0.2,
  PAS: 0.15,
  DRI: 0.15,
  DEF: 0.15,
  PHY: 0.15,
} as const;

/** Checked top-down; first match wins. */
export const TIERS = [
  { tier: "special", min: 85 },
  { tier: "gold", min: 75 },
  { tier: "silver", min: 65 },
  { tier: "bronze", min: 0 },
] as const;

/** Byte multipliers applied before computing language shares (position + DRI). */
export const LANGUAGE_BYTE_WEIGHTS: Readonly<Record<string, number>> = {
  // Notebooks store outputs (images, tables), which inflates their size.
  "Jupyter Notebook": 0.1,
};

export const POSITION = {
  /** Top group at or above this share wins outright */
  dominantShare: 0.5,
  /** Otherwise, this many groups at or above groupShare means fullstack */
  fullstackMinGroups: 3,
  fullstackGroupShare: 0.15,
  /** Kotlin counts as mobile when any of these appear; backend otherwise */
  kotlinMobileSignals: ["Swift", "Dart"],
} as const;

export const POSITION_GROUPS = {
  AI: { label: "AI", pitch: "CAM", languages: ["Python", "Jupyter Notebook"] },
  FE: {
    label: "Frontend",
    pitch: "LW",
    languages: ["TypeScript", "JavaScript", "CSS", "HTML", "SCSS", "Vue", "Svelte"],
  },
  BE: { label: "Backend", pitch: "ST", languages: ["Go", "Java", "Rust", "C#", "PHP", "Ruby"] },
  OPS: { label: "DevOps", pitch: "CB", languages: ["Dockerfile", "Shell", "HCL", "YAML", "Nix"] },
  SYS: { label: "Systems", pitch: "CDM", languages: ["C", "C++", "Assembly"] },
  MOB: { label: "Mobile", pitch: "RW", languages: ["Swift", "Dart", "Objective-C"] },
} as const;

export const FALLBACK_POSITIONS = {
  FS: { label: "Fullstack", pitch: "CM" },
  SUB: { label: "Substitute", pitch: "GK" },
} as const;
