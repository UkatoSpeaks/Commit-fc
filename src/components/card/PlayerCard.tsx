"use client";

import Image from "next/image";
import type { StatKey } from "@/lib/stats";
import type { CardData } from "@/lib/ui/card-data";
import { CARD_CLIP, CARD_H, CARD_W, TIER_MATERIALS } from "@/lib/ui/tiers";
import { ClubBadge } from "./ClubBadge";
import { CommitGrid } from "./CommitGrid";
import { Flag } from "./Flag";
import { TierMaterial } from "./TierMaterial";
import type { Tilt } from "./useTilt";

const LEFT: readonly StatKey[] = ["PAC", "SHO", "PAS"];
const RIGHT: readonly StatKey[] = ["DRI", "DEF", "PHY"];

interface PlayerCardProps {
  data: CardData;
  /** Rendered width in px. The 300x440 layout scales to fit. */
  size?: number;
  /** Pass a tilt from useTilt() to make the card interactive */
  tilt?: Tilt;
  /** Run the gold sweep animation (off for reduced motion) */
  animated?: boolean;
  priority?: boolean;
  className?: string;
  /** Emphasize one stat and dim the rest. `null` = highlighting on, nothing picked. */
  highlight?: StatKey | null;
}

/** Shrink long names so they fit the plate. */
function nameSize(name: string): number {
  return Math.max(18, Math.min(32, Math.floor(250 / (name.length * 0.5))));
}

interface StatColumnProps {
  keys: readonly StatKey[];
  stats: CardData["stats"];
  highlight?: StatKey | null;
}

/** Inline styles for a stat row. Plain (no extra props) unless a highlight is in use. */
function statRowStyle(k: StatKey, highlight: StatKey | null | undefined) {
  const base = { display: "flex", alignItems: "baseline", gap: 8, height: 32 } as const;
  if (highlight === undefined) return base;
  return {
    ...base,
    opacity: highlight && highlight !== k ? 0.3 : 1,
    transform: highlight === k ? "scale(1.12)" : "none",
    transformOrigin: "center",
    transition: "opacity 200ms ease, transform 200ms ease",
  };
}

function StatColumn({ keys, stats, highlight }: StatColumnProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {keys.map((k) => (
        <div key={k} style={statRowStyle(k, highlight)}>
          <span style={{ fontSize: 26, fontWeight: 800, width: 32, textAlign: "right" }}>{stats[k]}</span>
          <span style={{ fontSize: 21, fontWeight: 600 }}>{k}</span>
        </div>
      ))}
    </div>
  );
}

function AvatarFallback() {
  return (
    <svg viewBox="0 0 140 140" width={140} height={140} aria-hidden="true" style={{ opacity: 0.45 }}>
      <circle cx={70} cy={56} r={26} fill="currentColor" />
      <path d="M22 132c6-30 26-44 48-44s42 14 48 44" fill="currentColor" />
    </svg>
  );
}

export function PlayerCard({ data, size = CARD_W, tilt, animated = true, priority = false, className, highlight }: PlayerCardProps) {
  const scale = size / CARD_W;
  const height = CARD_H * scale;
  const material = TIER_MATERIALS[data.tier];
  const label = `${data.name}, ${data.overall} rated ${material.label.toLowerCase()} card, ${data.role} ${data.pitch}`;
  const interactive = tilt?.enabled ?? false;

  return (
    <div
      ref={tilt?.ref}
      className={className}
      style={{ width: size, height, perspective: 1100 * scale, touchAction: tilt ? "pan-y" : undefined }}
    >
      <div
        role="img"
        aria-label={label}
        style={{
          width: size,
          height,
          // --rx/--ry are written by useTilt. A static card has no transform at all.
          transform: interactive ? "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" : undefined,
          willChange: interactive ? "transform" : undefined,
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.5))",
        }}
      >
        <div style={{ width: size, height, clipPath: CARD_CLIP, position: "relative", overflow: "hidden" }}>
          <TierMaterial tier={data.tier} interactive={interactive} animated={animated} />

          <div
            className="font-display uppercase"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: CARD_W,
              height: CARD_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              color: material.ink,
              lineHeight: 1,
            }}
          >
            {/* Top rule */}
            <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 1, background: "currentColor", opacity: 0.25 }} />

            {/* Last 28 days of real activity */}
            <div style={{ position: "absolute", top: 28, right: 26 }}>
              <CommitGrid opacities={data.grid} />
            </div>

            {/* Rating column */}
            <div
              style={{
                position: "absolute",
                top: 34,
                left: 30,
                width: 64,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 66, fontWeight: 800, lineHeight: 0.85 }}>{data.overall}</span>
              <span style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{data.pitch}</span>
              <span style={{ width: 28, height: 1, background: "currentColor", opacity: 0.5, margin: "8px 0" }} />
              <Flag country={data.country} />
              <ClubBadge club={data.club} className="mt-2" />
            </div>

            {/* Avatar */}
            <div
              style={{
                position: "absolute",
                top: 76,
                left: 122,
                width: 140,
                height: 140,
                borderRadius: "50%",
                overflow: "hidden",
                background: "rgba(0,0,0,0.12)",
              }}
            >
              {data.avatarUrl ? (
                <Image src={data.avatarUrl} alt="" width={140} height={140} priority={priority} style={{ width: 140, height: 140, objectFit: "cover" }} />
              ) : (
                <AvatarFallback />
              )}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.22), inset 0 0 0 1px rgba(0,0,0,0.25)",
                }}
              />
            </div>

            {/* Name plate */}
            <div style={{ position: "absolute", top: 226, left: 20, right: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  fontSize: nameSize(data.name),
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {data.name}
              </span>
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", marginTop: 4 }}>
                {data.role}
              </span>
              <span style={{ width: 200, height: 1, background: "currentColor", opacity: 0.35, marginTop: 10 }} />
            </div>

            {/* Stats */}
            <div style={{ position: "absolute", top: 290, left: 46, right: 46, display: "flex", justifyContent: "space-between" }}>
              <StatColumn keys={LEFT} stats={data.stats} highlight={highlight} />
              <span style={{ width: 1, background: "currentColor", opacity: 0.3 }} />
              <StatColumn keys={RIGHT} stats={data.stats} highlight={highlight} />
            </div>

            {/* Footer */}
            <div
              className="font-mono"
              style={{ position: "absolute", top: 396, left: 0, right: 0, textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", opacity: 0.7 }}
            >
              COMMIT FC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
