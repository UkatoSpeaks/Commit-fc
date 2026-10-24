/**
 * Kick-off intro handshake with the inline script in the root layout.
 *
 * The script adds `js-motion` to <html> (landing page only, motion allowed) so CSS can
 * hide intro elements before first paint. It also arms a failsafe that removes the class
 * after INTRO_FAILSAFE_MS in case the intro never starts (JS error, slow chunk).
 */

export const INTRO_CLASS = "js-motion";
export const INTRO_FAILSAFE_MS = 2500;

declare global {
  interface Window {
    __introFailsafe?: number;
  }
}

/** Inline <head> script. Plain ES5 so it runs before any bundle. */
export const INTRO_SCRIPT = `(function(){try{if(location.pathname!=="/"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.classList.add("${INTRO_CLASS}");window.__introFailsafe=setTimeout(function(){d.classList.remove("${INTRO_CLASS}")},${INTRO_FAILSAFE_MS})}catch(e){}})();`;

/**
 * Call when an intro is about to start. True if it should run: the class is still on
 * <html> (failsafe hasn't fired, intro hasn't already played). Cancels the failsafe.
 */
export function claimIntro(): boolean {
  if (typeof document === "undefined") return false;
  if (!document.documentElement.classList.contains(INTRO_CLASS)) return false;
  window.clearTimeout(window.__introFailsafe);
  return true;
}

/** Intro done (or abandoned): stop hiding intro elements for good. */
export function finishIntro(): void {
  if (typeof document === "undefined") return;
  window.clearTimeout(window.__introFailsafe);
  document.documentElement.classList.remove(INTRO_CLASS);
}
