import { Chip } from "@/components/ui/Chip";
import { cardClass } from "@/components/ui/styles";
import type { StatKey, Tier } from "@/lib/stats";
import { TIER_MATERIALS } from "@/lib/ui/tiers";

const TIER_RANGES: { tier: Tier; range: string }[] = [
  { tier: "bronze", range: "<65" },
  { tier: "silver", range: "65–74" },
  { tier: "gold", range: "75–84" },
  { tier: "special", range: "85+" },
];

// Matches the stats engine (src/lib/stats/stats.ts).
const STATS: { key: StatKey; name: string; body: string }[] = [
  { key: "PAC", name: "Pace", body: "Contributions in the last 90 days, plus your current daily streak." },
  { key: "SHO", name: "Shooting", body: "Total stars on the repos you own. Impact others can see." },
  { key: "PAS", name: "Passing", body: "Pull requests you open to other people's repos, plus forks of your work." },
  { key: "DRI", name: "Dribbling", body: "How many languages make up a real share (over 2%) of your code." },
  { key: "DEF", name: "Defending", body: "Issues and PR reviews you've done, plus how long you've been on GitHub." },
  { key: "PHY", name: "Physical", body: "Contributions this year, public repos and followers. Staying power." },
];

export function RatingsExplainer() {
  return (
    <section id="ratings" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6">
      <p className="mono-label text-xs text-accent">Ratings</p>
      <h2 className="display mt-3 text-5xl font-extrabold sm:text-6xl">What the numbers mean</h2>
      <p className="mt-4 max-w-xl text-muted">
        Every stat runs from 40 to 99 on a log scale, so early progress counts. Your overall is a weighted average, and it
        sets your card tier.
      </p>

      <ul className="mt-8 flex flex-wrap gap-2" aria-label="Card tiers">
        {TIER_RANGES.map(({ tier, range }) => (
          <li key={tier}>
            <Chip dot={TIER_MATERIALS[tier].dot}>
              {TIER_MATERIALS[tier].label} {range}
            </Chip>
          </li>
        ))}
      </ul>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.key} className={`${cardClass} p-6`}>
            <dt className="flex items-baseline gap-3">
              <span className="display text-4xl font-extrabold text-accent">{s.key}</span>
              <span className="mono-label text-xs text-muted">{s.name}</span>
            </dt>
            <dd className="mt-3 text-sm leading-relaxed text-muted">{s.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
