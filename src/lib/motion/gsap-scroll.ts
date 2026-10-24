"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { gsap } from "./gsap";

// Landing-only plugins. Kept out of gsap.ts so other routes don't download them.
gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
export { useGSAP } from "./gsap";

/** Scroll reveals play once per page load, so they don't replay when Back restores the page. */
const revealed = new Set<string>();

export function hasRevealed(key: string): boolean {
  return revealed.has(key);
}

export function markRevealed(key: string): void {
  revealed.add(key);
}

/** Shared trigger settings: start when the top of the section is 80% down the viewport. */
export const REVEAL_START = "top 80%";
