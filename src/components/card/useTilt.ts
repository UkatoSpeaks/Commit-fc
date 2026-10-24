"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useFinePointer } from "@/lib/motion/pointer";
import { useReducedMotion } from "@/lib/motion/reduced-motion";

export type MotionPermission = "unsupported" | "needed" | "granted" | "denied";

export interface Tilt {
  /**
   * Put this on the card wrapper. The hook writes `--rx`/`--ry` (deg) and `--gx`/`--gy`
   * (glare position, %) onto it, and the card reads them in CSS.
   */
  ref: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  motionPermission: MotionPermission;
  requestMotion: () => void;
}

type PermissionedOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type QuickTo = (value: number) => void;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** Springy follow: back.out overshoots a little when the pointer stops. */
const FOLLOW = { duration: 0.7, ease: "back.out(1.6)" } as const;

export interface TiltOptions {
  /** Mouse only, and only while hovering the card. No touch or device orientation. */
  hoverOnly?: boolean;
}

/**
 * Card tilt. Mouse: follows the cursor anywhere on the page.
 * Phone: device orientation, or drag on the card if that isn't allowed.
 * With `hoverOnly`: tilts only while a mouse is over the card.
 * Off when the user prefers reduced motion.
 */
export function useTilt(max = 12, { hoverOnly = false }: TiltOptions = {}): Tilt {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const enabled = !reduced && (!hoverOnly || finePointer);
  const [motionPermission, setMotionPermission] = useState<MotionPermission>("unsupported");

  // Normalized tilt (-1..1) on each axis, eased by GSAP and written to CSS vars.
  const moveTo = useRef<{ x: QuickTo; y: QuickTo } | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!enabled || !el) return;
      const pos = { x: 0, y: 0 };
      const apply = () => {
        el.style.setProperty("--rx", `${(-pos.y * max).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(pos.x * max).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(50 + pos.x * 50).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(50 + pos.y * 50).toFixed(1)}%`);
      };
      moveTo.current = {
        x: gsap.quickTo(pos, "x", { ...FOLLOW, onUpdate: apply }),
        y: gsap.quickTo(pos, "y", { ...FOLLOW, onUpdate: apply }),
      };
      return () => {
        moveTo.current = null;
        for (const prop of ["--rx", "--ry", "--gx", "--gy"]) el.style.removeProperty(prop);
      };
    },
    { dependencies: [enabled, max] },
  );

  const set = useCallback((x: number, y: number) => {
    moveTo.current?.x(clamp(x));
    moveTo.current?.y(clamp(y));
  }, []);

  // Hover-only: track the mouse while it's over the card, spring back on leave.
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !hoverOnly || !el) return;
    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch" || !el) return;
      const r = el.getBoundingClientRect();
      set((e.clientX - (r.left + r.width / 2)) / (r.width / 2), (e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    }
    const reset = () => set(0, 0);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, [enabled, hoverOnly, set]);

  // Mouse / pen: track the pointer relative to the card's center.
  useEffect(() => {
    if (!enabled || hoverOnly) return;
    function onMove(e: PointerEvent) {
      const el = ref.current;
      if (!el || e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      set((e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 120), (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 120));
    }
    const reset = () => set(0, 0);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [enabled, hoverOnly, set]);

  // Touch drag on the card: fallback when device orientation is unavailable.
  useEffect(() => {
    const el = ref.current;
    if (!enabled || hoverOnly || !el || motionPermission === "granted") return;
    function onTouchMove(e: PointerEvent) {
      if (e.pointerType !== "touch" || !el) return;
      const r = el.getBoundingClientRect();
      set((e.clientX - (r.left + r.width / 2)) / (r.width / 2), (e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    }
    function onTouchEnd(e: PointerEvent) {
      if (e.pointerType === "touch") set(0, 0);
    }
    el.addEventListener("pointermove", onTouchMove);
    el.addEventListener("pointerup", onTouchEnd);
    el.addEventListener("pointercancel", onTouchEnd);
    return () => {
      el.removeEventListener("pointermove", onTouchMove);
      el.removeEventListener("pointerup", onTouchEnd);
      el.removeEventListener("pointercancel", onTouchEnd);
    };
  }, [enabled, hoverOnly, motionPermission, set]);

  // Decide whether device orientation is available, and whether it needs a tap first (iOS).
  useEffect(() => {
    if (!enabled || hoverOnly || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const DOE = window.DeviceOrientationEvent as PermissionedOrientation;
    // Syncing with a browser capability that's only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotionPermission(typeof DOE.requestPermission === "function" ? "needed" : "granted");
  }, [enabled, hoverOnly]);

  useEffect(() => {
    if (!enabled || motionPermission !== "granted") return;
    let gotEvent = false;
    function onOrient(e: DeviceOrientationEvent) {
      if (e.gamma === null || e.beta === null) return;
      gotEvent = true;
      set(e.gamma / 25, (e.beta - 45) / 25);
    }
    window.addEventListener("deviceorientation", onOrient);
    // Some browsers expose the API but never fire it (desktop emulation, no sensor).
    const timer = window.setTimeout(() => {
      if (!gotEvent) setMotionPermission("unsupported");
    }, 1500);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.clearTimeout(timer);
    };
  }, [enabled, motionPermission, set]);

  const requestMotion = useCallback(() => {
    const DOE = window.DeviceOrientationEvent as PermissionedOrientation;
    if (typeof DOE.requestPermission !== "function") return;
    DOE.requestPermission()
      .then((state) => setMotionPermission(state === "granted" ? "granted" : "denied"))
      .catch(() => setMotionPermission("denied"));
  }, []);

  return { ref, enabled, motionPermission, requestMotion };
}
