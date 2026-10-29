"use client";

/* ────────────────────────────────────────────────────────────────
   HeroText — titular con efecto «shutter» por rebanadas
   (componente de 21st.dev pegado por el usuario).

   Cada letra entra desenfocada mientras tres rebanadas suyas
   (superior / central / inferior, recortadas con `clip-path`)
   barren en horizontal en sentidos alternos y se desvanecen.

   Integración en CHARLI AI (v1.45): el original es una pantalla
   hero completa (rejilla de fondo, botón de replay, esquinas).
   Aquí se conserva SOLO el efecto sobre el texto para usarlo
   como titular de sección — «Proyectos destacados», centrado
   (ver works.tsx) — con estas adaptaciones:
   · Sin cromo de pantalla completa (fondo, botón flotante,
     esquinas): el replay del efecto es un clic sobre el propio
     titular, como pedía el «Click to re-shutter» original.
   · Se ejecuta al entrar en pantalla (`useInView`, una vez),
     no al montar: vive a mitad de página.
   · Tamaño de titular de sección (clamp) en lugar de 15vw, y
     salto de línea solo entre palabras (cada palabra no se parte).
   · Paleta del sitio: tinta sobre papel con rebanadas
     `lime-deep` (el original usaba índigo/esmeralda).
   · Todo `<span>` para poder vivir dentro de un `<h2>`.
   ──────────────────────────────────────────────────────────────── */

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroTextProps {
  text?: string;
  className?: string;
}

/* Clases compartidas por la letra principal y sus rebanadas:
   deben coincidir EXACTO para que los recortes se solapen. */
const CHAR_CLASS =
  "text-[clamp(2.35rem,7vw,5.1rem)] leading-[1.04] font-black tracking-tighter";

export default function HeroText({ text = "IMMERSE", className = "" }: HeroTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [count, setCount] = useState(0);

  const words = text.split(" ");
  /* Índice global de letra: la cascada recorre el titular entero,
     no reinicia en cada palabra (offset de arranque por palabra). */
  const wordOffsets = words.map((_, wi) =>
    words.slice(0, wi).reduce((acc, w) => acc + w.length, 0)
  );

  return (
    <span
      ref={ref}
      onClick={() => setCount((c) => c + 1)}
      className={cn("flex cursor-pointer select-none justify-center", className)}
    >
      <AnimatePresence mode="wait">
        <motion.span key={count} className="flex flex-wrap items-center justify-center">
          {words.map((word, wi) => (
            <span key={wi} className="flex whitespace-nowrap">
              {word.split("").map((char, ci) => {
                const i = wordOffsets[wi] + ci;
                return (
                  <span key={ci} className="relative inline-block overflow-hidden px-[0.1vw]">
                    {/* Letra principal — entra del desenfoque */}
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={
                        inView
                          ? { opacity: 1, filter: "blur(0px)" }
                          : { opacity: 0, filter: "blur(10px)" }
                      }
                      transition={{ delay: i * 0.04 + 0.3, duration: 0.8 }}
                      className={cn(CHAR_CLASS, "relative inline-block text-ink")}
                    >
                      {char}
                    </motion.span>

                    {/* Rebanada superior */}
                    <motion.span
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={inView ? { x: "100%", opacity: [0, 1, 0] } : { x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.7, delay: i * 0.04, ease: "easeInOut" }}
                      className={cn(CHAR_CLASS, "pointer-events-none absolute inset-0 z-10 inline-block text-lime-deep")}
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                      aria-hidden="true"
                    >
                      {char}
                    </motion.span>

                    {/* Rebanada central */}
                    <motion.span
                      initial={{ x: "100%", opacity: 0 }}
                      animate={inView ? { x: "-100%", opacity: [0, 1, 0] } : { x: "100%", opacity: 0 }}
                      transition={{ duration: 0.7, delay: i * 0.04 + 0.1, ease: "easeInOut" }}
                      className={cn(CHAR_CLASS, "pointer-events-none absolute inset-0 z-10 inline-block text-ink-soft")}
                      style={{ clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)" }}
                      aria-hidden="true"
                    >
                      {char}
                    </motion.span>

                    {/* Rebanada inferior */}
                    <motion.span
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={inView ? { x: "100%", opacity: [0, 1, 0] } : { x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.7, delay: i * 0.04 + 0.2, ease: "easeInOut" }}
                      className={cn(CHAR_CLASS, "pointer-events-none absolute inset-0 z-10 inline-block text-lime-deep")}
                      style={{ clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)" }}
                      aria-hidden="true"
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              })}
              {/* hueco entre palabras (no dentro de la última):
                  lleva CHAR_CLASS para que el ancho en `em` se
                  mida contra el tamaño de las letras, no contra
                  el del contenedor (si no, el espacio colapsa y
                  las palabras se pegan) */}
              {wi < words.length - 1 ? (
                <span className={cn(CHAR_CLASS, "inline-block w-[0.3em]")} aria-hidden="true" />
              ) : null}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
