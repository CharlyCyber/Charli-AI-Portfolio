"use client";

import { useSyncExternalStore } from "react";

/* ── Estado global del banner de cookies (mini store, mismo patrón
   que loader-store): quién deba apartarse cuando el banner está en
   pantalla (p. ej. el botón flotante «Descargar código») se suscribe
   aquí en vez de adivinar alturas por breakpoint. `height` es la
   altura real de la tarjeta medida en runtime (ResizeObserver) — el
   banner apila texto+botones en móvil y los pone en fila en ≥sm, así
   que la altura cambia con el ancho del viewport. */
function createCookieStore() {
  let listeners: (() => void)[] = [];
  let state = { visible: false, height: 0 };
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

export const cookieStore = createCookieStore();

export function useCookieState() {
  return useSyncExternalStore(
    cookieStore.subscribe,
    cookieStore.get,
    cookieStore.get
  );
}
