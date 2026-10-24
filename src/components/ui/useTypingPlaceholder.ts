"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { nextTyping, TYPING_START, typingText, type TypingState } from "@/lib/motion/typing";

export const SAMPLE_USERNAMES = ["torvalds", "karpathy", "shadcn", "antirez", "sindresorhus"] as const;

/** Wait for the kick-off intro before typing starts. */
const START_DELAY_MS = 1600;

/**
 * Types and deletes sample usernames on a loop. Returns null when inactive, so the input
 * falls back to its static placeholder (also what screen readers get on focus).
 */
export function useTypingPlaceholder(active: boolean, words: readonly string[] = SAMPLE_USERNAMES): string | null {
  const reduced = useReducedMotion();
  const running = active && !reduced;
  const [state, setState] = useState<TypingState>(TYPING_START);

  useEffect(() => {
    if (!running) return;
    let current = state;
    let timer = 0;
    const tick = () => {
      const next = nextTyping(current, words);
      timer = window.setTimeout(() => {
        current = next.state;
        setState(current);
        tick();
      }, next.delay);
    };
    // First run waits for the intro; resuming after a pause starts straight away.
    timer = window.setTimeout(tick, current === TYPING_START ? START_DELAY_MS : 0);
    return () => window.clearTimeout(timer);
    // `state` is only the resume point; re-running on every keystroke would restart timers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, words]);

  // Keep the static placeholder until the first letter is typed.
  return running && state !== TYPING_START ? typingText(state, words) : null;
}
