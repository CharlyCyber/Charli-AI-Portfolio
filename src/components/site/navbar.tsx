"use client";

import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { FlipGroup, flipWords } from "@/components/ui/flip-links";
import { SpecialText } from "@/components/ui/special-text";
import { EASE_OUT } from "./anim";
import { useLoaderState } from "./loader-store";

/* ── Botones de la barra superior ──────────────────────────────
   Exactamente los cuatro pedidos, en orden de izquierda a
   derecha:
   1. Servicios → #servicios («Servicios & Capacidades»), enlace
      directo — sin desplegable.
   2. Proyectos → #proyectos («Proyectos destacados»).
   3. Precios   → #tarifas (la sección «Tarifas»).
   4. Contacto  → #proyecto-en-mente (el bloque «¿Tienes un
      proyecto en mente?» del footer), como píldora CTA a la
      derecha — el último botón de la barra. */
const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#tarifas", label: "Precios" },
] as const;

export function Navbar() {
  const { done } = useLoaderState();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (mobileOpen) return;
    setHidden(y > prev && y > 220);
  });

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-[120] px-3 sm:px-5 pt-3 sm:pt-4"
      initial={{ y: -90, opacity: 0 }}
      animate={
        done
          ? { y: hidden ? -110 : 0, opacity: 1 }
          : { y: -90, opacity: 0 }
      }
      transition={{ duration: 0.65, ease: EASE_OUT }}
    >
      <motion.nav
        aria-label="Navegación principal"
        className={`mx-auto flex max-w-[1320px] items-center justify-between gap-2 rounded-full border py-2 pl-4 pr-2 transition-all duration-500 ${
          scrolled
            ? "border-black/[0.08] bg-white/80 shadow-[0_8px_40px_-12px_rgba(15,16,17,0.18)] backdrop-blur-xl"
            : "border-transparent bg-white/40 backdrop-blur-md"
        }`}
      >
        {/* Logo */}
        <a
          href="#inicio"
          className="flex items-center gap-2.5"
          aria-label="CHARLI AI — inicio"
        >
          <img
            src="/images/logo.jpeg"
            alt="Logotipo de CHARLI AI"
            className="size-8 rounded-full object-cover ring-1 ring-black/10"
          />
          <span className="text-[15px] font-semibold tracking-tight">
            <SpecialText active={done} delay={0.05}>
              CHARLI&nbsp;AI
            </SpecialText>
            <span className="text-lime-deep">.</span>
          </span>
        </a>

        {/* Center links (desktop) — enlaces directos, sin desplegables */}
        <div className="hidden lg:flex items-center gap-1 text-[15px]">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
            >
              <SpecialText active={done} delay={0.15 + i * 0.05}>
                {l.label}
              </SpecialText>
            </a>
          ))}
        </div>

        {/* Right cluster — Contacto: último botón, lleva al bloque
            «¿Tienes un proyecto en mente?» del footer */}
        <div className="flex items-center gap-2">
          <FlipGroup>
            <a
              href="#proyecto-en-mente"
              className="group hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white transition-transform duration-300 hover:scale-[1.03] active:scale-95"
            >
              <span>{flipWords("Contacto")}</span>
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </FlipGroup>

          <button
            className="lg:hidden grid size-10 place-items-center rounded-full border border-black/[0.08] bg-white/70"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="lg:hidden mx-auto mt-2 max-w-[1320px] rounded-3xl border border-black/[0.06] bg-white/95 p-5 shadow-xl backdrop-blur-xl"
          >
            <div className="grid gap-1 text-[16px]">
              {NAV_LINKS.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <SpecialText inView delay={i * 0.06}>
                    {l.label}
                  </SpecialText>
                </a>
              ))}
              <FlipGroup className="block">
                <a
                  href="#proyecto-en-mente"
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{flipWords("Contacto")}</span>{" "}
                  <ArrowUpRight className="size-4" />
                </a>
              </FlipGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
