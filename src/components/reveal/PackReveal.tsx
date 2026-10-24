"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ClubBadge } from "@/components/card/ClubBadge";
import { Flag } from "@/components/card/Flag";
import { PlayerCard } from "@/components/card/PlayerCard";
import type { Tier } from "@/lib/stats";
import type { CardData } from "@/lib/ui/card-data";
import { SealedPack } from "./SealedPack";

type Phase = "sealed" | "nation" | "position" | "walkout";

/** ms per phase after the pack opens. Bronze is short and calm. */
const TIMINGS: Record<Tier, { nation: number; position: number; walkout: number }> = {
  bronze: { nation: 700, position: 700, walkout: 1100 },
  silver: { nation: 900, position: 900, walkout: 1300 },
  gold: { nation: 1000, position: 1000, walkout: 1600 },
  special: { nation: 1000, position: 1000, walkout: 2000 },
};

const RAY_STRENGTH: Record<Tier, number> = { bronze: 0.25, silver: 0.4, gold: 0.6, special: 0.95 };
const TIER_GLOW: Record<Tier, string> = {
  bronze: "rgba(198,138,92,0.45)",
  silver: "rgba(217,222,227,0.45)",
  gold: "rgba(246,218,126,0.55)",
  special: "rgba(154,123,255,0.7)",
};

const AUTO_OPEN_MS = 2000;

// Fixed sparkle positions (deterministic, no hydration surprises).
const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
  left: 50 + Math.cos(i * 2.4) * (28 + (i % 4) * 6),
  top: 50 + Math.sin(i * 2.4) * (30 + (i % 3) * 7),
  delay: (i % 6) * 0.12,
  size: 3 + (i % 3) * 2,
}));

interface PackRevealProps {
  data: CardData;
  onDone: () => void;
}

export function PackReveal({ data, onDone }: PackRevealProps) {
  const [phase, setPhase] = useState<Phase>("sealed");
  const t = TIMINGS[data.tier];

  const open = useCallback(() => setPhase((p) => (p === "sealed" ? "nation" : p)), []);

  // Auto-open, then step through the phases.
  useEffect(() => {
    const next: Record<Phase, [Phase | "done", number]> = {
      sealed: ["nation", AUTO_OPEN_MS],
      nation: ["position", t.nation],
      position: ["walkout", t.position],
      walkout: ["done", t.walkout],
    };
    const [to, ms] = next[phase];
    const timer = window.setTimeout(() => (to === "done" ? onDone() : setPhase(to)), ms);
    return () => window.clearTimeout(timer);
  }, [phase, t, onDone]);

  // Special: brief confetti as the card lands.
  useEffect(() => {
    if (phase !== "walkout" || data.tier !== "special") return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void import("canvas-confetti").then(({ default: confetti }) => {
        if (cancelled) return;
        void confetti({
          particleCount: 140,
          spread: 90,
          startVelocity: 42,
          origin: { y: 0.55 },
          colors: ["#9A7BFF", "#3DDC84", "#F5E6A8", "#FF6FD8", "#5BE9FF"],
          disableForReducedMotion: true,
        });
      });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase, data.tier]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-bg" aria-live="polite">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(closest-side at 50% 40%, rgba(245,230,168,0.08), transparent 80%)" }}
      />

      <button
        type="button"
        onClick={onDone}
        className="mono-label absolute top-4 right-4 z-10 min-h-11 rounded-xl border border-line-strong px-4 text-xs text-muted hover:text-text"
      >
        Skip
      </button>

      <AnimatePresence mode="wait">
        {phase === "sealed" && (
          <motion.button
            key="sealed"
            type="button"
            onClick={open}
            aria-label="Open your pack"
            className="rounded-[28px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: [1, 1.03, 1], transition: { scale: { repeat: Infinity, duration: 1.6 } } }}
            exit={{ opacity: 0, scale: 1.25, filter: "brightness(2)", transition: { duration: 0.35 } }}
          >
            <SealedPack caption="Tap to open" />
          </motion.button>
        )}

        {phase === "nation" && (
          <motion.div
            key="nation"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          >
            <motion.div initial={{ y: -160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}>
              <Flag country={data.country} width={170} height={110} radius={10} />
            </motion.div>
            <motion.p
              className="display text-5xl font-extrabold"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {data.country?.name ?? "Nation unknown"}
            </motion.p>
          </motion.div>
        )}

        {phase === "position" && (
          <motion.div
            key="position"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          >
            <motion.p
              className="display text-[160px] font-extrabold text-accent"
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {data.pitch}
            </motion.p>
            <motion.div
              className="flex items-center gap-3 text-text"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: t.position / 2500 }}
            >
              <ClubBadge club={data.club} size={44} />
              <span className="display text-3xl font-bold">{data.club ?? "Free agent"}</span>
            </motion.div>
          </motion.div>
        )}

        {phase === "walkout" && (
          <motion.div key="walkout" className="relative flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Light rays */}
            <motion.div
              aria-hidden="true"
              className="absolute size-[900px]"
              style={{
                background: `repeating-conic-gradient(from 0deg, rgba(245,230,168,${RAY_STRENGTH[data.tier] * 0.35}) 0deg 5deg, transparent 5deg 15deg)`,
                maskImage: "radial-gradient(closest-side, black 20%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(closest-side, black 20%, transparent 75%)",
              }}
              initial={{ scale: 0.2, opacity: 0, rotate: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: 40 }}
              transition={{ duration: t.walkout / 1000, ease: "easeOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute size-[460px] rounded-full"
              style={{ background: `radial-gradient(closest-side, ${TIER_GLOW[data.tier]}, transparent)` }}
              initial={{ scale: 0 }}
              animate={{ scale: data.tier === "special" ? [0, 1.6, 1.1] : 1 }}
              transition={{ duration: 0.7 }}
            />

            {(data.tier === "gold" || data.tier === "special") &&
              SPARKLES.map((s, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    left: `${s.left}%`,
                    top: `${s.top}%`,
                    width: s.size,
                    height: s.size,
                    background: data.tier === "gold" ? "#FFF3C4" : "#E9E2FF",
                    boxShadow: "0 0 10px currentColor",
                    color: data.tier === "gold" ? "#F6DA7E" : "#9A7BFF",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0] }}
                  transition={{ duration: 1.1, delay: 0.3 + s.delay, repeat: 1 }}
                />
              ))}

            <motion.div
              style={{ transformPerspective: 1200 }}
              initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <PlayerCard data={data} priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
