import type { Tier } from "@/lib/stats";

/**
 * Every timing and intensity of the pack reveal, in one place.
 * Segment durations are in seconds and run back to back after the pack opens:
 * pack → nation → position → club → burst → card → hold.
 */
export interface TierReveal {
  /** Pack splits open, light leaks out */
  pack: number;
  /** Flag drops in, country name types in */
  nation: number;
  /** Position code slams in */
  position: number;
  /** Club badge and repo name slide up */
  club: number;
  /** Full-screen flash in the tier color */
  burst: number;
  /** Card flips into place */
  card: number;
  /** Time on the finished card before the report appears */
  hold: number;

  /** Idle pack shake, degrees */
  shake: number;
  /** Peak flash opacity, 0–1 */
  flash: number;
  /** How far the burst ring grows */
  ring: number;
  /** Light ray strength after the burst, 0–1 */
  rays: number;
  /** Sparkle particles around the card (0 = none) */
  sparkles: number;
  confetti: boolean;
  /** Tier color used by the flash, glow and floodlights */
  color: string;
}

export const REVEAL = {
  /** Pack opens by itself after this long */
  autoOpen: 2,
  /** Longest wait for the Three.js stage before falling back to CSS rays */
  stageTimeoutMs: 300,
  /** Neutral floodlight color before the burst */
  floodColor: "#F5E6A8",
  tiers: {
    // ~3.2s: short and calm
    bronze: {
      pack: 0.4, nation: 0.75, position: 0.45, club: 0.4, burst: 0.2, card: 0.7, hold: 0.3,
      shake: 1, flash: 0.22, ring: 1, rays: 0.3, sparkles: 0, confetti: false, color: "#C68A5C",
    },
    // ~3.7s
    silver: {
      pack: 0.45, nation: 0.85, position: 0.5, club: 0.45, burst: 0.25, card: 0.8, hold: 0.4,
      shake: 1.5, flash: 0.32, ring: 1.15, rays: 0.45, sparkles: 0, confetti: false, color: "#D9DEE3",
    },
    // ~4.2s: adds sparkles
    gold: {
      pack: 0.5, nation: 0.9, position: 0.55, club: 0.5, burst: 0.3, card: 0.9, hold: 0.55,
      shake: 2, flash: 0.5, ring: 1.3, rays: 0.7, sparkles: 18, confetti: false, color: "#F6DA7E",
    },
    // ~4.8s: full burst plus confetti
    special: {
      pack: 0.55, nation: 0.95, position: 0.6, club: 0.5, burst: 0.4, card: 1, hold: 0.8,
      shake: 3, flash: 0.75, ring: 1.7, rays: 1, sparkles: 26, confetti: true, color: "#9A7BFF",
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
