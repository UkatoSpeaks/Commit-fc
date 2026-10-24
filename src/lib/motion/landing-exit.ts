"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared state for the landing "Get my card" exit: the form starts it, the sample
 * cards stack up and the wipe covers the screen. Reset whenever the landing is shown
 * again (Back, bfcache) so nothing is left mid-animation.
 */

/** Time from submit until router.push. The wipe is fully closed by then. */
export const EXIT_NAV_DELAY_MS = 480;
/** Show the loading label only if navigation takes longer than this after submit. */
export const EXIT_LOADING_DELAY_MS = 650;

export interface ExitState {
  leaving: boolean;
  username: string | null;
}

const IDLE: ExitState = { leaving: false, username: null };

let state: ExitState = IDLE;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function startExit(username: string): void {
  state = { leaving: true, username };
  emit();
}

export function resetExit(): void {
  if (!state.leaving) return;
  state = IDLE;
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useExitState(): ExitState {
  return useSyncExternalStore(subscribe, () => state, () => IDLE);
}
