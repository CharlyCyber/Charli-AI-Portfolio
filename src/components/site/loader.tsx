"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { loaderStore, useLoaderState } from "./loader-store";
import { EASE } from "./anim";

const LOAD_DURATION = 2600; // ms

type Phase = "loading" | "exit" | "gone";

/* Pantalla de carga 100 % visual: CERO nodos de texto (sin fila
   superior, sin contador 0→100 %, sin «Cargando portfolio», sin
   sr-only, sin esquinas — petición expresa del usuario). Queda el
   honeycomb + la barra de progreso, y la transición de salida de
   la ventana que sube (exit y: -100 %). */
export function Loader() {
  // re-render when store flips (navbar/hero listen to the same store)
  useLoaderState();
  const [phase, setPhase] = useState<Phase>("loading");
  /* ref directo al relleno de la barra: se actualiza por DOM
     (style.width) sin pasar por React — el hilo principal llega
     saturado durante la carga inicial (hidratación, WebGL, fuentes)
     y un re-render por fotograma se pierde. Sin texto que pintar,
     ya no hace falta pctRef: sólo el relleno de la barra. */
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("charli-loader-done") === "1") {
      // defer so every store subscriber (navbar, hero, cookie banner)
      // is mounted before the state flips
      const t = setTimeout(() => {
        loaderStore.set({ done: true, progress: 100 });
        setPhase("gone");
      }, 0);
      return () => clearTimeout(t);
    }
    const start = performance.now();
    const paint = (n: number) => {
      if (fillRef.current) fillRef.current.style.width = `${n}%`;
    };
    let iv = 0;
    const finish = setTimeout(() => {
      // begin curtain exit + release the rest of the page
      clearInterval(iv);
      paint(100);
      setPhase("exit");
      loaderStore.set({ done: true, progress: 100 });
      sessionStorage.setItem("charli-loader-done", "1");
      // deterministic unmount once the 1s curtain has finished
      setTimeout(() => setPhase("gone"), 1080);
    }, LOAD_DURATION + 320);
    /* interval (y no requestAnimationFrame): los timers siguen
       disparándose aunque el navegador pause o acelere el bucle de
       render (pestaña en segundo plano, preview embebida, hilo
       principal ocupado) — la ascensión 0 % → 100 % nunca se congela.
       easeInOutSine: arranque y final suaves */
    iv = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / LOAD_DURATION);
      const eased = t === 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t);
      paint(Math.round(eased * 100));
    }, 50);
    return () => {
      clearInterval(iv);
      clearTimeout(finish);
    };
  }, []);

  return (
    <AnimatePresence>
      {phase === "loading" && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] bg-paper text-ink noise overflow-hidden"
          aria-label="Cargando CHARLI AI"
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: EASE }}
          onAnimationComplete={(definition) => {
            if (definition === "exit") setPhase("gone");
          }}
        >
          {/* honeycomb grande + progreso 0→100 — figuras negras sobre
              el fondo claro del sitio, todo centrado. CERO texto: la
              barra es la única lectura del progreso (por ref). */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-8"
            role="status"
          >
            {/* wrapper con el tamaño visual real del clúster escalado
                (el box del honeycomb es 24×24 pero los hexágonos
                sobresalen ~±62px: sin esto taparían la barra) */}
            <div className="grid h-[128px] w-[136px] place-items-center">
              <div className="honeycomb honeycomb-lg" aria-hidden="true">
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>

            {/* progreso de carga 0 % → 100 % — actualizado por ref
                (ver arriba): arranca vacía y asciende sin re-renders */}
            <div className="h-[3px] w-48 overflow-hidden rounded-full bg-ink/10 sm:w-56">
              <div
                ref={fillRef}
                className="h-full rounded-full bg-ink transition-[width] duration-150 ease-linear"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
