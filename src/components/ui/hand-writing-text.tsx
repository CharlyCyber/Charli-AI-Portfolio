"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* HandWrittenTitle (Kokonut UI) — trazo manuscrito gigante que se
   dibuja alrededor del título. Porte del componente pegado por el
   usuario con adaptaciones documentadas para CHARLI AI:
   ① el progreso del dibujo está ATADO AL SCROLL (useScroll sobre el
     propio wrapper): al bajar el scroll el bucle se dibuja y al
     subir RETROCEDE (se des-dibuja) — el lápiz es el propio scroll,
     sin reloj de animación y sin «once»;
   ② el bucle es GRANDE de verdad (v2): la caja del trazo mantiene la
     proporción 2:1 del viewBox (aspect-[2/1]) de modo que el SVG
     renderiza SIN letterboxing — antes el contenedor era ~3:1 y el
     dibujo se encogía al 65% del ancho disponible, quedando apenas
     más ancho que el texto. Ahora el bucle abarca toda la caja
     (~93% × 91%) y el ancho se auto-limita también por la ALTURA
     disponible (max-w = min(56rem, 88vh) → alto ≤ 44vh) para no
     desbordar el header de 70vh en pantallas bajas. El path además
     se extendió hasta las propias bordes del viewBox;
   ③ acepta `children` para envolver el H2 del sitio (tipografía y
     efectos propios del sitio) en lugar del h1 por defecto.
   La estructura y el carácter del trazo (bucle abierto que se cruza
   arriba a la derecha) son los del original. */

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

function HandWrittenTitle({
  title = "Hand Written",
  subtitle,
  children,
}: HandWrittenTitleProps) {
  const ref = useRef<HTMLDivElement>(null);

  /* Progreso del scroll del propio bloque: 0 cuando su borde superior
     está al 85% del viewport (el título apenas asoma por abajo) y 1
     cuando llega al 30% (el título queda centrado). Bajar = dibujar;
     subir = retroceder. Lenis anima el scroll nativo, así que
     useScroll lo sigue sin fricción. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.3"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative w-full">
      {/* Caja 2:1 = proporción exacta del viewBox → el SVG llena la caja
          sin letterboxing y el bucle renderiza a su tamaño diseñado.
          56rem = max-w-4xl original; 88vh ≡ alto ≤ 44vh (cabe siempre
          en el header h-[70vh] junto al eyebrow, incluso en pantallas
          bajas). */}
      <div className="relative mx-auto aspect-[2/1] w-full max-w-[min(56rem,88vh)]">
        <div className="absolute inset-0">
          <motion.svg
            width="100%"
            height="100%"
            viewBox="0 0 1200 600"
            className="h-full w-full"
          >
            <title>KokonutUI</title>
            {/* Bucle extendido hasta los bordes del viewBox (x 55→1225
                con sobrepaso a 1390 en el cruce; y 26→574): abraza el
                título con margen generoso en cualquier viewport. */}
            <motion.path
              d="M 985 64
                 C 1390 300, 1170 528, 600 574
                 C 200 574, 55 508, 55 300
                 C 55 92, 330 26, 600 26
                 C 880 26, 1062 172, 990 150"
              fill="none"
              strokeWidth="12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength }}
              className="text-ink opacity-90"
            />
          </motion.svg>
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
          {children ?? (
            <motion.h1
              className="flex items-center gap-2 text-4xl tracking-tighter text-ink md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p
              className="text-xl text-ink/80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

export { HandWrittenTitle };
