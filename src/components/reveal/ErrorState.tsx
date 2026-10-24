import { Footer } from "@/components/landing/Footer";
import { PageNav } from "@/components/report/PageNav";
import { UsernameForm } from "@/components/ui/UsernameForm";
import type { PlayerError } from "@/lib/player/types";

interface ErrorCopy {
  eyebrow: string;
  title: string;
  body: string;
}

export function errorCopy(error: PlayerError, username: string): ErrorCopy {
  switch (error.code) {
    case "USER_NOT_FOUND":
      return {
        eyebrow: "Scouting report · 404",
        title: "No player with that username",
        body: `We couldn't find @${username} on GitHub. Check the spelling and try again.`,
      };
    case "INVALID_USERNAME":
      return {
        eyebrow: "Scouting report · Invalid",
        title: "That's not a GitHub username",
        body: "Usernames use letters, numbers and single hyphens, up to 39 characters.",
      };
    case "RATE_LIMITED": {
      const minutes = error.retryAfter ? Math.max(1, Math.ceil(error.retryAfter / 60)) : null;
      return {
        eyebrow: "Scouting report · Busy",
        title: `Scouts are busy — try again in ${minutes ? `${minutes} minute${minutes === 1 ? "" : "s"}` : "a few minutes"}`,
        body: "We've hit GitHub's rate limit. Cards already scouted still load instantly.",
      };
    }
    default:
      return {
        eyebrow: "Scouting report · Error",
        title: "Something went wrong in the tunnel",
        body: "Our scouts hit a problem talking to GitHub. Try again in a moment.",
      };
  }
}

export function ErrorState({ error, username }: { error: PlayerError; username: string }) {
  const copy = errorCopy(error, username);
  return (
    <>
      <PageNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="mono-label text-xs text-accent">{copy.eyebrow}</p>
        <h1 className="display mt-4 text-5xl font-extrabold sm:text-6xl">{copy.title}</h1>
        <p className="mt-4 text-muted">{copy.body}</p>
        <div className="mt-8">
          <UsernameForm variant="hero" defaultValue={error.code === "RATE_LIMITED" ? username : ""} autoFocus />
        </div>
      </main>
      <Footer />
    </>
  );
}
