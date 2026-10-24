import type { CSSProperties } from "react";
import type { CardData } from "@/lib/ui/card-data";
import { CARD_CLIP_PX, CARD_H, CARD_W, TIER_MATERIALS } from "@/lib/ui/tiers";
import { CardFrame, ShieldArt, TierPattern } from "./CardArt";
import { BROWSER_FONTS, type CardFonts } from "./CardFace";

const abs = (left: number, top: number, extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", left, top, ...extra });

/** Tier-colored card back: pattern, frame, shield and wordmark. Export-safe like CardFace. */
export function CardBack({ data, fonts = BROWSER_FONTS }: { data: Pick<CardData, "tier" | "login">; fonts?: CardFonts }) {
  const m = TIER_MATERIALS[data.tier];
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: CARD_W,
        height: CARD_H,
        overflow: "hidden",
        clipPath: CARD_CLIP_PX,
        backgroundImage: m.background,
        color: m.ink,
        fontFamily: fonts.display,
        lineHeight: 1,
      }}
    >
      <TierPattern tier={data.tier} />
      <div
        style={abs(30, 70, {
          width: 240,
          height: 240,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 70%)",
        })}
      />
      <CardFrame tier={data.tier} />
      <div style={{ display: "flex", marginTop: -20 }}>
        <ShieldArt size={104} color={m.ink} />
      </div>
      <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "0.08em", marginTop: 18, textShadow: m.textShadow }}>COMMIT FC</span>
      <span style={{ fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", marginTop: 10, opacity: 0.75 }}>
        SEASON 26/27
      </span>
    </div>
  );
}
