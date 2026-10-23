"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ─────────────────────────────────────────────────────────────────
   FlipLinks — efecto "flip" letra a letra (basado en el componente
   Flip Link de 21st.dev / vaib215), integrado a la escala del sitio
   con TRIPLE disparo que NO depende del cursor:

   1 · Ola al entrar en viewport — cuando un titular (o el label de
       un botón) entra en pantalla, sus palabras voltean en cascada
       (25 ms/letra, encadenadas entre palabras) SIN cursor. Al
       volver a entrar, vuelve a olear (con anti-rebote de 1,8 s).

   2 · Burbuja en bucle — mientras el texto permanece visible en el
       viewport, la ola se repite cada ~4,6 s (hold 1,6 s). Los
       timers solo corren para texto VISIBLE: nada de olas a ciegas
       en secciones lejanas (v1.11 burbujeaba siempre, aunque el
       titular estuviera fuera de pantalla).

   3 · Hover — el clásico del original: la palabra voltea al pasar
       el cursor con respuesta inmediata (stagger solo por letra,
       sin el retardo de la ola). En botones, <FlipGroup> extiende
       el hover a TODA la superficie (iconos y padding incluidos).

   · `flipWords(node)` — envuelve cada PALABRA de un ReactNode en un
     <FlipText>, conservando los elementos anidados (spans con
     itálicas, enlaces…), el flujo inline (los saltos de línea
     naturales siguen funcionando) y encadenando los retardos para
     que toda la línea voltee como una sola ola.

   Notas de la implementación:
   · Las letras son inline-block en flujo normal (no flex): así se
     conserva el letter-spacing del titular entre letras.
   · `pb/-mb 0.14em` + `translateY(±120%)`: los descendentes (g, j,
     p, q, y…) nunca se recortan en reposo y la fila entrante queda
     totalmente oculta bajo el borde inferior.
   · Fase por hash del texto (determinista: idéntica en SSR y
     cliente, sin mismatch de hidratación).
   · Arranque: la primera ola se pospone hasta que la cortina del
     loader termina de levantar (~4,2 s; 0,5 s si ya se cargó en la
     sesión) para que el hero no voltee a ciegas tras el telón.
   · `prefers-reduced-motion`: se desactivan las olas automáticas
     (la de viewport y la burbuja); el hover se mantiene.
   ───────────────────────────────────────────────────────────────── */

const FLIP_LETTER_MS = 25; // escalonado por letra (como el original)
const WORD_GAP_MS = 45; // hueco extra entre palabras encadenadas
const AUTO_INTERVAL = 4600; // cada cuánto burbujea (ms)
const AUTO_HOLD = 1600; // cuánto se mantiene volteada (ms)
const REENTRY_COOLDOWN = 1800; // anti-rebote al re-entrar en viewport
const REENTRY_DELAY = 140; // ola casi inmediata al re-entrar

/* ── Arranque: instante de carga del bundle (solo cliente) ──── */
const BOOT_MS =
  typeof window !== "undefined" && typeof performance !== "undefined"
    ? Date.now()
    : 0;

/** Retardo de la primera ola: tras la cortina del loader inicial
 *  (~2,9 s de contador + 1 s de cortina) o casi nada si el loader
 *  ya se completó antes en esta sesión (sessionStorage). */
function firstWaveDelay(): number {
  try {
    if (sessionStorage.getItem("charli-loader-done") === "1") return 500;
  } catch {
    /* sessionStorage inaccesible: valor por defecto */
  }
  return 4200;
}

/* ── Fase determinista (SSR-safe) a partir del texto ────────── */
export function textPhase(...parts: string[]): number {
  let h = 7;
  for (const ch of parts.join("|")) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % 3000;
}

/* ── Extrae el texto plano de un ReactNode ──────────────────── */
export function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/* ── Contexto de hover de grupo (botones: flip en toda la
     superficie del botón, no solo sobre la palabra) ─────────── */
const FlipHoverCtx = createContext(false);

/** Envuelve un botón/enlace para que el volteo letra a letra de su
 *  label responda al hover sobre CUALQUIER parte del botón (iconos,
 *  padding…). React propaga mouseenter/mouseleave sintéticos desde
 *  los descendientes, así que basta con envolver el elemento. */
export function FlipGroup({
  children,
  className,
}: {
  children: ReactNode;
  /** Display del wrapper: "block"/"w-full" para botones full-width,
   *  "inline-block" para el resto. Por defecto inline-block. */
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <FlipHoverCtx.Provider value={hover}>
      <span
        className={className ?? "inline-block"}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </span>
    </FlipHoverCtx.Provider>
  );
}

/* ── FlipText — una palabra que voltea letra a letra ────────── */
export function FlipText({
  text,
  delay = 0,
  phase,
  auto = true,
  className,
}: {
  text: string;
  /** Offset (ms) para encadenar varias palabras en una sola ola */
  delay?: number;
  /** Desfase del bucle automático (ms); por defecto, hash del texto */
  phase?: number;
  /** Ola al entrar en viewport + burbuja en bucle mientras visible */
  auto?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [visible, setVisible] = useState(false);
  const groupHover = useContext(FlipHoverCtx);
  const active = hover || groupHover || bubble;
  const ownPhase = phase ?? textPhase(text);

  const ref = useRef<HTMLSpanElement>(null);
  const wavedRef = useRef(false); // ¿ya soltó su primera ola?
  const lastWaveRef = useRef(0); // instante de la última ola

  /* Visibilidad en viewport: un IntersectionObserver por palabra.
     rootMargin vertical amplio → la ola arranca justo antes de que
     el titular cruce el borde (y para las palabras gigantes del
     carrusel horizontal, al cruzar el borde lateral). */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { rootMargin: "10% 0px 10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Olas automáticas — solo mientras la palabra es visible. */
  useEffect(() => {
    if (!visible || !auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let up: number | undefined;
    let down: number | undefined;

    const now = Date.now();
    let firstDelay: number;
    if (!wavedRef.current) {
      const warm = Math.max(0, BOOT_MS + firstWaveDelay() - now);
      /* primera ola: tras la cortina del loader (si aún no pasó) con
         un pequeño desfase por hash; si ya pasó (sección profunda a
         la que el usuario llega scrolleando), ola casi inmediata */
      firstDelay = warm > 0 ? warm + (ownPhase % 900) : REENTRY_DELAY;
    } else {
      /* re-entrada en viewport: ola inmediata con anti-rebote */
      const since = now - lastWaveRef.current;
      firstDelay =
        since < REENTRY_COOLDOWN ? REENTRY_COOLDOWN - since : REENTRY_DELAY;
    }

    const fire = () => {
      wavedRef.current = true;
      lastWaveRef.current = Date.now();
      setBubble(true);
      down = window.setTimeout(() => setBubble(false), AUTO_HOLD);
      up = window.setTimeout(fire, AUTO_INTERVAL);
    };
    up = window.setTimeout(fire, firstDelay);

    return () => {
      if (up !== undefined) window.clearTimeout(up);
      if (down !== undefined) window.clearTimeout(down);
      /* si la palabra sale de viewport a mitad de ola, baja limpia */
      setBubble(false);
    };
  }, [visible, auto, ownPhase]);

  const letters = text.split("");

  const row = (rest: string, flipped: string, hidden: boolean) => (
    <span
      className={hidden ? "absolute inset-0" : undefined}
      aria-hidden="true"
    >
      {letters.map((ch, i) => (
        <span
          key={i}
          className="inline-block whitespace-pre transition-transform duration-300 ease-in-out"
          style={{
            /* la ola automática usa el retardo encadenado (cascada
               entre palabras); el hover responde YA, con el stagger
               solo por letra del original */
            transitionDelay: bubble
              ? `${delay + i * FLIP_LETTER_MS}ms`
              : `${i * FLIP_LETTER_MS}ms`,
            transform: active ? flipped : rest,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );

  return (
    <span
      ref={ref}
      className={`relative inline-block overflow-hidden whitespace-nowrap pl-[0.06em] -ml-[0.06em] pr-[0.1em] -mr-[0.1em] pb-[0.14em] -mb-[0.14em] ${className ?? ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* texto real para lectores de pantalla; las filas están ocultas */}
      <span className="sr-only">{text}</span>
      {row("translateY(0)", "translateY(-120%)", false)}
      {row("translateY(120%)", "translateY(0)", true)}
    </span>
  );
}

/* ── flipWords — envuelve cada palabra de un nodo en FlipText ── */
type WrapCtx = { delay: number; phase: number; auto: boolean };

function wrapNode(node: ReactNode, ctx: WrapCtx, key: string): ReactNode {
  if (typeof node === "string") {
    if (!node.trim()) return node; // separadores → texto normal
    const parts = node.split(/(\s+)/);
    const out: ReactNode[] = [];
    parts.forEach((part, i) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        out.push(<React.Fragment key={`${key}-s${i}`}>{part}</React.Fragment>);
        return;
      }
      const wordDelay = ctx.delay;
      ctx.delay += part.length * FLIP_LETTER_MS + WORD_GAP_MS;
      out.push(
        <FlipText
          key={`${key}-w${i}`}
          text={part}
          delay={wordDelay}
          phase={ctx.phase}
          auto={ctx.auto}
        />
      );
    });
    return out.length === 1 ? out[0] : out;
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <React.Fragment key={`${key}-${i}`}>
        {wrapNode(child, ctx, `${key}-${i}`)}
      </React.Fragment>
    ));
  }
  if (React.isValidElement(node)) {
    const children = (node.props as { children?: ReactNode }).children;
    if (children == null) return node;
    return React.cloneElement(
      node,
      { key: node.key ?? key },
      wrapNode(children, ctx, key)
    );
  }
  return node;
}

export function flipWords(
  node: ReactNode,
  opts?: { phase?: number; auto?: boolean }
): ReactNode {
  const ctx: WrapCtx = {
    delay: 0,
    phase: opts?.phase ?? textPhase(extractText(node)),
    auto: opts?.auto ?? true,
  };
  return wrapNode(node, ctx, "f");
}

/* ── FlipLink — componente original (demo) ────────────────────
   Versión hover-only del efecto, tal como fue publicada; se
   mantiene como referencia/demo del patrón original. */
export const FlipLink = ({ children, href }: { children: string; href: string }) => {
  return (
    <a
      href={href}
      className="group text-primary relative block overflow-hidden whitespace-nowrap text-4xl font-black uppercase sm:text-7xl md:text-8xl lg:text-9xl"
      style={{
        lineHeight: 0.75,
      }}
    >
      <div className="flex">
        {children.split("").map((letter, i) => (
          <span
            key={i}
            className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-[110%]"
            style={{
              transitionDelay: `${i * 25}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="absolute inset-0 flex">
        {children.split("").map((letter, i) => (
          <span
            key={i}
            className="inline-block translate-y-[110%] transition-transform duration-300 ease-in-out group-hover:translate-y-0"
            style={{
              transitionDelay: `${i * 25}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </a>
  );
};

export const Component = () => {
  return (
    <section className="grid place-content-center gap-2 bg-background w-full h-screen text-black">
      <FlipLink href="https://x.com/thisis_vaib">Twitter</FlipLink>
      <FlipLink href="https://linkedin.com/in/vaib215">Linkedin</FlipLink>
      <FlipLink href="https://github.com/vaib215">Github</FlipLink>
      <FlipLink href="https://instagram.com/thisis_vaib">Instagram</FlipLink>
    </section>
  );
};
