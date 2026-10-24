import type { StatKey, Tier } from "@/lib/stats";

export const TIER_RANGES: { tier: Tier; range: string }[] = [
  { tier: "bronze", range: "<65" },
  { tier: "silver", range: "65–74" },
  { tier: "gold", range: "75–84" },
  { tier: "special", range: "85+" },
];

/** Overall shown on the preview card for each tier, so the number matches the material. */
export const TIER_PREVIEW_OVERALL: Record<Tier, number> = { bronze: 61, silver: 72, gold: 81, special: 89 };

// Matches the stats engine (src/lib/stats/stats.ts).
export const STATS: { key: StatKey; name: string; body: string }[] = [
  { key: "PAC", name: "Pace", body: "Contributions in the last 90 days, plus your current daily streak." },
  { key: "SHO", name: "Shooting", body: "Total stars on the repos you own. Impact others can see." },
  { key: "PAS", name: "Passing", body: "Pull requests you open to other people's repos, plus forks of your work." },
  { key: "DRI", name: "Dribbling", body: "How many languages make up a real share (over 2%) of your code." },
  { key: "DEF", name: "Defending", body: "Issues and PR reviews you've done, plus how long you've been on GitHub." },
  { key: "PHY", name: "Physical", body: "Contributions this year, public repos and followers. Staying power." },
];
