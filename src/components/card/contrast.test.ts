import { describe, expect, it } from "vitest";
import type { Tier } from "@/lib/stats";
import { CARD_H, CARD_W, TIER_MATERIALS } from "@/lib/ui/tiers";
import { GLARE, GLARE_PEAK } from "./CardLive";

// Text contrast on the card face. Samples the tier gradient under each text block
// (positions from CardFace) and checks the ink against it, plain and with the live
// glare fully under it (worst case: the glare can drift behind any text while tilting).
// The glare sits below the text layer, so it only ever changes the background.

const SPOTS: Record<string, [number, number]> = {
  overall: [62, 60],
  position: [62, 108],
  name: [150, 247],
  role: [150, 268],
  statTopLeft: [100, 300],
  statBottomLeft: [100, 360],
  statTopRight: [240, 300],
  statBottomRight: [240, 360],
  footer: [150, 392],
  serial: [150, 405],
};


type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Color of a CSS `linear-gradient(<deg>, #hex p%, ...)` at a point on the 300x440 card. */
function gradientAt(css: string, x: number, y: number): RGB {
  const deg = Number(/(\d+)deg/.exec(css)![1]) * (Math.PI / 180);
  const stops = [...css.matchAll(/(#[0-9a-f]{6})\s+(\d+)%/gi)].map((m) => ({ c: hex(m[1]!), p: Number(m[2]) / 100 }));
  const dx = Math.sin(deg);
  const dy = -Math.cos(deg);
  const length = Math.abs(CARD_W * dx) + Math.abs(CARD_H * dy);
  const t = Math.min(1, Math.max(0, 0.5 + ((x - CARD_W / 2) * dx + (y - CARD_H / 2) * dy) / length));
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!;
    const b = stops[i]!;
    if (t <= b.p) {
      const k = (t - a.p) / (b.p - a.p);
      return a.c.map((v, j) => v + (b.c[j]! - v) * k) as RGB;
    }
  }
  return stops.at(-1)!.c;
}

/** soft-light blend of white at opacity `a` over `rgb`. */
function softLightWhite(rgb: RGB, a: number): RGB {
  const d = (b: number) => (b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b));
  return rgb.map((b) => b + a * (d(b) - b)) as RGB;
}

/** Darkest stop of the overall's gradient fill (lightest for light ink), else the ink. */
function overallInk(tier: Tier): RGB {
  const m = TIER_MATERIALS[tier];
  if (!m.overallFill) return hex(m.ink);
  const stops = [...m.overallFill.matchAll(/#[0-9a-f]{6}/gi)].map((s) => hex(s[0]));
  const light = luminance(hex(m.ink)) > 0.5;
  return stops.sort((a, b) => (light ? luminance(a) - luminance(b) : luminance(b) - luminance(a)))[0]!;
}

describe("card text contrast ≥ 4.5:1", () => {
  for (const tier of Object.keys(TIER_MATERIALS) as Tier[]) {
    it(tier, () => {
      const m = TIER_MATERIALS[tier];
      for (const [spot, [x, y]] of Object.entries(SPOTS)) {
        const bg = gradientAt(m.background, x, y);
        const ink = spot === "overall" ? overallInk(tier) : hex(m.ink);
        expect.soft(contrast(ink, bg), `${spot}`).toBeGreaterThanOrEqual(4.5);
        expect.soft(contrast(ink, softLightWhite(bg, GLARE[tier].opacity * GLARE_PEAK)), `${spot} under glare`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
