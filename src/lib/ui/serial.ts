/** Season printed on every card. */
export const SEASON = "S26/27";

/** 32-bit FNV-1a. Small, fast and stable across runtimes. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Stable 4-digit card number for a GitHub login. Case-insensitive, like logins. */
export function serialNumber(login: string): string {
  return String(fnv1a(login.trim().toLowerCase()) % 10000).padStart(4, "0");
}

/** "#0427 · S26/27" */
export function serialStamp(login: string): string {
  return `#${serialNumber(login)} · ${SEASON}`;
}
