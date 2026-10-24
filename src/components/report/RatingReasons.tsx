import { cardClass } from "@/components/ui/styles";
import type { StatKey, Stats } from "@/lib/stats";
import { barPercent } from "@/lib/ui/next-tier";
import { ratingColor } from "@/lib/ui/reasons";

const ORDER: readonly StatKey[] = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];

const TEXT = { good: "text-good", ok: "text-ok", low: "text-low" } as const;
const BAR = { good: "bg-good", ok: "bg-ok", low: "bg-low" } as const;

export function RatingReasons({ stats, reasons }: { stats: Stats; reasons: Record<StatKey, string> }) {
  return (
    <section className={`${cardClass} p-5 sm:p-6`} aria-labelledby="reasons-title">
      <h2 id="reasons-title" className="display text-2xl font-extrabold sm:text-3xl">
        Why these ratings
      </h2>
      <ul className="mt-4 divide-y divide-line">
        {ORDER.map((k) => {
          const tone = ratingColor(stats[k]);
          return (
            <li key={k} className="py-3">
              <div className="flex items-center gap-3">
                <span className="display w-11 text-2xl font-bold">{k}</span>
                <span className={`display w-9 text-2xl font-extrabold ${TEXT[tone]}`}>{stats[k]}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <span className={`block h-full rounded-full ${BAR[tone]}`} style={{ width: `${barPercent(stats[k])}%` }} />
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted sm:pl-[92px]">{reasons[k]}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
