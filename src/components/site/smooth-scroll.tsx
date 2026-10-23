"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { loaderStore } from "./loader-store";

/* ── Lenis smooth-scroll provider ──────────────────────────── */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Anchor links through lenis
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -90 });
      }
    };
    document.addEventListener("click", onClick);

    const unsubscribe = loaderStore.subscribe(() => {
      if (!loaderStore.get().done) lenis.stop();
      else lenis.start();
    });
    if (!loaderStore.get().done) lenis.stop();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      unsubscribe();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
