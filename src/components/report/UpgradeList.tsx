import { ArrowRight } from "lucide-react";
import { cardClass } from "@/components/ui/styles";
import type { Upgrade } from "@/lib/ui/upgrades";

export function UpgradeList({ upgrades }: { upgrades: readonly Upgrade[] }) {
  return (
    <section className={`${cardClass} p-5 sm:p-6`} aria-labelledby="upgrades-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="upgrades-title" className="display text-2xl font-extrabold sm:text-3xl">
          Upgrade your card
        </h2>
        <span className="mono-label rounded-full border border-line-strong px-2.5 py-1 text-[10px] text-dim">Estimates</span>
      </div>

      {upgrades.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Every stat is already 90 or higher. Nothing left to suggest.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {upgrades.map((u) => (
            <li key={u.stat} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-line bg-surface-2 px-4 py-3">
              <div className="min-w-0">
                <p className="display flex items-center gap-2 text-2xl font-extrabold">
                  {u.stat} <span className="text-dim">{u.from}</span>
                  <ArrowRight size={18} aria-label="to" className="text-dim" />
                  <span className="text-accent">{u.to}</span>
                </p>
                <p className="text-sm text-muted">{u.action}</p>
              </div>
              {u.overallTo > u.overallFrom && (
                <span className="mono-label text-xs text-accent">+{u.overallTo - u.overallFrom} OVR</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
