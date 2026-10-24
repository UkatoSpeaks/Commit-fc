"use client";

import { PlayerCard } from "@/components/card/PlayerCard";
import { useTilt } from "@/components/card/useTilt";
import { buttonClass } from "@/components/ui/styles";
import type { CardData } from "@/lib/ui/card-data";
import { TIER_MATERIALS } from "@/lib/ui/tiers";
import { ShareBar } from "./ShareBar";

export function CardColumn({ data }: { data: CardData }) {
  const tilt = useTilt();
  const glow = TIER_MATERIALS[data.tier].dot;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="relative flex w-full justify-center py-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${glow} 38%, transparent), transparent)` }}
        />
        <PlayerCard data={data} tilt={tilt} animated={tilt.enabled} priority className="relative" />
      </div>

      {tilt.enabled && (
        <p className="mono-label text-[11px] text-dim">Move your cursor or tilt your phone</p>
      )}
      {tilt.motionPermission === "needed" && (
        <button type="button" onClick={tilt.requestMotion} className={buttonClass("outline", "text-sm!")}>
          Enable tilt
        </button>
      )}

      <ShareBar />
    </div>
  );
}
