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

   v1.48 — visible desde el primer pintado: antes la franja no
   renderizaba NADA (contenedor en `visibility: hidden`, sin
   <textPath>) hasta que un efecto cliente medía el texto tras
   la hidratación. Con caché fría tras un despliegue y conexión
   lenta, la hidratación puede tardar decenas de segundos (el
   JS del sitio es grande) y la franja se quedaba como una
   banda blanca vacía — «no aparecen las letras». Ahora el
   <textPath> se renderiza ya en servidor con un espaciado
   ESTIMADO (ancho medio de glifo × nº de caracteres): las
   letras se ven estáticas desde el primer pintado aunque el
   JS tarde o incluso si falla. Al hidratar se mide el ancho
   real (y se remide cuando las fuentes terminan de cargar y
   ante cualquier resize) y la animación arranca sin saltos
   desde la posición actual.

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

/* Ancho medio estimado por carácter en unidades SVG para el
   tamaño de letra de esta franja (4 rem, peso black, mayúsculas):
   el texto real de la sección mide ≈ 33,8/caracter. Solo se usa
   para el primer pintado (servidor / pre-hidratación); tras
   montar se sustituye por la medición exacta. */
const ESTIMATED_CHAR_WIDTH = 34;

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
  const placedRef = useRef(false);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const [inView, setInView] = useState(false);
  const uid = useId();
  const pathId = `curve-${uid.replace(/:/g, "")}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  /* v1.48: espaciado efectivo desde el primer render — estimado
     hasta que la medición real lo sustituya. El <textPath> se
     pinta SIEMPRE (también en servidor), así las letras nunca
     dependen de que la hidratación haya terminado. */
  const effectiveSpacing =
    spacing > 0 ? spacing : Math.max(1, text.length) * ESTIMATED_CHAR_WIDTH;
  const totalText = Array(Math.ceil(1800 / effectiveSpacing) + 3)
    .fill(text)
    .join("");
  /* La animación sí necesita la medición real (envoltura sin
     costuras), pero la visibilidad ya no depende de ella. */
  const measured = spacing > 0;

  /* Medir el ancho real de UNA copia del texto: al montar, cuando
     las fuentes acaban de cargar (la métrica con la fuente de
     reserva difiere — aquí 6404 → 5274) y ante cualquier cambio
     de tamaño del marco. Si la medición da 0 (SVG aún sin layout),
     se conserva la estimación y se reintenta en los siguientes
     disparadores — nunca se queda en blanco. */
  useEffect(() => {
    let cancelled = false;
    const measure = () => {
      const node = measureRef.current;
      if (!node || cancelled) return;
      let width = 0;
      try {
        width = node.getComputedTextLength();
      } catch {
        width = 0;
      }
      if (width > 0) {
        setSpacing((prev) => (Math.abs(prev - width) > 0.5 ? width : prev));
      }
    };
    measure();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    const host = hostRef.current;
    const observer =
      host && "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    if (host && observer) observer.observe(host);
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [text, className]);

  /* Colocación inicial SOLO la primera vez que se mide: saltar a
     -spacing es visualmente idéntico a 0 (una copia exacta antes)
     y deja el intervalo de envoltura (-spacing, 0] preparado. En
     remediciones posteriores NO se toca la posición: la
     animación reinicia leyendo el startOffset actual y la
     envoltura modular conserva el punto exacto de la curva. */
  useEffect(() => {
    if (!spacing || placedRef.current) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute("startOffset", initial + "px");
      setOffset(initial);
      placedRef.current = true;
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
    if (!measured || !inView) return;
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
  }, [spacing, speed, measured, inView]);

  return (
    <div
      ref={hostRef}
      className="relative flex w-full items-center justify-center overflow-hidden"
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
      </svg>
    </div>
  );
};

export default CurvedLoop;
