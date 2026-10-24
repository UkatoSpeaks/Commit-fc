"use client";

import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { PREVIEW_AVATAR, previewCards } from "@/components/card/__fixtures__/cards";
import { PlayerCard } from "@/components/card/PlayerCard";
import type { Tilt } from "@/components/card/useTilt";
import type { Tier } from "@/lib/stats";

const CARDS = previewCards(PREVIEW_AVATAR);

/** A frozen tilt so screenshots can show the lit/edge states. */
const FROZEN: Tilt = { ref: { current: null }, enabled: true, motionPermission: "unsupported", requestMotion: () => {} };

function tiltVars(x: number, y: number, max = 12): CSSProperties {
  return {
    ["--rx" as string]: `${-y * max}deg`,
    ["--ry" as string]: `${x * max}deg`,
    ["--gx" as string]: `${50 + x * 50}%`,
    ["--gy" as string]: `${50 + y * 50}%`,
    ["--tx" as string]: x,
    ["--ty" as string]: y,
    ["--tilt" as string]: Math.max(Math.abs(x), Math.abs(y)),
  };
}

/**
 * All four tiers side by side, for screenshots.
 * ?live=0 base layer only · ?back=1 card backs · ?tilt=0.8,-0.4 frozen tilt (x,y in -1..1)
 */
export function DebugCards() {
  const params = useSearchParams();
  const live = params.get("live") !== "0";
  const flipped = params.get("back") === "1";
  const [x, y] = (params.get("tilt") ?? "").split(",").map(Number);
  const frozen = Number.isFinite(x) && Number.isFinite(y);

  return (
    <main className="grid w-max grid-cols-4 gap-6 bg-bg p-6 pb-10">
      {(Object.keys(CARDS) as Tier[]).map((tier) => (
        <div key={tier} data-tier={tier} className="p-4" style={frozen ? tiltVars(x!, y!) : undefined}>
          <PlayerCard data={CARDS[tier]} live={live} animated={false} flipped={flipped} tilt={frozen ? FROZEN : undefined} />
        </div>
      ))}
    </main>
  );
}
