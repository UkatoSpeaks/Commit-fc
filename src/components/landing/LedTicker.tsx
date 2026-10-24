import { getFeaturedPlayers } from "@/lib/player/featured";
import { TickerTrack } from "./TickerTrack";

/** Stadium LED strip of featured players. Hidden when too few could be loaded. */
export async function LedTicker() {
  const players = await getFeaturedPlayers();
  if (players.length === 0) return null;
  return <TickerTrack players={players} />;
}
