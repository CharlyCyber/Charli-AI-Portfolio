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
    const video = ref.current;
    if (!video) return;

    // En móviles, declarar muted + playsInline en el elemento y llamar a
    // load() antes de play() mejora la compatibilidad con autoplay.
    video.muted = props.muted ?? false;
    video.playsInline = true;
    video.load();

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || video.paused === false) return;
      video.play().catch(() => {
        // El navegador puede bloquear autoplay por ahorro de datos/energía.
        // El poster permanece visible como fallback.
      });
    };
    video.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", tryPlay);
    };
  }, [shouldLoad, props.muted]);

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
