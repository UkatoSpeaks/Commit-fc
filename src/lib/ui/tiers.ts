import type { Tier } from "@/lib/stats";

export interface TierMaterialDef {
  label: string;
  background: string;
  /** Text color on the card */
  ink: string;
  /** Tier dot / chip color (CSS variable) */
  dot: string;
  /** Plain hex tier color, for places CSS variables can't reach (SVG, exports) */
  hex: string;
  /** Embossed frame: highlight on the top edges, shadow on the bottom edges */
  frameLight: string;
  frameDark: string;
  /** Embossed text: 1px highlight above, soft shadow below */
  textShadow: string;
  /** Optional vertical gradient fill for the overall rating (falls back to `ink`) */
  overallFill?: string;
  /** Card edge seen when the card tilts (slightly darker than the face) */
  edge: string;
  /** Pattern stroke/fill color and strength */
  pattern: string;
  patternOpacity: number;
  /** Strength of the live foil grain, 0–1 */
  grain: number;
}

export const TIER_MATERIALS: Record<Tier, TierMaterialDef> = {
  bronze: {
    label: "Bronze",
    // Lighter ends than before so dark ink keeps ≥4.5:1 everywhere on the card.
    background: "linear-gradient(155deg,#A8703F 0%,#D29767 42%,#B87D4C 68%,#9A6236 100%)",
    ink: "#1C1008",
    dot: "var(--color-bronze)",
    hex: "#C68A5C",
    frameLight: "rgba(255,226,196,0.75)",
    frameDark: "rgba(46,24,8,0.7)",
    textShadow: "0 -1px 0 rgba(255,222,188,0.45), 0 1px 2px rgba(40,18,4,0.35)",
    edge: "#7A4A24",
    pattern: "#2A1608",
    patternOpacity: 0,
    grain: 0.1,
  },
  silver: {
    label: "Silver",
    background: "linear-gradient(155deg,#8C96A0 0%,#E6EAEE 40%,#B4BCC4 68%,#6F7983 100%)",
    ink: "#12161A",
    dot: "var(--color-silver)",
    hex: "#D9DEE3",
    frameLight: "rgba(255,255,255,0.9)",
    frameDark: "rgba(30,36,42,0.6)",
    textShadow: "0 -1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.25)",
    edge: "#8A939C",
    pattern: "#2B3238",
    patternOpacity: 0.1,
    grain: 0.08,
  },
  gold: {
    label: "Gold",
    background: "linear-gradient(155deg,#A87A1E 0%,#F6DA7E 42%,#D9AE45 66%,#8C6418 100%)",
    ink: "#221804",
    dot: "var(--color-gold)",
    hex: "#F6DA7E",
    frameLight: "rgba(255,247,214,0.95)",
    frameDark: "rgba(74,48,4,0.7)",
    textShadow: "0 -1px 0 rgba(255,246,206,0.6), 0 1px 2px rgba(70,44,0,0.35)",
    overallFill: "linear-gradient(180deg,#3D2C07 0%,#1A1102 100%)",
    edge: "#A07A1F",
    pattern: "#FFF6D2",
    patternOpacity: 0.2,
    grain: 0.16,
  },
  special: {
    label: "Special",
    background: "linear-gradient(155deg,#140B33 0%,#3A1D78 38%,#1B2F6B 70%,#0B1A33 100%)",
    ink: "#F5F2FF",
    dot: "var(--color-special)",
    hex: "#9A7BFF",
    frameLight: "rgba(214,200,255,0.85)",
    frameDark: "rgba(4,2,16,0.8)",
    textShadow: "0 -1px 0 rgba(255,255,255,0.22), 0 1px 3px rgba(0,0,0,0.6)",
    overallFill: "linear-gradient(180deg,#FFFFFF 0%,#DCD2FF 100%)",
    edge: "#4A34A8",
    pattern: "#CDBEFF",
    patternOpacity: 0.22,
    grain: 0.18,
  },
};

export const CARD_CLIP = "polygon(14% 0, 86% 0, 100% 7%, 100% 86%, 50% 100%, 0 86%, 0 7%)";
export const CARD_W = 300;
export const CARD_H = 440;

/** The card shield in px (same shape as CARD_CLIP), for SVG. */
export const CARD_POINTS = "42,0 258,0 300,30.8 300,378.4 150,440 0,378.4 0,30.8";
/** The shield inset by 8px on every side, for the embossed inner frame. */
export const FRAME_POINTS = "44.6,8 255.4,8 292,34.9 292,373 150,431.4 8,373 8,34.9";
/** CARD_CLIP in px for the fixed 300x440 face. Satori misreads some of the % points. */
export const CARD_CLIP_PX = "polygon(42px 0px, 258px 0px, 300px 30.8px, 300px 378.4px, 150px 440px, 0px 378.4px, 0px 30.8px)";
