import { Star } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/styles";
import { REPO_URL } from "@/lib/ui/site";

export function LandingNav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Logo />
      <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
        <a href="#how-it-works" className="hidden min-h-11 items-center rounded-lg px-3 text-sm text-muted hover:text-text md:inline-flex">
          How it works
        </a>
        <a href="#ratings" className="hidden min-h-11 items-center rounded-lg px-3 text-sm text-muted hover:text-text md:inline-flex">
          Ratings
        </a>
        <span aria-disabled="true" className="hidden min-h-11 cursor-not-allowed items-center gap-2 px-3 text-sm text-dim md:inline-flex">
          Leaderboard
          <span className="mono-label rounded-full border border-line-strong px-2 py-0.5 text-[10px]">soon</span>
        </span>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClass("outline", "ml-1 px-3! text-base!")}>
          <GitHubIcon size={16} />
          <span className="hidden sm:inline">Star on GitHub</span>
          <span className="sm:hidden">Star</span>
          <Star size={14} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
