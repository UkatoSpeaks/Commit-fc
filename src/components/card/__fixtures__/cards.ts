import type { Tier } from "@/lib/stats";
import type { CardData } from "@/lib/ui/card-data";
import { countryByCode } from "@/lib/ui/flags";
import { SAMPLE_CARDS } from "@/lib/ui/samples";

/** One card per tier, for the /debug/cards preview and the export render test. */
export function previewCards(avatarUrl: string | null): Record<Tier, CardData> {
  return {
    bronze: {
      name: "Lindqvist",
      login: "lindqvist",
      role: "TOOLING",
      pitch: "CB",
      overall: 58,
      tier: "bronze",
      stats: { PAC: 61, SHO: 52, PAS: 57, DRI: 55, DEF: 66, PHY: 60 },
      avatarUrl,
      country: countryByCode("SE"),
      club: "dotfiles",
      grid: SAMPLE_CARDS.silver.grid,
    },
    silver: { ...SAMPLE_CARDS.silver, avatarUrl },
    gold: { ...SAMPLE_CARDS.gold, avatarUrl },
    special: { ...SAMPLE_CARDS.special, avatarUrl },
  };
}

export const PREVIEW_AVATAR = "https://avatars.githubusercontent.com/u/9919?v=4";
