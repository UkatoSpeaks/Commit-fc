import type { Tier } from "@/lib/stats";
import { TIER_MATERIALS } from "@/lib/ui/tiers";

interface TierMaterialProps {
  tier: Tier;
  /** Highlight follows the tilt via the --gx/--gy CSS vars from useTilt. Off: fixed resting position. */
  interactive?: boolean;
  /** Run the gold shine sweep */
  animated?: boolean;
}

const fill = { position: "absolute", inset: 0, pointerEvents: "none" } as const;

/** Card background plus the tier's light effect (matte, soft highlight, sweep or holo). */
export function TierMaterial({ tier, interactive = false, animated = true }: TierMaterialProps) {
  // Plain values when static, so exports never depend on CSS variables.
  const gx = interactive ? "var(--gx, 35%)" : "35%";
  const gy = interactive ? "var(--gy, 25%)" : "25%";
  const highlight = `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.5), rgba(255,255,255,0) 48%)`;

  return (
    <>
      <div style={{ ...fill, background: TIER_MATERIALS[tier].background }} />

      {tier === "silver" && <div style={{ ...fill, background: highlight, mixBlendMode: "soft-light" }} />}

      {tier === "gold" && (
        <>
          <div style={{ ...fill, background: highlight, mixBlendMode: "soft-light", opacity: 0.8 }} />
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
          <div
            style={{
              ...fill,
              background:
                "linear-gradient(115deg, transparent 18%, rgba(255,90,200,0.55) 34%, rgba(90,235,255,0.55) 48%, rgba(120,255,170,0.5) 60%, transparent 76%)",
              backgroundSize: "220% 220%",
              backgroundPosition: `${gx} ${gy}`,
              mixBlendMode: "color-dodge",
              opacity: 0.55,
            }}
          />
          <div style={{ ...fill, background: highlight, mixBlendMode: "overlay", opacity: 0.6 }} />
        </>
      )}
    </>
  );
}
