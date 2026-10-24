import { TIERS } from "./config";

export type Tier = (typeof TIERS)[number]["tier"];

export function tierFor(overall: number): Tier {
  return TIERS.find((t) => overall >= t.min)?.tier ?? "bronze";
}
