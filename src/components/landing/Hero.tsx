import { UsernameForm } from "@/components/ui/UsernameForm";
import { SampleCards } from "./SampleCards";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pt-12">
      <div className="max-w-xl">
        <p className="mono-label text-xs text-accent">Season 26/27 · Scouting is open</p>
        <h1 className="display mt-4 text-[56px] font-extrabold sm:text-[80px] lg:text-[96px]">
          Your GitHub, rated like a <span className="text-accent">footballer.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          We scout your public repos, commits and pull requests, then hand you a player card with six real ratings. Share
          it, challenge a friend, or work your way up to gold.
        </p>
        <div className="mt-8 max-w-lg">
          <UsernameForm variant="hero" />
          <p className="mono-label mt-3 text-[11px] text-dim">Public data only · No sign-in · Ready in ~2 seconds</p>
        </div>
      </div>
      <SampleCards />
    </section>
  );
}
