import type { Player, Stats, Tier } from "@/lib/stats";
import { commitGridOpacities } from "./commit-grid";
import { countryFromLocation, type Country } from "./flags";

/** Everything the PlayerCard needs. Small, serializable, easy to hardcode for samples. */
export interface CardData {
  name: string;
  /** e.g. "FRONTEND" */
  role: string;
  /** Pitch code, e.g. "LW" */
  pitch: string;
  overall: number;
  tier: Tier;
  stats: Stats;
  avatarUrl: string | null;
  country: Country | null;
  club: string | null;
  /** 28 opacities, oldest day first */
  grid: number[];
}

/** "commit-fc" → "CF", "react" → "RE", "myCoolApp" → "MC". */
export function clubInitials(repo: string | null): string {
  if (!repo) return "FA"; // free agent
  const words = repo
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s\-_.]+/)
    .filter(Boolean);
  const initials = words.length >= 2 ? `${words[0]![0]}${words[1]![0]}` : repo.replace(/[^a-z0-9]/gi, "").slice(0, 2);
  return (initials || "FC").toUpperCase();
}

/** Position label without the pitch code: "Frontend LW" → "FRONTEND". */
export function roleName(player: Player): string {
  return player.position.label.replace(new RegExp(`\\s*${player.position.pitch}$`), "").toUpperCase();
}

export function toCardData(player: Player): CardData {
  const { profile } = player;
  return {
    name: profile.name?.trim() || profile.login,
    role: roleName(player),
    pitch: player.position.pitch,
    overall: player.overall,
    tier: player.tier,
    stats: player.stats,
    avatarUrl: profile.avatarUrl,
    country: countryFromLocation(profile.location),
    club: player.extras.club,
    grid: commitGridOpacities(profile.contributions.calendar),
  };
}
