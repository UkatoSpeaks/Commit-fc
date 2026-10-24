"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { REVEAL, type StageProps } from "../reveal-config";

/**
 * Lightweight background: conic light rays and a floodlight glow in CSS.
 * Used when WebGL is off, unavailable, too slow to load, or the device is low-end.
 * Reads the shared levels every frame, like the WebGL stage, but only touches the DOM
 * when a value changes: opacity is compositor-only, the color (a repaint) only moves at the burst.
 */
export function CssRays({ levels, color }: StageProps) {
  const root = useRef<HTMLDivElement>(null);
  const rays = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const raysEl = rays.current;
      const glowEl = glow.current;
      if (!el || !raysEl || !glowEl) return;
      const mix = gsap.utils.interpolate(REVEAL.floodColor, color);
      let rayA = "";
      let floodA = "";
      let tint = "";
      const tick = () => {
        const r = Math.min(1, levels.rays).toFixed(2);
        const f = Math.min(1, levels.flood).toFixed(2);
        const t = levels.tint.toFixed(2);
        if (r !== rayA) raysEl.style.opacity = rayA = r;
        if (f !== floodA) glowEl.style.opacity = floodA = f;
        if (t !== tint) el.style.setProperty("--flood-color", mix(Number((tint = t))));
      };
      tick();
      gsap.ticker.add(tick);
      gsap.to(raysEl, { rotation: 360, duration: 90, ease: "none", repeat: -1 });
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      return () => gsap.ticker.remove(tick);
    },
    { scope: root, dependencies: [levels, color] },
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none invisible absolute inset-0 overflow-hidden opacity-0">
      <div
        ref={rays}
        className="absolute top-1/2 left-1/2 -mt-150 -ml-150 size-300 will-change-transform"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--flood-color, #F5E6A8) 30%, transparent) 0deg 5deg, transparent 5deg 15deg)",
          maskImage: "radial-gradient(closest-side, black 15%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(closest-side, black 15%, transparent 72%)",
        }}
      />
      <div
        ref={glow}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side at 50% 42%, color-mix(in srgb, var(--flood-color, #F5E6A8) 40%, transparent), transparent 85%)",
        }}
      />
    </div>
  );
}
