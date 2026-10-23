"use client";

/* ────────────────────────────────────────────────────────────────
   HorizontalScroll — sección anclada (sticky) que se recorre en
   horizontal con el scroll vertical.
   Adaptación del componente "Horizontal Scroll" de 21st.dev
   (inspirado en Matt Perry), con correcciones de integración:
   · selectores acotados a refs del propio componente (el original
     usaba document.querySelectorAll("li") y document.querySelector
     ("section"), que fugaban fuera del componente)
   · sin <ReactLenis root>: el sitio ya provee Lenis global
     (SmoothScroll); anidar dos instancias pelearían por el scroll
   · cleanup de las animaciones al desmontar
   · wrapper con overflow-x-clip para no provocar scroll horizontal
     en navegadores con scrollbar clásica (w-screen = 100vw)
   ── v1.44 ──
   · prop `background`: capa de fondo fija bajo el carrusel durante
     TODO el tramo, dentro de un wrapper `sticky top-0 z-0
     -mb-[100vh] h-screen overflow-hidden`: el margen negativo anula
     su huella de flujo, de modo que el carrusel conserva su posición
     y su rango sticky exactos; el <ul> sube a z-10 y viaja por
     encima. Sin `background` no se renderiza nada → comportamiento
     idéntico al original.
   · prop `wordClassName`: clases de las palabras gigantes (por
     defecto "text-ink"). Se APLICA EN LUGAR del color por defecto —
     así "text-paper" no compite con "text-ink" en la cascada (con
     dos utilidades de color simultáneas el orden del CSS generado
     decidiría de forma no determinista).
   · sweep móvil: en viewports <640px el barrido por slide baja de
     ±0.85·vw a ±0.42·vw — la palabra (≈92vw de ancho) quedaba
     completamente fuera de pantalla entre relevos (pantalla vacía);
     con ±0.42·vw sigue siempre parcialmente visible, con relevo
     parcial como en escritorio.
   · fundido por proximidad de las tarjetas `.slide-info` SOLO en
     móvil (<640px o puntero coarse): cada tarjeta interior tiene
     perfil de opacidad [0,1,0] centrado ±d alrededor del centro del
     viewport según su posición horizontal (opacidad 1 al centrarse
     su slide, 0 hacia los bordes); la PRIMERA usa [1,0] (visible al
     inicio, se apaga al avanzar) y la ÚLTIMA [0,1] (se enciende al
     final). Ligado como las palabras (scroll-linked de motion:
     escrituras directas sobre el elemento, sin setState por frame)
     y con limpieza del opacity inline al (re)calibrar, para que no
     quede residuo al pasar a escritorio.
   · geoKey: clave de estado que cambia ante `resize` +
     `visualViewport.resize` (debounce 180ms) y re-liga TODAS las
     animaciones con geometría fresca (H, vh, sweep, anclas) —
     compensa la barra de URL móvil (100vh ≠ viewport real), que
     dejaba el último slide "en blanco".
   ──────────────────────────────────────────────────────────────── */

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { animate, scroll } from "motion";
import { FlipText } from "@/components/ui/flip-links";

export type HorizontalScrollSlide = {
  id: string;
  /** Palabra gigante que cruza el slide */
  word: string;
  /** Clases de fondo del slide (p. ej. "bg-paper-dim") */
  className?: string;
  /** Contenido informativo superpuesto (esquina superior izquierda) */
  info?: ReactNode;
  /** Imagen anclada al borde inferior (opcional) */
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  /** Clases de tamaño/aspecto de la imagen (se ancla al borde inferior) */
  imageClassName?: string;
};

export type HorizontalScrollProps = {
  slides: HorizontalScrollSlide[];
  /** Bloque introductorio antes del tramo horizontal (p. ej. 80vh) */
  header?: ReactNode;
  headerClassName?: string;
  /** Bloque de cierre tras el tramo horizontal */
  footer?: ReactNode;
  footerClassName?: string;
  /** id del wrapper (para anclas de navegación) */
  id?: string;
  /** Capa de fondo fija bajo el carrusel durante todo el tramo
      (p. ej. <div className="h-full bg-[#0f1011]"><Threads/></div>) */
  background?: ReactNode;
  /** Clases de las palabras gigantes — sustituyen al "text-ink" por
      defecto (p. ej. "text-paper" sobre un fondo oscuro) */
  wordClassName?: string;
};

export default function HorizontalScroll({
  slides,
  header,
  headerClassName,
  footer,
  footerClassName,
  id,
  background,
  wordClassName,
}: HorizontalScrollProps) {
  const ulRef = useRef<HTMLUListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* geoKey — invalidación de la geometría del carrusel: cualquier
     cambio de tamaño del viewport (incluida la barra de URL móvil,
     que no siempre dispara "resize" con métricas definitivas)
     re-liga las animaciones tras 180ms de calma. */
  const [geoKey, setGeoKey] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const bump = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => setGeoKey((k) => k + 1), 180);
    };
    window.addEventListener("resize", bump);
    window.visualViewport?.addEventListener("resize", bump);
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("resize", bump);
      window.visualViewport?.removeEventListener("resize", bump);
    };
  }, []);

  useEffect(() => {
    const ul = ulRef.current;
    const section = sectionRef.current;
    if (!ul || !section) return;

    const items = Array.from(
      ul.querySelectorAll<HTMLLIElement>(":scope > li"),
    );
    if (items.length === 0) return;

    /* Tarjetas .slide-info (una por slide, si el consumidor las usa).
       El opacity inline del fundido móvil se elimina SIEMPRE al
       (re)calibrar: al re-ligar por geoKey o al cambiar de móvil a
       escritorio no debe quedar residuo (el fade se desactiva fuera
       de móvil). */
    const infoCards = items
      .map((item) => item.querySelector<HTMLElement>(".slide-info"))
      .filter((el): el is HTMLElement => el !== null);
    for (const card of infoCards) {
      card.style.removeProperty("opacity");
    }

    /* ── Tamaño uniforme de las palabras gigantes ──
       TODAS las palabras usan el mismo font-size: el de la más larga
       (AUTODIDACTA), que es la que limita — medimos el ancho natural
       de cada palabra al tamaño base (20vw de la clase) y aplicamos
       a todas el mínimo de los tamaños que las harían ~92vw de
       ancho. Así comparten altura de letra, línea base y proporción
       de un slide al siguiente (las más cortas simplemente ocupan
       menos ancho). offsetWidth es de layout: no le afecta la
       transform x del barrido. Se re-mide cuando las fuentes
       terminan de cargar (métricas definitivas) y es idempotente
       (reset → medir → fijar), lo que lo hace seguro en StrictMode. */
    const fitWords = () => {
      if (!section.isConnected) return;
      const vw = window.innerWidth;
      const headings: HTMLHeadingElement[] = [];
      const sizeVws: number[] = [];
      for (const item of items) {
        const heading = item.querySelector("h2");
        const span = heading?.querySelector("span");
        if (!heading || !span) continue;
        heading.style.fontSize = ""; // vuelve al 20vw de la clase
        const natural = span.offsetWidth; // ancho al 20vw
        headings.push(heading);
        sizeVws.push(natural > 0 ? Math.min(20, (20 * 0.92 * vw) / natural) : 20);
      }
      if (headings.length === 0) return;
      const uniform = Math.min(...sizeVws); // el tamaño de AUTODIDACTA
      for (const heading of headings) {
        heading.style.fontSize = `${uniform.toFixed(2)}vw`;
      }
    };
    fitWords();
    document.fonts.ready.then(fitWords);

    const cleanups: Array<() => void> = [];

    /* el carrusel se desplaza en horizontal con el scroll vertical.
       ease "linear" explícito: la x del carrusel es función exacta del
       scroll (sin muelle), lo que garantiza que cada slide quede centrado
       exactamente cuando su palabra lo está. (Nota: en motion v14,
       `ease: spring()` pasa un objeto generador que rompe el sampler JS
       con "easingFunctions is not a function" al hacer stop()). */
    const distance = (items.length - 1) * window.innerWidth;
    const controls = animate(
      ul,
      { x: [0, -distance] },
      { ease: "linear" },
    );
    scroll(controls, { target: section });
    cleanups.push(() => controls.stop());

    /* cada palabra gigante barre su slide con el scroll vertical.
       ── Coreografía de alineación ──
       El slide i queda centrado en el viewport exactamente cuando el
       carrusel alcanza el progreso p = i / (n - 1) del tramo útil de
       scroll (span = altura de la sección − alto del viewport); en
       ese instante su palabra debe estar centrada (x = 0) para que
       TODAS las letras aparezcan en la misma posición, con el mismo
       tamaño y la misma línea base de un scroll al siguiente.
       La primera palabra empieza centrada y sale; la última entra y
       termina centrada; las interiores entran desde la derecha y
       salen por la izquierda a velocidad uniforme.
       ── Semántica de los offsets de motion ──
       Un par [v, c] resuelve al pixel `insetSección + H·v − vh·c`
       (H = altura de la sección, vh = alto del viewport). Para anclar
       el progreso p del tramo útil:  par [(span·p + vh)/H, 1] como
       inicio y par [(span·p)/H, 0] como fin. Con ease "linear" la x
       es función exacta del scroll (sin muelle). */
    const n = items.length;
    /* Barrido por slide: 0.85·vw en escritorio; en móvil (<640px)
       0.42·vw — con ±85vw la palabra (~92vw de ancho, ~360px en un
       viewport de 390px) salía COMPLETA de pantalla y dejaba el
       slide vacío entre relevos; con ±0.42·vw (~164px en 390px)
       queda siempre parcialmente visible, con relevo parcial como
       en escritorio. */
    const vw = window.innerWidth;
    const sweep = Math.round(vw * (vw < 640 ? 0.42 : 0.85));
    if (n > 1) {
      const H = section.offsetHeight;
      const vh = window.innerHeight;
      const span = Math.max(1, H - vh);
      const anchorStart = (p: number) => (span * p + vh) / H; // par [v, 1]
      const anchorEnd = (p: number) => (span * p) / H; // par [v, 0]
      const d = 0.5 / (n - 1); // medio paso entre centros de slide

      /* Fundido por proximidad de las tarjetas .slide-info — SOLO en
         móvil (<640px o puntero coarse): en los cruces las tarjetas
         de slides adyacentes quedaban simultáneas en pantalla
         ("duplicados"). Cada tarjeta acompaña a su palabra con el
         MISMO par de anclas (mismo centro ±d): interiores [0,1,0],
         primera [1,0], última [0,1]. Ligado con scroll-linked de
         motion → escrituras directas sobre el elemento por ref, sin
         setState por frame. */
      const fade =
        vw < 640 || window.matchMedia("(pointer: coarse)").matches;

      items.forEach((item, i) => {
        const heading = item.querySelector("h2");
        if (!heading) return;
        const center = i / (n - 1);

        let from = sweep;
        let to = -sweep;
        let a = center - d;
        let b = center + d;
        if (i === 0) {
          from = 0;
          a = 0;
          b = d;
        } else if (i === n - 1) {
          to = 0;
          a = 1 - d;
          b = 1;
        }

        const wordControls = animate(
          [heading],
          { x: [from, to] },
          { ease: "linear" },
        );
        scroll(wordControls, {
          target: section,
          offset: [
            [anchorStart(a), 1],
            [anchorEnd(b), 0],
          ],
        });
        cleanups.push(() => wordControls.stop());

        if (fade) {
          const card = item.querySelector<HTMLElement>(".slide-info");
          if (card) {
            const profile: number[] =
              i === 0 ? [1, 0] : i === n - 1 ? [0, 1] : [0, 1, 0];
            const fadeControls = animate(
              [card],
              { opacity: profile },
              { ease: "linear" },
            );
            scroll(fadeControls, {
              target: section,
              offset: [
                [anchorStart(a), 1],
                [anchorEnd(b), 0],
              ],
            });
            cleanups.push(() => fadeControls.stop());
          }
        }
      });
    }

    return () => {
      for (const stop of cleanups) stop();
    };
  }, [slides, geoKey]);

  return (
    <div id={id} className="relative overflow-x-clip">
      {header ? (
        <header className={headerClassName}>{header}</header>
      ) : null}

      <section
        ref={sectionRef}
        className="relative"
        style={{ height: `${slides.length * 100}vh` }}
      >
        {/* Capa de fondo fija bajo el carrusel: sticky durante TODO el
            tramo de la sección. El -mb-[100vh] anula su huella de flujo
            (h-screen − 100vh de margen = 0), así el carrusel conserva su
            posición y su rango sticky exactos; z-0 la deja por debajo del
            ul (z-10) y overflow-hidden recorta el fondo al viewport. Sin
            `background` no se renderiza nada: idéntico al original. */}
        {background ? (
          <div className="sticky top-0 z-0 -mb-[100vh] h-screen overflow-hidden">
            {background}
          </div>
        ) : null}
        <ul ref={ulRef} className="sticky top-0 z-10 flex">
          {slides.map((slide) => (
            <li
              key={slide.id}
              className={`relative h-screen w-screen flex-none overflow-hidden ${slide.className ?? ""}`}
            >
              {slide.info}
              {/* Palabra gigante: centrado absoluto idéntico en todos los
                  slides y sin salto de línea → misma posición y mismos
                  bordes de un scroll al siguiente. El tamaño exacto lo
                  fija fitWords() en el efecto para que la palabra quepa
                  COMPLETA en el viewport (~92vw de ancho).
                  El span real dentro del flex se centra con desbordes
                  simétricos (grid + texto anónimo lo alinearía a la
                  izquierda cuando la palabra es más ancha que el slide).
                  wordClassName (p. ej. "text-paper") SUSTITUYE al text-ink
                  por defecto — color de la palabra a elección del consumidor
                  sin colisión de utilidades en la cascada. */}
              <h2
                className={`absolute inset-0 flex items-center justify-center whitespace-nowrap text-[20vw] font-semibold leading-none tracking-tight ${
                  wordClassName ?? "text-ink"
                }`}
              >
                <span>
                  <FlipText text={slide.word} />
                </span>
              </h2>
              {slide.image ? (
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  draggable={false}
                  className={`absolute bottom-0 ${slide.imageClassName ?? ""}`}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {footer ? (
        <footer className={footerClassName}>{footer}</footer>
      ) : null}
    </div>
  );
}
