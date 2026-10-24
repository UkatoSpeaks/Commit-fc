"use client";

import { useLayoutEffect, useRef } from "react";
import { EXIT_LOADING_DELAY_MS, resetExit, useExitState } from "@/lib/motion/landing-exit";
import { gsap, useGSAP } from "@/lib/motion/gsap";

/**
 * Full-screen wipe for the "Get my card" exit. If navigation is slower than the wipe it
 * stays closed and shows a small loading label rather than revealing the landing again.
 */
export function TransitionWipe() {
  const root = useRef<HTMLDivElement>(null);
  const { leaving, username } = useExitState();

  // Reset when the landing is shown (first mount, Back via Activity) and when it's hidden.
  useLayoutEffect(() => {
    resetExit();
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) resetExit();
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      resetExit();
    };
  }, []);

  useGSAP(
    () => {
      if (!leaving) return;
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const reduce = Boolean(ctx.conditions?.reduce);
          const tl = gsap.timeline();
          if (reduce) tl.set(".wipe-panel", { scaleX: 1 });
          else tl.fromTo(".wipe-panel", { scaleX: 0 }, { scaleX: 1, duration: 0.34, ease: "power3.inOut" }, 0.12);
          tl.fromTo(".wipe-loading", { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.25 }, reduce ? 0 : EXIT_LOADING_DELAY_MS / 1000);
        },
      );
    },
    { scope: root, dependencies: [leaving], revertOnUpdate: true },
  );

  return (
    <div ref={root} aria-hidden={!leaving} className={`fixed inset-0 z-50 ${leaving ? "" : "pointer-events-none invisible"}`}>
      {/* Inline transform, not Tailwind's scale-x-0: that sets the CSS `scale` property, which GSAP's transform wouldn't override. */}
      <div className="wipe-panel absolute inset-0 origin-left bg-bg" style={{ transform: "scaleX(0)" }}>
        <span className="absolute inset-y-0 right-0 w-0.5 bg-accent/60" />
      </div>
      <div role="status" className="wipe-loading invisible absolute inset-0 flex items-center justify-center opacity-0">
        {leaving && (
          <p className="mono-label text-xs text-muted">
            Scouting <span className="text-accent">@{username}</span>
            <span aria-hidden="true">
              <span className="wipe-dot">.</span>
              <span className="wipe-dot [animation-delay:0.15s]">.</span>
              <span className="wipe-dot [animation-delay:0.3s]">.</span>
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
