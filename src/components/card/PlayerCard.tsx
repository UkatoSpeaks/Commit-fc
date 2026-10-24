"use client";

import type { CSSProperties } from "react";
import type { StatKey } from "@/lib/stats";
import type { CardData } from "@/lib/ui/card-data";
import { CARD_CLIP, CARD_H, CARD_W, TIER_MATERIALS } from "@/lib/ui/tiers";
import { CardBack } from "./CardBack";
import { CardFace } from "./CardFace";
import { CardLive } from "./CardLive";
import type { Tilt } from "./useTilt";

interface PlayerCardProps {
  data: CardData;
  /** Rendered width in px. The 300x440 layout scales to fit. */
  size?: number;
  /** Pass a tilt from useTilt() to make the card interactive */
  tilt?: Tilt;
  /**
   * Browser-only effects layer (grain, glare, edge light, holo, twinkle) and moving shadows.
   * Off = the export-safe base layer only.
   */
  live?: boolean;
  /** Run looping animations (gold sweep, glitter twinkle). Off for reduced motion. */
  animated?: boolean;
  /** Show the card back */
  flipped?: boolean;
  className?: string;
  /** Emphasize one stat and dim the rest. `null` = highlighting on, nothing picked. */
  highlight?: StatKey | null;
}

const face: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

const preserve: CSSProperties = { transformStyle: "preserve-3d" };

/** How far behind the face the back sits: the card's thickness. */
const DEPTH = 2.5;

export function PlayerCard({ data, size = CARD_W, tilt, live = true, animated = true, flipped = false, className, highlight }: PlayerCardProps) {
  const scale = size / CARD_W;
  const height = CARD_H * scale;
  const material = TIER_MATERIALS[data.tier];
  const label = `${data.name}, ${data.overall} rated ${material.label.toLowerCase()} card, ${data.role} ${data.pitch}`;
  const interactive = tilt?.enabled ?? false;

  return (
    <div
      ref={tilt?.ref}
      className={className}
      style={{ position: "relative", width: size, height, perspective: 1100 * scale, touchAction: tilt ? "pan-y" : undefined }}
    >
      {/* Contact shadow on the "floor", tightening as the card tilts */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "15%",
          width: "70%",
          bottom: -18 * scale,
          height: 26 * scale,
          background: "radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))",
          transform: live ? "translateX(calc(var(--tx, 0) * -8px)) scaleX(calc(1 - var(--tilt, 0) * 0.18))" : undefined,
          pointerEvents: "none",
        }}
      />
      {/* Drop shadow, cast away from the tilt. Blur sits on a wrapper so the clip doesn't cut it. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${14 * scale}px)`,
          transform: live
            ? `translate(calc(var(--tx, 0) * ${-16 * scale}px), calc(${20 * scale}px + var(--ty, 0) * ${-12 * scale}px)) scale(0.94)`
            : `translateY(${20 * scale}px) scale(0.94)`,
          willChange: interactive ? "transform" : undefined,
          pointerEvents: "none",
        }}
      >
        <div style={{ width: "100%", height: "100%", clipPath: CARD_CLIP, background: "rgba(0,0,0,0.55)" }} />
      </div>

      <div
        role="img"
        aria-label={label}
        style={{
          ...preserve,
          position: "relative",
          width: size,
          height,
          // --rx/--ry are written by useTilt. A static card has no tilt transform at all.
          transform: interactive ? "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" : undefined,
          willChange: interactive ? "transform" : undefined,
        }}
      >
        {/* Flipper: the pack reveal spins this element directly. */}
        <div
          data-card-flipper=""
          style={{
            ...preserve,
            width: size,
            height,
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 600ms cubic-bezier(0.3, 0.7, 0.2, 1)",
          }}
        >
          <div
            className="card-stage"
            style={{
              ...preserve,
              position: "relative",
              width: CARD_W,
              height: CARD_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              ["--card-edge" as string]: material.edge,
            }}
          >
            <div style={face}>
              <CardFace data={data} highlight={highlight} foil={live ? <CardLive tier={data.tier} animated={animated} /> : null} />
            </div>
            <div style={{ ...face, transform: `translateZ(${-DEPTH}px) rotateY(180deg)` }}>
              <CardBack data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
