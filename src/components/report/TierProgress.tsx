import { cardClass } from "@/components/ui/styles";
import { RATING } from "@/lib/stats/config";
import { tierProgress } from "@/lib/ui/next-tier";
import { TIER_MATERIALS } from "@/lib/ui/tiers";

export function TierProgress({ overall }: { overall: number }) {
  const p = tierProgress(overall);
  const color = TIER_MATERIALS[p.tier].dot;

  return (
    <section className={`${cardClass} p-5 sm:p-6`} aria-labelledby="tier-progress-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="tier-progress-title" className="display text-2xl font-extrabold sm:text-3xl">
          {p.next ? (
            <>
              {p.next.pointsNeeded} {p.next.pointsNeeded === 1 ? "point" : "points"} to {TIER_MATERIALS[p.next.tier].label}
            </>
          ) : (
            "Top tier"
          )}
        </h2>
        <span className="mono-label text-xs text-dim">OVR {overall}</span>
      </div>

      <div className="relative mt-5 pb-7">
        <div
          className="relative h-3 overflow-hidden rounded-full border border-line bg-surface-2"
          role="meter"
          aria-label="Overall rating"
          aria-valuemin={RATING.min}
          aria-valuemax={RATING.max}
          aria-valuenow={overall}
        >
          <div className="h-full rounded-full" style={{ width: `${p.percent}%`, background: color }} />
        </div>
        {p.markers.map((m) => (
          <div key={m.tier} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${m.percent}%` }} aria-hidden="true">
            <span className="h-3 w-px bg-text/60" />
            <span className="mono-label mt-2 text-[10px] text-dim">{TIER_MATERIALS[m.tier].label}</span>
          </div>
        ))}
        <div className="mono-label absolute right-0 bottom-0 left-0 flex justify-between text-[10px] text-dim" aria-hidden="true">
          <span>{RATING.min}</span>
          <span>{RATING.max}</span>
        </div>
      </div>
    </section>
  );
}
