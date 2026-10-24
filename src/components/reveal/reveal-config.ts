import type { Tier } from "@/lib/stats";

/**
 * Every timing and intensity of the pack reveal, in one place.
 * Durations are in seconds and run back to back once the pack opens:
 *
 *   pack → nation → hold → position → hold → club → hold → burst → card → stats → overall → end
 *
 * The total (see `revealDuration`) is ~2.5s bronze, ~3.5s silver, ~5s gold, ~6.5s special.
 */
export interface TierReveal {
  /** Pack splits open, light leaks out */
  pack: number;
  /** Flag drops in, country name types in */
  nation: number;
  nationHold: number;
  /** Position code slams in */
  position: number;
  positionHold: number;
  /** Club badge and repo name slide up */
  club: number;
  clubHold: number;
  /** Full-screen flash in the tier color; the card arrives back-first and starts to spin */
  burst: number;
  /** Card finishes spinning to the front and lands */
  card: number;
  /** Each stat counts up from 0 for this long… */
  statCount: number;
  /** …starting this long after the previous one */
  statStagger: number;
  /** Overall rating slams in last */
  overall: number;
  /** Time on the finished card before the report appears */
  hold: number;

  /** Total card rotation while it arrives (180 = one half turn, 540 = one and a half) */
  spin: number;
  /** Idle pack rumble, degrees */
  shake: number;
  /** Screen shake when the overall lands, px (0 = none) */
  slamShake: number;
  /** Peak flash opacity, 0–1 */
  flash: number;
  /** How far the burst ring grows */
  ring: number;
  /** Light ray strength after the burst, 0–1 */
  rays: number;
  /** Sparkle particles around the card (0 = none) */
  sparkles: number;
  confetti: boolean;
  /** Tier color used by the seam light, flash, glow and floodlights */
  color: string;
}

/** Number of stats on the card (they count up one after another). */
export const STAT_COUNT = 6;

/** Time from the first stat starting to count to the last one finishing. */
export function statsDuration(t: TierReveal): number {
  return t.statCount + (STAT_COUNT - 1) * t.statStagger;
}

/** The beats in order, with their durations. Labels on the master timeline use these names. */
export function revealBeats(t: TierReveal) {
  return [
    ["pack", t.pack],
    ["nation", t.nation],
    ["nationHold", t.nationHold],
    ["position", t.position],
    ["positionHold", t.positionHold],
    ["club", t.club],
    ["clubHold", t.clubHold],
    ["burst", t.burst],
    ["card", t.card],
    ["stats", statsDuration(t)],
    ["overall", t.overall],
    ["hold", t.hold],
  ] as const;
}

export type RevealBeat = ReturnType<typeof revealBeats>[number][0];

/** Total reveal length from opening the pack to the report, in seconds. */
export function revealDuration(t: TierReveal): number {
  return revealBeats(t).reduce((sum, [, d]) => sum + d, 0);
}

export const REVEAL = {
  /** Pack opens by itself after this long */
  autoOpen: 2,
  /** Longest wait for the Three.js stage before falling back to CSS rays */
  stageTimeoutMs: 300,
  /** Neutral floodlight color before the burst */
  floodColor: "#F5E6A8",
  /** Scout report fade/slide-in after the reveal, seconds */
  reportIn: 0.55,
  tiers: {
    // ~2.5s: quick, short holds, no frills
    bronze: {
      pack: 0.25, nation: 0.3, nationHold: 0.15, position: 0.2, positionHold: 0.15, club: 0.15, clubHold: 0.15,
      burst: 0.15, card: 0.35, statCount: 0.12, statStagger: 0.06, overall: 0.2, hold: 0.08,
      spin: 180, shake: 1, slamShake: 0, flash: 0.22, ring: 1, rays: 0.3, sparkles: 0, confetti: false, color: "#C68A5C",
    },
    // ~3.5s
    silver: {
      pack: 0.25, nation: 0.35, nationHold: 0.3, position: 0.25, positionHold: 0.3, club: 0.25, clubHold: 0.3,
      burst: 0.2, card: 0.4, statCount: 0.12, statStagger: 0.07, overall: 0.25, hold: 0.15,
      spin: 180, shake: 1.6, slamShake: 0, flash: 0.32, ring: 1.15, rays: 0.45, sparkles: 0, confetti: false, color: "#D9DEE3",
    },
    // ~5s: sparkles, a fuller spin and a screen shake on the slam
    gold: {
      pack: 0.4, nation: 0.55, nationHold: 0.35, position: 0.35, positionHold: 0.35, club: 0.35, clubHold: 0.35,
      burst: 0.3, card: 0.7, statCount: 0.2, statStagger: 0.075, overall: 0.4, hold: 0.35,
      spin: 540, shake: 2.4, slamShake: 6, flash: 0.5, ring: 1.3, rays: 0.7, sparkles: 18, confetti: false, color: "#F6DA7E",
    },
    // ~6.5s: everything, plus confetti
    special: {
      pack: 0.5, nation: 0.7, nationHold: 0.4, position: 0.45, positionHold: 0.4, club: 0.45, clubHold: 0.4,
      burst: 0.45, card: 0.95, statCount: 0.25, statStagger: 0.08, overall: 0.5, hold: 0.6,
      spin: 540, shake: 3.4, slamShake: 9, flash: 0.75, ring: 1.7, rays: 1, sparkles: 26, confetti: true, color: "#9A7BFF",
    },
  } satisfies Record<Tier, TierReveal>,
} as const;

export const CONFETTI_COLORS = ["#9A7BFF", "#3DDC84", "#F5E6A8", "#FF6FD8", "#5BE9FF"];

/**
 * Values the master timeline tweens and the background stage (WebGL or CSS) reads
 * every frame. Keeps 2D and 3D in sync without React re-renders.
 */
export interface StageLevels {
  /** Light ray strength, 0–1+ */
  rays: number;
  /** Dust visibility, 0–1 */
  dust: number;
  /** Floodlight glow strength, 0–1.5 */
  flood: number;
  /** 0 = neutral floodlight color, 1 = tier color */
  tint: number;
}

export const INITIAL_LEVELS: StageLevels = { rays: 0.2, dust: 0.6, flood: 0.35, tint: 0 };

export interface StageProps {
  levels: StageLevels;
  /** Tier color the floodlights shift to at the burst */
  color: string;
}
