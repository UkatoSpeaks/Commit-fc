"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

interface FloatProps {
  children: ReactNode;
  /** Seconds into the loop to start at, so neighbours bob out of step. */
  offset?: number;
}

/** Gentle up-and-down bob. Static when the user prefers reduced motion. */
export function Float({ children, offset = 0 }: FloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(ref.current, { y: -10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 }).totalTime(offset);
    });
  });

  return <div ref={ref}>{children}</div>;
}
