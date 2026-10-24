"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";

export type MotionPermission = "unsupported" | "needed" | "granted" | "denied";

export interface Tilt {
  ref: RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Highlight position, 0–100 (%) */
  glareX: MotionValue<number>;
  glareY: MotionValue<number>;
  enabled: boolean;
  motionPermission: MotionPermission;
  requestMotion: () => void;
}

type PermissionedOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Card tilt. Mouse: follows the cursor anywhere on the page.
 * Phone: device orientation, or drag on the card if that isn't allowed.
 * Off when the user prefers reduced motion.
 */
export function useTilt(max = 12): Tilt {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const enabled = !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 140, damping: 18, mass: 0.6 });

  const rotateY = useTransform(sx, (v) => v * max);
  const rotateX = useTransform(sy, (v) => -v * max);
  const glareX = useTransform(sx, (v) => 50 + v * 50);
  const glareY = useTransform(sy, (v) => 50 + v * 50);

  const [motionPermission, setMotionPermission] = useState<MotionPermission>("unsupported");

  // Mouse / pen: track the pointer relative to the card's center.
  useEffect(() => {
    if (!enabled) return;
    function onMove(e: PointerEvent) {
      const el = ref.current;
      if (!el || e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      x.set(clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 120)));
      y.set(clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 120)));
    }
    function reset() {
      x.set(0);
      y.set(0);
    }
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [enabled, x, y]);

  // Touch drag on the card: fallback when device orientation is unavailable.
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || motionPermission === "granted") return;
    function onTouchMove(e: PointerEvent) {
      if (e.pointerType !== "touch" || !el) return;
      const r = el.getBoundingClientRect();
      x.set(clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      y.set(clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    }
    function onTouchEnd(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      x.set(0);
      y.set(0);
    }
    el.addEventListener("pointermove", onTouchMove);
    el.addEventListener("pointerup", onTouchEnd);
    el.addEventListener("pointercancel", onTouchEnd);
    return () => {
      el.removeEventListener("pointermove", onTouchMove);
      el.removeEventListener("pointerup", onTouchEnd);
      el.removeEventListener("pointercancel", onTouchEnd);
    };
  }, [enabled, motionPermission, x, y]);

  // Decide whether device orientation is available, and whether it needs a tap first (iOS).
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const DOE = window.DeviceOrientationEvent as PermissionedOrientation;
    // Syncing with a browser capability that's only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotionPermission(typeof DOE.requestPermission === "function" ? "needed" : "granted");
  }, [enabled]);

  useEffect(() => {
    if (!enabled || motionPermission !== "granted") return;
    let gotEvent = false;
    function onOrient(e: DeviceOrientationEvent) {
      if (e.gamma === null || e.beta === null) return;
      gotEvent = true;
      x.set(clamp(e.gamma / 25));
      y.set(clamp((e.beta - 45) / 25));
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
  }, [enabled, motionPermission, x, y]);

  const requestMotion = useCallback(() => {
    const DOE = window.DeviceOrientationEvent as PermissionedOrientation;
    if (typeof DOE.requestPermission !== "function") return;
    DOE.requestPermission()
      .then((state) => setMotionPermission(state === "granted" ? "granted" : "denied"))
      .catch(() => setMotionPermission("denied"));
  }, []);

  return { ref, rotateX, rotateY, glareX, glareY, enabled, motionPermission, requestMotion };
}
