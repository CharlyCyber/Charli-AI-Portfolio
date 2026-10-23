"use client";

import { useSyncExternalStore } from "react";

/* ── Global loader state (tiny store, no React component here) ── */
function createLoaderStore() {
  let listeners: (() => void)[] = [];
  let state = { done: false, progress: 0 };
  return {
    get: () => state,
    set(patch: Partial<typeof state>) {
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.push(l);
      return () => {
        listeners = listeners.filter((x) => x !== l);
      };
    },
  };
}

export const loaderStore = createLoaderStore();

export function useLoaderState() {
  return useSyncExternalStore(
    loaderStore.subscribe,
    loaderStore.get,
    loaderStore.get
  );
}
