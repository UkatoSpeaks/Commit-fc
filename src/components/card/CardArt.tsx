import type { Tier } from "@/lib/stats";
import { CARD_H, CARD_POINTS, CARD_W, FRAME_POINTS, TIER_MATERIALS } from "@/lib/ui/tiers";

// Export-safe card art: plain inline SVG only (no CSS filters or blend modes),
// so the same markup renders in the browser and in Satori image exports.

const layer = { position: "absolute", left: 0, top: 0 } as const;

/**
 * Shield clip inside each SVG. CSS clip-path on the card covers this in browsers,
 * but Satori doesn't clip SVG children with a parent's clip-path.
 */
function shieldClip(id: string) {
  return (
    <clipPath id={id}>
      <polygon points={CARD_POINTS} />
    </clipPath>
  );
}

/** Where the gold rays radiate from: behind the player's head. */
const RAY_ORIGIN = { x: 197, y: 128 };

/** Glitter dots on gold cards, placed in the gaps between text blocks (card px). */
export const GLITTER: ReadonlyArray<{ x: number; y: number; r: number }> = [
  { x: 112, y: 46, r: 4 },
  { x: 178, y: 30, r: 3 },
  { x: 287, y: 120, r: 5 },
  { x: 96, y: 214, r: 3.5 },
  { x: 285, y: 222, r: 4 },
  { x: 24, y: 262, r: 3 },
  { x: 277, y: 276, r: 3.5 },
  { x: 36, y: 368, r: 4.5 },
];

/** Four-point sparkle centered at (x, y). */
export function sparklePath(x: number, y: number, r: number): string {
  const k = r * 0.28;
  return `M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k} Z`;
}

/** Thin wedges radiating out from RAY_ORIGIN. */
function rayWedges(count: number, width: number): string[] {
  const reach = 520;
  const { x, y } = RAY_ORIGIN;
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const b = a + (width * Math.PI) / 180;
    const p = (t: number) => `${(x + Math.cos(t) * reach).toFixed(1)},${(y + Math.sin(t) * reach).toFixed(1)}`;
    return `${x},${y} ${p(a)} ${p(b)}`;
  });
}

const RAYS = rayWedges(36, 3.2);

/** Low-opacity tier pattern: none (bronze), hexagons (silver), rays + glitter (gold), stars (special). */
export function TierPattern({ tier }: { tier: Tier }) {
  const m = TIER_MATERIALS[tier];
  if (tier === "bronze" || m.patternOpacity === 0) return null;
  const id = `cfc-${tier}`;

  return (
    <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`} style={layer} aria-hidden="true">
      <defs>
        {shieldClip(`${id}-clip`)}
        {tier === "silver" && (
          <pattern id={`${id}-hex`} width={24} height={13.86} patternUnits="userSpaceOnUse">
            <path d="M0 6.93 L4 0 H12 L16 6.93 L12 13.86 H4 Z M16 6.93 H24" fill="none" stroke={m.pattern} strokeWidth={0.8} />
          </pattern>
        )}
        {tier === "gold" && (
          <radialGradient id={`${id}-ray`} cx={RAY_ORIGIN.x} cy={RAY_ORIGIN.y} r={300} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={m.pattern} stopOpacity={1} />
            <stop offset="0.55" stopColor={m.pattern} stopOpacity={0.45} />
            <stop offset="1" stopColor={m.pattern} stopOpacity={0} />
          </radialGradient>
        )}
        {tier === "special" && (
          <pattern id={`${id}-star`} width={36} height={36} patternUnits="userSpaceOnUse">
            <path d={sparklePath(9, 9, 4)} fill={m.pattern} />
            <path d={sparklePath(27, 27, 2.5)} fill={m.pattern} />
            <circle cx={27} cy={8} r={0.9} fill={m.pattern} />
            <circle cx={8} cy={28} r={0.7} fill={m.pattern} />
          </pattern>
        )}
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
      <g opacity={m.patternOpacity}>
        {tier === "silver" && <rect width={CARD_W} height={CARD_H} fill={`url(#${id}-hex)`} />}
        {tier === "gold" && RAYS.map((pts, i) => <polygon key={i} points={pts} fill={`url(#${id}-ray)`} />)}
        {tier === "special" && <rect width={CARD_W} height={CARD_H} fill={`url(#${id}-star)`} />}
      </g>

      {tier === "gold" && (
        <g opacity={0.85}>
          {GLITTER.map((g, i) => (
            <path key={i} d={sparklePath(g.x, g.y, g.r)} fill="#FFFBEA" />
          ))}
        </g>
      )}
      </g>
    </svg>
  );
}

/**
 * Embossed frame: a beveled outer rim plus a raised inner border 8px in,
 * lit from above (light top edges, dark bottom edges).
 */
export function CardFrame({ tier }: { tier: Tier }) {
  const m = TIER_MATERIALS[tier];
  const id = `cfc-${tier}-bevel`;
  return (
    <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`} style={layer} aria-hidden="true">
      <defs>
        {shieldClip(`${id}-clip`)}
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.frameLight} />
          <stop offset="0.5" stopColor={m.frameLight} stopOpacity={0.35} />
          <stop offset="1" stopColor={m.frameDark} />
        </linearGradient>
        <linearGradient id={`${id}-in`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.frameDark} />
          <stop offset="0.5" stopColor={m.frameDark} stopOpacity={0.3} />
          <stop offset="1" stopColor={m.frameLight} />
        </linearGradient>
      </defs>
      {/* Outer rim: half the stroke is clipped away by the card edge. */}
      <polygon points={CARD_POINTS} fill="none" stroke={`url(#${id})`} strokeWidth={4} clipPath={`url(#${id}-clip)`} />
      {/* Inner border: groove (lit from below) right next to a ridge (lit from above). */}
      <polygon points={FRAME_POINTS} fill="none" stroke={`url(#${id}-in)`} strokeWidth={1} transform="translate(0 1.4)" opacity={0.8} />
      <polygon points={FRAME_POINTS} fill="none" stroke={`url(#${id})`} strokeWidth={1.6} />
    </svg>
  );
}

/** Commit FC shield, drawn in the given color. */
export function ShieldArt({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <path d="M4 1.5h20l3 3v18L14 30.5 1 22.5v-18z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M8 11l4 3.5L8 18" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 19h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}
