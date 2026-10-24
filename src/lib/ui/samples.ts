import type { CardData } from "./card-data";
import { countryByCode } from "./flags";

/** Deterministic fake activity so samples render the same on server and client. */
function fakeGrid(seed: number): number[] {
  const levels = [0.14, 0.38, 0.58, 0.78, 1];
  return Array.from({ length: 28 }, (_, i) => levels[(i * 7 + seed * 3 + ((i * i) % 5)) % levels.length]!);
}

/** Fictional players for the landing page. */
export const SAMPLE_CARDS: Record<"silver" | "gold" | "special", CardData> = {
  silver: {
    name: "Mehta",
    login: "mehta",
    role: "BACKEND",
    pitch: "ST",
    overall: 72,
    tier: "silver",
    stats: { PAC: 78, SHO: 66, PAS: 70, DRI: 73, DEF: 69, PHY: 75 },
    avatarUrl: null,
    country: countryByCode("IN"),
    club: "rate-limiter",
    grid: fakeGrid(1),
  },
  gold: {
    name: "Sato",
    login: "sato",
    role: "AI",
    pitch: "CAM",
    overall: 81,
    tier: "gold",
    stats: { PAC: 84, SHO: 82, PAS: 76, DRI: 79, DEF: 80, PHY: 83 },
    avatarUrl: null,
    country: countryByCode("JP"),
    club: "tiny-llm",
    grid: fakeGrid(2),
  },
  special: {
    name: "Okafor",
    login: "okafor",
    role: "SYSTEMS",
    pitch: "CDM",
    overall: 89,
    tier: "special",
    stats: { PAC: 91, SHO: 88, PAS: 86, DRI: 84, DEF: 90, PHY: 92 },
    avatarUrl: null,
    country: countryByCode("NG"),
    club: "fast-alloc",
    grid: fakeGrid(3),
  },
};
