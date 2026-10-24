import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// The same Satori build the PNG export will use.
import { ImageResponse } from "next/og";
import type { Tier } from "@/lib/stats";
import { CARD_H, CARD_W } from "@/lib/ui/tiers";
import { CardBack } from "./CardBack";
import { CardFace, type CardFonts } from "./CardFace";
import { PREVIEW_AVATAR, previewCards } from "./__fixtures__/cards";

/**
 * The card's base layer must stay renderable by Satori (used for PNG/SVG export).
 * Renders the front and back of every tier. Invalid CSS makes Satori throw, so a pass
 * here means the markup is export-safe.
 *
 * Visual check: CARD_PNG_DIR=/some/dir [CARD_FONT_DIR=/dir/with/ttfs] npx vitest run CardFace.export
 * writes one PNG per tier (with a real avatar, so it needs network).
 */

const OUT = process.env.CARD_PNG_DIR;
const FONT_DIR = process.env.CARD_FONT_DIR;

// 2x2 PNG so the masked <img> path is exercised without network.
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP4z8DwHwyBNAMDAwMDAwBH6Af5Ld7G8wAAAABJRU5ErkJggg==";

function loadFonts() {
  if (!FONT_DIR) return { fonts: undefined, families: undefined };
  const font = (file: string, name: string, weight: 600 | 700 | 800) =>
    existsSync(join(FONT_DIR, file)) ? [{ name, data: readFileSync(join(FONT_DIR, file)), weight, style: "normal" as const }] : [];
  const fonts = [
    ...font("BarlowCondensed-SemiBold.ttf", "Barlow Condensed", 600),
    ...font("BarlowCondensed-Bold.ttf", "Barlow Condensed", 700),
    ...font("BarlowCondensed-ExtraBold.ttf", "Barlow Condensed", 800),
    ...font("JetBrainsMono-Bold.ttf", "JetBrains Mono", 700),
  ];
  const families: CardFonts = { display: "Barlow Condensed", mono: "JetBrains Mono" };
  return { fonts, families };
}

async function render(el: React.ReactElement, width: number, height: number): Promise<Buffer> {
  const { fonts } = loadFonts();
  const res = new ImageResponse(el, { width, height, ...(fonts ? { fonts } : {}) });
  return Buffer.from(await res.arrayBuffer());
}

const TIERS: Tier[] = ["bronze", "silver", "gold", "special"];

describe("card base layer renders with Satori", () => {
  const cards = previewCards(OUT ? PREVIEW_AVATAR : TINY_PNG);
  const { families } = loadFonts();

  for (const tier of TIERS) {
    it(`${tier}: front and back`, async () => {
      const data = cards[tier];
      // Rendered as the root element, the way an export will render it.
      const front = await render(<CardFace data={data} fonts={families} />, CARD_W, CARD_H);
      const back = await render(<CardBack data={data} fonts={families} />, CARD_W, CARD_H);
      for (const png of [front, back]) expect(png.subarray(1, 4).toString()).toBe("PNG");
      if (OUT) {
        writeFileSync(join(OUT, `satori-${tier}-front.png`), front);
        writeFileSync(join(OUT, `satori-${tier}-back.png`), back);
      }
    }, 30_000);
  }

  it("renders without an avatar", async () => {
    const png = await render(<CardFace data={{ ...cards.gold, avatarUrl: null }} fonts={families} />, CARD_W, CARD_H);
    expect(png.length).toBeGreaterThan(1000);
  }, 30_000);
});
