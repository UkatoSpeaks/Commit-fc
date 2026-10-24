"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { isValidUsername } from "@/lib/github/username";

interface UsernameFormProps {
  variant?: "hero" | "compact";
  defaultValue?: string;
  autoFocus?: boolean;
}

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

export function UsernameForm({ variant = "hero", defaultValue = "", autoFocus = false }: UsernameFormProps) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const hero = variant === "hero";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = cleanUsername(value);
    if (!name) return setError("Enter a GitHub username.");
    if (!isValidUsername(name)) return setError("Usernames are letters, numbers and single hyphens (max 39).");
    setError(null);
    setPending(true);
    router.push(`/u/${name}`);
  }

  const errorId = `${id}-error`;

  return (
    <form onSubmit={onSubmit} noValidate className={hero ? "w-full" : "w-full sm:w-auto"}>
      {hero && (
        <label htmlFor={id} className="mono-label mb-2 block text-xs text-muted">
          GitHub username
        </label>
      )}
      <div
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
            placeholder="username"
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
        <button
          type="submit"
          disabled={pending && hero}
          className={
            hero
              ? "font-display min-h-12 w-full rounded-xl bg-accent px-6 text-[22px] font-extrabold uppercase tracking-wider text-accent-ink hover:bg-[#5BE69A] disabled:opacity-70 sm:w-auto"
              : "font-display min-h-11 rounded-r-xl bg-accent px-4 text-base font-extrabold uppercase tracking-[0.06em] text-accent-ink hover:bg-[#5BE69A] disabled:opacity-70"
          }
        >
          {hero ? (pending ? "Scouting…" : "Get my card") : "Scout"}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 font-mono text-xs text-low">
          {error}
        </p>
      )}
    </form>
  );
}
