"use client";

import { useRef, useState } from "react";
import { PlayerCard } from "@/components/card/PlayerCard";
import { cardClass } from "@/components/ui/styles";
import { gsap, hasRevealed, markRevealed, REVEAL_START, useGSAP } from "@/lib/motion/gsap-scroll";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import type { StatKey, Tier } from "@/lib/stats";
import { SAMPLE_CARDS } from "@/lib/ui/samples";
import { TIER_MATERIALS } from "@/lib/ui/tiers";
import { STATS, TIER_PREVIEW_OVERALL, TIER_RANGES } from "./ratings-data";

const KEY = "ratings-explorer";
const PREVIEW_SIZE = 210; // ~0.7 of the full 300px card

/**
 * Stat grid + a small sample card. Hovering or focusing a stat highlights it on the card;
 * hovering or focusing a tier chip flips the card into that tier's material.
 */
export function RatingsExplorer() {
  const root = useRef<HTMLDivElement>(null);
  const flip = useRef<HTMLDivElement>(null);
  const flipTarget = useRef<Tier>("gold");
  const [tier, setTier] = useState<Tier>("gold");
  const [shownTier, setShownTier] = useState<Tier>("gold");
  const [active, setActive] = useState<StatKey | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (hasRevealed(KEY)) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true, onEnter: () => markRevealed(KEY) },
        });
        tl.fromTo("[data-chip]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, 0)
          .fromTo("[data-cell]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.1)
          .fromTo("[data-code]", { rotationX: -90, transformPerspective: 400 }, { rotationX: 0, duration: 0.5, stagger: 0.07, ease: "back.out(1.8)" }, 0.25)
          .fromTo("[data-preview]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.15);
      });
    },
    { scope: root },
  );

  function chooseTier(next: Tier) {
    if (next === flipTarget.current) return;
    setTier(next);
    flipTarget.current = next;
    const el = flip.current;
    if (!el || prefersReducedMotion()) {
      setShownTier(next);
      return;
    }
    // Turn edge-on, swap the material while it's invisible, turn back.
    contextSafe(() => {
      gsap.to(el, {
        rotationY: 90,
        duration: 0.14,
        ease: "power1.in",
        overwrite: true,
        onComplete: () => {
          setShownTier(flipTarget.current);
          gsap.to(el, { rotationY: 0, duration: 0.22, ease: "power2.out" });
        },
      });
    })();
  }

  const preview = { ...SAMPLE_CARDS.gold, tier: shownTier, overall: TIER_PREVIEW_OVERALL[shownTier] };

  return (
    <div ref={root}>
      <ul className="mt-8 flex flex-wrap gap-2" aria-label="Card tiers">
        {TIER_RANGES.map(({ tier: t, range }) => {
          const pressed = t === tier;
          return (
            <li key={t} data-chip>
              <button
                type="button"
                aria-pressed={pressed}
                onClick={() => chooseTier(t)}
                onPointerEnter={(e) => e.pointerType !== "touch" && chooseTier(t)}
                onFocus={() => chooseTier(t)}
                className={`mono-label inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-[11px] transition-colors ${
                  pressed ? "border-muted bg-surface text-text" : "border-line-strong text-muted hover:text-text"
                }`}
              >
                <span className="size-2 rounded-full" style={{ background: TIER_MATERIALS[t].dot }} aria-hidden="true" />
                {TIER_MATERIALS[t].label} {range}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <dl className="grid gap-4 sm:grid-cols-2" onPointerLeave={() => setActive(null)}>
          {STATS.map((s) => {
            const on = active === s.key;
            return (
              <div
                key={s.key}
                data-cell
                onPointerEnter={(e) => e.pointerType !== "touch" && setActive(s.key)}
                className={`${cardClass} p-6 transition-colors ${on ? "border-accent/60" : ""}`}
              >
                <dt>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-describedby={`stat-${s.key}`}
                    onFocus={() => setActive(s.key)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(on ? null : s.key)}
                    className="flex items-baseline gap-3 rounded-md text-left"
                  >
                    <span data-code className="display inline-block text-4xl font-extrabold text-accent">
                      {s.key}
                    </span>
                    <span className="mono-label text-xs text-muted">{s.name}</span>
                  </button>
                </dt>
                <dd id={`stat-${s.key}`} className="mt-3 text-sm leading-relaxed text-muted">
                  {s.body}
                </dd>
              </div>
            );
          })}
        </dl>

        <div data-preview className="order-first flex justify-center lg:sticky lg:top-8 lg:order-none" style={{ perspective: 900 }}>
          <div ref={flip}>
            <PlayerCard data={preview} size={PREVIEW_SIZE} highlight={active} />
          </div>
        </div>
      </div>
    </div>
  );
}
