"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BellRing,
  Bot,
  Check,
  ClipboardList,
  FileSearch,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Package,
  Send,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
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

/* ── v1.49 — Pestañas de categorías dentro de Tarifas ─────────
   Cuatro categorías en el mismo bloque (documento de tarifas del
   cliente): 01 Web & Desarrollo conserva EXACTAMENTE la oferta
   actual (mismas tarjetas, importes y pestañas CUP/USD); se
   añaden 02 Contenido & Creatividad (planes mensuales que usan
   las MISMAS pestañas Nacional/CUP · Internacional/USD de la
   cabecera), 03 Automatización & Bots y 04 Sistemas & Análisis
   (sin precios fijos: «Solicitar cotización»). */
type CurrencyTab = "intl" | "cu";

const CATEGORIES = [
  { id: "web", num: "01", label: "Web & Desarrollo", short: "Web" },
  { id: "contenido", num: "02", label: "Contenido & Creatividad", short: "Contenido" },
  { id: "auto", num: "03", label: "Automatización & Bots", short: "Bots" },
  { id: "sistemas", num: "04", label: "Sistemas & Análisis", short: "Sistemas" },
] as const;

type Category = (typeof CATEGORIES)[number]["id"];

/* ── 02 · Contenido & Creatividad ───────────────────────────── */
type ContentPlan = {
  tag: string;
  name: string;
  price: string;
  currency: string;
  description: string;
  features: string[];
  ideal: string;
};

const CONTENT_PLANS: Record<CurrencyTab, ContentPlan> = {
  cu: {
    tag: "Plan Nacional",
    name: "Impulso Digital",
    price: "9.500",
    currency: "CUP/mes",
    description:
      "Para emprendedores y pequeños negocios que necesitan mantener una presencia visual activa y profesional.",
    features: [
      "8 piezas gráficas para publicaciones en redes sociales.",
      "8 adaptaciones de esas piezas al formato de historias.",
      "4 textos publicitarios breves con llamadas a la acción.",
      "Calendario mensual de contenido.",
      "1 creatividad promocional con apoyo de IA.",
      "2 vídeos verticales sencillos estilo Motion Graphics.",
      "1 ronda de ajustes por entrega mensual.",
    ],
    ideal: "tiendas, cafeterías, restaurantes, profesionales y emprendimientos locales.",
  },
  intl: {
    tag: "Plan Internacional",
    name: "Contenido Global",
    price: "49",
    currency: "USD/mes",
    description:
      "Para emprendedores, marcas personales y pequeñas empresas que necesitan contenido comercial constante y práctico.",
    features: [
      "8 piezas gráficas personalizadas para publicaciones en redes sociales.",
      "8 adaptaciones al formato vertical de historias.",
      "4 textos publicitarios breves con llamadas a la acción.",
      "Calendario mensual de contenido.",
      "2 imágenes comerciales con IA a partir de referencias de productos proporcionadas.",
      "2 vídeos verticales sencillos estilo Motion Graphics.",
      "Hasta 2 rondas de ajustes.",
    ],
    ideal: "marcas personales, emprendedores y pequeñas empresas.",
  },
};

const VIDEO_SPEC: [string, string][] = [
  ["Cantidad", "2 vídeos al mes por suscripción."],
  ["Formato", "vertical 9:16."],
  ["Duración", "6 a 10 segundos cada uno."],
  ["Estilo", "Motion Graphics básico, textos animados, transiciones sencillas y elementos gráficos."],
  ["Uso", "promociones cortas de productos, servicios, ofertas o mensajes de marca."],
];

const PLAN_LIMITS =
  "No incluye grabación presencial, rodaje, locución profesional, animación 3D, efectos complejos, edición audiovisual avanzada, publicación de contenido ni administración de cuentas. El cliente debe proporcionar la información, precios, logotipos y fotografías de los productos cuando corresponda.";

const MONTHLY_CONDITIONS: string[] = [
  "Los paquetes cubren únicamente los entregables enumerados para cada mes.",
  "Las solicitudes adicionales, cambios fuera de las rondas incluidas o entregables extra se cotizan por separado.",
  "No incluye inversión publicitaria, gestión de mensajes, publicación en redes ni suscripciones de terceros.",
  "Los plazos de producción se coordinan después de recibir toda la información y los materiales del cliente.",
];

/* Tarjeta informativa pequeña (especificaciones, límites y
   condiciones de la pestaña de contenido). */
function InfoCard({
  title,
  delay = 0,
  children,
}: {
  title: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
      className="h-full rounded-[24px] border border-black/[0.08] bg-white p-6"
    >
      <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.12em]">
        <SpecialText>{title}</SpecialText>
      </h4>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

const bulletDot = (
  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink/40" aria-hidden="true" />
);

function ContenidoPanel({ currency }: { currency: CurrencyTab }) {
  const plan = CONTENT_PLANS[currency];
  return (
    <div className="mt-12">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="mx-auto max-w-2xl text-center text-[15px] leading-relaxed text-ink-soft"
      >
        Suscripciones mensuales de contenido comercial para negocios, marcas
        personales y emprendimientos.
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.article
          key={currency}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="relative mx-auto mt-10 max-w-4xl"
        >
          <span className="absolute -top-3 left-7 z-20 rounded-full bg-lime px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            <SpecialText inView>Tarifa de lanzamiento</SpecialText>
          </span>
          <GradientBlobCard tone="dark" blobDelay={0}>
            <div className="grid gap-9 p-7 text-white sm:p-9 lg:grid-cols-[1fr_1.35fr]">
              <div className="flex flex-col">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-lime">
                  <SpecialText inView speed={15}>{plan.tag}</SpecialText>
                </p>
                <h3 className="mt-2.5 text-[22px] font-semibold tracking-tight">
                  <SpecialText inView speed={17}>{plan.name}</SpecialText>
                </h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-[clamp(2.4rem,4vw,3.4rem)] font-medium leading-none tracking-tight text-lime">
                    {plan.price}
                  </span>
                  <span className="text-[13px] font-medium text-white/60">
                    <SpecialText inView delay={0.3}>{plan.currency}</SpecialText>
                  </span>
                </p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-white/75">
                  {plan.description}
                </p>
                <p className="mt-4 text-[12.5px] leading-relaxed text-white/60">
                  <span className="font-semibold text-white/85">Ideal para: </span>
                  {plan.ideal}
                </p>
                <div className="mt-auto pt-8">
                  <FlipGroup className="block">
                    <a
                      href="#proyecto-en-mente"
                      className="group inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-lime px-6 py-3.5 text-[14px] font-semibold text-ink transition-transform duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      <span>{flipWords("Empezar proyecto")}</span>
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </FlipGroup>
                </div>
              </div>
              <div>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-white/85">
                  <SpecialText inView>Incluye cada mes</SpecialText>
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((f, fi) => (
                    <li key={f} className="fm-wrap flex items-start gap-2.5 text-[13.5px] leading-snug">
                      <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-lime/20 text-lime">
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      <span className="text-white/80">
                        <SpecialText inView delay={0.2 + fi * 0.05} speed={11}>{f}</SpecialText>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GradientBlobCard>
        </motion.article>
      </AnimatePresence>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <InfoCard title="Especificación de los vídeos" delay={0.08}>
          <ul className="space-y-2.5 text-[13px] leading-relaxed text-ink-soft">
            {VIDEO_SPEC.map(([k, v]) => (
              <li key={k} className="flex gap-2.5">
                {bulletDot}
                <span>
                  <strong className="font-semibold text-ink">{k}: </strong>
                  {v}
                </span>
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard title="Límites del servicio" delay={0.16}>
          <p className="text-[13px] leading-relaxed text-ink-soft">{PLAN_LIMITS}</p>
        </InfoCard>
        <InfoCard title="Condiciones de los planes mensuales" delay={0.24}>
          <ul className="space-y-2.5 text-[13px] leading-relaxed text-ink-soft">
            {MONTHLY_CONDITIONS.map((c) => (
              <li key={c} className="flex gap-2.5">
                {bulletDot}
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>
    </div>
  );
}

/* ── 03/04 · Servicios a cotizar ────────────────────────────── */
type ServiceItem = { icon: LucideIcon; title: string; text: string };
type ServiceGroup = { intro: string; services: ServiceItem[]; tarifa: string };

const AUTOMATIZACION: ServiceGroup = {
  intro:
    "Implementación de herramientas ligeras que ayudan a reducir tareas repetitivas y mejorar la atención a clientes.",
  services: [
    {
      icon: ClipboardList,
      title: "Automatización de formularios",
      text: "Recibir solicitudes y organizar los datos en hojas de cálculo.",
    },
    {
      icon: BellRing,
      title: "Notificaciones automáticas",
      text: "Avisos de nuevos pedidos, registros o consultas.",
    },
    {
      icon: Send,
      title: "Bots de Telegram",
      text: "Preguntas frecuentes, consulta de catálogos, registro de pedidos y búsqueda de información.",
    },
    {
      icon: Bot,
      title: "Asistentes sencillos con IA",
      text: "Apoyo para responder consultas o localizar información en documentos, cuando exista una opción técnica viable.",
    },
    {
      icon: Workflow,
      title: "Flujos entre herramientas",
      text: "Conexión de formularios, hojas de cálculo, correo y otros servicios compatibles.",
    },
  ],
  tarifa:
    "Cotización personalizada según funcionalidades, complejidad, volumen de uso e integraciones necesarias.",
};

const SISTEMAS: ServiceGroup = {
  intro:
    "Herramientas sencillas para registrar, visualizar y comprender mejor la actividad de un negocio.",
  services: [
    {
      icon: Package,
      title: "Control de inventario",
      text: "Registro de productos, existencias y movimientos.",
    },
    {
      icon: Wallet,
      title: "Ventas y gastos",
      text: "Hojas de cálculo para registrar operaciones y consultar resultados.",
    },
    {
      icon: Users,
      title: "Pedidos y clientes",
      text: "Organización de solicitudes, contactos y estados de seguimiento.",
    },
    {
      icon: LayoutDashboard,
      title: "Dashboards y reportes",
      text: "Indicadores y resúmenes visuales para facilitar decisiones.",
    },
    {
      icon: FileSearch,
      title: "Análisis e investigación",
      text: "Limpieza, organización, análisis y presentación de información.",
    },
    {
      icon: GraduationCap,
      title: "Formación práctica en IA",
      text: "Sesiones para aprender a aplicar herramientas de IA en tareas reales.",
    },
  ],
  tarifa:
    "Cotización personalizada según alcance, datos disponibles y funcionalidades requeridas.",
};

const INFRA_POINTS: string[] = [
  "Priorizar herramientas gratuitas, planes free y arquitecturas serverless cuando sean suficientes para el proyecto.",
  "Opciones posibles según el caso: Google Apps Script y Sheets; Cloudflare Workers, D1 y Cron Triggers; Vercel Functions; APIs y servicios con nivel gratuito.",
  "No prometer VPS, ejecución continua, disponibilidad empresarial 24/7 ni cargas elevadas dentro de una tarifa fija.",
  "Las APIs de pago, consumo de modelos de IA, alojamiento especializado, dominios, suscripciones y servicios externos se presupuestan aparte o se contratan con cuentas del cliente.",
  "Si un proyecto necesita procesos persistentes, alto volumen o infraestructura dedicada, explicar el requisito y solicitar aprobación de un presupuesto adicional antes de implementarlo.",
];

const NOTA_COMERCIAL =
  "Desarrollamos soluciones priorizando herramientas gratuitas y tecnologías de bajo coste. Cada proyecto se evalúa según sus requisitos técnicos y los límites de las plataformas disponibles. Los servicios externos de pago se cotizan por separado.";

/* Bloque técnico común a Automatización & Bots y Sistemas &
   Análisis: infraestructura, condiciones y nota comercial. */
function Infraestructura() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: EASE_OUT }}
      className="mt-5 rounded-[24px] border border-black/[0.08] bg-white p-6 sm:p-7"
    >
      <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.12em]">
        <SpecialText>Infraestructura y condiciones técnicas</SpecialText>
      </h4>
      <ul className="mt-4 grid gap-x-8 gap-y-2.5 text-[13px] leading-relaxed text-ink-soft md:grid-cols-2">
        {INFRA_POINTS.map((t) => (
          <li key={t} className="flex gap-2.5">
            {bulletDot}
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-l-2 border-lime pl-4 text-[13.5px] italic leading-relaxed text-ink">
        &ldquo;{NOTA_COMERCIAL}&rdquo;
      </p>
    </motion.div>
  );
}

function ServiciosPanel({ data }: { data: ServiceGroup }) {
  return (
    <div className="mt-12">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="max-w-2xl text-[15px] leading-relaxed text-ink-soft"
      >
        {data.intro}
      </motion.p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.services.map((s, i) => (
          <motion.article
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 + i * 0.07, ease: EASE_OUT }}
            className="h-full rounded-[24px] border border-black/[0.08] bg-white p-6"
          >
            <span className="grid size-10 place-items-center rounded-full bg-paper-dim text-ink">
              <s.icon className="size-[18px]" strokeWidth={2} />
            </span>
            <h4 className="mt-4 text-[15px] font-semibold tracking-tight">
              <SpecialText inView delay={i * 0.05} speed={16}>{s.title}</SpecialText>
            </h4>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{s.text}</p>
          </motion.article>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: EASE_OUT }}
        className="mt-5 flex flex-wrap items-center justify-between gap-5 rounded-[24px] bg-ink p-6 text-white sm:p-7"
      >
        <div className="min-w-56 max-w-xl">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-lime">
            <SpecialText inView>Tarifa</SpecialText>
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">{data.tarifa}</p>
        </div>
        <FlipGroup>
          <a
            href="#proyecto-en-mente"
            className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-lime px-6 py-3.5 text-[14px] font-semibold text-ink transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            <span>{flipWords("Solicitar cotización")}</span>
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </FlipGroup>
      </motion.div>
      <Infraestructura />
    </div>
  );
}

export function Pricing() {
  const [tab, setTab] = useState<CurrencyTab>("cu");
  /* v1.49: pestaña de categoría activa (01–04). La de moneda
     (Nacional/CUP · Internacional/USD) se mantiene en la
     cabecera y gobierna tanto Web & Desarrollo como los planes
     de Contenido & Creatividad. */
  const [category, setCategory] = useState<Category>("web");
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

        {/* v1.49 — pestañas de categorías (01–04): el cambio es
            interno a Tarifas, sin navegar a otra página. El
            contenido de Web & Desarrollo (debajo) queda intacto. */}
        <Reveal delay={0.2} className="mt-10">
          <div
            role="tablist"
            aria-label="Categorías de servicios"
            className="grid grid-cols-2 gap-1 rounded-[26px] border border-black/[0.08] bg-white p-1 lg:grid-cols-4"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={category === c.id}
                onClick={() => setCategory(c.id)}
                className={`relative flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[13px] font-medium transition-colors duration-300 ${
                  category === c.id ? "text-white" : "text-ink-soft hover:text-ink"
                }`}
              >
                {category === c.id && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  />
                )}
                <span
                  className={`relative z-10 text-[10.5px] font-bold tracking-[0.14em] ${
                    category === c.id ? "text-lime" : "text-ink/35"
                  }`}
                >
                  {c.num}
                </span>
                <span className="relative z-10 hidden md:inline">
                  <SpecialText inView speed={15}>{c.label}</SpecialText>
                </span>
                <span className="relative z-10 md:hidden">
                  <SpecialText inView>{c.short}</SpecialText>
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {category === "web" && (
        <>
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
        </>
        )}

        {category === "contenido" && <ContenidoPanel currency={tab} />}
        {category === "auto" && <ServiciosPanel data={AUTOMATIZACION} />}
        {category === "sistemas" && <ServiciosPanel data={SISTEMAS} />}

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
