import { RatingsExplorer } from "./RatingsExplorer";

export function RatingsExplainer() {
  return (
    <section id="ratings" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6">
      <p className="mono-label text-xs text-accent">Ratings</p>
      <h2 className="display mt-3 text-5xl font-extrabold sm:text-6xl">What the numbers mean</h2>
      <p className="mt-4 max-w-xl text-muted">
        Every stat runs from 40 to 99 on a log scale, so early progress counts. Your overall is a weighted average, and it
        sets your card tier.
      </p>
      <RatingsExplorer />
    </section>
  );
}
