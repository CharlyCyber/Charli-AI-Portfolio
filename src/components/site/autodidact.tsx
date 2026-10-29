"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Cpu, MessageCircle, Terminal } from "lucide-react";
import { MaskLines, Reveal } from "./anim";
import { SpecialText } from "@/components/ui/special-text";
import { CurvedLoop } from "@/components/ui/curved-text-loop";
const Lanyard = dynamic(() => import("@/components/ui/lanyard"), {
  ssr: false,
});

const CHAT = [
  { from: "client", text: "¡Hola! Necesito una landing para mi negocio, con animaciones y formularios." },
  { from: "charli", text: "¡Hola! Perfecto. Antes de diseñar, cuéntame tu marca, público y objetivos: la IA acelera el proceso, pero la estrategia la definimos juntos." },
  { from: "client", text: "Me encantaría algo premium, oscuro, con motion." },
  { from: "charli", text: "Vamos con eso. Te preparo concepto visual, estructura orientada a conversión y una primera versión interactiva esta semana." },
];

const MARQUEE_ITEMS = [
  "Generación visual",
  "Prompting avanzado",
  "Agentes de IA",
  "Integraciones de APIs",
  "Bots de Telegram",
  "Workflows",
  "Frontend",
  "Backend",
  "Motion",
  "No-Low-Code",
];

/* Texto de la marquesina curva (CurvedLoop): las mismas palabras
   de siempre, separadas por el punto del componente original. */
const CURVED_TEXT = `${MARQUEE_ITEMS.join(" • ")} • `;

/* ─── Calibración de la tarjeta elástica ──────────────────────────────
   El lienzo del Lanyard cubre TODA la sección (overlay full-section:
   el canvas puede sobresalir de la zona de reposo y estirarse por
   encima de letras, chips y chat). La posición de la tarjeta se define
   como fracciones de ese lienzo, así que este hook mide la sección y
   la zona de reposo con un ResizeObserver y deriva:
   · size        → fracción del alto del lienzo que ocupa la tarjeta
                   (el Lanyard dibuja cardH = size · alto del lienzo).
   · strapLength → fracción que sienta el borde superior de la tarjeta
                   en zoneTop + 24 px (el Lanyard mapea el reposo a
                   cardTop = (0.12 + 0.30·strapLength) · alto del lienzo).
   · anchor      → "photo" (0.77, centro de la columna de la foto en el
                   grid 1.5fr/1fr) en escritorio; "center" en compacto.
   La altura queda acotada (≤400 px escritorio / ≤340 px compacto y
   móvil) y limitada por la propia zona de reposo. */

type CardAnchor = "photo" | "center";

interface CardCalibration {
  size: number;
  strapLength: number;
  anchor: CardAnchor;
}

const CARD_MAX_HEIGHT_DESKTOP = 400;
const CARD_MAX_HEIGHT_COMPACT = 340;
const CARD_TOP_OFFSET = 24;
const STRAP_REST_MIN = 0.12;
const STRAP_REST_SPAN = 0.3;

function useCardCalibration() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [calibration, setCalibration] = useState<CardCalibration | null>(null);
  const [shouldLoadLanyard, setShouldLoadLanyard] = useState(false);

  /* v1.45 — la tarjeta elástica tardaba demasiado y mientras tanto
     se veía la foto estática: el montaje (chunk de three.js +
     texturas) solo empezaba a 500 px de la sección. Ahora arranca
     a 2.500 px O en cuanto el navegador queda en reposo tras la
     carga inicial, lo que ocurra primero — el Lanyard pausa solo
     su rAF fuera de pantalla, así que montarlo antes no cuesta
     animación, solo deja la tarjeta lista al llegar. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadLanyard(true);
        observer.disconnect();
      },
      { rootMargin: "2500px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoadLanyard) return;
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(
        () => setShouldLoadLanyard(true),
        { timeout: 6000 }
      );
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(() => setShouldLoadLanyard(true), 5000);
    return () => clearTimeout(timer);
  }, [shouldLoadLanyard]);

  useEffect(() => {
    const section = sectionRef.current;
    const zone = zoneRef.current;
    if (!section || !zone) return undefined;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    let frame: number | null = null;

    const measure = () => {
      frame = null;
      const sectionBox = section.getBoundingClientRect();
      const zoneBox = zone.getBoundingClientRect();
      if (sectionBox.width < 1 || sectionBox.height < 1) return;

      const zoneTop = zoneBox.top - sectionBox.top;
      if (zoneBox.height < CARD_TOP_OFFSET + 40) return;

      const desktop = desktopQuery.matches;
      const cardHeight = Math.min(
        desktop ? CARD_MAX_HEIGHT_DESKTOP : CARD_MAX_HEIGHT_COMPACT,
        zoneBox.height - CARD_TOP_OFFSET
      );
      const size = Math.min(0.9, Math.max(0.15, cardHeight / sectionBox.height));
      const topRatio = (zoneTop + CARD_TOP_OFFSET) / sectionBox.height;
      const strapLength = Math.min(
        1,
        Math.max(0, (topRatio - STRAP_REST_MIN) / STRAP_REST_SPAN)
      );
      const next: CardCalibration = {
        size,
        strapLength,
        anchor: desktop ? "photo" : "center"
      };

      setCalibration((prev) =>
        prev &&
        prev.size === next.size &&
        prev.strapLength === next.strapLength &&
        prev.anchor === next.anchor
          ? prev
          : next
      );
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    observer.observe(zone);
    desktopQuery.addEventListener("change", schedule);
    measure();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      desktopQuery.removeEventListener("change", schedule);
    };
  }, []);

  return { sectionRef, zoneRef, calibration, shouldLoadLanyard };
}

export function Autodidact() {
  const { sectionRef, zoneRef, calibration, shouldLoadLanyard } = useCardCalibration();
  const [lanyardReady, setLanyardReady] = useState(false);

  return (
    <section
      id="sobre-mi"
      ref={sectionRef}
      className="relative isolate py-20 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6">
        <Reveal>
          <p className="label-caps">
            <SpecialText inView>Sobre mí</SpecialText>
          </p>
        </Reveal>

        <div className="mt-5 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div>
            <MaskLines
              as="h2"
              className="display-2"
              lines={[
                <>Creador tecnológico autodidacta</>,
                <>
                  en la intersección de{" "}
                  <span className="italic font-normal">IA, diseño</span> y{" "}
                  <span className="italic font-normal">código</span>.
                </>,
              ]}
            />
            <Reveal delay={0.15} className="mt-6 max-w-xl">
              <p className="text-[15px] leading-relaxed text-ink-soft sm:text-base">
                Más de 2 años utilizando herramientas de IA con actualización
                constante sobre nuevos modelos, herramientas, técnicas y avances
                del sector. Experiencia práctica con IDEs y entornos de
                programación asistida y agéntica:{" "}
                <strong className="font-semibold text-ink">
                  Cursor, Claude Code, Google Antigravity, OpenCode y Codex
                </strong>
                . Enfoque No-Low-Code: trabajo directamente con código y
                construyo soluciones personalizadas — la IA acelera el flujo,
                pero el criterio técnico y la revisión de resultados siempre son
                humanos.
              </p>
            </Reveal>

            {/* Agent tools chips */}
            <Reveal delay={0.25} className="mt-7">
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: Terminal, label: "Cursor" },
                  { icon: Cpu, label: "Claude Code" },
                  { icon: Code2, label: "Google Antigravity" },
                  { icon: Terminal, label: "OpenCode" },
                  { icon: Cpu, label: "Codex" },
                ].map((t, ti) => (
                  <span
                    key={t.label}
                    className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
                  >
                    <t.icon className="size-3.5 text-ink-soft" />
                    <SpecialText inView delay={ti * 0.07} speed={18}>
                      {t.label}
                    </SpecialText>
                  </span>
                ))}
                <span className="flex items-center rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-lime">
                  <SpecialText inView delay={0.4} speed={18}>
                    Enfoque No-Low-Code
                  </SpecialText>
                </span>
              </div>
            </Reveal>
          </div>

          {/* Zona de reposo de la tarjeta elástica: la foto estática fue
              sustituida por la propia tarjeta 3D (frontal = foto, reverso =
              logo), que cuelga del overlay full-section y reposa aquí —
              sobre esta zona, sin tapar el texto de la izquierda. */}
          <div ref={zoneRef} className="pointer-events-none relative aspect-[4/4.4]" aria-hidden="true">
            {/* Foto estática SOLO como red de seguridad mientras la
                tarjeta 3D pinta su primera textura (con la precarga
                de v1.45 casi nunca se llega a ver) y como fallback
                permanente si WebGL no está disponible. Al estar la
                tarjeta lista se funde, sin el corte brusco de antes. */}
            <div
              className={`absolute inset-0 grid place-items-center transition-opacity duration-700 ease-out ${
                lanyardReady ? "opacity-0" : "opacity-100"
              }`}
            >
              <img
                src="/images/charli-perfil.jpg"
                alt=""
                className="h-auto w-[min(72vw,320px)] rounded-[1.45rem] border border-black/10 object-cover shadow-[0_24px_64px_-30px_rgba(15,16,17,0.55)]"
              />
            </div>
          </div>
        </div>

        {/* Real-time chat mockup */}
        <Reveal className="mt-20" y={50}>
          <div className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-[0_24px_80px_-32px_rgba(15,16,17,0.3)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="live-dot size-2 rounded-full bg-lime-deep" />
                <p className="label-caps !text-ink">
                  <SpecialText inView speed={13}>
                    Colaboración en tiempo real
                  </SpecialText>
                </p>
              </div>
              <MessageCircle className="size-4 text-ink-soft" />
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              {/* client side */}
              <div className="space-y-3">
                {CHAT.filter((m) => m.from === "client").map((m, i) => (
                  <motion.div
                    key={i}
                    className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-paper-dim px-4 py-3 text-[13.5px] leading-relaxed"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.35, duration: 0.5 }}
                  >
                    {m.text}
                  </motion.div>
                ))}
                <motion.span
                  className="block text-right text-[11px] text-ink-soft/60"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <SpecialText inView delay={0.4}>
                    Cliente · ahora
                  </SpecialText>
                </motion.span>
              </div>

              {/* divider */}
              <div className="hidden lg:block">
                <div className="dot-sep h-40 w-[2px]" />
              </div>

              {/* charli side */}
              <div className="space-y-3">
                {CHAT.filter((m) => m.from === "charli").map((m, i) => (
                  <motion.div
                    key={i}
                    className="mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-ink px-4 py-3 text-[13.5px] leading-relaxed text-white"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.35, duration: 0.5 }}
                  >
                    {m.text}
                  </motion.div>
                ))}
                <motion.div
                  className="mr-auto flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <img
                    src="/images/charli-avatar.jpg"
                    alt="Charli"
                    className="size-6 rounded-full object-cover"
                  />
                  <span className="text-[11px] text-ink-soft/60">
                    <SpecialText inView delay={0.9} speed={16}>
                      CHARLI · escribiendo…
                    </SpecialText>
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Marquesina curva (v1.45) — las palabras ya no viajan en
          una tira rectangular: recorren un arco en bucle infinito
          LENTO (CurvedLoop de 21st.dev, ver ui/curved-text-loop).
          Interactiva: arrastrar la curva cambia su velocidad y
          sentido en tiempo real, como en la demo original. La
          lista de habilidades es decorativa aquí (se repite en
          el resto de la sección), por eso va aria-hidden. */}
      <div
        className="relative z-10 mt-16 overflow-hidden border-y border-black/[0.07] bg-white py-6 sm:py-8"
        aria-hidden="true"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <CurvedLoop
            marqueeText={CURVED_TEXT}
            speed={0.55}
            curveAmount={160}
            direction="left"
            interactive
            className="fill-ink"
          />
        </div>
      </div>

      {/* Overlay full-section con la tarjeta elástica: cubre TODA la
          sección (mucho más que la zona de reposo) para que la tarjeta
          pueda estirarse por encima de letras, chips y chat. En móvil
          (hasta lg) la tarjeta viaja POR DETRÁS del contenido
          (z-0 + contenido en z-10): el texto queda siempre legible y
          la tarjeta asoma alrededor; en escritorio (lg:z-30) vuelve a
          quedar por encima como siempre. El Lanyard
          escucha en window y hace hit-testing contra la tarjeta, así que
          el overlay es transparente al puntero y el contenido de abajo
          sigue siendo interactivo. La tarjeta reposa calibrada sobre la
          zona de la derecha (ancla "photo", factor 0.77) con balanceo
          de brisa; un clic la gira (foto ↔ logo). */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:z-30"
        aria-hidden="true"
      >
        {shouldLoadLanyard && calibration && (
          <Lanyard
            frontImage="/images/charli-perfil.jpg"
            backImage="/images/logo-card.webp"
            orientation="portrait"
            finish="glossy"
            metal="silver"
            elasticity={0.55}
            breeze={0.28}
            intro
            size={calibration.size}
            strapLength={calibration.strapLength}
            anchor={calibration.anchor}
            onReady={() => setLanyardReady(true)}
          />
        )}
      </div>
    </section>
  );
}
