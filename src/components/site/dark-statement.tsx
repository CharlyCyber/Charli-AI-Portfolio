"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Counter, MaskLines, Reveal } from "./anim";
import { SpecialText } from "@/components/ui/special-text";
import { LazyVideo } from "@/components/ui/lazy-video";

const STATS = [
  { to: 2, suffix: "+", label: "años de experiencia con herramientas de IA" },
  { to: 3, suffix: "", label: "APIs integradas en un solo bot de Telegram" },
  { to: 5, suffix: "", label: "entornos agénticos de desarrollo dominados" },
  { to: 100, suffix: "%", label: "actualización constante: modelos y benchmarks" },
];

export function DarkStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section
      ref={ref}
      className="noise relative overflow-hidden bg-[#0a0a0b] py-24 text-white sm:py-36"
    >
      {/* motion graphics bg */}
      <motion.div style={{ y: videoY }} className="absolute inset-[-14%]">
        <LazyVideo
          src="/videos/mixkit-44818.mp4"
          poster="/images/mixkit-44818-poster.jpg"
          className="h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/70 via-transparent to-[#0a0a0b]/85" />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <motion.div style={{ y: textY }}>
            <Reveal>
              <p className="label-caps !text-white/50">
                <SpecialText inView speed={15}>
                  Enfoque de trabajo
                </SpecialText>
              </p>
            </Reveal>
            <MaskLines
              as="h2"
              className="display-2 mt-5 !text-white"
              lines={[
                <>La IA integrada en cada proyecto</>,
                <>
                  <span className="italic font-normal text-lime">potencia</span>, mejora y
                  multiplica
                </>,
                <>su impacto — y hoy es indispensable.</>,
              ]}
            />
            <Reveal delay={0.2} className="mt-6 max-w-xl">
              <p className="text-[15px] leading-relaxed text-white/60 sm:text-base">
                Integrarla ya no es una ventaja: es una necesidad obligatoria.
                Acelera cada fase del trabajo —de la ideación a la entrega—,
                eleva la calidad técnica del resultado y amplifica su impacto
                final más allá de lo que cualquier flujo tradicional permite.
              </p>
            </Reveal>
          </motion.div>
        </div>

        {/* Odometer stats */}
        <div className="mt-24 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/10 pt-14 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="relative">
                <span className="absolute -top-2 left-0 h-px w-8 bg-lime" />
                <p className="font-num text-[clamp(3.4rem,6vw,5.5rem)] leading-none text-lime">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-3 max-w-[220px] text-[13px] leading-snug text-white/55">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
