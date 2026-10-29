"use client";

/* ────────────────────────────────────────────────────────────────
   CurvedLoop — marquesina infinita sobre una curva SVG
   (componente de 21st.dev pegado por el usuario).

   El texto recorre un arco (`<textPath>`) en bucle continuo,
   SIEMPRE hacia la izquierda, a velocidad constante y suave
   (por tiempo, no por fotogramas: se mueve igual a 30, 60 o
   120 Hz). Integración en CHARLI AI: franja de palabras bajo
   «Colaboración en tiempo real» (ver autodidact.tsx).

   v1.46 — movimiento constante SIN arrastre (petición del
   usuario): se eliminó toda la interacción por puntero del
   original (arrastrar cambiaba velocidad y sentido) y también
   la pausa ante `prefers-reduced-motion` — con esa preferencia
   activa en el sistema (el caso de la vista previa del cliente)
   la franja quedaba estática hasta tocarla. Ahora nada depende
   del cursor ni del dedo: la curva avanza sola, sin parar.
   Solo se sigue pausando FUERA de pantalla (IntersectionObserver,
   invisible para el visitante) por rendimiento.

   Otras adaptaciones respecto al código pegado:
   · Sin `setState` por fotograma: el original llamaba a
     `setOffset` en cada rAF (re-render a 60 fps de todo el
     componente). Aquí el bucle solo escribe `startOffset` por DOM.
   · `fill-white` ya no se fuerza junto al `className` recibido
     (dos utilidades `fill-*` en conflicto): si el caller pasa su
     propio relleno, manda el suyo.
   · Encuadre más ceñido (`aspect-[100/13]` en vez de `100/18`):
     en la demo el texto vive dentro de una tarjeta alta; aquí es
     una franja y la caja original dejaba ~140 px de aire muerto
     bajo el arco. La geometría del arco no cambia.
   · Id de la curva sin los «:» de `useId` (referencia SVG segura).
   ──────────────────────────────────────────────────────────────── */

import { useRef, useEffect, useState, useMemo, useId, type FC } from "react";

export interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
}

export const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = "CURVED MARQUEE • INTERACTIVE LOOP • 21ST.DEV • ",
  speed = 2,
  className,
  curveAmount = 250,
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, "") : marqueeText) + "\u00A0";
  }, [marqueeText]);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const [inView, setInView] = useState(false);
  const uid = useId();
  const pathId = `curve-${uid.replace(/:/g, "")}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const textLength = spacing;
  const totalText = textLength
    ? Array(Math.ceil(1800 / textLength) + 2)
        .fill(text)
        .join("")
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute("startOffset", initial + "px");
      setOffset(initial);
    }
  }, [spacing]);

  /* Solo anima con la tira en pantalla (rendimiento) */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "15% 0px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* Bucle constante hacia la izquierda. La posición se DERIVA
     del tiempo transcurrido (speed = unidades por fotograma de
     60 fps de referencia), no se acumula fotograma a fotograma:
     la velocidad es matemáticamente la misma a 30, 60 o 120 Hz
     e inmune a tirones — si un fotograma tarda, el siguiente
     cae exactamente donde debe, sin deriva ni frenazos. */
  useEffect(() => {
    if (!spacing || !ready || !inView) return;
    let frame = 0;
    const t0 = performance.now();
    const startOffset = parseFloat(
      textPathRef.current?.getAttribute("startOffset") || "0"
    );
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      if (!textPathRef.current) return;
      const traveled = speed * ((now - t0) / (1000 / 60));
      const raw = startOffset - traveled;
      /* envuelve raw al intervalo (-spacing, 0] */
      const wrapped = ((raw % spacing) + spacing) % spacing;
      const next = wrapped === 0 ? 0 : wrapped - spacing;
      textPathRef.current.setAttribute("startOffset", next + "px");
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready, inView]);

  return (
    <div
      ref={hostRef}
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      <svg
        className="block aspect-[100/13] w-full select-none overflow-visible text-[4rem] font-black uppercase tracking-tight"
        viewBox="0 0 1440 160"
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}
        >
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text xmlSpace="preserve" className={className ?? "fill-white"}>
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={offset + "px"}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
