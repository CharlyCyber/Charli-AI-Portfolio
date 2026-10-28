"use client";

/* ────────────────────────────────────────────────────────────────
   LoopingWords — palabras gigantes en bucle vertical.
   Réplica del componente "Looping Words with Selector" de Osmo
   (https://osmo.supply/resource/looping-words-with-selector).

   ── Por qué un driver de RELOJ DE PARED (y no animaciones) ──
   En la vista previa embebida el navegador puede PAUSAR el bucle de
   render: los tweens de GSAP (ticker rAF) y las animaciones WAAPI /
   CSS avanzan su reloj pero no se pinta ni un fotograma — la palabra
   queda congelada (v1.14–v1.16 lo padecieron aunque en un navegador
   sano funcionasen). Lo que SÍ llega a la pantalla en ese entorno
   son las escrituras de estilo desde timers: el loader (interval +
   performance.now) y el flip de los CTAs (setTimeout + estado) se
   ven perfectos. Aquí el ciclo NO es una animación: cada latido
   calcula la fase con performance.now() (reloj de pared, jamás
   frenado) y escribe transform/width directamente en el DOM.
   · Cadencia REAL de 2 s por palabra aunque los timers salgan
     tarde: la palabra pintada es siempre la que corresponde a
     AHORA — idéntica a la de un navegador sano.
   · Latido doble: requestAnimationFrame (suavidad a 60 fps donde
     el bucle de render vive) + setInterval de 50 ms (garantía
     donde rAF está congelado — la misma técnica del loader).
   · Escrituras idempotentes y deduplicadas: en los reposos no se
     escribe nada (coste cero); en los slides, solo si cambia.

   ── Geometría (idéntica al original de Osmo, aprobada) ──
   · Ventana de 3 líneas (2.7em): la palabra central nítida y las
     vecinas fundidas arriba/abajo — el fundido es una MÁSCARA del
     contenedor (no un degradado de color pintado encima): las
     vecinas se funden a transparente dejando ver el fondo real del
     hero, sin rectángulo sólido detrás.
   · La lista lleva una COPIA de la primera palabra al final: el
     ciclo termina mostrando la copia y el reinicio salta a la
     original — misma palabra, mismo ancho → costura invisible del
     bucle infinito sin reordenar el DOM.
   · Selector con 4 esquinas en L negras (#000000) anclado al borde
     izquierdo (alineado con la lista y el eyebrow del hero),
     abrazando el ancho de la palabra en curso con expo.out 0,5 s
     en paralelo al slide elástico de 1,2 s — ritmo neto de 2 s
     por palabra (0,8 s reposo + 1,2 s slide).

   Adaptaciones de integración:
   · `active` (default true): el bucle se monta al terminar el
     loader (sincronía con la cortina).
   · El transform de reposo va INLINE en el JSX: el primer paint
     (aún sin JS) ya muestra la primera palabra centrada.
   · Resize / carga de fuentes: solo se re-miden los anchos — la
     fase vive en el reloj de pared, no hay nada que reconstruir.
   · `prefers-reduced-motion`: el bucle sigue (es la identidad del
     hero) pero el slide es lineal, sin rebote elástico.
   ──────────────────────────────────────────────────────────────── */

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface LoopingWordsProps {
  words: readonly string[];
  /** Clase extra para el contenedor (tamaño/tipografía via CSS) */
  className?: string;
  /** El bucle solo se monta cuando `active` es true (default true) */
  active?: boolean;
}

/* Ritmo del original: 0,8 s de reposo + 1,2 s de slide elástico. */
const HOLD_MS = 800;
const SLIDE_MS = 1200;
const EDGE_MS = 500;
/* Latido del interval de garantía — el mismo del loader (probado
   en la vista previa embebida: los timers siguen disparándose). */
const TICK_MS = 50;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Curvas del original (elastic.out(1,0.85) / expo.out de GSAP)
   evaluadas en JS — sin depender del reloj de animaciones. Si
   parseEase no existiera, las fórmulas manuales equivalentes. */
const makeEases = () => {
  const fallbackExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const fallbackElastic = (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    const s = 0.85 / 4;
    return Math.pow(2, -10 * p) * Math.sin(((p - s) * Math.PI * 2) / 0.85) + 1;
  };
  let elastic: (p: number) => number = fallbackElastic;
  let expo: (p: number) => number = fallbackExpo;
  try {
    const e1 = gsap.parseEase("elastic.out(1,0.85)");
    const e2 = gsap.parseEase("expo.out");
    if (typeof e1 === "function" && typeof e2 === "function") {
      elastic = e1;
      expo = e2;
    }
  } catch {
    /* fórmulas manuales */
  }
  return { elastic, expo };
};

export const LoopingWords: React.FC<LoopingWordsProps> = ({
  words,
  className,
  active = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordListRef = useRef<HTMLUListElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);

  /* items = palabras + copia de la primera (costura del bucle). */
  const items = words.length > 1 ? [...words, words[0]] : [...words];
  const M = items.length;   // líneas de la lista
  const N = M - 1;          // slides por ciclo
  const linePct = 100 / M;  // 1 línea = % del alto de la lista
  /* item 0 centrado en la ventana de 3 líneas — INLINE: el primer
     paint ya muestra la primera palabra (y el fallback sin JS). */
  const restTransform = `translateY(${linePct.toFixed(4)}%)`;

  useEffect(() => {
    const root = rootRef.current;
    const wordList = wordListRef.current;
    const edge = edgeRef.current;
    if (!root || !wordList || !edge || !active || M === 0) return;

    /* item k sobre la línea central de la ventana de 3 líneas. */
    const pos = (k: number) => (1 - k) * linePct;
    const totalMs = HOLD_MS + N * (SLIDE_MS + HOLD_MS);
    const segMs = SLIDE_MS + HOLD_MS;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const { elastic, expo } = makeEases();
    const easeSlide = reduced ? (p: number) => p : elastic;

    const liEls = Array.from(wordList.children) as HTMLLIElement[];

    let disposed = false;
    let rafId = 0;
    let timerId = 0;
    let roTimer = 0;
    let widths: number[] = [];
    let lastTf = "";
    let lastW = "";
    let edgeShown = false;

    /* Anchos de cada palabra como % del ancho de la lista (la
       referencia del ancho del selector). Reintento perezoso en
       cada latido: si el hero aún no tiene layout (fuentes cargando,
       cortina del loader), la primera medida falla y el próximo
       latido vuelve a intentarlo — sin carreras de montaje. */
    const measure = (): boolean => {
      const listW = wordList.getBoundingClientRect().width;
      if (listW <= 2) return false;
      const ws = liEls.map((li) => {
        const w = (li.getBoundingClientRect().width / listW) * 100;
        return Math.min(Math.round(Math.min(w, 100) * 1e3) / 1e3, 100);
      });
      if (ws.length !== M || ws.some((w) => !isFinite(w) || w <= 0)) {
        return false;
      }
      widths = ws;
      return true;
    };

    /* Fase del ciclo a partir del reloj de pared → qué ver ahora.
       Escrituras idempotentes y deduplicadas (repo = coste cero). */
    const render = (now: number) => {
      if (disposed) return;
      if (widths.length === 0 && !measure()) return;
      if (!edgeShown) {
        edge.style.opacity = "1";
        edgeShown = true;
      }

      let tfV: number;
      let wV: number;
      if (N < 1) {
        tfV = pos(0);
        wV = widths[0];
      } else {
        const t = (((now - t0) % totalMs) + totalMs) % totalMs;
        if (t < HOLD_MS) {
          /* reposo inicial: primera palabra centrada */
          tfV = pos(0);
          wV = widths[0];
        } else {
          const u = t - HOLD_MS;
          const k = Math.min(Math.floor(u / segMs), N - 1);
          const local = u - k * segMs;
          if (local < SLIDE_MS) {
            /* slide elástico pos(k) → pos(k+1); el ancho del
               selector persigue la palabra entrante (expo.out,
               onStart como en el original) */
            tfV = lerp(pos(k), pos(k + 1), easeSlide(local / SLIDE_MS));
            wV = lerp(widths[k], widths[k + 1], expo(Math.min(local / EDGE_MS, 1)));
          } else {
            /* reposo: palabra k+1 centrada */
            tfV = pos(k + 1);
            wV = widths[k + 1];
          }
        }
      }

      const tf = `translateY(${tfV.toFixed(4)}%)`;
      if (tf !== lastTf) {
        wordList.style.transform = tf;
        lastTf = tf;
      }
      const w = `${wV.toFixed(3)}%`;
      if (w !== lastW) {
        edge.style.width = w;
        lastW = w;
      }
    };

    const t0 = performance.now();

    /* Latido doble sobre el mismo render idempotente:
       · rAF → 60 fps donde el bucle de render vive (suavidad).
       · interval de 50 ms → garantía donde rAF está congelado
         (vista previa embebida): los timers SÍ disparan y cada
         escritura directa de estilo SÍ se pinta. */
    /* performance.now() (y NO el timestamp del callback): bajo throttle
       el timestamp del frame puede ir retrasado o coalescido — siempre
       el mismo reloj fresco que el interval. */
    const rafLoop = () => {
      render(performance.now());
      if (!disposed) rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);
    timerId = window.setInterval(() => render(performance.now()), TICK_MS);
    render(performance.now());

    /* Al volver a la pestaña/preview: catch-up inmediato. */
    const onVisible = () => {
      if (!document.hidden) render(performance.now());
    };
    document.addEventListener("visibilitychange", onVisible);

    /* Re-medición al cambiar el tamaño (los anchos % y la fuente
       cqw/cqh cambian con el viewport) y al cargar las fuentes.
       La fase vive en el reloj de pared: solo se re-miden anchos,
       no hay animación que reconstruir ni fase que conservar. */
    const ro = new ResizeObserver(() => {
      if (disposed) return;
      window.clearTimeout(roTimer);
      roTimer = window.setTimeout(() => {
        if (disposed) return;
        widths = []; // fuerza re-medición en el próximo latido
        render(performance.now());
      }, 160);
    });
    ro.observe(root);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => {
          if (disposed) return;
          widths = [];
          render(performance.now());
        })
        .catch(() => {});
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.clearInterval(timerId);
      window.clearTimeout(roTimer);
      document.removeEventListener("visibilitychange", onVisible);
      ro.disconnect();
    };
    // Las words son estáticas en el hero (CONFIG); el efecto se monta
    // una vez por cambio de `active`. Dentro solo se usan refs.
  }, [active, words.length]);

  return (
    <div className={`looping-words${className ? ` ${className}` : ""}`} ref={rootRef}>
      <div className="looping-words__containers">
        <ul
          data-looping-words-list=""
          className="looping-words__list"
          style={{ transform: restTransform }}
          ref={wordListRef}
          aria-hidden="true"
        >
          {items.map((word, index) => (
            <li key={index} className="looping-words__list-item">
              <p className="looping-words__p">{word}</p>
            </li>
          ))}
        </ul>
      </div>
      <div
        data-looping-words-selector=""
        className="looping-words__selector"
        ref={edgeRef}
        aria-hidden="true"
      >
        <div className="looping-words__edge" />
        <div className="looping-words__edge is--2" />
        <div className="looping-words__edge is--3" />
        <div className="looping-words__edge is--4" />
      </div>
    </div>
  );
};
