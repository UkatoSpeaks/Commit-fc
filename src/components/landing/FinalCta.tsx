"use client";

import { useRef } from "react";
import { UsernameForm } from "@/components/ui/UsernameForm";
import { gsap, hasRevealed, markRevealed, REVEAL_START, useGSAP } from "@/lib/motion/gsap-scroll";

const KEY = "final-cta";

/** Closing call to action before the footer. */
export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (hasRevealed(KEY)) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true, onEnter: () => markRevealed(KEY) },
          })
          .fromTo("[data-glow]", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.2 }, 0)
          .fromTo("[data-rise]", { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.1);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="final-cta-title" className="relative overflow-clip px-4 py-24 sm:px-6 sm:py-32">
      <div
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side at 50% 55%, rgba(61,220,132,0.18), transparent 70%), radial-gradient(closest-side at 50% 0%, rgba(245,230,168,0.08), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <p data-rise className="mono-label text-xs text-accent">
          Full time is a long way off
        </p>
        <h2 data-rise id="final-cta-title" className="display mt-4 text-6xl font-extrabold sm:text-8xl">
          Ready for your <span className="text-accent">walkout?</span>
        </h2>
        <div data-rise className="mt-10 w-full max-w-lg text-left">
          <UsernameForm variant="hero" exitTransition />
        </div>
      </div>
    </section>
  );
}
