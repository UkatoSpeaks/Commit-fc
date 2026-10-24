import { UsernameForm } from "@/components/ui/UsernameForm";
import { KickoffIntro } from "./KickoffIntro";
import { SampleCards } from "./SampleCards";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pt-12">
      <KickoffIntro>
        <p data-intro="eyebrow" className="mono-label text-xs text-accent">
          Season 26/27 · Scouting is open
        </p>
        <h1 data-intro="title" className="display mt-4 text-[56px] font-extrabold sm:text-[80px] lg:text-[96px]">
          Your GitHub, rated like a{" "}
          <span data-intro-accent className="inline-block text-accent">
            footballer.
          </span>
        </h1>
        <p data-intro="fade" className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          We scout your public repos, commits and pull requests, then hand you a player card with six real ratings. Share
          it, challenge a friend, or work your way up to gold.
        </p>
        <div className="mt-8 max-w-lg">
          <div data-intro="fade">
            <UsernameForm variant="hero" typingPlaceholder exitTransition />
          </div>
          <p data-intro="fade" className="mono-label mt-3 text-[11px] text-dim">
            Public data only · No sign-in · Ready in seconds
          </p>
        </div>
      </KickoffIntro>
      <SampleCards />
    </section>
  );
}
