"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";

/** Tiny toast: `const { show, toast } = useToast()`, render `toast` once. */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState<string | null>(null);
  // Bumped on every show() so the same message twice still replays the enter animation.
  const [shown, setShown] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const el = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const show = useCallback(
    (text: string) => {
      window.clearTimeout(timer.current);
      setMessage(text);
      setShown((n) => n + 1);
      timer.current = window.setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Keep the last text on screen while the toast fades out.
  const [lastText, setLastText] = useState("");
  if (message !== null && message !== lastText) setLastText(message);

  useGSAP(
    () => {
      if (!el.current) return;
      const d = reduced ? 0 : 0.25;
      if (message !== null) gsap.fromTo(el.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: d, ease: "power2.out" });
      else gsap.to(el.current, { autoAlpha: 0, y: 12, duration: d, ease: "power2.in" });
    },
    { dependencies: [message, shown, reduced], revertOnUpdate: false },
  );

  const toast = (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <p role="status" aria-live="polite" className="sr-only">
        {message ?? ""}
      </p>
      <div
        ref={el}
        aria-hidden="true"
        className="mono-label invisible rounded-xl border border-line-strong bg-surface px-4 py-3 text-xs text-text opacity-0 shadow-2xl"
      >
        {lastText}
      </div>
    </div>
  );

  return { show, toast };
}
