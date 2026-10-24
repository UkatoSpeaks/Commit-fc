import type { CSSProperties, ReactNode } from "react";
import type { StatKey } from "@/lib/stats";
import type { CardData } from "@/lib/ui/card-data";
import { clubInitials } from "@/lib/ui/card-data";
import { serialStamp } from "@/lib/ui/serial";
import { CARD_CLIP_PX, CARD_H, CARD_W, TIER_MATERIALS } from "@/lib/ui/tiers";
import { CardFrame, TierPattern } from "./CardArt";
import { FlagArt } from "./Flag";

// Base layer of the card front. Export-safe on purpose: inline styles only, every
// multi-child box is an explicit flex container, plain <img>, inline SVG art.
// It renders identically in the browser and in Satori (@vercel/og). No hooks.

const LEFT: readonly StatKey[] = ["PAC", "SHO", "PAS"];
const RIGHT: readonly StatKey[] = ["DRI", "DEF", "PHY"];

export interface CardFonts {
  display: string;
  mono: string;
}

/** Browser fonts (next/font CSS variables). Exports pass real font family names instead. */
export const BROWSER_FONTS: CardFonts = {
  display: "var(--font-barlow), 'Barlow Condensed', sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', monospace",
};

export const AVATAR_SIZE = 170;

export interface CardFaceProps {
  data: CardData;
  fonts?: CardFonts;
  /** Emphasize one stat and dim the rest. `null` = highlighting on, nothing picked. */
  highlight?: StatKey | null;
  /**
   * Browser-only light effects (CardLive). Drawn over the foil and player but under the
   * text, so glare never washes out the ratings. Leave empty for exports.
   */
  foil?: ReactNode;
}

/** Shrink long names so they fit the plate. */
function nameSize(name: string): number {
  return Math.max(18, Math.min(32, Math.floor(250 / (name.length * 0.5))));
}

/** Ask GitHub for a 2x avatar so it stays sharp at 170px. Other URLs pass through. */
export function avatarSrc(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "avatars.githubusercontent.com") return url;
    u.searchParams.set("s", String(AVATAR_SIZE * 2));
    return u.toString();
  } catch {
    return url;
  }
}

const abs = (left: number, top: number, extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", left, top, ...extra });

function statRowStyle(k: StatKey, highlight: StatKey | null | undefined): CSSProperties {
  const base: CSSProperties = { display: "flex", alignItems: "baseline", height: 30 };
  if (highlight === undefined) return base;
  return {
    ...base,
    opacity: highlight && highlight !== k ? 0.3 : 1,
    transform: highlight === k ? "scale(1.12)" : "none",
    transition: "opacity 200ms ease, transform 200ms ease",
  };
}

function StatColumn({ keys, data, highlight }: { keys: readonly StatKey[]; data: CardData; highlight?: StatKey | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {keys.map((k) => (
        <div key={k} style={statRowStyle(k, highlight)}>
          <span data-card-stat={k} style={{ fontSize: 26, fontWeight: 800, width: 32, textAlign: "right", marginRight: 8 }}>
            {data.stats[k]}
          </span>
          <span style={{ fontSize: 21, fontWeight: 600 }}>{k}</span>
        </div>
      ))}
    </div>
  );
}

const OVERALL: CSSProperties = { fontSize: 66, fontWeight: 800, lineHeight: 0.85 };

/**
 * Overall rating. With a gradient fill, the emboss shadow goes on a plain copy underneath:
 * text-shadow on gradient-clipped text paints over the fill in browsers and breaks in Satori.
 */
function Overall({ value, fill, emboss }: { value: number; fill?: string; emboss: string }) {
  if (!fill) {
    return (
      <span data-card-overall="" style={{ ...OVERALL, textShadow: emboss }}>
        {value}
      </span>
    );
  }
  return (
    <div data-card-overall-box="" style={{ display: "flex", position: "relative" }}>
      <span data-card-overall-shadow="" style={{ ...OVERALL, textShadow: emboss }}>
        {value}
      </span>
      <span
        data-card-overall=""
        style={{
          ...OVERALL,
          position: "absolute",
          left: 0,
          top: 0,
          backgroundImage: fill,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CommitGridArt({ opacities, color }: { opacities: readonly number[]; color: string }) {
  const cell = 8;
  const gap = 3;
  return (
    <svg width={7 * cell + 6 * gap} height={4 * cell + 3 * gap} aria-hidden="true">
      {opacities.map((o, i) => (
        <rect key={i} x={(i % 7) * (cell + gap)} y={Math.floor(i / 7) * (cell + gap)} width={cell} height={cell} rx={1.5} fill={color} opacity={o} />
      ))}
    </svg>
  );
}

function AvatarSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 140 140" width={AVATAR_SIZE} height={AVATAR_SIZE} aria-hidden="true" style={{ opacity: 0.35 }}>
      <circle cx={70} cy={56} r={26} fill={color} />
      <path d="M22 140c4-32 24-50 48-50s44 18 48 50" fill={color} />
    </svg>
  );
}

export function CardFace({ data, fonts = BROWSER_FONTS, highlight, foil }: CardFaceProps) {
  const m = TIER_MATERIALS[data.tier];
  const emboss = m.textShadow;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: CARD_W,
        height: CARD_H,
        overflow: "hidden",
        clipPath: CARD_CLIP_PX,
        backgroundImage: m.background,
        color: m.ink,
        fontFamily: fonts.display,
        textTransform: "uppercase",
        lineHeight: 1,
      }}
    >
      <TierPattern tier={data.tier} />

      {/* Player: square, faded into the card at the edges and bottom, behind the name plate. */}
      <div
        style={abs(112, 66, {
          display: "flex",
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          maskImage: "radial-gradient(ellipse 60% 64% at 50% 40%, #000 32%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 64% at 50% 40%, #000 32%, transparent 100%)",
        })}
      >
        {data.avatarUrl ? (
          // Plain <img>: next/image can't render in image exports, and avatars are already small.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc(data.avatarUrl)} alt="" width={AVATAR_SIZE} height={AVATAR_SIZE} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, objectFit: "cover" }} />
        ) : (
          <AvatarSilhouette color={m.ink} />
        )}
      </div>

      <CardFrame tier={data.tier} />

      {foil}

      {/* Top rule */}
      <div style={abs(30, 14, { width: 240, height: 1, backgroundColor: m.ink, opacity: 0.22 })} />

      {/* Last 28 days of real activity */}
      <div style={abs(200, 28, { display: "flex" })}>
        <CommitGridArt opacities={data.grid} color={m.ink} />
      </div>

      {/* Rating column */}
      <div style={abs(30, 34, { display: "flex", flexDirection: "column", alignItems: "center", width: 64 })}>
        <Overall value={data.overall} fill={m.overallFill} emboss={emboss} />
        <span style={{ fontSize: 24, fontWeight: 700, marginTop: 4, textShadow: emboss }}>{data.pitch}</span>
        <div style={{ width: 28, height: 1, backgroundColor: m.ink, opacity: 0.5, margin: "8px 0" }} />
        <div style={{ display: "flex", width: 34, height: 22, borderRadius: 3, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,0.18)" }}>
          <FlagArt country={data.country} width={34} height={22} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            marginTop: 8,
            borderRadius: 15,
            border: `2px solid ${m.ink}`,
            fontFamily: fonts.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {clubInitials(data.club)}
        </div>
      </div>

      {/* Name plate */}
      <div style={abs(20, 230, { display: "flex", flexDirection: "column", alignItems: "center", width: 260 })}>
        <span
          style={{
            fontSize: nameSize(data.name),
            fontWeight: 800,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
            height: 34,
            display: "flex",
            alignItems: "center",
            textShadow: emboss,
          }}
        >
          {data.name}
        </span>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", marginTop: 4 }}>{data.role}</span>
        <div style={{ width: 200, height: 1, backgroundColor: m.ink, opacity: 0.35, marginTop: 9 }} />
      </div>

      {/* Stats */}
      <div style={abs(46, 288, { display: "flex", justifyContent: "space-between", width: 208, textShadow: emboss })}>
        <StatColumn keys={LEFT} data={data} highlight={highlight} />
        <div style={{ width: 1, backgroundColor: m.ink, opacity: 0.3 }} />
        <StatColumn keys={RIGHT} data={data} highlight={highlight} />
      </div>

      {/* Footer: wordmark and serial stamp */}
      <div style={abs(0, 387, { display: "flex", flexDirection: "column", alignItems: "center", width: CARD_W, fontFamily: fonts.mono, fontWeight: 700 })}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em" }}>COMMIT FC</span>
        <span style={{ fontSize: 8.5, letterSpacing: "0.08em", marginTop: 5 }}>{serialStamp(data.login)}</span>
      </div>
    </div>
  );
}
