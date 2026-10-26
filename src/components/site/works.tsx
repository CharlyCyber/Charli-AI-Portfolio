"use client";

/* ────────────────────────────────────────────────────────────────
   Works — "Proyectos destacados".
   Los 3 proyectos se presentan bajo el efecto Skiper 17
   "StickyCard_002": tarjetas apiladas y ancladas (pin) que, con el
   scroll, hacen que la tarjeta actual se encoja y rote mientras la
   siguiente sube desde abajo (GSAP ScrollTrigger + scrub).
   Adaptaciones de integración:
   · sin <ReactLenis root>: el sitio ya provee Lenis global
     (SmoothScroll); se sincroniza vía window.__lenis
   · gsap.context + cleanup (StrictMode-safe)
   · end funcional para recalcular al redimensionar
   Créditos del efecto: Skiper UI (@gurvinder-singh02) — uso libre
   con atribución.
   ──────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Terminal,
} from "lucide-react";
import { MaskLines, Reveal } from "./anim";
import { SpecialText } from "@/components/ui/special-text";

gsap.registerPlugin(ScrollTrigger);

type WorkLink = {
  label: string;
  url: string;
  /** Etiqueta corta (p. ej. «Nuevo» / «Antiguo») */
  tag?: string;
};

type Work = {
  name: string;
  desc: string;
  /** Imagen de fondo a sangre completa */
  img?: string;
  alt?: string;
  /** Capturas reales flotando sobre fondo oscuro (demo) */
  shots?: string[];
  shotAlts?: string[];
  /** Muestra de diseño web en marco de navegador flotante */
  mockup?: { img: string; alt: string; url: string; host: string };
  /** Enlaces externos (chips bajo la descripción) */
  links?: WorkLink[];
  /** Repositorio GitHub (se muestra como `gh repo clone …`) */
  repo?: string;
  year: string;
  niche: string;
};

const WORKS: Work[] = [
  {
    name: "Telegram Intelligence Bot",
    desc: "Sistema que integra tres APIs para recuperar, organizar y presentar información audiovisual con imágenes a partir de una sola llamada.",
    shots: ["/images/telegram-demo-1.jpg", "/images/telegram-demo-2.jpg"],
    shotAlts: [
      "Bot Audiovisual en Telegram: búsqueda de Matrix con la lista numerada de coincidencias",
      "Bot Audiovisual en Telegram: ficha de Matrix (1999) con póster, tipo y sinopsis",
    ],
    repo: "CharlyCyber/Telegram-Visual-Bot",
    year: "2025",
    niche: "Bots & APIs",
  },
  {
    name: "AI Intelligence Agent",
    desc: "Agente orientado al seguimiento de novedades de IA y rankings de benchmarks, para facilitar la investigación y mantenerse actualizado.",
    img: "/images/work-ranking.jpg",
    alt: "Leaderboard del Ranking-IA: puntuaciones ELO de GPT-5.2, Claude Opus 4.5, Gemini 3 Pro, Grok 4.1 y DeepSeek V4, difuminado hacia abajo",
    repo: "CharlyCyber/Ranking-IA",
    year: "2026",
    niche: "AI Agents",
  },
  {
    name: "Diseños Webs",
    desc: "Diseño web a medida: identidades visuales, landings y portafolios reales desplegados en línea — del concepto al código.",
    mockup: {
      img: "/images/work-disenos-web.jpg",
      alt:
        "Muestra de diseño web: página de inicio de pupita's, gestora de redes sociales, con titular grande y elementos flotantes",
      url: "https://pupitas-manager.vercel.app",
      host: "pupitas-manager.vercel.app",
    },
    links: [
      {
        label: "pupitas-manager.vercel.app",
        url: "https://pupitas-manager.vercel.app",
        tag: "Nuevo",
      },
      {
        label: "portafolio-charli.vercel.app",
        url: "https://portafolio-charli.vercel.app",
        tag: "Antiguo",
      },
    ],
    year: "2026",
    niche: "Diseño Web",
  },
];

/* ── Chip de repositorio: comando `gh repo clone` + copiar ──── */
function RepoChip({ repo }: { repo: string }) {
  const [copied, setCopied] = useState(false);
  const cmd = `gh repo clone ${repo}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      /* fallback para contextos sin Clipboard API */
      const ta = document.createElement("textarea");
      ta.value = cmd;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mt-3 flex w-full max-w-lg items-stretch gap-2">
      <a
        href={`https://github.com/${repo}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Ver el repositorio ${repo} en GitHub`}
        className="group/repo flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-sm transition-colors duration-300 hover:border-lime/60"
      >
        <Terminal className="size-3.5 shrink-0 text-lime" aria-hidden="true" />
        <code className="min-w-0 flex-1 truncate font-mono text-[11px] leading-none text-white/85 sm:text-[11.5px]">
          <SpecialText inView speed={10}>
            {cmd}
          </SpecialText>
        </code>
        <ArrowUpRight
          className="ml-auto hidden size-3.5 shrink-0 text-white/40 transition-colors duration-300 group-hover/repo:text-lime sm:block"
          aria-hidden="true"
        />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar comando de clonación"
        className="flex shrink-0 cursor-pointer items-center rounded-lg border border-white/15 bg-black/45 px-2.5 text-white/60 backdrop-blur-sm transition-colors duration-300 hover:border-lime/60 hover:text-lime"
      >
        {copied ? (
          <Check className="size-3.5 text-lime" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/* ── Chips de enlaces externos (muestras desplegadas en línea) ── */
function LinkChips({ links }: { links: WorkLink[] }) {
  return (
    <div className="mt-3 grid w-full max-w-lg gap-2">
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Abrir ${l.label} en una pestaña nueva`}
          className="group/link flex items-center gap-2 rounded-lg border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-sm transition-colors duration-300 hover:border-lime/60"
        >
          <ArrowUpRight
            className="size-3.5 shrink-0 text-lime"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] leading-none text-white/85 sm:text-[11.5px]">
            <SpecialText inView speed={11}>
              {l.label}
            </SpecialText>
          </span>
          {l.tag ? (
            <span
              className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-white/55 transition-colors duration-300 group-hover/link:bg-lime/15 group-hover/link:text-lime"
            >
              <SpecialText inView delay={0.3}>
                {l.tag}
              </SpecialText>
            </span>
          ) : null}
        </a>
      ))}
    </div>
  );
}

/* ── Stack anclado de tarjetas (efecto Skiper 17) ─────────────── */
function StickyWorks({ works }: { works: typeof WORKS }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    const cards = cardRefs.current;
    if (!container || !sticky || !cards[0]) return;

    const ctx = gsap.context(() => {
      /* estado inicial: la primera tarjeta visible, las demás
         apiladas por debajo (desplazadas al 100% de su altura) */
      gsap.set(cards[0], { y: "0%", scale: 1, rotation: 0 });
      for (let i = 1; i < cards.length; i++) {
        if (cards[i]) {
          gsap.set(cards[i], { y: "100%", scale: 1, rotation: 0 });
        }
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sticky,
          start: "top top",
          end: () => `+=${window.innerHeight * (cards.length - 1)}`,
          pin: true,
          scrub: 0.5,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      /* en cada transición: la tarjeta actual se encoge y rota
         mientras la siguiente sube desde abajo */
      for (let i = 0; i < cards.length - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];
        if (!current || !next) continue;

        timeline.to(
          current,
          { scale: 0.7, rotation: 5, duration: 1, ease: "none" },
          i,
        );
        timeline.to(next, { y: "0%", duration: 1, ease: "none" }, i);
      }
    }, container);

    /* sincronía con el Lenis global del sitio */
    const lenis = (
      window as unknown as {
        __lenis?: {
          on: (event: string, cb: () => void) => void;
          off: (event: string, cb: () => void) => void;
        };
      }
    ).__lenis;
    const onLenisScroll = () => ScrollTrigger.update();
    lenis?.on("scroll", onLenisScroll);

    /* recalcular al redimensionar / al terminar la carga */
    const onResize = () => ScrollTrigger.refresh();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    window.addEventListener("load", onResize);

    return () => {
      lenis?.off("scroll", onLenisScroll);
      window.removeEventListener("load", onResize);
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={stickyRef}
        className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden p-3 lg:p-8"
      >
        <div className="relative h-[90%] max-h-[900px] w-full max-w-sm overflow-hidden rounded-[24px] bg-ink shadow-[0_48px_96px_-40px_rgba(15,16,17,0.5)] sm:max-w-md sm:rounded-[28px] md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
          {works.map((work, i) => (
            <article
              key={work.name}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 overflow-hidden rounded-[24px] will-change-transform sm:rounded-[28px]"
            >
              {/* visual: capturas reales flotantes (demo), muestra
                  de diseño web en marco de navegador, o imagen de
                  fondo a sangre completa */}
              {work.shots ? (
                <>
                  {/* fondo oscuro limpio con brillo lima — las capturas
                      de la demo destacan sobre él */}
                  <div
                    className="absolute inset-0 bg-[#0f1011]"
                    style={{
                      background:
                        "radial-gradient(62% 42% at 72% 8%, rgba(200,242,78,0.11), transparent 70%), radial-gradient(52% 32% at 12% 92%, rgba(200,242,78,0.05), transparent 70%), #0f1011",
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0">
                    {work.shots.map((shot, k) => (
                      <img
                        key={shot}
                        src={shot}
                        alt={work.shotAlts?.[k] ?? ""}
                        draggable={false}
                        className={`absolute w-[43%] max-w-[218px] rounded-xl border border-white/15 object-cover object-top shadow-[0_28px_56px_-18px_rgba(0,0,0,0.75)] ${
                          k === 0
                            ? "left-[5%] top-[7%] -rotate-2"
                            : "right-[5%] top-[11%] rotate-2"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : work.mockup ? (
                <>
                  {/* fondo oscuro con brillo cálido — la muestra de
                      diseño web (marco de navegador) destaca sobre él */}
                  <div
                    className="absolute inset-0 bg-[#0f1011]"
                    style={{
                      background:
                        "radial-gradient(60% 42% at 50% 24%, rgba(251,146,60,0.14), transparent 70%), radial-gradient(52% 32% at 10% 94%, rgba(200,242,78,0.05), transparent 70%), #0f1011",
                    }}
                    aria-hidden="true"
                  />
                  <a
                    href={work.mockup.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Ver el diseño ${work.mockup.host} en una pestaña nueva`}
                    className="group/mock absolute left-1/2 top-[7%] block w-[94%] max-w-[580px] -translate-x-1/2 -rotate-[1.6deg] overflow-hidden rounded-xl border border-white/15 bg-[#17181a] shadow-[0_36px_72px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 hover:rotate-0 hover:border-lime/50 sm:top-[9%] sm:w-[90%]"
                  >
                    {/* barra de navegador */}
                    <span className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <span className="size-2 rounded-full bg-white/25" />
                        <span className="size-2 rounded-full bg-white/25" />
                        <span className="size-2 rounded-full bg-white/25" />
                      </span>
                      <span className="ml-1 min-w-0 flex-1 truncate rounded-md bg-black/45 px-2.5 py-1 text-center font-mono text-[9.5px] leading-none text-white/55 sm:text-[10.5px]">
                        <SpecialText inView speed={11}>
                          {work.mockup.host}
                        </SpecialText>
                      </span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 text-white/35 transition-colors duration-300 group-hover/mock:text-lime"
                        aria-hidden="true"
                      />
                    </span>
                    <img
                      src={work.mockup.img}
                      alt={work.mockup.alt}
                      draggable={false}
                      className="block w-full select-none"
                    />
                  </a>
                </>
              ) : (
                <img
                  src={work.img}
                  alt={work.alt}
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-cover"
                />
              )}

              {/* gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/25" />

              {/* índice */}
              <span className="font-num absolute right-6 top-6 text-[13px] font-medium text-white/80 sm:right-8 sm:top-8">
                0{i + 1} <span className="text-white/40">/ 0{works.length}</span>
              </span>

              {/* nombre + metadatos */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-lime px-3 py-1 text-[11px] font-semibold text-ink">
                    <SpecialText inView>
                      {work.niche}
                    </SpecialText>
                  </span>
                  <span className="font-num text-[12px] font-medium text-white/70">
                    {work.year}
                  </span>
                </div>
                <h3 className="mt-3 text-[clamp(1.45rem,3vw,2.3rem)] font-medium leading-none tracking-tight text-white">
                  {work.name}
                </h3>
                <p className="mt-2.5 line-clamp-3 max-w-md text-[13px] leading-relaxed text-white/75 sm:text-sm">
                  {work.desc}
                </p>
                {work.repo ? <RepoChip repo={work.repo} /> : null}
                {work.links ? <LinkChips links={work.links} /> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Works() {
  return (
    <section id="proyectos" className="py-20 sm:py-28">
      <div className="relative z-40 mx-auto max-w-[1320px] bg-paper px-4 sm:px-6">
        <Reveal>
          <p className="label-caps">
            <SpecialText inView>
              Proyectos
            </SpecialText>
          </p>
        </Reveal>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <MaskLines
            as="h2"
            className="display-2"
            lines={[<>Proyectos destacados</>]}
          />
          <Reveal delay={0.2}>
            <a
              href="#contacto"
              className="group flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-[14px] font-medium transition-all duration-300 hover:border-ink hover:bg-ink hover:text-white"
            >
              <SpecialText inView speed={15}>
                Ver todos los trabajos
              </SpecialText>
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>

      {/* ── Los 3 proyectos bajo el efecto de tarjetas apiladas ── */}
      <div className="mt-10 sm:mt-14">
        <StickyWorks works={WORKS} />
      </div>

      {/* ── Motion gallery: un único vídeo grande horizontal ──
          `relative z-40` sube esta pantalla por ENCIMA del trazo que
          se dibuja con el scroll (overlay del ScrollStroke a z-30):
          la línea pasa por detrás de la pantalla de Motion & Diseño
          Gráfico. Va en el contenedor (por encima del Reveal, cuyo
          transform crearía su propio contexto de apilamiento) para
          competir directamente con el overlay en el contexto raíz. */}
      <div className="relative z-40 mx-auto mt-6 max-w-[1320px] px-4 sm:mt-8 sm:px-6">
        <MotionCard
          index={WORKS.length}
          src="/videos/works-ticker.mp4"
          title="Motion & Diseño Gráfico"
          desc="Collage en movimiento con piezas de diseño gráfico seleccionadas: carteles, flyers y sistemas visuales para marcas reales."
          tag="Motion Gallery"
          chip="Showreel en loop"
        />
      </div>
    </section>
  );
}

function MotionCard({
  index,
  src,
  title,
  desc,
  tag,
  chip,
}: {
  index: number;
  src: string;
  title: string;
  desc: string;
  tag: string;
  chip: string;
}) {
  return (
    <Reveal delay={index * 0.08} y={60}>
      <motion.article
        className="group relative cursor-view"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* vídeo grande horizontal: 16/9 nativo (works-ticker es
            1600×900) → sin recortes, a todo el ancho del contenedor */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#0a0a0b] sm:rounded-[28px]">
          <motion.video
            src={src}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            variants={{ rest: { scale: 1 }, hover: { scale: 1.03 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

          {/* label overlay */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
            <motion.h3
              className="text-[clamp(1.2rem,2.6vw,2rem)] font-medium leading-none tracking-tight text-white"
              variants={{ rest: { y: 0 }, hover: { y: -4 } }}
              transition={{ duration: 0.4 }}
            >
              {title}
            </motion.h3>
            <motion.span
              className="flex shrink-0 items-center gap-2 rounded-full bg-lime px-4 py-2 text-[12px] font-semibold text-ink opacity-0"
              variants={{
                rest: { opacity: 0, y: 14, scale: 0.9 },
                hover: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {chip} <ArrowUpRight className="size-3.5" />
            </motion.span>
          </div>
        </div>

        {/* metadata row */}
        <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4 px-1">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-ink-soft sm:text-sm">
            {desc}
          </p>
          <span className="rounded-full bg-paper-dim px-3.5 py-1.5 text-[12px] font-medium text-ink">
            <SpecialText inView speed={16}>
              {tag}
            </SpecialText>
          </span>
        </div>
      </motion.article>
    </Reveal>
  );
}
