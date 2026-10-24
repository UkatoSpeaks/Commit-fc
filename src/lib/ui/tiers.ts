import type { Tier } from "@/lib/stats";

export interface TierMaterialDef {
  label: string;
  background: string;
  /** Text color on the card */
  ink: string;
  /** Tier dot / chip color (CSS variable) */
  dot: string;
}

export const TIER_MATERIALS: Record<Tier, TierMaterialDef> = {
  bronze: {
    label: "Bronze",
    background: "linear-gradient(155deg,#7A4B2A 0%,#C68A5C 42%,#A0673C 68%,#5E391F 100%)",
    ink: "#1C1008",
    dot: "var(--color-bronze)",
  },
  silver: {
    label: "Silver",
    background: "linear-gradient(155deg,#8C96A0 0%,#E6EAEE 40%,#B4BCC4 68%,#6F7983 100%)",
    ink: "#12161A",
    dot: "var(--color-silver)",
  },
  gold: {
    label: "Gold",
    background: "linear-gradient(155deg,#A87A1E 0%,#F6DA7E 42%,#D9AE45 66%,#8C6418 100%)",
    ink: "#221804",
    dot: "var(--color-gold)",
  },
  special: {
    label: "Special",
    background: "linear-gradient(155deg,#140B33 0%,#3A1D78 38%,#1B2F6B 70%,#0B1A33 100%)",
    ink: "#F5F2FF",
    dot: "var(--color-special)",
  },
};

export const CARD_CLIP = "polygon(14% 0, 86% 0, 100% 7%, 100% 86%, 50% 100%, 0 86%, 0 7%)";
export const CARD_W = 300;
export const CARD_H = 440;
