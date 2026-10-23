"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { FlipGroup, flipWords } from "@/components/ui/flip-links";
import { MaskLines, Reveal, Magnetic } from "./anim";
import { SpecialText } from "@/components/ui/special-text";

export function CTA() {

  return (
    <section id="contacto" className="px-4 pb-24 pt-8 sm:px-6 sm:pb-32">
      <div className="mx-auto max-w-[1320px]">
        <Reveal y={60}>
          <div className="noise relative overflow-hidden rounded-[28px] bg-[#0a0a0b] px-6 py-20 text-center text-white sm:rounded-[36px] sm:py-32">
            {/* motion graphics bg */}
            <video
              src="/videos/mixkit-47282.mp4"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/60 via-transparent to-[#0a0a0b]/80" />

            <div className="relative">
              <Reveal>
                <p className="label-caps !text-white/50">
                  <SpecialText inView>Contacto</SpecialText>
                </p>
              </Reveal>

              <MaskLines
                as="h2"
                className="display-1 mx-auto mt-6 max-w-4xl !text-white"
                lines={[
                  <>Empieza tu proyecto</>,
                  <>
                    con{" "}
                    <span className="italic font-normal text-lime">CHARLI</span>
                  </>,
                ]}
              />

              <Reveal delay={0.25} className="mt-7">
                <p className="mx-auto max-w-md text-[15px] leading-relaxed text-white/60 sm:text-base">
                  Cuéntame tu idea y recibe una propuesta con alcance, plazos y
                  presupuesto — normalmente en menos de 24 horas.
                </p>
              </Reveal>

              <Reveal delay={0.35} className="mt-10">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Magnetic className="inline-block">
                    <FlipGroup>
                      <a
                        href="mailto:charlicharli984@gmail.com"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-lime px-8 py-4 text-[15px] font-semibold text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-95"
                      >
                        <Mail className="size-4" />
                        <span>{flipWords("Escríbeme")}</span>
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </FlipGroup>
                  </Magnetic>
                  <FlipGroup>
                    <a
                      href="https://wa.me/5353463755"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-[15px] font-medium text-white/90 backdrop-blur transition-colors duration-300 hover:border-white/50 hover:text-white"
                    >
                      <span>{flipWords("WhatsApp directo")}</span>
                    </a>
                  </FlipGroup>
                </div>
              </Reveal>

              <Reveal delay={0.45}>
                <p className="mt-8 font-num text-lg text-white/40">
                  <SpecialText inView delay={0.5} speed={10}>
                    charlicharli984@gmail.com · +53 53463755
                  </SpecialText>
                </p>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
