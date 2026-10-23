"use client";

/* ────────────────────────────────────────────────────────────────
   SpecialText — efecto "scramble/decode" para letras pequeñas.
   Componente de 21st.dev (demo: "Make it beautiful") integrado en
   el design system de CHARLI AI. Secuencia visual idéntica al
   original: FASE 1 (caracteres aleatorios creciendo de 1 en 1
   hasta la longitud del texto) + FASE 2 (revelado progresivo del
   texto real con cursor "_", un carácter cada 2 pasos).

   Adaptaciones de integración (documentadas para futuras tareas):
   · RELOJ DE PARED (lección de Tasks 20–21): el original avanzaba
     UN paso por tick de interval — en la vista previa embebida los
     timers salen ~9,5× tarde y el decode duraría ~18 s. Aquí cada
     latido calcula el paso con performance.now() (como el loader
     y el LoopingWords): la duración es SIEMPRE la diseñada y cada
     escritura pinta el estado que corresponde a AHORA. Latido
     rAF + interval (misma técnica del loader), escrituras directas
     de textContent (idempotentes, sin re-render de React).
   · Tipografía HEREDADA: el original fuerza `font-mono h-4.5
     leading-5 font-medium`; aquí el span hereda fuente/tamaño/peso/
     color/tracking del contenedor (Switzer en todo el sitio, mono
     solo donde el contenedor lo pide) y `whitespace-pre` hace que
     los espacios iniciales reserven el ancho final (sin saltos de
     layout durante el decode).
   · `active` (default true): gate de arranque — el hero y el
     navbar esperan a que la cortina del loader termine para que
     el decode no ocurra oculto tras ella (mismo patrón que
     LoopingWords).
   · `aria-label={text}`: lectores de pantalla leen el texto real
     y no el ruido del scramble.
   ──────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface SpecialTextProps {
  children: string;
  /** ms por paso (igual que el original) — la fase vive en el reloj */
  speed?: number;
  delay?: number;
  className?: string;
  inView?: boolean;
  once?: boolean;
  /** El decode solo arranca cuando `active` es true (default true) */
  active?: boolean;
}

const RANDOM_CHARS = "_!X$0-+*#";

function getRandomChar(prevChar?: string): string {
  let char: string;
  do {
    char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  } while (char === prevChar);
  return char;
}

/* Frame de la FASE 1 en el paso `step` (0..len*2-1):
   `step+1` caracteres aleatorios (máx. len), resto nbsp. */
function phase1String(text: string, step: number): string {
  const currentLength = Math.min(step + 1, text.length);
  const chars: string[] = [];
  for (let i = 0; i < currentLength; i++) {
    const prevChar = i > 0 ? chars[i - 1] : undefined;
    chars.push(getRandomChar(prevChar));
  }
  for (let i = currentLength; i < text.length; i++) {
    chars.push("\u00A0");
  }
  return chars.join("");
}

/* Frame de la FASE 2 en el paso `step` (0..len*2-1): floor(step/2)
   caracteres reales + cursor "_" / aleatorio + resto aleatorio. */
function phase2String(text: string, step: number): string {
  const revealedCount = Math.floor(step / 2);
  const chars: string[] = [];
  for (let i = 0; i < revealedCount && i < text.length; i++) {
    chars.push(text[i]);
  }
  if (revealedCount < text.length) {
    if (step % 2 === 0) {
      chars.push("_");
    } else {
      chars.push(getRandomChar());
    }
  }
  for (let i = chars.length; i < text.length; i++) {
    chars.push(getRandomChar());
  }
  return chars.join("");
}

export function SpecialText({
  children,
  speed = 20,
  delay = 0,
  className = "",
  inView = false,
  once = true,
  active = true,
}: SpecialTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  /* Margen: -100px arriba (como el original) pero 0 abajo — con
     -100px en los cuatro lados, los elementos del FINAL de la página
     (barra inferior del footer) jamás entrarían en la raíz efectiva
     del observer (la página no se puede scrollear más allá) y no
     decodificarían nunca. */
  const isInView = useInView(containerRef, { once, margin: "-100px 0px 0px 0px" });
  const shouldAnimate = inView ? isInView : true;
  const text = children;
  const [hasStarted, setHasStarted] = useState(false);

  const t0Ref = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const startTimeoutRef = useRef<number | null>(null);
  const disposedRef = useRef(false);

  const stepMs = Math.max(1, speed);

  function clearTimers() {
    if (startTimeoutRef.current !== null) {
      window.clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
  }

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      clearTimers();
    };
  }, []);

  /* Arranque: active × visibilidad × delay → arranca el reloj. */
  useEffect(() => {
    if (active && shouldAnimate && !hasStarted) {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
      }
      startTimeoutRef.current = window.setTimeout(
        () => {
          startTimeoutRef.current = null;
          setHasStarted(true);
        },
        Math.max(0, delay) * 1000,
      );
    }
    return () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
    };
  }, [active, shouldAnimate, hasStarted, delay]);

  /* Ticker: la FASE se calcula del reloj de pared (performance.now)
     — mismo ritmo con timers sanos o frenados. Cubre también el
     reinicio cuando cambia `text` (re-decodea la nueva cadena). */
  useEffect(() => {
    if (!hasStarted || text.length === 0) return;

    t0Ref.current = performance.now();
    const totalSteps = text.length * 4; // fase1 (len*2) + fase2 (len*2)

    const paint = () => {
      if (disposedRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      const step = Math.floor((performance.now() - t0Ref.current) / stepMs);
      if (step >= totalSteps - 1) {
        el.textContent = text;
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        cancelAnimationFrame(rafRef.current);
        return;
      }
      if (step < 0) return; // aún no (reloj futura por un tick)
      el.textContent =
        step < text.length * 2
          ? phase1String(text, step)
          : phase2String(text, step - text.length * 2);
    };

    /* Latido doble (técnica del loader): rAF para suavidad donde el
       bucle de render vive + interval como garantía donde rAF está
       congelado (vista previa embebida). Escrituras idempotentes. */
    const rafLoop = () => {
      paint();
      if (!disposedRef.current && intervalRef.current !== null) {
        rafRef.current = requestAnimationFrame(rafLoop);
      }
    };
    intervalRef.current = window.setInterval(paint, Math.max(16, Math.min(stepMs, 50)));
    rafRef.current = requestAnimationFrame(rafLoop);
    paint();

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, [hasStarted, text, stepMs]);

  return (
    <span
      ref={containerRef}
      aria-label={text}
      /* inline-block (y no inline-flex como el original): una run de
         texto de solo espacios NO se envuelve en ítem flex anónimo →
         el span tendría altura 0 y el IntersectionObserver con
         rootMargin negativo no lo reportaría. Con inline-block los
         espacios (white-space: pre) generan un line box de altura
         real desde el primer paint. */
      className={`inline-block whitespace-pre ${className}`}
    >
      {" ".repeat(text.length)}
    </span>
  );
}
