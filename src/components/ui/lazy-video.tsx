"use client";

import {
  useEffect,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react";

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  src: string;
  /** Imagen visible mientras el navegador prepara el primer fotograma. */
  poster?: string;
  /** Anticipación de carga antes de que el vídeo entre en pantalla. */
  rootMargin?: string;
};

/**
 * Vídeo decorativo diferido. Evita descargar los tres MP4 al abrir el
 * portafolio, pero comienza a prepararlos antes de que la persona llegue a
 * la sección. El `poster` impide que una superficie negra parezca un fallo.
 */
export function LazyVideo({
  src,
  poster,
  rootMargin = "700px 0px",
  preload,
  ...props
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setShouldLoad(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!shouldLoad) return;
    ref.current?.play().catch(() => {
      // Algunos navegadores solo permiten iniciar el loop cuando el vídeo
      // alcanza estado reproducible; `autoPlay` hará el siguiente intento.
    });
  }, [shouldLoad]);

  return (
    <video
      ref={ref}
      {...props}
      src={shouldLoad ? src : undefined}
      poster={poster}
      preload={shouldLoad ? preload ?? "metadata" : "none"}
    />
  );
}
