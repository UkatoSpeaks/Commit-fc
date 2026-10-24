"use client";

import { useEffect, useRef } from "react";
import { PlayerCard } from "@/components/card/PlayerCard";
import { useTilt } from "@/components/card/useTilt";
import { claimIntro } from "@/lib/motion/intro";
import { useExitState } from "@/lib/motion/landing-exit";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import type { CardData } from "@/lib/ui/card-data";
import { SAMPLE_CARDS } from "@/lib/ui/samples";
import { Float } from "./Float";

interface CardSlot {
  data: CardData;
  /** Fanned resting pose (static CSS, so it renders without JS) */
  pose?: string;
  /** Offsets that undo the pose, so all three sit in one stack */
  stack: { xPercent: number; rotation: number; scale: number };
  /** Parallax travel in px */
  depth: number;
  floatOffset: number;
  front?: boolean;
}

// Back to front: silver left, gold right, special in front.
const SLOTS: CardSlot[] = [
  {
    data: SAMPLE_CARDS.silver,
    pose: "translateX(-46%) rotate(-11deg) scale(0.84)",
    stack: { xPercent: 55, rotation: 7, scale: 1.19 },
    depth: 6,
    floatOffset: 2,
  },
  {
    data: SAMPLE_CARDS.gold,
    pose: "translateX(46%) rotate(10deg) scale(0.84)",
    stack: { xPercent: -55, rotation: -7, scale: 1.19 },
    depth: 6,
    floatOffset: 4,
  },
  { data: SAMPLE_CARDS.special, stack: { xPercent: 0, rotation: 0, scale: 1 }, depth: 10, floatOffset: 0, front: true },
];

const FANNED = { xPercent: 0, rotation: 0, scale: 1 } as const;
const DESKTOP_MOTION = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Tilts and moves its shine while a mouse hovers it. Static on touch screens. */
function HoverCard({ data }: { data: CardData }) {
  const tilt = useTilt(10, { hoverOnly: true });
  return <PlayerCard data={data} tilt={tilt} />;
}

/** Three fanned, gently floating sample cards over a floodlit pitch. */
export function SampleCards() {
  const root = useRef<HTMLDivElement>(null);
  const deals = useRef<(HTMLDivElement | null)[]>([]);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const glow = useRef<HTMLDivElement>(null);
  const pitch = useRef<SVGSVGElement>(null);
  const stackTl = useRef<gsap.core.Timeline | null>(null);
  const { leaving } = useExitState();

  useGSAP(
    () => {
      const cards = deals.current.filter((d): d is HTMLDivElement => d !== null);

      // Kick-off: the stack appears, then the cards are dealt into the fan.
      if (claimIntro()) {
        const tl = gsap.timeline();
        cards.forEach((card, i) => {
          tl.fromTo(card, { ...SLOTS[i]!.stack, autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.2);
          tl.to(card, { ...FANNED, duration: 0.8, ease: "back.out(1.7)" }, 0.5 + i * 0.06);
        });
        tl.fromTo(glow.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.1);
        tl.set(pitch.current, { autoAlpha: 1 }, 0.2).fromTo(
          pitch.current?.querySelector("ellipse") ?? null,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" },
          0.2,
        );
      }

      // Exit: shuffle back into one stack. Played by the effect below.
      stackTl.current = gsap
        .timeline({ paused: true })
        .to(cards, {
          xPercent: (i: number) => SLOTS[i]!.stack.xPercent,
          rotation: (i: number) => SLOTS[i]!.stack.rotation,
          scale: (i: number) => SLOTS[i]!.stack.scale,
          duration: 0.32,
          ease: "power3.in",
        });

      // Desktop: cursor parallax and a floodlight that drifts after the pointer.
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const movers = layers.current.map((el) =>
          el ? { x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" }) } : null,
        );
        const glowX = gsap.quickTo(glow.current, "x", { duration: 1.6, ease: "power2" });
        const glowY = gsap.quickTo(glow.current, "y", { duration: 1.6, ease: "power2" });
        function onMove(e: PointerEvent) {
          if (e.pointerType === "touch") return;
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          movers.forEach((m, i) => {
            m?.x(nx * SLOTS[i]!.depth);
            m?.y(ny * SLOTS[i]!.depth);
          });
          glowX(nx * 60);
          glowY(ny * 30);
        }
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });

      return () => {
        stackTl.current = null;
      };
    },
    { scope: root },
  );

  useEffect(() => {
    const tl = stackTl.current;
    if (!tl) return;
    if (leaving) tl.restart();
    else tl.pause(0);
  }, [leaving]);

  return (
    <div
      ref={root}
      className="relative mx-auto flex h-[400px] w-full max-w-[560px] items-center justify-center overflow-x-clip sm:h-[540px]"
      aria-label="Sample player cards"
      role="group"
    >
      {/* Floodlight glow */}
      <div
        ref={glow}
        data-intro
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side at 50% 45%, rgba(61,220,132,0.22), transparent 75%), radial-gradient(closest-side at 50% 10%, rgba(245,230,168,0.10), transparent 70%)",
        }}
      />
      {/* Pitch ellipse, drawn in by the intro */}
      <svg
        ref={pitch}
        data-intro
        aria-hidden="true"
        viewBox="0 0 500 96"
        preserveAspectRatio="none"
        className="absolute bottom-4 left-1/2 h-24 w-[90%] -translate-x-1/2 overflow-visible"
      >
        <ellipse cx={250} cy={48} rx={249.5} ry={47.5} fill="none" stroke="rgba(61,220,132,0.25)" strokeWidth={1} pathLength={1} strokeDasharray={1} />
      </svg>

      <div className="relative h-[440px] w-[300px] shrink-0 scale-[0.68] sm:scale-90 lg:scale-100">
        {SLOTS.map((slot, i) => (
          <div
            key={slot.data.tier}
            className="absolute inset-0"
            style={{ transform: slot.pose, filter: slot.front ? "drop-shadow(0 40px 50px rgba(0,0,0,0.65))" : undefined }}
          >
            <div
              data-intro
              ref={(el) => {
                deals.current[i] = el;
              }}
            >
              <div
                ref={(el) => {
                  layers.current[i] = el;
                }}
              >
                <Float offset={slot.floatOffset}>
                  <HoverCard data={slot.data} />
                </Float>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
