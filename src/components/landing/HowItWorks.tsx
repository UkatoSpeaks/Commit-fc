import { ScoutingSteps } from "./ScoutingSteps";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6">
      <p className="mono-label text-xs text-accent">How it works</p>
      <h2 className="display mt-3 text-5xl font-extrabold sm:text-6xl">From commits to caps</h2>
      <ScoutingSteps />
    </section>
  );
}
