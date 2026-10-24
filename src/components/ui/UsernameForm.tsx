"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { isValidUsername } from "@/lib/github/username";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { EXIT_NAV_DELAY_MS, startExit, useExitState } from "@/lib/motion/landing-exit";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { MagneticButton } from "./MagneticButton";
import { useTypingPlaceholder } from "./useTypingPlaceholder";

interface UsernameFormProps {
  variant?: "hero" | "compact";
  defaultValue?: string;
  autoFocus?: boolean;
  /** Cycle sample usernames through the placeholder while idle */
  typingPlaceholder?: boolean;
  /** Landing only: play the card shuffle + wipe before navigating */
  exitTransition?: boolean;
}

const PLACEHOLDER = "username";

/** Accepts "octocat", "@octocat" or a pasted github.com/octocat URL. */
export function cleanUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]!
    .trim();
}

export function UsernameForm({
  variant = "hero",
  defaultValue = "",
  autoFocus = false,
  typingPlaceholder = false,
  exitTransition = false,
}: UsernameFormProps) {
  const router = useRouter();
  const id = useId();
  const field = useRef<HTMLDivElement>(null);
  const navTimer = useRef(0);
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [localPending, setLocalPending] = useState(false);
  const [focused, setFocused] = useState(false);
  const exit = useExitState();
  const hero = variant === "hero";
  // The exit state resets when Back restores the landing, so the button never sticks on "Scouting…".
  const pending = exitTransition ? exit.leaving : localPending;
  const typed = useTypingPlaceholder(typingPlaceholder && !focused && value === "");

  const { contextSafe } = useGSAP({ scope: field });
  // Wrapped at call time (not during render) so the tween is cleaned up with the component.
  function shake() {
    const el = field.current;
    if (prefersReducedMotion() || !el) return;
    contextSafe(() => {
      gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-8, 8, -6, 6, -3, 0] }, duration: 0.4, ease: "none" });
    })();
  }

  useEffect(() => () => window.clearTimeout(navTimer.current), []);

  function fail(message: string) {
    setError(message);
    shake();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const name = cleanUsername(value);
    if (!name) return fail("Enter a GitHub username.");
    if (!isValidUsername(name)) return fail("Usernames are letters, numbers and single hyphens (max 39).");
    setError(null);
    const href = `/u/${name}`;

    if (!exitTransition) {
      setLocalPending(true);
      router.push(href);
      return;
    }
    router.prefetch(href);
    startExit(name);
    // Navigate once the wipe has closed. With reduced motion the wipe is instant, so go now.
    navTimer.current = window.setTimeout(() => router.push(href), prefersReducedMotion() ? 0 : EXIT_NAV_DELAY_MS);
  }

  const errorId = `${id}-error`;
  const buttonLabel = hero ? (pending ? "Scouting…" : "Get my card") : "Scout";

  return (
    <form onSubmit={onSubmit} noValidate className={hero ? "w-full" : "w-full sm:w-auto"}>
      {hero && (
        <label htmlFor={id} className="mono-label mb-2 block text-xs text-muted">
          GitHub username
        </label>
      )}
      <div
        ref={field}
        className={
          hero
            ? "flex flex-wrap items-stretch gap-2 rounded-[16px] border border-line bg-surface p-2 focus-within:border-accent sm:flex-nowrap"
            : "flex items-stretch rounded-xl border border-line bg-surface focus-within:border-accent"
        }
      >
        <div className="flex min-w-0 flex-1 items-center pl-3">
          <span className={`font-mono text-dim ${hero ? "text-sm" : "text-xs"}`} aria-hidden="true">
            github.com/
          </span>
          {!hero && (
            <label htmlFor={id} className="sr-only">
              GitHub username
            </label>
          )}
          <input
            id={id}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={typed ?? PLACEHOLDER}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus={autoFocus}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`min-w-0 flex-1 bg-transparent font-mono text-text outline-none placeholder:text-dim ${hero ? "h-12 text-base" : "h-11 w-28 text-sm sm:w-36"}`}
          />
        </div>
        {hero ? (
          <MagneticButton
            type="submit"
            disabled={pending}
            className="font-display min-h-12 w-full rounded-xl bg-accent px-6 text-[22px] font-extrabold uppercase tracking-wider text-accent-ink hover:bg-[#5BE69A] disabled:opacity-70 sm:w-auto"
          >
            {buttonLabel}
          </MagneticButton>
        ) : (
          <button
            type="submit"
            className="font-display min-h-11 rounded-r-xl bg-accent px-4 text-base font-extrabold uppercase tracking-[0.06em] text-accent-ink hover:bg-[#5BE69A] disabled:opacity-70"
          >
            {buttonLabel}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 font-mono text-xs text-low">
          {error}
        </p>
      )}
    </form>
  );
}
