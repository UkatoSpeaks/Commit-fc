import { prefersReducedMotion } from "./reduced-motion";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Low-end: 4 or fewer cores, or 4 GB or less of memory (Chrome only reports memory). */
export function isLowEndDevice(nav: NavigatorWithMemory): boolean {
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  return false;
}

/**
 * Whether the reveal may load the Three.js stage. False means the CSS rays are used
 * and Three.js is never downloaded.
 *
 * For testing, `?stage=css` forces the CSS rays and `?stage=webgl` skips the device check.
 */
export function canUseWebGLStage(): boolean {
  if (typeof window === "undefined" || prefersReducedMotion()) return false;
  const override = new URLSearchParams(window.location.search).get("stage");
  if (override === "css") return false;
  if (override !== "webgl" && isLowEndDevice(navigator)) return false;
  return hasWebGL();
}
