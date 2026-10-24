import { FALLBACK_POSITIONS, POSITION, POSITION_GROUPS } from "./config";
import type { LanguageShare } from "./languages";

export type GroupCode = keyof typeof POSITION_GROUPS;
export type PositionCode = GroupCode | keyof typeof FALLBACK_POSITIONS;

export interface Position {
  /** Role code, e.g. "BE" */
  code: PositionCode;
  /** Pitch position, e.g. "ST" */
  pitch: string;
  /** Display label, e.g. "Backend ST" */
  label: string;
  /** Share (0–1) per group, for debugging and tuning */
  groupShares: Partial<Record<GroupCode, number>>;
}

const GROUP_CODES = Object.keys(POSITION_GROUPS) as GroupCode[];

function groupFor(language: string, kotlinIsMobile: boolean): GroupCode | null {
  if (language === "Kotlin") return kotlinIsMobile ? "MOB" : "BE";
  return GROUP_CODES.find((code) => (POSITION_GROUPS[code].languages as readonly string[]).includes(language)) ?? null;
}

/** Group shares are relative to grouped bytes only; unknown languages are ignored. */
export function groupShares(shares: readonly LanguageShare[]): Partial<Record<GroupCode, number>> {
  const present = new Set(shares.map((s) => s.name));
  const kotlinIsMobile = POSITION.kotlinMobileSignals.some((l) => present.has(l));

  const bytes: Partial<Record<GroupCode, number>> = {};
  let total = 0;
  for (const s of shares) {
    const group = groupFor(s.name, kotlinIsMobile);
    if (!group) continue;
    bytes[group] = (bytes[group] ?? 0) + s.bytes;
    total += s.bytes;
  }
  if (total === 0) return {};

  const result: Partial<Record<GroupCode, number>> = {};
  for (const code of GROUP_CODES) {
    const b = bytes[code];
    if (b) result[code] = b / total;
  }
  return result;
}

function build(code: PositionCode, groupSharesValue: Position["groupShares"]): Position {
  const def = code in POSITION_GROUPS ? POSITION_GROUPS[code as GroupCode] : FALLBACK_POSITIONS[code as keyof typeof FALLBACK_POSITIONS];
  return { code, pitch: def.pitch, label: `${def.label} ${def.pitch}`, groupShares: groupSharesValue };
}

export function detectPosition(shares: readonly LanguageShare[]): Position {
  const byGroup = groupShares(shares);
  const ranked = (Object.entries(byGroup) as [GroupCode, number][]).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];

  if (!top) return build("SUB", byGroup);
  if (top[1] >= POSITION.dominantShare) return build(top[0], byGroup);

  const bigGroups = ranked.filter(([, share]) => share >= POSITION.fullstackGroupShare).length;
  if (bigGroups >= POSITION.fullstackMinGroups) return build("FS", byGroup);

  return build(top[0], byGroup);
}
