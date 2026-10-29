"use client";

/* ────────────────────────────────────────────────────────────────
   AboutHorizontal — la sección 2 ("Quién soy") presentada bajo el
   efecto de scroll horizontal anclado: un slide por pilar del
   perfil de CHARLI AI, con palabra gigante (centrada y alineada
   idénticamente en cada slide) y la información (descripción,
   skill bars, credenciales) superpuesta.
   ── v1.44 ──
   Los slides viajan TRANSPARENTES sobre una capa de fondo oscura
   fija (bg #0f1011 con el WebGL Threads de hilos blancos; en v1.47,
   la versión oficial de React Bits — manojo ondulante a 25° que
   reacciona al cursor) pasada por la
   prop `background` del HorizontalScroll; las palabras gigantes son
   text-paper y las tarjetas de info usan la paleta papel sobre ese
   fondo oscuro. El header (título «Quién soy» envuelto en el trazo
   manuscrito scrubbed de HandWrittenTitle) y el footer (solo la
   cita) permanecen sobre papel claro, FUERA del fondo oscuro.
   Todo en español.
   ──────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import HorizontalScroll, {
  type HorizontalScrollSlide,
} from "@/components/ui/horizontal-scroll";
import Threads from "@/components/ui/threads";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { flipWords } from "@/components/ui/flip-links";
import { SpecialText } from "@/components/ui/special-text";

/* ── Bloque de información superpuesto (arriba-izquierda) ──────
   Estilo oscuro sobre el fondo Threads: papel con alfas bajos y
   barra de skill lima. La clase .slide-info del root es la que
   activa el fundido por proximidad del HorizontalScroll en móvil
   (perfil [0,1,0] centrado ±d — primera [1,0], última [0,1]). */
function SlideInfo({
  kicker,
  children,
  skill,
  value,
  chips,
}: {
  kicker: string;
  children: ReactNode;
  skill?: string;
  value?: number;
  chips?: string[];
}) {
  return (
    <div className="slide-info absolute left-5 top-[11vh] z-10 w-[min(300px,74vw)] sm:left-10 sm:top-[13vh] lg:left-14">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-paper/60">
        <SpecialText inView speed={15}>
          {kicker}
        </SpecialText>
      </p>
      <p className="mt-2.5 text-[15px] font-medium leading-snug text-paper/85 sm:text-[16.5px]">
        {children}
      </p>
      {typeof value === "number" && skill ? (
        <div className="mt-4 w-52 max-w-full">
          <div className="flex items-baseline justify-between gap-3 text-[10.5px] font-bold text-paper/60">
            <span className="uppercase tracking-[0.14em]">
              <SpecialText inView speed={14}>
                {skill}
              </SpecialText>
            </span>
            <span className="shrink-0 font-num text-[13px] text-paper/90">
              {value}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper/20">
            <div
              className="h-full rounded-full bg-lime"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ) : null}
      {chips?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-paper/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-paper/85"
            >
              <SpecialText inView speed={15}>
                {chip}
              </SpecialText>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ── La info de la segunda sección, repartida en 5 slides ──────
   Sin className de fondo: los slides son transparentes y dejan ver
   la capa oscura (background) fija debajo del carrusel. */
const SLIDES: HorizontalScrollSlide[] = [
  {
    id: "autodidacta",
    word: "AUTODIDACTA",
    info: (
      <SlideInfo
        kicker="Quién soy · 01"
        chips={["2+ años con IA a diario", "Siempre al día"]}
      >
        Creative technologist que mantiene tu producto{" "}
        <span className="italic">creciendo</span> con IA — autodidacta en la
        intersección de IA, diseño, software y automatización.
      </SlideInfo>
    ),
  },
  {
    id: "prompting",
    word: "PROMPTING",
    info: (
      <SlideInfo kicker="Stack CHARLI · 02" skill="Prompting avanzado" value={96}>
        Ingeniería de prompts avanzada: resultados precisos, evaluables y
        reproducibles con cualquier modelo.
      </SlideInfo>
    ),
  },
  {
    id: "agentes",
    word: "AGENTES",
    info: (
      <SlideInfo
        kicker="Stack CHARLI · 03"
        skill="Agentes & automatización"
        value={92}
      >
        LLMs de vanguardia y Agentes de IA que potencian y automatizan todo
        el trabajo.
      </SlideInfo>
    ),
  },
  {
    id: "codigo",
    word: "CÓDIGO",
    info: (
      <SlideInfo kicker="Stack CHARLI · 04" skill="Frontend & backend" value={88}>
        Código asistido por modelos de IA de vanguardia en entornos
        agénticos, IDEs, Harnés y Skills.
      </SlideInfo>
    ),
  },
  {
    id: "diseno",
    word: "DISEÑO",
    info: (
      <SlideInfo kicker="Stack CHARLI · 05" skill="Dirección artística" value={90}>
        Dirección artística con criterio: identidades y sistemas visuales que
        respiran.
      </SlideInfo>
    ),
  },
];

export function AboutHorizontal() {
  return (
    <HorizontalScroll
      id="quien-soy"
      slides={SLIDES}
      /* Fondo oscuro de todo el tramo (01 AUTODIDACTA → 05 DISEÑO):
         #0f1011 + Threads (v1.47: la versión oficial de React Bits,
         con las props EXACTAS del ejemplo del usuario — manojo de
         hilos blancos a 25° que ondulan y reaccionan al cursor).
         Sustituye al Threads propio anterior de rayas verticales
         soleadas. h-full en el wrapper para que el canvas llene el
         wrapper h-screen del HorizontalScroll. */
      background={
        <div className="h-full bg-[#0f1011]">
          <Threads
            color="#ffffff"
            lineCount={90}
            thickness={0.6}
            softness={1.3}
            amplitude={1.7}
            distance={0.4}
            waves={1.05}
            speed={0.6}
            split={0.04}
            fray={0.5}
            angle={25}
            taper={0.85}
            brightness={1.4}
            parting={0}
            enableMouseInteraction={true}
            fade={0}
            opacity={1}
          />
        </div>
      }
      wordClassName="text-paper"
      headerClassName="relative grid h-[70vh] w-full grid-cols-1 place-content-center overflow-hidden bg-paper px-6 text-center text-ink"
      header={
        <>
          <div
            className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#0f10111c_1px,transparent_1px),linear-gradient(to_bottom,#0f10111c_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
            aria-hidden="true"
          />
          <p className="label-caps relative mb-5">
            <SpecialText inView speed={15}>
              CHARLI AI — Stack &amp; perfil
            </SpecialText>
          </p>
          {/* El trazo manuscrito abraza el H2: HandWrittenTitle acepta
              children y su dibujo está scrubbed por el scroll (se dibuja
              al bajar, retrocede al subir). grid-cols-1 en el header da
              una columna de ancho DEFINIDO: con la columna auto del base
              el track colapsaba al ancho del eyebrow (el H2 envuelto ya
              no define el track) y la caja 2:1 del trazo se encogía. */}
          <HandWrittenTitle>
            <h2 className="display-2 relative">{flipWords("Quién soy")}</h2>
          </HandWrittenTitle>
        </>
      }
      footerClassName="grid place-content-center gap-3 bg-paper px-6 py-16 text-center text-ink"
      footer={
        <p className="mx-auto max-w-xl text-[15px] font-medium leading-relaxed text-ink/80 sm:text-base">
          “Construyo experiencias digitales, sistemas creativos y
          automatizaciones potenciadas por IA.”
        </p>
      }
    />
  );
}
