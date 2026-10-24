"use client";

import { useRef } from "react";
import { cardClass } from "@/components/ui/styles";
import { gsap, hasRevealed, markRevealed, REVEAL_START, useGSAP } from "@/lib/motion/gsap-scroll";
import type { StatKey } from "@/lib/stats";
import { SAMPLE_CARDS } from "@/lib/ui/samples";

const STEPS = [
  { n: "01", title: "Enter a username", body: "Any public GitHub account. No sign-in, no permissions, nothing to install." },
  { n: "02", title: "We scout your repos", body: "Commits, stars, pull requests, languages and reviews become six ratings and a position." },
  { n: "03", title: "Walk out and share", body: "Open your pack, get your card, and post it or drop it in your README." },
] as const;

const STAT_KEYS: StatKey[] = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];
const SCOUTED = SAMPLE_CARDS.gold.stats;
const STAT_FLOOR = 40;
const KEY = "scouting-steps";

/** Six ratings that count up from 40 when step 02 scrolls in. Final values in the HTML. */
function ScoutedStats() {
  return (
    <dl className="mt-5 grid grid-cols-3 gap-x-4 gap-y-2" aria-label="Example ratings">
      {STAT_KEYS.map((k) => (
        <div key={k} className="flex items-baseline gap-2">
          <dt className="mono-label text-[11px] text-dim">{k}</dt>
          <dd className="display text-2xl font-extrabold tabular-nums text-text" data-count={SCOUTED[k]}>
            {SCOUTED[k]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The three "How it works" steps. A connecting line draws 01 → 02 → 03 with scroll
 * (horizontal from md, vertical on phones), the cards rise in, step 02 counts up.
 */
export function ScoutingSteps() {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = root.current;
      if (!list || hasRevealed(KEY)) return;
      const items = gsap.utils.toArray<HTMLElement>("li", list);
      const line = list.querySelector<HTMLElement>("[data-line]");
      const last = items[items.length - 1];
      const mm = gsap.matchMedia();

      mm.add(
        { wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", narrow: "(max-width: 767px) and (prefers-reduced-motion: no-preference)" },
        (ctx) => {
          const wide = Boolean(ctx.conditions?.wide);

          // Size the line to run from the first step's number to the last one's.
          const sizeLine = () => {
            if (!line || !last) return;
            gsap.set(line, wide ? { width: last.offsetLeft, height: 2 } : { width: 2, height: last.offsetTop });
          };
          sizeLine();
          if (line) {
            gsap.fromTo(
              line,
              wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 },
              {
                scaleX: 1,
                scaleY: 1,
                ease: "none",
                scrollTrigger: { trigger: list, start: REVEAL_START, end: "bottom 55%", scrub: 0.6, onRefresh: sizeLine },
              },
            );
          }

          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: { trigger: list, start: REVEAL_START, once: true, onEnter: () => markRevealed(KEY) },
            },
          );

          const numbers = gsap.utils.toArray<HTMLElement>("[data-count]", list);
          numbers.forEach((el) => {
            const target = Number(el.dataset.count);
            const n = { v: STAT_FLOOR };
            el.textContent = String(STAT_FLOOR);
            gsap.to(n, {
              v: target,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(n.v));
              },
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          });
          return () => numbers.forEach((el) => (el.textContent = el.dataset.count ?? ""));
        },
      );
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="relative mt-10 grid gap-4 pl-6 md:grid-cols-3 md:pl-0">
      {/*
        Connector. Phones: down a left gutter through the dots. md+: across the step numbers.
        JS sizes it; it's left out with reduced motion.
      */}
      <span
        data-line
        aria-hidden="true"
        className="pointer-events-none absolute top-[34px] left-2 z-[1] hidden origin-top-left bg-accent/50 motion-safe:block md:left-[42px]"
      />
      {STEPS.map((s) => (
        <li key={s.n} className={`${cardClass} relative p-6`}>
          <span aria-hidden="true" className="absolute top-[30px] -left-[19px] size-2 rounded-full bg-accent md:hidden" />
          <span className="mono-label relative z-[2] inline-flex rounded-full border border-accent/40 bg-surface px-2 py-0.5 text-xs text-accent">
            {s.n}
          </span>
          <h3 className="display mt-4 text-3xl font-bold">{s.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          {s.n === "02" && <ScoutedStats />}
        </li>
      ))}
    </ol>
  );
}
