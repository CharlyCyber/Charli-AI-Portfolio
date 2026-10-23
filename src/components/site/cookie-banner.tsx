"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT, Magnetic } from "./anim";
import { SpecialText } from "@/components/ui/special-text";
import { useLoaderState } from "./loader-store";
import { cookieStore } from "./cookie-store";

export function CookieBanner() {
  const { done } = useLoaderState();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("charli-cookies");
    if (stored === null) {
      // defer to avoid synchronous setState inside the effect body
      const t = setTimeout(() => setDismissed(false), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!done || dismissed) return;
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, [done, dismissed]);

  /* Publicación de estado al cookie-store (Fix-7): el botón flotante
     «Descargar código» se suscribe y se eleva sobre el banner cuando
     `visible` está a true. */
  useEffect(() => {
    cookieStore.set({ visible: visible && !dismissed });
  }, [visible, dismissed]);

  /* La altura se MIDE en runtime (ResizeObserver sobre la tarjeta):
     en móvil el banner apila texto+botones y en ≥sm va en fila, así
     que la altura cambia con el ancho del viewport — nadie tiene que
     adivinarla por breakpoint. Al desmontarse se publica height 0. */
  useEffect(() => {
    if (!visible || dismissed) return undefined;
    const el = cardRef.current;
    if (!el) return undefined;
    const publish = () => cookieStore.set({ height: el.offsetHeight });
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cookieStore.set({ height: 0 });
    };
  }, [visible, dismissed]);

  const choose = (value: string) => {
    localStorage.setItem("charli-cookies", value);
    setVisible(false);
    setTimeout(() => setDismissed(true), 600);
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          role="dialog"
          aria-label="Consentimiento de cookies"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[160] flex justify-center px-4 pb-4 sm:pb-6"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div
            ref={cardRef}
            className="pointer-events-auto flex w-full max-w-[760px] flex-col gap-4 rounded-3xl border border-white/10 bg-[#0f1011]/90 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
          >
            <p className="text-[13px] leading-relaxed text-white/70">
              Usamos cookies para mejorar tu experiencia y analizar el tráfico.{" "}
              <a href="#" className="font-medium text-lime underline underline-offset-2">
                Política de cookies
              </a>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => choose("necessary")}
                className="rounded-full border border-white/15 px-4 py-2.5 text-[12.5px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                <SpecialText inView speed={16}>
                  Solo necesarias
                </SpecialText>
              </button>
              <Magnetic>
                <button
                  onClick={() => choose("all")}
                  className="rounded-full bg-lime px-5 py-2.5 text-[12.5px] font-semibold text-ink transition-transform hover:scale-105 active:scale-95"
                >
                  <SpecialText inView delay={0.15} speed={16}>
                    Aceptar todas
                  </SpecialText>
                </button>
              </Magnetic>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
