"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Instagram,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { FlipGroup, flipWords } from "@/components/ui/flip-links";
import { Magnetic, Reveal } from "./anim";
import { SpecialText } from "@/components/ui/special-text";
import Squares from "@/components/ui/squares";

const SERVICES = [
  "AI Creative Systems",
  "AI Automation & Agents",
  "AI Web Experiences",
  "Investigación y redacción",
];

const CAPS = [
  "Generación visual",
  "Prompting avanzado",
  "Bots de Telegram",
  "Frontend & backend",
  "Workflows",
  "Entornos agénticos",
];

/* ── Fondo 3D del bloque «¿Tienes un proyecto en mente?» ──────
   Malla de cuadrados (Squares, React Bits): las celdas se elevan
   hacia el cursor y se tiñen de verde apagado (#39451f sobre base
   #111316, depth 120 — lima desaturado para no comprometer la
   legibilidad, ajuste de Recovery-3). Montaje perezoso con
   useInView; encima, un velo oscuro translúcido deja el contenido
   respirar sobre la malla. */
function FooterSquares() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0">
      {inView && (
        <>
          <Squares color="#111316" hoverColor="#39451f" depth={120} />
          {/* Velo oscuro translúcido — legibilidad sobre la malla */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/85 via-[#0a0a0b]/55 to-[#0a0a0b]/85" />
        </>
      )}
    </div>
  );
}

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("charlicharli984@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <footer className="noise relative mt-auto overflow-hidden bg-[#0a0a0b] text-white">
      {/* gradiente oscuro animado — le da vida al fondo negro */}
      <div className="footer-aurora" aria-hidden="true" />

      {/* Big contact statement — ancla del botón «Contacto» de la
          barra superior: el usuario aterriza justo en «¿Tienes un
          proyecto en mente?».
          v1.45: eliminada la sección «Contacto» (CTA) — este
          bloque es ahora el único cierre de conversión y su botón
          «Empezar proyecto» (Magnetic) es el de WhatsApp directo
          (wa.me con el mensaje ya redactado). Todos los enlaces
          que antes iban a `#contacto` aterrizan aquí
          (`#proyecto-en-mente`); la columna «Pongámonos en
          contacto» del pie conserva el email. */}
      <div id="proyecto-en-mente" className="relative border-b border-white/[0.08]">
        <FooterSquares />
        <div className="relative mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <Reveal>
                <p className="label-caps !text-white/40">
                  <SpecialText inView speed={13}>
                    ¿Tienes un proyecto en mente?
                  </SpecialText>
                </p>
              </Reveal>
              <Reveal delay={0.12} className="mt-6">
                <Magnetic className="inline-block">
                  <FlipGroup>
                    <a
                      href="https://wa.me/5353463755?text=Hola%20Charli%2C%20quiero%20empezar%20un%20proyecto"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Empezar proyecto por WhatsApp directo"
                      className="group inline-flex items-center gap-2.5 rounded-full bg-lime px-8 py-4 text-[15px] font-semibold text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-95"
                    >
                      <MessageCircle className="size-4" />
                      <span>{flipWords("Empezar proyecto")}</span>
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </FlipGroup>
                </Magnetic>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div className="flex items-center gap-2.5 rounded-full border border-lime/30 bg-lime/10 px-4 py-2.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-lime" />
                </span>
                <span className="text-[13px] font-medium text-lime">
                  <SpecialText inView delay={0.25} speed={12}>
                    Disponible para nuevos proyectos
                  </SpecialText>
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="relative mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
          {/* pages */}
          <nav aria-label="Páginas">
            <p className="label-caps !text-white/40">
              <SpecialText inView>Páginas:</SpecialText>
            </p>
            <ul className="mt-5 space-y-2.5 text-[14.5px]">
              {[
                { href: "#inicio", label: "Inicio" },
                { href: "#proyectos", label: "Proyectos" },
                { href: "#tarifas", label: "Tarifas" },
              ].map((l, i) => (
                <li key={l.href}>
                  <a href={l.href} className="footer-link">
                    <SpecialText inView delay={i * 0.07}>
                      {l.label}
                    </SpecialText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* services */}
          <div>
            <p className="label-caps !text-white/40">
              <SpecialText inView>Servicios:</SpecialText>
            </p>
            <ul className="mt-5 space-y-2.5 text-[14.5px]">
              {SERVICES.map((s, i) => (
                <li key={s}>
                  <a href="#servicios" className="footer-link">
                    <SpecialText inView delay={i * 0.07} speed={13}>
                      {s}
                    </SpecialText>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* capabilities */}
          <div>
            <p className="label-caps !text-white/40">
              <SpecialText inView>Capacidades:</SpecialText>
            </p>
            <ul className="mt-5 space-y-2.5 text-[14.5px]">
              {CAPS.map((c, i) => (
                <li key={c}>
                  <a href="#servicios" className="footer-link">
                    <SpecialText inView delay={i * 0.07} speed={14}>
                      {c}
                    </SpecialText>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <p className="label-caps !text-white/40">
              <SpecialText inView speed={13}>
                Pongámonos en contacto:
              </SpecialText>
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <a
                  href="mailto:charlicharli984@gmail.com"
                  className="link-sweep text-[15px] font-medium"
                >
                  <SpecialText inView speed={12}>
                    charlicharli984@gmail.com
                  </SpecialText>
                </a>
                <button
                  onClick={copyEmail}
                  aria-label="Copiar correo"
                  className="grid size-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  {copied ? (
                    <Check className="size-3.5 text-lime" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { href: "https://instagram.com/charli___ai", icon: Instagram, label: "Instagram", ext: true },
                  { href: "https://wa.me/5353463755", icon: MessageCircle, label: "WhatsApp", ext: false },
                  { href: "https://t.me/charliAI", icon: Send, label: "Telegram", ext: false },
                  { href: "mailto:charlicharli984@gmail.com", icon: Mail, label: "Email", ext: false },
                ].map((s, i) => (
                  <a
                    key={s.label}
                    href={s.href}
                    {...(s.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="social-chip"
                  >
                    <s.icon className="size-3.5" />{" "}
                    <SpecialText inView delay={i * 0.07}>
                      {s.label}
                    </SpecialText>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-[12.5px] text-white/40">
            <SpecialText inView speed={9}>
              © 2026 CHARLI AI™ — Portfolio &amp; Commercial Brief v4
            </SpecialText>
          </p>
          <ul className="flex items-center gap-5 text-[12.5px] text-white/40">
            {[
              { href: "#", label: "Política de privacidad" },
              { href: "#", label: "Términos de uso" },
              { href: "#", label: "Cookies" },
            ].map((l, i) => (
              <li key={l.label}>
                <a href={l.href} className="transition-colors hover:text-white">
                  <SpecialText inView delay={i * 0.1} speed={15}>
                    {l.label}
                  </SpecialText>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
