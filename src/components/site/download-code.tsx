"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { FlipGroup, flipWords } from "@/components/ui/flip-links";
import { SpecialText } from "@/components/ui/special-text";
import { EASE_OUT, Magnetic } from "./anim";
import { useLoaderState } from "./loader-store";
import { useCookieState } from "./cookie-store";

/* ── Floating utility pill: download the project source ZIP ──
   (Solo utilidad de este entorno: no forma parte de la réplica)
   Fix-7: se eleva sobre el banner de cookies cuando este está en
   pantalla (cookie-store: altura real medida en runtime) — el
   wrapper exterior conserva la entrada/salida con delay 0.9 y el
   motion.div interior lleva el ascenso (0.45s), de modo que el
   delay de entrada no contamina el ascenso. */
export function DownloadCode() {
  const { done } = useLoaderState();
  const banner = useCookieState();

  return (
    <AnimatePresence>
      {done && (
        <motion.div
          className="fixed bottom-4 right-4 z-[150] sm:bottom-6 sm:right-6"
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 64, opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.9 }}
        >
          <motion.div
            animate={{ y: banner.visible ? -(banner.height + 36) : 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            <Magnetic strength={0.25}>
              <FlipGroup>
                <a
                  href="https://github.com/CharlyCyber/Charli-AI-Portfolio/archive/refs/heads/main.zip"
                  aria-label="Descargar el código del proyecto en ZIP desde GitHub"
                  className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0f1011]/90 py-2.5 pl-4 pr-5 text-[12.5px] font-medium text-white shadow-2xl backdrop-blur-xl transition-colors hover:border-lime/60"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-lime text-ink transition-transform duration-300 group-hover:scale-110">
                    <Download className="size-3.5" strokeWidth={2.4} aria-hidden />
                  </span>
                  <span className="leading-none">
                    <span>{flipWords("Descargar código")}</span>
                    <span className="ml-1.5 hidden text-[11px] font-normal text-white/50 sm:inline">
                      <SpecialText inView>ZIP · 55 MB</SpecialText>
                    </span>
                  </span>
                </a>
              </FlipGroup>
            </Magnetic>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
