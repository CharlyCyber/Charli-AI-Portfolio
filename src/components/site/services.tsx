"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { MaskLines, Reveal, EASE_OUT } from "./anim";
import { SpecialText } from "@/components/ui/special-text";
import { HoverImg, type HoverImgItem } from "@/components/block/hover-img";
import { LazyVideo } from "@/components/ui/lazy-video";

/* ── Servicios (info íntegra, en español) ─────────────────────
   La lista se presenta bajo el estilo Obsidian UI «hover-img»
   (ver block/hover-img.tsx): al pasar el cursor por una fila, su
   imagen HD sigue al puntero; al acercarse al «+» la imagen se
   desvanece; el «+» expande descripción, tags y enlace.
   v1.39+: sin pestaña «Capacidades» — las 4 filas de servicios
   se muestran directamente. */
type Service = {
  n: string;
  title: string;
  label: string;
  tags: string[];
  desc: string;
  img: string;
  alt: string;
};

const SERVICES: Service[] = [
  {
    n: "1",
    title: "Sistemas creativos con IA",
    label: "Conceptos visuales y dirección artística",
    tags: ["Conceptos visuales", "Dirección artística", "Diseño premium", "Adaptación multiformato"],
    desc: "Desarrollo de conceptos visuales, dirección artística y producción de diseño gráfico premium para campañas y comunicación digital: ideación, generación, selección, refinamiento y adaptación de piezas.",
    img: "/images/svc-food.webp",
    alt: "Lata de Pringles sabor pizza con el alimento en escena sobre la landing «Pizza Flavour» — dirección artística de campaña de alimentos",
  },
  {
    n: "2",
    title: "Automatización y agentes de IA",
    label: "Bots, workflows e integraciones de APIs",
    tags: ["Agentes", "Bots", "Workflows", "Integración de APIs"],
    desc: "Diseño e implementación de agentes, bots, workflows e integraciones entre APIs para automatizar procesos, organizar información y reducir tareas manuales.",
    img: "/images/svc-automation.jpg",
    alt: "Cabezales robóticos de una máquina automatizada sobre una placa de circuito verde — automatización e integraciones",
  },
  {
    n: "3",
    title: "Experiencias web con IA",
    label: "Landings, sitios y producto digital",
    tags: ["Landing pages", "Sitios web", "Responsive", "Interactivo"],
    desc: "Diseño y desarrollo de landing pages, sitios web y experiencias digitales personalizadas, responsive e interactivas, con atención a la usabilidad, el rendimiento y los objetivos del negocio.",
    img: "/images/svc-laptop.webp",
    alt: "Portátil con la web de Ouaken de compostaje inteligente en pantalla — diseño y desarrollo de experiencias web",
  },
  {
    n: "4",
    title: "Investigación y redacción",
    label: "Research, síntesis y contenidos",
    tags: ["Research asistida por IA", "Síntesis", "Análisis de tendencias", "Contenidos"],
    desc: "Investigación asistida por IA, síntesis y organización de información, análisis de herramientas y tendencias, y redacción de contenidos para proyectos digitales y comunicación profesional.",
    img: "/images/svc-research.jpg",
    alt: "Mano escribiendo en una agenda con portátil encendido al fondo — investigación y redacción asistidas",
  },
];

export function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="servicios" className="bg-paper-dim py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <Reveal>
          <p className="label-caps">
            <SpecialText inView speed={15}>
              Servicios &amp; Capacidades
            </SpecialText>
          </p>
        </Reveal>
        <MaskLines
          as="h2"
          className="display-2 mt-5 max-w-4xl"
          lines={[
            <>Servicios creativos y técnicos</>,
            <>
              para marcas que usan <span className="italic font-normal">IA</span>
            </>,
          ]}
        />

        {/* Motion strip — motion gráfico estilo After Effects: muro de
            pantallas con test patterns, glitch y datos (Mixkit 4192).
            Sustituye a la aurora: misma energía que el resto del sitio. */}
        <Reveal delay={0.2} className="mt-10">
          <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-[28px] bg-[#0a0a0b] sm:aspect-[21/6]">
            <LazyVideo
              src="/videos/mixkit-4192-screens.mp4"
              poster="/images/mixkit-4192-screens-poster.jpg"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-7">
              <div>
                <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                  <span className="size-1.5 rounded-full bg-lime" />{" "}
                  <SpecialText inView>AI Motion</SpecialText>
                </span>
                <p className="text-[clamp(1.1rem,2.4vw,1.8rem)] font-medium leading-tight tracking-tight text-white">
                  Dirección creativa que respira
                </p>
              </div>
              <span className="rounded-full bg-lime px-4 py-2 text-[12px] font-semibold text-ink">
                <SpecialText inView delay={0.25}>
                  Loop · Motion
                </SpecialText>
              </span>
            </div>
          </div>
        </Reveal>

        {/* List — sin pestañas (v1.39 eliminó «Capacidades»): las 4
            filas de servicios se muestran directamente. */}
        <div className="relative mt-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <HoverImg
              items={SERVICES.map<HoverImgItem>((s) => {
                const isOpen = expanded === s.title;
                return {
                  title: s.title,
                  label: s.label,
                  imageSrc: s.img,
                  imageAlt: s.alt,
                  open: isOpen,
                  action: (
                    <button
                      onClick={() => setExpanded(isOpen ? null : s.title)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Ocultar" : "Ver"} detalles de ${s.title}`}
                      className={`grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "border-ink bg-ink text-lime"
                          : "border-black/10 bg-white text-ink hover:border-ink hover:bg-ink hover:text-lime"
                      }`}
                    >
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                      >
                        <Plus className="size-4" />
                      </motion.span>
                    </button>
                  ),
                  extra: (
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pt-4 text-[14.5px] leading-relaxed text-ink-soft">
                            {s.desc}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {s.tags.map((t, ti) => (
                              <span
                                key={t}
                                className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-ink-soft ring-1 ring-black/[0.06]"
                              >
                                <SpecialText
                                  inView
                                  delay={ti * 0.07}
                                  speed={16}
                                >
                                  {t}
                                </SpecialText>
                              </span>
                            ))}
                          </div>
                          <a
                            href="#proyecto-en-mente"
                            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold link-sweep"
                          >
                            <SpecialText inView speed={15}>
                              Solicitar este servicio
                            </SpecialText>
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ),
                };
              })}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
