/**
 * Rate a fixed list of well-known accounts and print a table sorted by overall.
 *
 * Raw GitHub profiles are fetched once and saved to scripts/.calibration-profiles.json,
 * so every run rates the same data (and makes no GitHub calls). Pass --refresh to refetch.
 *
 *   npm run calibrate
 *   npm run calibrate -- --refresh
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchGitHubProfile, type GitHubProfile } from "@/lib/github";
import { buildPlayer } from "@/lib/stats";
import { referenceDate } from "@/lib/ui/upgrades";

const LOGINS = [
  "torvalds",
  "karpathy",
  "rasbt",
  "shadcn",
  "JakeWharton",
  "twostraws",
  "sindresorhus",
  "antirez",
  "mitchellh",
  "kelseyhightower",
  "defunkt",
  "gaearon",
  "yyx990803",
  "octocat",
  "ghost",
  "UkatoSpeaks",
];

const PROFILES_FILE = join(import.meta.dirname, ".calibration-profiles.json");
const CONCURRENCY = 4;

async function fetchAll(): Promise<Record<string, GitHubProfile>> {
  const profiles: Record<string, GitHubProfile> = {};
  const queue = [...LOGINS];
  async function worker() {
    for (let login = queue.shift(); login; login = queue.shift()) {
      process.stderr.write(`fetching ${login}…\n`);
      profiles[login] = await fetchGitHubProfile(login);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return profiles;
}

async function loadProfiles(refresh: boolean): Promise<Record<string, GitHubProfile>> {
  if (!refresh && existsSync(PROFILES_FILE)) {
    const saved = JSON.parse(readFileSync(PROFILES_FILE, "utf8")) as Record<string, GitHubProfile>;
    const missing = LOGINS.filter((l) => !saved[l]);
    if (missing.length === 0) return saved;
    process.stderr.write(`saved profiles are missing ${missing.join(", ")}; refetching all\n`);
  }
  const profiles = await fetchAll();
  writeFileSync(PROFILES_FILE, JSON.stringify(profiles));
  process.stderr.write(`saved ${Object.keys(profiles).length} profiles to ${PROFILES_FILE}\n`);
  return profiles;
}

function table(rows: string[][]): string {
  const widths = rows[0]!.map((_, i) => Math.max(...rows.map((r) => r[i]!.length)));
  const line = (r: string[]) => "| " + r.map((c, i) => c.padEnd(widths[i]!)).join(" | ") + " |";
  const sep = "| " + widths.map((w) => "-".repeat(w)).join(" | ") + " |";
  return [line(rows[0]!), sep, ...rows.slice(1).map(line)].join("\n");
}

async function main() {
  const profiles = await loadProfiles(process.argv.includes("--refresh"));
  const players = LOGINS.map((login) => {
    const profile = profiles[login]!;
    return buildPlayer(profile, referenceDate(profile));
  }).sort((a, b) => b.overall - a.overall);

  const header = ["login", "position", "overall", "tier", "PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];
  const rows = players.map((p) => [
    p.profile.login,
    p.position.label,
    String(p.overall),
    p.tier,
    ...(["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const).map((k) => String(p.stats[k])),
  ]);
  console.log(table([header, ...rows]));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
