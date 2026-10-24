import type { CSSProperties } from "react";
import type { Tier } from "@/lib/stats";
import { CARD_CLIP_PX, CARD_H, CARD_W, TIER_MATERIALS } from "@/lib/ui/tiers";
import { GLITTER, sparklePath } from "./CardArt";

// Browser-only light effects layered over CardFace: grain, glare, edge light, holo, twinkle.
// Never part of an export. Everything moves through the tilt CSS variables from useTilt
// (--gx/--gy %, --tx/--ty -1..1) via transform/opacity, so tilting never repaints.
// Without those variables (a static card) every layer sits at its resting position.

const fill: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.2'/></filter><rect width='160' height='160' filter='url(#n)'/></svg>",
)}")`;

/** Star tile used to mask the holographic layer on special cards. */
const STARS = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><path d='${sparklePath(9, 9, 4.5)}'/><path d='${sparklePath(27, 27, 3)}'/></svg>`,
)}")`;

/** White alpha at the center of the glare. */
export const GLARE_PEAK = 0.65;

/** Glare: a big soft light that drifts opposite to the tilt. */
const GLARE_SHIFT = "translate(calc((50% - var(--gx, 50%)) * 0.45), calc((50% - var(--gy, 50%)) * 0.45))";

export const GLARE: Record<Tier, { blend: CSSProperties["mixBlendMode"]; opacity: number }> = {
  bronze: { blend: "soft-light", opacity: 0.5 },
  silver: { blend: "soft-light", opacity: 0.55 },
  gold: { blend: "soft-light", opacity: 0.55 },
  special: { blend: "soft-light", opacity: 0.6 },
};

interface CardLiveProps {
  tier: Tier;
  /** Run the looping animations (gold sweep and twinkle). Off for reduced motion. */
  animated?: boolean;
}

function EdgeLight({ side }: { side: "left" | "right" | "top" | "bottom" }) {
  // The edge facing the light: the glare sits opposite the pointer, so pointer right → left edge lit.
  const dir = { left: "90deg", right: "270deg", top: "180deg", bottom: "0deg" }[side];
  const strength = { left: "var(--tx, 0)", right: "calc(var(--tx, 0) * -1)", top: "var(--ty, 0)", bottom: "calc(var(--ty, 0) * -1)" }[side];
  return (
    <div
      style={{
        ...fill,
        background: `linear-gradient(${dir}, rgba(255,255,255,0.75), rgba(255,255,255,0) 9%)`,
        mixBlendMode: "overlay",
        opacity: `calc(${strength} * 0.9)`,
      }}
    />
  );
}

export function CardLive({ tier, animated = true }: CardLiveProps) {
  const m = TIER_MATERIALS[tier];
  const glare = GLARE[tier];

  return (
    <div aria-hidden="true" style={{ ...fill, width: CARD_W, height: CARD_H, clipPath: CARD_CLIP_PX, overflow: "hidden" }}>
      {/* Foil grain */}
      <div style={{ ...fill, backgroundImage: GRAIN, backgroundSize: "160px 160px", mixBlendMode: "overlay", opacity: m.grain }} />

      {/* Holographic stars: a rainbow strip seen through the star pattern, sliding with the tilt. */}
      {tier === "special" && (
        <div style={{ ...fill, maskImage: STARS, WebkitMaskImage: STARS, maskSize: "36px 36px", WebkitMaskSize: "36px 36px", mixBlendMode: "color-dodge", opacity: 0.4 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "-100%",
              width: "300%",
              background:
                "linear-gradient(100deg, #ff5ac8, #ffd25a 12%, #78ffaa 24%, #5aebff 36%, #9a7bff 48%, #ff5ac8 60%, #ffd25a 72%, #78ffaa 84%, #5aebff 100%)",
              transform: "translateX(calc(var(--tx, 0) * 22%)) translateY(calc(var(--ty, 0) * 4%))",
            }}
          />
        </div>
      )}

      {/* Gold glitter twinkle (the static dots are in the base layer) */}
      {tier === "gold" && animated && (
        <svg width={CARD_W} height={CARD_H} style={fill}>
          {GLITTER.map((g, i) => (
            <path
              key={i}
              d={sparklePath(g.x, g.y, g.r * 1.4)}
              fill="#FFFFFF"
              className="animate-twinkle"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${(i * 0.37) % 2.4}s` }}
            />
          ))}
        </svg>
      )}

      {/* Gold sweep */}
      {tier === "gold" && animated && (
        <div style={{ ...fill, overflow: "hidden" }}>
          <div
            className="animate-shine"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "-80%",
              width: "260%",
              background: "linear-gradient(115deg, transparent 40%, rgba(255,250,225,0.55) 50%, transparent 60%)",
              mixBlendMode: "overlay",
            }}
          />
        </div>
      )}

      {/* Glare: at rest it sits over the player (upper right), away from the rating and stats. */}
      <div
        style={{
          position: "absolute",
          left: "-50%",
          top: "-50%",
          width: "200%",
          height: "200%",
          background: `radial-gradient(circle at 58% 38%, rgba(255,255,255,${GLARE_PEAK}) 0%, rgba(255,255,255,0.2) 12%, rgba(255,255,255,0) 26%)`,
          mixBlendMode: glare.blend,
          opacity: glare.opacity,
          transform: GLARE_SHIFT,
          pointerEvents: "none",
        }}
      />

      <EdgeLight side="left" />
      <EdgeLight side="right" />
      <EdgeLight side="top" />
      <EdgeLight side="bottom" />
    </div>
  );
}
