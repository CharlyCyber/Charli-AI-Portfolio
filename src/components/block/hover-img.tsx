"use client";

/* ────────────────────────────────────────────────────────────────
   HoverImg — puerto del bloque «hover-img» de Obsidian UI
   (https://www.obsidianui.dev/r/hover-img.json). Registro shadcn:
   npx shadcn@latest add "https://www.obsidianui.dev/r/hover-img.json"
   — recreación adaptada; créditos del patrón a Obsidian UI.
   Motor original: miniatura fija que sigue al cursor con GSAP
   quickTo; pila de imágenes conmutable por índice (yPercent
   -100·i); escala 0 al salir de la lista.
   Extensión propia («al acercarse al + la imagen desaparece»):
   cada fila puede llevar una ACCIÓN (p. ej. el «+» de detalles);
   mientras el cursor recorre la fila la miniatura se desvanece de
   forma continua en función de su distancia a la acción — invisible
   junto al botón, completa a ≥190px. Las filas abiertas (is-open)
   no muestran miniatura: se leen sus detalles.
   ──────────────────────────────────────────────────────────────── */

import React, { useRef, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import "./hover-img.css";

export interface HoverImgItem {
  /** Título grande de la fila (h2) */
  title: string;
  /** Etiqueta muted a la derecha de la fila (p) */
  label: string;
  /** Imagen HD que sigue al cursor sobre la fila */
  imageSrc: string;
  imageAlt?: string;
  /** Acción a la derecha de la fila (p. ej. botón «+»): la miniatura
      se desvanece a medida que el cursor se le acerca */
  action?: ReactNode;
  /** Contenido extra al pie de la fila (p. ej. detalles expandibles) */
  extra?: ReactNode;
  /** Fila abierta: sin miniatura y sin atenuación de la cabeza */
  open?: boolean;
}

interface HoverImgProps {
  items: HoverImgItem[];
  className?: string;
  /** Miniatura absoluta contenida (para previews en grid) */
  isContained?: boolean;
}

/* Distancias (px) de la miniatura a la acción: por debajo de NEAR
   es invisible; a partir de FAR está completa. */
const ACTION_NEAR = 56;
const ACTION_FAR = 190;

export function HoverImg({
  items,
  className,
  isContained = false,
}: HoverImgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const projectThumbnail = thumbnailRef.current;
    const projectsContainer = containerRef.current?.querySelector(
      ".hover-img-projects",
    ) as HTMLElement | null;
    if (!projectThumbnail || !projectsContainer) return;

    const projectElements = gsap.utils.toArray(
      ".hover-img-project",
      projectsContainer,
    ) as HTMLElement[];
    const thumbnails = gsap.utils.toArray(
      ".hover-img-thumbnail",
      projectThumbnail,
    ) as HTMLElement[];

    gsap.set(projectThumbnail, { scale: 0, xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(projectThumbnail, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(projectThumbnail, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    let lastX = 0;
    let lastY = 0;
    let activeRow: HTMLElement | null = null;

    /* Escala objetivo (0–1) de la miniatura: 0 sin fila activa o con
       la fila abierta; según proximidad del cursor a la acción. */
    const proximityScale = (): number => {
      if (!activeRow || activeRow.classList.contains("is-open")) return 0;
      const action = activeRow.querySelector<HTMLElement>(".hover-img-action");
      if (!action) return 1;
      const r = action.getBoundingClientRect();
      const dx = lastX - (r.left + r.width / 2);
      const dy = lastY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      return Math.min(1, Math.max(0, (dist - ACTION_NEAR) / (ACTION_FAR - ACTION_NEAR)));
    };

    const showThumbnail = () => {
      gsap.to(projectThumbnail, {
        scale: proximityScale(),
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      let x = (lastX = e.clientX);
      let y = (lastY = e.clientY);

      if (isContained && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const halfWidth = projectThumbnail.offsetWidth / 2;
        const halfHeight = projectThumbnail.offsetHeight / 2;
        const inset = 16;
        x = Math.max(
          halfWidth + inset,
          Math.min(rect.width - halfWidth - inset, e.clientX - rect.left),
        );
        y = Math.max(
          halfHeight + inset,
          Math.min(rect.height - halfHeight - inset, e.clientY - rect.top),
        );
      }

      xTo(x);
      yTo(y);
      /* la imagen se desvanece al acercarse el cursor al «+» */
      if (activeRow) showThumbnail();
    };

    const handleMouseLeave = () => {
      activeRow = null;
      gsap.to(projectThumbnail, {
        scale: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const cleanups: Array<() => void> = [];

    projectElements.forEach((project, index) => {
      const handleMouseEnter = (e: MouseEvent) => {
        activeRow = project;
        lastX = e.clientX;
        lastY = e.clientY;
        /* pila: la imagen de esta fila pasa a primer plano */
        gsap.to(thumbnails, {
          yPercent: -100 * index,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
        /* escala según proximidad (0 si la fila está abierta) */
        showThumbnail();
      };
      project.addEventListener("mouseenter", handleMouseEnter);
      cleanups.push(() =>
        project.removeEventListener("mouseenter", handleMouseEnter),
      );
    });

    projectsContainer.addEventListener("mousemove", handleMouseMove);
    projectsContainer.addEventListener("mouseleave", handleMouseLeave);
    cleanups.push(() => {
      projectsContainer.removeEventListener("mousemove", handleMouseMove);
      projectsContainer.removeEventListener("mouseleave", handleMouseLeave);
    });

    return () => cleanups.forEach((fn) => fn());
    /* las filas y sus nodos DOM son estables (lista de servicios);
       el estado abierto se lee del DOM en cada evento */
  }, [isContained]);

  return (
    <div
      className={`hover-img-container ${className || ""}`}
      ref={containerRef}
    >
      <div className="hover-img-projects">
        {items.map((item, index) => (
          <div
            key={index}
            className={`hover-img-project${item.open ? " is-open" : ""}`}
          >
            <div className="hover-img-row">
              <div className="hover-img-head">
                <h2>{item.title}</h2>
                <p>{item.label}</p>
              </div>
              {item.action ? (
                <div className="hover-img-action">{item.action}</div>
              ) : null}
            </div>
            {item.extra ? (
              <div className="hover-img-extra">{item.extra}</div>
            ) : null}
          </div>
        ))}
      </div>

      <div
        className="hover-img-thumbnail-wrapper"
        ref={thumbnailRef}
        style={
          isContained
            ? ({ position: "absolute" } as CSSProperties)
            : undefined
        }
      >
        {items.map((item, index) => (
          <div className="hover-img-thumbnail" key={index}>
            <img src={item.imageSrc} alt={item.imageAlt ?? item.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HoverImg;
