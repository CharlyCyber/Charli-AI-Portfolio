"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, Globe2, MapPin } from "lucide-react";
import { FlipGroup, flipWords } from "@/components/ui/flip-links";
import { MaskLines, Reveal, EASE_OUT } from "./anim";
import { SpecialText } from "@/components/ui/special-text";
import FlowingMenu, { type FlowingMenuItem } from "@/components/ui/flowing-menu";
import GradientBlobCard from "@/components/ui/gradient-bold-card";

type Tier = {
  name: string;
  price: string;
  currency: string;
  period?: string;
  features: string[];
  featured?: boolean;
};

const INTERNATIONAL: Tier[] = [
  {
    name: "Landing Básica",
    price: "$250",
    currency: "USD",
    features: [
      "Diseño personalizado esencial",
      "Versión responsive",
      "Botones de contacto o formulario sencillo",
      "Publicación incluida",
      "1 ronda de cambios",
    ],
  },
  {
    name: "Landing Professional",
    price: "$400",
    currency: "USD",
    features: [
      "Diseño personalizado",
      "Estructura orientada a conversión",
      "Responsive + animaciones e interacciones",
      "SEO básico y publicación",
      "2 rondas de cambios",
      "Soporte menor 7–14 días",
    ],
    featured: true,
  },
  {
    name: "Landing Premium",
    price: "$600",
    currency: "USD",
    features: [
      "Experiencia más elaborada",
      "Motion avanzado e interacciones personalizadas",
      "Integraciones adicionales",
      "Refinamiento técnico",
      "Copywriting a cotizar según alcance",
    ],
  },
];

const CUBA: Tier[] = [
  {
    name: "Landing Sencilla",
    price: "20.000",
    currency: "CUP",
    features: [
      "Estructura esencial",
      "Diseño personalizado sencillo",
      "Adaptación móvil",
      "Botones de contacto",
      "Publicación incluida",
    ],
  },
  {
    name: "Landing Intermedia",
    price: "40.000",
    currency: "CUP",
    features: [
      "Diseño personalizado, varias secciones",
      "Responsive + formulario o contacto",
      "Microinteracciones",
      "SEO básico",
      "2 rondas de cambios",
    ],
    featured: true,
  },
  {
    name: "Landing Premium",
    price: "60.000",
    currency: "CUP",
    features: [
      "Mayor profundidad de diseño y estructura",
      "Animaciones e interacciones avanzadas",
      "Refinamiento técnico",
      "SEO básico",
      "Integraciones sencillas según el proyecto",
    ],
  },
];

/* ── Condiciones comerciales (v1.44 — franjas FlowingMenu) ────
   Cada condición es una franja Obsidian: `title` es la palabra en
   reposo (label Anton vía `.cond-flow` en globals.css), `phrase`
   es el texto ÍNTEGRO de v1.20 que recorre la banda lima (marquee
   hacia la IZQUIERDA a 50 px/s — Recovery-6), `meta` un descriptor
   corto (solo escritorio) e `img` la foto de la franja. El clic
   navega a #proyecto-en-mente — SmoothScroll (Lenis) intercepta el ancla y
   la anima con offset -90; en táctil, el primer toque activa la
   franja (la extensión vive dentro del FlowingMenu). */
type Condition = {
  title: string;
  phrase: string;
  meta: string;
  img: string;
};

const CONDITIONS: Condition[] = [
  {
    title: "Pagos",
    phrase: "50% al comenzar y 50% antes de la entrega o publicación definitiva.",
    meta: "50 / 50",
    img: "/images/hero-02.jpg",
  },
  {
    title: "Alcance",
    phrase:
      "Cada paquete incluye únicamente los entregables y rondas de cambios especificadas.",
    meta: "Por paquete",
    img: "/images/hero-07.jpg",
  },
  {
    title: "Cambios extra",
    phrase: "Los cambios fuera del alcance acordado se presupuestan por separado.",
    meta: "A presupuestar",
    img: "/images/hero-10.jpg",
  },
  {
    title: "Dominio & hosting",
    phrase:
      "Dominio, hosting, suscripciones y servicios de terceros no están incluidos salvo que se especifique.",
    meta: "No incluido",
    img: "/images/hero-12.jpg",
  },
  {
    title: "Proyectos complejos",
    phrase: "Los proyectos complejos reciben un presupuesto personalizado.",
    meta: "A medida",
    img: "/images/about-workspace.jpg",
  },
];

/* Derivado a nivel de módulo (referencia estable entre renders):
   `text` = palabra en reposo, `marquee` = frase que recorre la
   banda lima, `image` = foto de la franja, `link` = ancla #proyecto-en-mente. */
const COND_ITEMS: FlowingMenuItem[] = CONDITIONS.map((c) => ({
  text: c.title,
  marquee: c.phrase,
  meta: c.meta,
  image: c.img,
  link: "#proyecto-en-mente",
}));

/* Marco anti-CLS: reserva la altura exacta de las 5 franjas
   (86/108/120 px por fila) y solo monta el FlowingMenu cuando el
   bloque entra en el viewport (once, 25%). */
function CondicionesFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <div ref={ref} className="cond-flow h-[430px] sm:h-[540px] lg:h-[600px]">
      {inView && (
        <FlowingMenu
          items={COND_ITEMS}
          bgColor="#0f1011"
          textColor="#f3f2ed"
          marqueeBgColor="#c8f24e"
          marqueeTextColor="#0f1011"
          speed={50}
          direction="left"
          stretch={0.3}
          magnet={0.15}
          followCursor={0.4}
          dimInactive={true}
          align="left"
          showIndex={true}
          showArrow={true}
          imageShape="rounded"
          ariaLabel="Condiciones comerciales"
        />
      )}
    </div>
  );
}

export function Pricing() {
  const [tab, setTab] = useState<"intl" | "cu">("cu");
  const tiers = tab === "intl" ? INTERNATIONAL : CUBA;

  return (
    <section id="tarifas" className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <Reveal>
          <p className="label-caps">
            <SpecialText inView>Tarifas</SpecialText>
          </p>
        </Reveal>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
          <MaskLines
            as="h2"
            className="display-2 max-w-xl"
            lines={[<>Precios claros,</>, <>sin sorpresas.</>]}
          />
          <Reveal delay={0.15}>
            <div
              role="tablist"
              aria-label="Moneda de tarifas"
              className="inline-flex rounded-full border border-black/[0.08] bg-white p-1"
            >
              {(
                [
                  ["cu", "Nacional · Cuba (CUP)", MapPin],
                  ["intl", "Internacional · USD", Globe2],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-colors duration-300 sm:px-5 ${
                    tab === id ? "text-white" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {tab === id && (
                    <motion.span
                      layoutId="price-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ duration: 0.45, ease: EASE_OUT }}
                    />
                  )}
                  <Icon className="relative z-10 size-4" />
                  <span className="relative z-10 hidden sm:inline">
                    <SpecialText inView speed={15}>
                      {label}
                    </SpecialText>
                  </span>
                  <span className="relative z-10 sm:hidden">
                    <SpecialText inView>
                      {id === "intl" ? "USD" : "CUP"}
                    </SpecialText>
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mt-12 grid gap-5 lg:grid-cols-3"
          >
            {/* v1.46 — las 3 tarjetas visten el GradientBlobCard
                (ui/gradient-bold-card.tsx): cristal con el blob
                rosa→rojo→amarillo recorriendo las esquinas tras
                el contenido. La destacada usa el tono oscuro del
                componente (ya era la tarjeta tinta); cada blob
                va desincronizado (−i·1,7 s) para que las tres no
                pulsen a la vez. La insignia «Más popular» vive
                FUERA de la caja con overflow-hidden (dentro, el
                −top-3 quedaría recortado por el borde). */}
            {tiers.map((t, i) => (
              <motion.article
                key={t.name}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.09, ease: EASE_OUT }}
                className="relative h-full"
              >
                {t.featured && (
                  <span className="absolute -top-3 left-7 z-20 rounded-full bg-lime px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                    <SpecialText inView>Más popular</SpecialText>
                  </span>
                )}
                <GradientBlobCard
                  tone={t.featured ? "dark" : "light"}
                  blobDelay={-i * 1.7}
                  className="h-full"
                >
                <div
                  className={`flex h-full flex-col p-7 sm:p-8 ${
                    t.featured ? "text-white" : ""
                  }`}
                >
                <h3 className="text-[15px] font-semibold uppercase tracking-[0.1em] opacity-80">
                  <SpecialText inView delay={i * 0.08} speed={17}>
                    {t.name}
                  </SpecialText>
                </h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span
                    className={`text-[clamp(2.4rem,4vw,3.4rem)] font-medium leading-none tracking-tight ${
                      t.featured ? "text-lime" : ""
                    }`}
                  >
                    {t.price}
                  </span>
                  <span
                    className={`text-[13px] font-medium ${
                      t.featured ? "text-white/60" : "text-ink-soft"
                    }`}
                  >
                    <SpecialText inView delay={0.3}>
                      {t.currency}
                    </SpecialText>
                  </span>
                </p>
                <ul className="mt-7 space-y-3">
                  {t.features.map((f, fi) => (
                    /* .fm-wrap (globals.css): pre-wrap para las features
                       de las tarjetas — evita el overflow en ≤360px. */
                    <li
                      key={f}
                      className="fm-wrap flex items-start gap-2.5 text-[13.5px] leading-snug"
                    >
                      <span
                        className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full ${
                          t.featured ? "bg-lime/20 text-lime" : "bg-paper-dim text-ink"
                        }`}
                      >
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      <span className={t.featured ? "text-white/80" : "text-ink-soft"}>
                        <SpecialText inView delay={0.25 + fi * 0.06} speed={11}>
                          {f}
                        </SpecialText>
                      </span>
                    </li>
                  ))}
                </ul>
                {/* mt-auto empuja el botón al fondo → los 3 quedan alineados */}
                <div className="mt-auto pt-8">
                  <FlipGroup className="block">
                    <a
                      href="#proyecto-en-mente"
                      className={`group inline-flex w-full items-center justify-center gap-1.5 rounded-full px-6 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:scale-[1.02] active:scale-95 ${
                        t.featured
                          ? "bg-lime text-ink"
                          : "bg-ink text-white"
                      }`}
                    >
                      <span>{flipWords("Empezar proyecto")}</span>
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </FlipGroup>
                </div>
                </div>
                </GradientBlobCard>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.1} className="mt-8">
          <p className="text-center text-[12.5px] leading-relaxed text-ink-soft">
            El ecommerce, las reservas avanzadas, los backends personalizados y
            las automatizaciones extensas se presupuestan por separado. El
            presupuesto final depende de las integraciones y la complejidad.
          </p>
        </Reveal>

        {/* Condiciones comerciales — franjas interactivas (FlowingMenu):
            cada condición es una franja; hover/toque despliega la banda
            lima con la frase completa recorriendo hacia la IZQUIERDA
            (50 px/s) y el clic navega a #proyecto-en-mente. */}
        <Reveal className="mt-16" y={44}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Condiciones comerciales
            </h3>
            <span className="label-caps">
              <SpecialText inView>Acuerdos claros</SpecialText>
            </span>
          </div>
          <CondicionesFlow />
          <p className="mt-4 text-center text-[12.5px] text-ink-soft">
            <SpecialText inView>Toca o pasa el cursor por cada franja.</SpecialText>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
