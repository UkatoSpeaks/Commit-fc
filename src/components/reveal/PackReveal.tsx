"use client";

import { useEffect, useRef, useState } from "react";
import { ClubBadge } from "@/components/card/ClubBadge";
import { Flag } from "@/components/card/Flag";
import { PlayerCard } from "@/components/card/PlayerCard";
import { ShieldMark } from "@/components/ui/Logo";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import type { CardData } from "@/lib/ui/card-data";
import { CARD_CLIP } from "@/lib/ui/tiers";
import { CONFETTI_COLORS, INITIAL_LEVELS, REVEAL, type StageLevels } from "./reveal-config";
import { SealedPack } from "./SealedPack";
import { RevealStage } from "./stage/RevealStage";

// Jagged tear down the middle of the pack. Points past 0–100% keep the outer glow unclipped.
const TEAR: ReadonlyArray<readonly [number, number]> = [
  [50, 0], [46, 10], [54, 21], [47, 33], [53, 45], [45, 57], [54, 69], [47, 81], [53, 91], [49, 100],
];
const pts = (list: ReadonlyArray<readonly [number, number]>) => list.map(([x, y]) => `${x}% ${y}%`).join(", ");
const LEFT_CLIP = `polygon(-60% -60%, 50% -60%, ${pts(TEAR)}, 49% 160%, -60% 160%)`;
const RIGHT_CLIP = `polygon(50% -60%, 160% -60%, 160% 160%, 49% 160%, ${pts([...TEAR].reverse())})`;

// Fixed sparkle positions around the card's edges (deterministic, no hydration surprises).
const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  left: 50 + Math.cos(i * 2.4) * (42 + (i % 4) * 6),
  top: 50 + Math.sin(i * 2.4) * (40 + (i % 3) * 7),
  size: 3 + (i % 3) * 2,
}));

const SPARKLE_COLORS = {
  bronze: ["#FFE1C7", "#C68A5C"],
  silver: ["#FFFFFF", "#D9DEE3"],
  gold: ["#FFF3C4", "#F6DA7E"],
  special: ["#E9E2FF", "#9A7BFF"],
} as const;

/** Every reveal layer starts like this in CSS, so nothing flashes before the timeline runs. */
const HIDDEN = "invisible opacity-0";

interface PackRevealProps {
  data: CardData;
  onDone: () => void;
}

interface Controls {
  open: () => void;
  skip: () => void;
}

function CardBack() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center"
      style={{
        clipPath: CARD_CLIP,
        background: "radial-gradient(circle at 50% 40%, rgba(61,220,132,0.25), transparent 60%), linear-gradient(155deg,#13241a,#07110c)",
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <ShieldMark size={84} />
    </div>
  );
}

export function PackReveal({ data, onDone }: PackRevealProps) {
  const cfg = REVEAL.tiers[data.tier];
  const country = data.country?.name ?? "Nation unknown";
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<Controls | null>(null);
  // Tweened by the timeline, read every frame by the background stage.
  const [levels] = useState<StageLevels>(() => ({ ...INITIAL_LEVELS }));

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const $ = (name: string) => q(`[data-reveal="${name}"]`);
      const letters = $("letter");
      const sparkles = $("sparkle").slice(0, cfg.sparkles);

      let finished = false;
      let skipping = false;
      let disposed = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        onDoneRef.current();
      };

      // Starting states, applied before first paint (useGSAP runs as a layout effect).
      gsap.set(letters, { autoAlpha: 0 });
      gsap.set($("pack-glow"), { autoAlpha: 0.5, scale: 0.95 });

      const fireConfetti = () => {
        if (skipping) return;
        void import("canvas-confetti").then(({ default: confetti }) => {
          if (disposed) return;
          void confetti({
            particleCount: 140,
            spread: 90,
            startVelocity: 42,
            origin: { y: 0.55 },
            colors: CONFETTI_COLORS,
            disableForReducedMotion: true,
          });
        });
      };

      // ── Idle: sealed pack fades in, glows and shakes until opened ──────────
      const intro = gsap.fromTo(
        $("pack"),
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
      );
      const pulse = gsap.to($("pack-glow"), { autoAlpha: 1, scale: 1.12, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });
      const s = cfg.shake;
      const shake = gsap.timeline({ repeat: -1, repeatDelay: 1.1, delay: 0.8 }).to($("pack-body"), {
        keyframes: { rotation: [0, s, -s, s * 0.6, -s * 0.4, 0], x: [0, -2, 2, -1, 1, 0] },
        duration: 0.45,
        ease: "none",
      });

      // ── Master timeline ───────────────────────────────────────────────────
      const tl = gsap.timeline({ paused: true, onComplete: finish });
      const show = (target: gsap.TweenTarget, at: number) => tl.set(target, { autoAlpha: 1, attr: { "aria-hidden": "false" } }, at);
      const hide = (target: gsap.TweenTarget, at: number, duration: number, vars: gsap.TweenVars = {}) =>
        tl
          .to(target, { autoAlpha: 0, duration, ease: "power1.in", ...vars }, at)
          .set(target, { attr: { "aria-hidden": "true" } }, at + duration);

      let at = 0;

      // pack: tears open, light leaks through the seam
      const crack = cfg.pack * 0.35;
      const split = cfg.pack - crack;
      tl.addLabel("pack", at)
        .to($("pack-body"), { rotation: 0, x: 0, scale: 1.05, duration: crack, ease: "power2.in" }, at)
        .fromTo($("seam"), { autoAlpha: 0, scaleY: 0.2 }, { autoAlpha: 1, scaleY: 1, duration: crack, ease: "power2.in" }, at)
        .to($("pack-glow"), { autoAlpha: 1, scale: 1.5, duration: crack }, at)
        .to($("half-l"), { xPercent: -45, rotation: -12, autoAlpha: 0, duration: split, ease: "power2.in" }, at + crack)
        .to($("half-r"), { xPercent: 45, rotation: 12, autoAlpha: 0, duration: split, ease: "power2.in" }, at + crack)
        // Light keeps pouring through the gap, then fades as the halves clear.
        .to($("seam"), { scaleX: 10, duration: split, ease: "power2.out" }, at + crack)
        .to($("seam"), { autoAlpha: 0, duration: split * 0.5, ease: "power1.in" }, at + crack + split * 0.5)
        .to($("pack-glow"), { autoAlpha: 0, scale: 2.2, duration: split }, at + crack)
        .to(levels, { rays: 0.45, flood: 0.6, duration: cfg.pack, ease: "power1.out" }, at);
      at += cfg.pack;
      hide($("pack"), at, 0.01);

      // nation: flag drops in with a bounce, country name types in
      tl.addLabel("nation", at);
      show($("nation"), at);
      tl.fromTo(
        $("flag"),
        { y: -240, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: Math.min(0.75, cfg.nation * 0.75), ease: "bounce.out" },
        at,
      );
      if (letters.length > 0) {
        const typing = cfg.nation * 0.4;
        tl.to(letters, { autoAlpha: 1, duration: 0.01, stagger: typing / letters.length }, at + Math.min(0.35, cfg.nation * 0.35));
      }
      at += cfg.nation;
      hide($("nation"), at - 0.2, 0.2, { y: -20 });

      // position: code slams in with a little overshoot
      tl.addLabel("position", at);
      show($("position"), at);
      tl.fromTo($("code"), { scale: 1.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2.5)" }, at)
        .to(levels, { flood: 0.9, duration: 0.12, yoyo: true, repeat: 1 }, at + 0.1);
      at += cfg.position;

      // club: badge and repo name slide up
      tl.addLabel("club", at).fromTo(
        $("club"),
        { y: 36, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: Math.min(0.4, cfg.club * 0.8), ease: "power3.out" },
        at,
      );
      at += cfg.club;
      hide($("position"), at - 0.18, 0.18, { scale: 0.92 });

      // burst: flash in the tier color, floodlights shift to the tier color
      tl.addLabel("burst", at)
        .fromTo($("flash"), { autoAlpha: 0 }, { autoAlpha: cfg.flash, duration: cfg.burst * 0.4, ease: "power2.out" }, at)
        .to($("flash"), { autoAlpha: 0, duration: cfg.burst * 0.6 + 0.35, ease: "power2.in" }, at + cfg.burst * 0.4)
        .fromTo($("ring"), { scale: 0.2, autoAlpha: 0.9 }, { scale: cfg.ring, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, at)
        .to(levels, { tint: 1, flood: 1.4, rays: cfg.rays, dust: 1, duration: cfg.burst, ease: "power2.out" }, at)
        .to(levels, { flood: 1, duration: 0.8, ease: "power2.out" }, at + cfg.burst);
      show($("card"), at);
      at += cfg.burst;

      // card: flips 180° into place with a small camera-style zoom, then settles
      tl.addLabel("card", at)
        .fromTo($("card"), { scale: 1.18 }, { scale: 1, duration: cfg.card, ease: "power3.out" }, at)
        .fromTo($("flipper"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, at)
        .fromTo($("flipper"), { rotationY: 180, scale: 0.7 }, { rotationY: 0, scale: 1, duration: cfg.card * 0.85, ease: "power3.out" }, at)
        .fromTo($("card-glow"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: cfg.card * 0.7 }, at);
      if (sparkles.length > 0) {
        tl.fromTo(
          sparkles,
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1.4,
            autoAlpha: 1,
            duration: 0.3,
            ease: "power2.out",
            stagger: { each: (cfg.card * 0.6) / sparkles.length, from: "random", yoyo: true, repeat: 1 },
          },
          at + 0.15,
        );
      }
      if (cfg.confetti) tl.call(fireConfetti, undefined, at + cfg.card * 0.35);
      at += cfg.card;

      // hold on the finished card
      tl.to({}, { duration: cfg.hold }, at);

      // ── Controls ──────────────────────────────────────────────────────────
      let opened = false;
      const autoOpen = gsap.delayedCall(REVEAL.autoOpen, () => controls.current?.open());
      const stopIdle = () => {
        opened = true;
        autoOpen.kill();
        pulse.kill();
        shake.kill();
        intro.progress(1);
      };
      controls.current = {
        open: () => {
          if (opened) return;
          stopIdle();
          tl.play();
        },
        skip: () => {
          skipping = true;
          stopIdle();
          tl.progress(1);
          finish();
        },
      };

      return () => {
        disposed = true;
        controls.current = null;
      };
    },
    { scope: root },
  );

  const [sparkleCore, sparkleGlow] = SPARKLE_COLORS[data.tier];

  return (
    <div ref={root} className="fixed inset-0 z-40 overflow-hidden bg-bg">
      {/* First in the tab order and never hidden. */}
      <button
        type="button"
        onClick={() => controls.current?.skip()}
        className="mono-label absolute top-4 right-4 z-30 min-h-11 rounded-xl border border-line-strong bg-bg/60 px-4 text-xs text-muted hover:text-text"
      >
        Skip
      </button>

      <RevealStage levels={levels} color={cfg.color} />

      <div
        data-reveal="flash"
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 ${HIDDEN}`}
        style={{ background: `radial-gradient(circle at 50% 45%, #FFFFFF 0%, ${cfg.color} 45%, ${cfg.color} 100%)` }}
      />

      <div className="relative z-10 grid h-full place-items-center px-4">
        {/* pack */}
        <div data-reveal="pack" className={`relative [grid-area:1/1] ${HIDDEN}`}>
          <div
            data-reveal="pack-glow"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -mt-55 -ml-55 size-110 rounded-full opacity-0"
            style={{ background: "radial-gradient(closest-side, rgba(61,220,132,0.45), transparent)" }}
          />
          <button
            type="button"
            onClick={() => controls.current?.open()}
            aria-label="Open your pack"
            className="relative block rounded-[28px]"
          >
            <span data-reveal="pack-body" className="relative block h-85 w-[230px]">
              <span data-reveal="half-l" className="absolute inset-0 block" style={{ clipPath: LEFT_CLIP }}>
                <SealedPack caption="Tap to open" />
              </span>
              <span data-reveal="half-r" aria-hidden="true" className="absolute inset-0 block" style={{ clipPath: RIGHT_CLIP }}>
                <SealedPack caption="Tap to open" />
              </span>
              <span
                data-reveal="seam"
                aria-hidden="true"
                className="absolute top-[-10%] left-1/2 -ml-0.75 block h-[120%] w-1.5 rounded-full opacity-0"
                style={{
                  background: "linear-gradient(transparent, #FFFBE6 20%, #FFFFFF 50%, #FFFBE6 80%, transparent)",
                  boxShadow: "0 0 30px 10px rgba(255,248,220,0.8)",
                }}
              />
            </span>
          </button>
        </div>

        {/* nation */}
        <div data-reveal="nation" aria-hidden="true" className={`flex flex-col items-center gap-6 [grid-area:1/1] ${HIDDEN}`}>
          <div data-reveal="flag">
            <Flag country={data.country} width={170} height={110} radius={10} />
          </div>
          {/* Read as one word, not letter by letter. */}
          <h2 aria-label={country} className="display max-w-[90vw] text-center text-5xl font-extrabold">
            {Array.from(country, (ch, i) => (
              <span key={i} data-reveal="letter" aria-hidden="true">
                {ch}
              </span>
            ))}
          </h2>
        </div>

        {/* position + club */}
        <div data-reveal="position" aria-hidden="true" className={`flex flex-col items-center gap-6 [grid-area:1/1] ${HIDDEN}`}>
          <p data-reveal="code" className="display text-[160px] font-extrabold text-accent">
            {data.pitch}
          </p>
          <div data-reveal="club" className="flex items-center gap-3 text-text">
            <ClubBadge club={data.club} size={44} />
            <span className="display text-3xl font-bold">{data.club ?? "Free agent"}</span>
          </div>
        </div>

        {/* card */}
        <div data-reveal="card" aria-hidden="true" className={`relative flex items-center justify-center [grid-area:1/1] ${HIDDEN}`}>
          <div
            data-reveal="ring"
            aria-hidden="true"
            className="pointer-events-none absolute size-130 rounded-full opacity-0"
            style={{ border: `3px solid ${cfg.color}`, boxShadow: `0 0 60px ${cfg.color}, inset 0 0 60px ${cfg.color}` }}
          />
          <div
            data-reveal="card-glow"
            aria-hidden="true"
            className="pointer-events-none absolute size-115 rounded-full opacity-0"
            style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${cfg.color} 55%, transparent), transparent)` }}
          />
          <div style={{ perspective: 1200 }}>
            <div data-reveal="flipper" className="relative" style={{ transformStyle: "preserve-3d" }}>
              <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                <PlayerCard data={data} priority />
              </div>
              <CardBack />
            </div>
          </div>
          {/* Sparkles sit above the card so they glint over its edges. */}
          {SPARKLES.slice(0, cfg.sparkles).map((s, i) => (
            <span
              key={i}
              data-reveal="sparkle"
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full opacity-0"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                background: sparkleCore,
                boxShadow: `0 0 10px ${sparkleGlow}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
