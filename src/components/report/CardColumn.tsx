"use client";

import { RotateCcw } from "lucide-react";
import { PlayerCard } from "@/components/card/PlayerCard";
import { useTilt } from "@/components/card/useTilt";
import { buttonClass } from "@/components/ui/styles";
import type { Ref } from "react";
import type { CardData } from "@/lib/ui/card-data";
import { TIER_MATERIALS } from "@/lib/ui/tiers";
import { ShareBar } from "./ShareBar";

interface CardColumnProps {
  data: CardData;
  /** Focused after the pack reveal */
  ref?: Ref<HTMLElement>;
  /** Plays the pack reveal again. Omitted (no button) when motion is reduced. */
  onReplay?: () => void;
}

export function CardColumn({ data, ref, onReplay }: CardColumnProps) {
  const tilt = useTilt();
  const glow = TIER_MATERIALS[data.tier].dot;

  return (
    <section ref={ref} tabIndex={-1} aria-label="Your player card" className="flex w-full flex-col items-center gap-5 rounded-card">
      <div className="relative flex w-full justify-center py-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${glow} 38%, transparent), transparent)` }}
        />
        <PlayerCard data={data} tilt={tilt} animated={tilt.enabled} className="relative" />
      </div>

      {tilt.enabled && (
        <p className="mono-label text-[11px] text-dim">Move your cursor or tilt your phone</p>
      )}
      {tilt.motionPermission === "needed" && (
        <button type="button" onClick={tilt.requestMotion} className={buttonClass("outline", "text-sm!")}>
          Enable tilt
        </button>
      )}

      {onReplay && (
        <button type="button" onClick={onReplay} className={buttonClass("outline", "text-sm!")}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Replay walkout
        </button>
      )}

      <ShareBar />
    </section>
  );
}
