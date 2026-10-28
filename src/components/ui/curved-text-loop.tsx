"use client";

/* ────────────────────────────────────────────────────────────────
   CurvedLoop — marquesina infinita sobre una curva SVG
   (componente de 21st.dev pegado por el usuario).

   El texto recorre un arco (`<textPath>`) en bucle continuo y se
   puede arrastrar con el puntero para cambiar velocidad y sentido
   en tiempo real. Integración en CHARLI AI (v1.45): sustituye a la
   antigua tira rectangular de palabras bajo «Colaboración en
   tiempo real» (ver autodidact.tsx), a velocidad lenta.

   Adaptaciones respecto al código pegado (sin cambio visual):
   · Sin `setState` por fotograma: el original llamaba a
     `setOffset` en cada rAF (re-render a 60 fps de todo el
     componente). Aquí el bucle solo escribe `startOffset` por DOM;
     el cursor «grabbing» pasa a un estado que cambia al
     pulsar/soltar.
   · `fill-white` ya no se fuerza junto al `className` recibido
     (dos utilidades `fill-*` en conflicto): si el caller pasa su
     propio relleno, manda el suyo.
   · Encuadre más ceñido (`aspect-[100/13]` en vez de `100/18`):
     en la demo el texto vive dentro de una tarjeta alta; aquí es
     una franja y la caja original dejaba ~140 px de aire muerto
     bajo el arco. La geometría del arco no cambia.
   · `touch-pan-y`: en móvil el arrastre horizontal manipula la
     curva sin bloquear el scroll vertical de la página.
   · Pausa fuera de pantalla (IntersectionObserver) y respeto a
     `prefers-reduced-motion` (curva estática, sin bucle).
   · Id de la curva sin los «:» de `useId` (referencia SVG segura).
   ──────────────────────────────────────────────────────────────── */

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useId,
  type FC,
  type PointerEvent,
} from "react";

export interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
}

export const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = "CURVED MARQUEE • INTERACTIVE LOOP • 21ST.DEV • ",
  speed = 2,
  className,
  curveAmount = 250,
  direction = "left",
  interactive = true,
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
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(false);
  const uid = useId();
  const pathId = `curve-${uid.replace(/:/g, "")}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<"left" | "right">(direction);
  const velRef = useRef(0);

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

  /* Solo anima con la tira en pantalla */
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

  useEffect(() => {
    if (!spacing || !ready || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        const currentOffset = parseFloat(
          textPathRef.current.getAttribute("startOffset") || "0"
        );
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute("startOffset", newOffset + "px");
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready, inView]);

  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    setDragging(true);
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = parseFloat(
      textPathRef.current.getAttribute("startOffset") || "0"
    );
    let newOffset = currentOffset + dx;
    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;
    textPathRef.current.setAttribute("startOffset", newOffset + "px");
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    setDragging(false);
    dirRef.current = velRef.current > 0 ? "right" : "left";
  };

  const cursorStyle = interactive ? (dragging ? "grabbing" : "grab") : "auto";

  return (
    <div
      ref={hostRef}
      className="relative flex w-full touch-pan-y items-center justify-center overflow-hidden"
      style={{ visibility: ready ? "visible" : "hidden", cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
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
