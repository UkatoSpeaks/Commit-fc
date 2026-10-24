import type { ReactNode } from "react";
import type { Country, CustomFlag, FlagShape } from "@/lib/ui/flags";

/** Points for a 5-point star centered at (cx, cy). */
function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.4;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + radius * Math.cos(a)).toFixed(2)},${(cy + radius * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function stripes(colors: readonly string[], weights: readonly number[] | undefined, vertical: boolean): ReactNode {
  const w = weights ?? colors.map(() => 1);
  const total = w.reduce((a, b) => a + b, 0);
  const size = vertical ? 30 : 20;
  let offset = 0;
  return colors.map((color, i) => {
    const len = ((w[i] ?? 1) / total) * size;
    const rect = vertical ? (
      <rect key={i} x={offset} y={0} width={len + 0.05} height={20} fill={color} />
    ) : (
      <rect key={i} x={0} y={offset} width={30} height={len + 0.05} fill={color} />
    );
    offset += len;
    return rect;
  });
}

function UnionJack({ w = 30, h = 20 }: { w?: number; h?: number }) {
  const sx = w / 30;
  const sy = h / 20;
  return (
    <g transform={`scale(${sx} ${sy})`}>
      <rect width={30} height={20} fill="#012169" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFFFFF" strokeWidth={4} />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth={1.4} />
      <rect x={0} y={7} width={30} height={6} fill="#FFFFFF" />
      <rect x={12} y={0} width={6} height={20} fill="#FFFFFF" />
      <rect x={0} y={8.2} width={30} height={3.6} fill="#C8102E" />
      <rect x={13.2} y={0} width={3.6} height={20} fill="#C8102E" />
    </g>
  );
}

const CUSTOM: Record<CustomFlag, () => ReactNode> = {
  US: () => (
    <>
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={0} y={(i * 20) / 13} width={30} height={20 / 13 + 0.05} fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"} />
      ))}
      <rect width={13} height={(7 * 20) / 13} fill="#3C3B6E" />
    </>
  ),
  GB: () => UnionJack({}),
  IN: () => (
    <>
      {stripes(["#FF9933", "#FFFFFF", "#138808"], undefined, false)}
      <circle cx={15} cy={10} r={2.4} fill="none" stroke="#000080" strokeWidth={0.7} />
    </>
  ),
  BR: () => (
    <>
      <rect width={30} height={20} fill="#009C3B" />
      <polygon points="3,10 15,2.5 27,10 15,17.5" fill="#FFDF00" />
      <circle cx={15} cy={10} r={4.2} fill="#002776" />
    </>
  ),
  CN: () => (
    <>
      <rect width={30} height={20} fill="#EE1C25" />
      <polygon points={star(5.5, 5, 3)} fill="#FFFF00" />
      {[
        [10, 2],
        [12, 4],
        [12, 7],
        [10, 9],
      ].map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={star(x!, y!, 0.9)} fill="#FFFF00" />
      ))}
    </>
  ),
  VN: () => (
    <>
      <rect width={30} height={20} fill="#DA251D" />
      <polygon points={star(15, 10.5, 6)} fill="#FFFF00" />
    </>
  ),
  TR: () => (
    <>
      <rect width={30} height={20} fill="#E30A17" />
      <circle cx={11} cy={10} r={5} fill="#FFFFFF" />
      <circle cx={12.4} cy={10} r={4} fill="#E30A17" />
      <polygon points={star(17.5, 10, 2.2)} fill="#FFFFFF" />
    </>
  ),
  CH: () => (
    <>
      <rect width={30} height={20} fill="#DA291C" />
      <rect x={13} y={4} width={4} height={12} fill="#FFFFFF" />
      <rect x={9} y={8} width={12} height={4} fill="#FFFFFF" />
    </>
  ),
  KR: () => (
    <>
      <rect width={30} height={20} fill="#FFFFFF" />
      <path d="M10,10 A5,5 0 0 1 20,10 Z" fill="#CD2E3A" />
      <path d="M10,10 A5,5 0 0 0 20,10 Z" fill="#0047A0" />
      {[
        [5, 4.5, 35],
        [25, 4.5, -35],
        [5, 15.5, -35],
        [25, 15.5, 35],
      ].map(([x, y, r]) => (
        <rect key={`${x}-${y}`} x={x! - 2} y={y! - 1.2} width={4} height={2.4} fill="#000000" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </>
  ),
  CA: () => (
    <>
      {stripes(["#D52B1E", "#FFFFFF", "#D52B1E"], [1, 2, 1], true)}
      <polygon points={star(15, 10.5, 4.6)} fill="#D52B1E" />
    </>
  ),
  AU: () => (
    <>
      <rect width={30} height={20} fill="#012169" />
      {UnionJack({ w: 15, h: 10 })}
      <polygon points={star(7.5, 15, 2.4)} fill="#FFFFFF" />
      {[
        [22, 4],
        [26, 9],
        [19, 10],
        [22, 16],
      ].map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={star(x!, y!, 1.3)} fill="#FFFFFF" />
      ))}
    </>
  ),
  NZ: () => (
    <>
      <rect width={30} height={20} fill="#012169" />
      {UnionJack({ w: 15, h: 10 })}
      {[
        [22, 4],
        [26, 9],
        [19, 10],
        [22, 16],
      ].map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={star(x!, y!, 1.5)} fill="#C8102E" stroke="#FFFFFF" strokeWidth={0.4} />
      ))}
    </>
  ),
  PK: () => (
    <>
      <rect width={30} height={20} fill="#01411C" />
      <rect width={7.5} height={20} fill="#FFFFFF" />
      <circle cx={19} cy={10} r={5} fill="#FFFFFF" />
      <circle cx={20.6} cy={8.8} r={4.4} fill="#01411C" />
      <polygon points={star(22, 7.5, 1.6)} fill="#FFFFFF" />
    </>
  ),
  IL: () => (
    <>
      <rect width={30} height={20} fill="#FFFFFF" />
      <rect y={2} width={30} height={2.6} fill="#0038B8" />
      <rect y={15.4} width={30} height={2.6} fill="#0038B8" />
      <polygon points="15,6 18.5,12 11.5,12" fill="none" stroke="#0038B8" strokeWidth={0.8} />
      <polygon points="15,14 18.5,8 11.5,8" fill="none" stroke="#0038B8" strokeWidth={0.8} />
    </>
  ),
  PT: () => (
    <>
      <rect width={30} height={20} fill="#FF0000" />
      <rect width={12} height={20} fill="#006600" />
      <circle cx={12} cy={10} r={3.6} fill="#FFE000" />
    </>
  ),
  CL: () => (
    <>
      <rect width={30} height={10} fill="#FFFFFF" />
      <rect y={10} width={30} height={10} fill="#D52B1E" />
      <rect width={10} height={10} fill="#0039A6" />
      <polygon points={star(5, 5, 2.6)} fill="#FFFFFF" />
    </>
  ),
  ZA: () => (
    <>
      <rect width={30} height={10} fill="#E03C31" />
      <rect y={10} width={30} height={10} fill="#001489" />
      <polygon points="0,0 4,0 13,7 30,7 30,13 13,13 4,20 0,20" fill="#FFFFFF" />
      <polygon points="0,1.5 2.4,0 12,8 30,8 30,12 12,12 2.4,20 0,18.5" fill="#007749" />
      <polygon points="0,4 8,10 0,16" fill="#FFB81C" />
      <polygon points="0,5.6 6,10 0,14.4" fill="#000000" />
    </>
  ),
  AE: () => (
    <>
      {stripes(["#00732F", "#FFFFFF", "#000000"], undefined, false)}
      <rect width={8} height={20} fill="#FF0000" />
    </>
  ),
};

// Called as plain functions (not <Components>): Satori only accepts SVG elements inside <svg>.
function shape(flag: FlagShape): ReactNode {
  switch (flag.kind) {
    case "h":
      return <>{stripes(flag.colors, flag.weights, false)}</>;
    case "v":
      return <>{stripes(flag.colors, flag.weights, true)}</>;
    case "nordic":
      return (
        <>
          <rect width={30} height={20} fill={flag.field} />
          <rect x={8} width={5} height={20} fill={flag.cross} />
          <rect y={7.5} width={30} height={5} fill={flag.cross} />
          {flag.inner && (
            <>
              <rect x={9.4} width={2.2} height={20} fill={flag.inner} />
              <rect y={8.9} width={30} height={2.2} fill={flag.inner} />
            </>
          )}
        </>
      );
    case "disc":
      return (
        <>
          <rect width={30} height={20} fill={flag.field} />
          <circle cx={15 + (flag.offset ?? 0)} cy={10} r={6} fill={flag.disc} />
        </>
      );
    case "custom":
      return <>{CUSTOM[flag.id]()}</>;
  }
}

interface FlagProps {
  country: Country | null;
  width?: number;
  height?: number;
  radius?: number;
  className?: string;
}

/** A simplified, emoji-free flag. Unknown country → neutral grey flag. */
export function Flag({ country, width = 34, height = 22, radius = 3, className }: FlagProps) {
  return (
    <span
      className={className}
      style={{ display: "inline-block", width, height, borderRadius: radius, overflow: "hidden", lineHeight: 0, boxShadow: "0 0 0 1px rgba(0,0,0,0.18)" }}
      role="img"
      aria-label={country ? `Flag of ${country.name}` : "Unknown nation"}
    >
      <FlagArt country={country} width={width} height={height} />
    </span>
  );
}

/** Just the flag drawing, no wrapper. Plain SVG, so it also renders in image exports. */
export function FlagArt({ country, width, height }: { country: Country | null; width: number; height: number }) {
  return (
    <svg viewBox="0 0 30 20" width={width} height={height} preserveAspectRatio="none" aria-hidden="true">
      {country ? (
        shape(country.flag)
      ) : (
        <>
          <rect width={30} height={20} fill="#4A5650" />
          <rect y={8} width={30} height={4} fill="#65726B" />
        </>
      )}
    </svg>
  );
}
