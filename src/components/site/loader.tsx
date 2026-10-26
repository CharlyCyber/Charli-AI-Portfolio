"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { loaderStore, useLoaderState } from "./loader-store";
import { EASE } from "./anim";

const LOAD_DURATION = 2600; // ms

type Phase = "loading" | "exit" | "gone";

/* Pantalla de carga: honeycomb + barra + CONTADOR 0 % → 100 %
   (petición expresa del usuario: cronómetro visible sencillo, sin
   frases ni decoración extra). El total ≤ 5 s se garantiza por
   construcción: LOAD_DURATION (2,6 s) + 320 ms de gracia + cortina
   de 1 s que puede solaparse — la pantalla nunca espera a la red. */
export function Loader() {
  // re-render when store flips (navbar/hero listen to the same store)
  useLoaderState();
  const [phase, setPhase] = useState<Phase>("loading");
  /* refs directos al relleno de la barra y al número: se actualizan
     por DOM (style.width / textContent) sin pasar por React — el
     hilo principal llega saturado durante la carga inicial
     (hidratación, WebGL, fuentes) y un re-render por fotograma se
     pierde. */
  const fillRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

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
      if (progressRef.current) {
        progressRef.current.setAttribute("aria-valuenow", String(n));
      }
      if (pctRef.current) pctRef.current.textContent = `${n}%`;
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
              el fondo claro del sitio, todo centrado. */}
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
                (ver arriba): arranca vacía y asciende sin re-renders.
                Debajo, el cronómetro 0 % → 100 % con aria-live para
                lectores de pantalla. */}
            <div
              ref={progressRef}
              className="flex w-48 flex-col items-center gap-3 sm:w-56"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-label="Progreso de carga"
            >
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  ref={fillRef}
                  className="h-full rounded-full bg-ink transition-[width] duration-150 ease-linear"
                  style={{ width: "0%" }}
                />
              </div>
              <span
                ref={pctRef}
                aria-live="polite"
                className="font-num text-[15px] font-semibold tabular-nums tracking-wide text-ink"
              >
                0%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
