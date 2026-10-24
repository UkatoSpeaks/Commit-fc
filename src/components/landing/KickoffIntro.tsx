"use client";

import { useRef, type ReactNode } from "react";
import { claimIntro, finishIntro } from "@/lib/motion/intro";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap-scroll";

/** Don't hold the intro for webfonts longer than this. */
const FONT_WAIT_MS = 400;

function fontsReady(): Promise<unknown> {
  const timeout = new Promise((resolve) => window.setTimeout(resolve, FONT_WAIT_MS));
  return Promise.race([document.fonts?.ready ?? Promise.resolve(), timeout]);
}

/**
 * Plays the hero text intro once per page load. Children mark parts with data-intro:
 * "eyebrow", "title" (the H1, with an optional [data-intro-accent] word) and "fade".
 * Those parts are hidden by CSS only while <html> has the js-motion class.
 */
export function KickoffIntro({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !claimIntro()) return;

      const eyebrow = el.querySelector("[data-intro=eyebrow]");
      const title = el.querySelector<HTMLElement>("[data-intro=title]");
      const fades = el.querySelectorAll("[data-intro=fade]");
      let split: SplitText | null = null;
      let cancelled = false;

      void fontsReady().then(() => {
        if (cancelled || !title) return;
        split = SplitText.create(title, { type: "lines", mask: "lines" });
        const accent = title.querySelector("[data-intro-accent]");

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            // Back to plain text so it reflows naturally on resize.
            split?.revert();
            finishIntro();
          },
        });
        tl.fromTo(eyebrow, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0)
          // The H1 itself shows at once (LCP), its lines rise from their masks.
          .set(title, { autoAlpha: 1 }, 0)
          .fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.08, ease: "power4.out" }, 0.1)
          // Let the accent word scale past the line mask.
          .set(split.masks, { overflow: "visible" }, 0.85);
        if (accent) {
          tl.fromTo(accent, { scale: 1.12 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)", transformOrigin: "0% 80%" }, 0.85);
        }
        tl.fromTo(fades, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.5);
      });

      // If the page is hidden mid-intro, useGSAP reverts the tweens and the class stays on
      // <html>, so the intro simply replays when the page is shown again.
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="max-w-xl">
      {children}
    </div>
  );
}
