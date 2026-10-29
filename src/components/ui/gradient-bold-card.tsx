import React from "react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   GradientBlobCard — tarjeta «glass» con blob de degradado
   animado detrás (componente de 21st.dev pegado por el usuario).

   El original es una cajita fija y vacía de 200×250: sombra
   neumórfica doble, panel de cristal (`white/95` + blur 24 px +
   outline blanco) inset 5 px y un círculo con degradado
   rosa→rojo→amarillo que recorre en bucle las 4 esquinas
   (`blob 5s linear infinite`), visible difuminado a través del
   cristal y como marco de color en los 5 px del borde.

   Integración en CHARLI AI (v1.46) — las 3 tarjetas de precios
   (ver site/pricing.tsx):
   · De caja fija vacía a CONTENEDOR con `children`: el tamaño
     lo da el contenido (h-full en el grid de tarifas); el radio
     sube a 28/24 px para casar con las tarjetas del sitio.
   · Prop `tone`: "light" (cristal blanco, como el original en
     claro) o "dark" (cristal tinta para la tarjeta destacada,
     que ya era oscura — el degradado intenso es el mismo en
     ambos, como pedía el original: «same bold colors»).
   · El blob escala con la tarjeta (`w-[62%]`, el original era
     150 px en 200 = 75 %… un punto menos para no invadir el
     texto) y acepta `blobDelay` para desincronizar las 3
     tarjetas (cada una va en una esquina distinta del ciclo).
   · Los keyframes viven UNA sola vez en globals.css
     (`.animate-blob-card`), no en un <style> por instancia
     como en el código pegado.
   Sin hooks ni "use client": es puramente presentacional.
   ──────────────────────────────────────────────────────────────── */

export interface GradientBlobCardProps {
  children?: React.ReactNode;
  /** Clases para la caja exterior (tamaño, altura…) */
  className?: string;
  /** Clases para el contenedor del contenido, sobre el cristal */
  contentClassName?: string;
  /** Cristal claro u oscuro (la destacada de precios) */
  tone?: "light" | "dark";
  /** Segundos de desfase del blob (negativo = empezar a mitad de ciclo) */
  blobDelay?: number;
  /** Duración del ciclo del blob, en segundos (original: 5) */
  blobDuration?: number;
}

const GradientBlobCard: React.FC<GradientBlobCardProps> = ({
  children,
  className,
  contentClassName,
  tone = "light",
  blobDelay = 0,
  blobDuration = 5,
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-stretch justify-center overflow-hidden rounded-[28px]",
        tone === "dark"
          ? "shadow-[20px_20px_60px_rgba(15,16,17,0.45),-20px_-20px_60px_#ffffff]"
          : "shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]",
        className
      )}
    >
      {/* Fondo de cristal — deja ver el blob difuminado y crea
          el marco de color de 5 px alrededor */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-[5px] z-[1] rounded-[24px] outline outline-2 backdrop-blur-[24px]",
          tone === "dark"
            ? "bg-[#0f1011]/85 outline-white/25"
            : "bg-white/90 outline-white"
        )}
      />

      {/* Blob con degradado intenso — mismos colores en claro y
          oscuro, recorriendo las 4 esquinas en bucle */}
      <div
        aria-hidden="true"
        className="animate-blob-card absolute left-1/2 top-1/2 z-0 aspect-square w-[62%] rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 opacity-100 blur-[12px]"
        style={{
          animationDelay: `${blobDelay}s`,
          animationDuration: `${blobDuration}s`,
        }}
      />

      {/* Contenido sobre el cristal */}
      <div className={cn("relative z-10 h-full", contentClassName)}>{children}</div>
    </div>
  );
};

export default GradientBlobCard;
