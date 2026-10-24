"use client";

import { motion, useMotionTemplate, useMotionValue, type MotionValue } from "framer-motion";
import type { Tier } from "@/lib/stats";
import { TIER_MATERIALS } from "@/lib/ui/tiers";

interface TierMaterialProps {
  tier: Tier;
  /** Highlight position in % (follows tilt). Defaults to a resting position. */
  glareX?: MotionValue<number>;
  glareY?: MotionValue<number>;
  /** Run the gold shine sweep */
  animated?: boolean;
}

const fill = { position: "absolute", inset: 0, pointerEvents: "none" } as const;

/** Card background plus the tier's light effect (matte, soft highlight, sweep or holo). */
export function TierMaterial({ tier, glareX, glareY, animated = true }: TierMaterialProps) {
  const restX = useMotionValue(35);
  const restY = useMotionValue(25);
  const gx = glareX ?? restX;
  const gy = glareY ?? restY;

  const highlight = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 48%)`;
  const holoPosition = useMotionTemplate`${gx}% ${gy}%`;

  return (
    <>
      <div style={{ ...fill, background: TIER_MATERIALS[tier].background }} />

      {tier === "silver" && <motion.div style={{ ...fill, background: highlight, mixBlendMode: "soft-light" }} />}

      {tier === "gold" && (
        <>
          <motion.div style={{ ...fill, background: highlight, mixBlendMode: "soft-light", opacity: 0.8 }} />
          <div
            className={animated ? "animate-shine" : undefined}
            style={{
              ...fill,
              background: "linear-gradient(115deg, transparent 38%, rgba(255,250,225,0.65) 50%, transparent 62%)",
              backgroundSize: "260% 100%",
              backgroundPosition: "150% 0",
              mixBlendMode: "overlay",
            }}
          />
        </>
      )}

      {tier === "special" && (
        <>
          <motion.div
            style={{
              ...fill,
              background:
                "linear-gradient(115deg, transparent 18%, rgba(255,90,200,0.55) 34%, rgba(90,235,255,0.55) 48%, rgba(120,255,170,0.5) 60%, transparent 76%)",
              backgroundSize: "220% 220%",
              backgroundPosition: holoPosition,
              mixBlendMode: "color-dodge",
              opacity: 0.55,
            }}
          />
          <motion.div style={{ ...fill, background: highlight, mixBlendMode: "overlay", opacity: 0.6 }} />
        </>
      )}
    </>
  );
}
