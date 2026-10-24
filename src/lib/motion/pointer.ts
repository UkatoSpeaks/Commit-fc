"use client";

import { useSyncExternalStore } from "react";

export const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True for a mouse or trackpad. False during SSR and hydration. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(FINE_POINTER_QUERY).matches, () => false);
}
