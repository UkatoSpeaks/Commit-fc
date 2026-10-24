"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import type { FeaturedPlayer } from "@/lib/ui/featured";
import { TIER_MATERIALS } from "@/lib/ui/tiers";

/** Scroll speed in px per second. */
const SPEED = 40;

function Items({ players, clone = false }: { players: FeaturedPlayer[]; clone?: boolean }) {
  return (
    <ul
      className={`flex shrink-0 items-center ${clone ? "motion-reduce:hidden" : ""}`}
      // The clone only exists for the seamless loop: hidden from screen readers and the tab order.
      aria-hidden={clone || undefined}
      inert={clone || undefined}
    >
      {players.map((p) => (
        <li key={p.username} className="flex items-center">
          <Link
            href={`/u/${p.username}`}
            prefetch={clone ? false : undefined}
            tabIndex={clone ? -1 : undefined}
            className="flex min-h-11 items-center gap-3 rounded-md px-5 font-mono text-sm tracking-[0.12em] text-accent uppercase hover:text-text focus-visible:outline-offset-[-2px]"
          >
            <span className="size-1.5 rounded-full" style={{ background: TIER_MATERIALS[p.tier].dot }} aria-hidden="true" />
            <span>@{p.username}</span>
            <span className="text-text">
              {p.overall} <span className="text-dim">{p.pitch}</span>
            </span>
          </Link>
          <span aria-hidden="true" className="text-line-strong">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Infinite marquee. Two copies side by side; moving left by exactly one copy loops
 * seamlessly. Pauses on hover and keyboard focus. Reduced motion: one static row
 * that scrolls sideways.
 */
export function TickerTrack({ players }: { players: FeaturedPlayer[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      const box = root.current;
      if (!el || !box) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The track is exactly two copies wide, so -50% is one copy: font or resize changes can't break the loop.
        const copyWidth = () => el.offsetWidth / 2;
        if (!copyWidth()) return;
        const loop = gsap.to(el, { xPercent: -50, duration: copyWidth() / SPEED, ease: "none", repeat: -1 });
        const slow = (to: number) => gsap.to(loop, { timeScale: to, duration: 0.4, overwrite: true });

        const onEnter = () => slow(0);
        const onLeave = () => {
          if (!box.contains(document.activeElement)) slow(1);
        };
        // Keyboard: stop and bring the focused player into view.
        const onFocusIn = (e: FocusEvent) => {
          const link = (e.target as HTMLElement).closest("li");
          gsap.killTweensOf(loop);
          loop.timeScale(0);
          if (link) loop.progress(Math.min(0.999, Math.max(0, link.offsetLeft - 16) / copyWidth()));
        };
        const onFocusOut = (e: FocusEvent) => {
          if (!box.contains(e.relatedTarget as Node | null) && !box.matches(":hover")) slow(1);
        };
        box.addEventListener("pointerenter", onEnter);
        box.addEventListener("pointerleave", onLeave);
        box.addEventListener("focusin", onFocusIn);
        box.addEventListener("focusout", onFocusOut);
        return () => {
          box.removeEventListener("pointerenter", onEnter);
          box.removeEventListener("pointerleave", onLeave);
          box.removeEventListener("focusin", onFocusIn);
          box.removeEventListener("focusout", onFocusOut);
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Featured players" className="led-board border-y border-line">
      {/* overflow: clip, not hidden, so focusing a link can't scroll the strip under the transform */}
      <div className="overflow-clip motion-reduce:overflow-x-auto">
        <div ref={track} className="flex w-max py-1">
          <Items players={players} />
          <Items players={players} clone />
        </div>
      </div>
    </section>
  );
}
