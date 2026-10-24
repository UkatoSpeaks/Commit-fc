"use client";

import { useRef, type ButtonHTMLAttributes } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

/** Max pull toward the cursor, px. */
const PULL = 6;
const DESKTOP_MOTION = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * A button that leans toward the mouse and springs back on leave, with a light sweep on
 * hover. Plain button on touch screens and with reduced motion.
 */
export function MagneticButton({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_MOTION, () => {
      const spring = { duration: 0.5, ease: "back.out(3)" };
      const x = gsap.quickTo(el, "x", spring);
      const y = gsap.quickTo(el, "y", spring);
      function onMove(e: PointerEvent) {
        if (e.pointerType === "touch" || !el) return;
        const r = el.getBoundingClientRect();
        x(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * PULL);
        y(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * PULL);
      }
      function onLeave() {
        x(0);
        y(0);
      }
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });
  });

  return (
    <button ref={ref} className={`group relative overflow-hidden ${className}`} {...props}>
      <span aria-hidden="true" className="btn-sweep" />
      <span className="relative">{children}</span>
    </button>
  );
}
