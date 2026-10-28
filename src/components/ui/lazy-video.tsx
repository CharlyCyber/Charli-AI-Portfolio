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

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

/**
 * Vídeo decorativo con carga anticipada (v1.45).
 *
 * Diagnóstico del comportamiento anterior («los vídeos aparecen
 * minutos después de abrir el sitio»): los MP4 originales
 * sumaban 13,6 MB y llevaban el átomo `moov` AL FINAL del archivo
 * — sin faststart el navegador no puede reproducir hasta tener
 * (casi) todo el archivo — y encima este componente solo empezaba
 * a descargar a 700 px de la pantalla, con `preload="metadata"`.
 * Corrección en tres frentes:
 *   1. Los archivos están re-codificados (4,0 MB en total) con
 *      `+faststart`: se reproducen mientras descargan.
 *   2. La descarga empieza MUCHO antes: a 2.000 px de entrar en
 *      pantalla, o en segundo plano cuando el navegador queda en
 *      reposo tras la carga inicial (`requestIdleCallback`) —
 *      al hacer scroll el vídeo ya está listo. Con ahorro de
 *      datos o red 2G declarados, solo vale la proximidad.
 *   3. El `poster` es un fotograma real del propio vídeo: la
 *      superficie se ve correcta desde el primer instante, sin
 *      parpadeo a negro ni imágenes ajenas de relleno.
 * Además: `preload="auto"` al cargar y pausa automática fuera de
 * pantalla (los datos quedan, la CPU no decodea en vano).
 */
export function LazyVideo({
  src,
  poster,
  rootMargin = "2000px 0px",
  autoPlay,
  muted,
  preload,
  ...props
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  /* Disparo de carga: proximidad amplia al viewport… */
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

  /* …o el navegador en reposo tras abrir la página: los vídeos
     viajan en segundo plano y están listos al llegar a ellos.
     No en modo ahorro de datos / red lenta declarada. */
  useEffect(() => {
    if (shouldLoad) return;
    const connection = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    if (
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
    ) {
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(() => setShouldLoad(true), {
        timeout: 4500,
      });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(() => setShouldLoad(true), 3500);
    return () => clearTimeout(timer);
  }, [shouldLoad]);

  /* Visibilidad real en pantalla: reproducir / pausar */
  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setOnScreen(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "80px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const video = ref.current;
    if (!video) return;

    // En móviles, declarar muted + playsInline en el elemento y
    // llamar a load() antes de play() mejora el autoplay.
    video.muted = muted ?? false;
    video.playsInline = true;
    video.load();
  }, [shouldLoad, muted]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !shouldLoad || !autoPlay) return;

    if (!onScreen) {
      video.pause();
      return;
    }

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || !video.paused) return;
      video.play().catch(() => {
        // El navegador puede bloquear autoplay por ahorro de
        // datos/energía. El poster permanece como fallback.
      });
    };
    video.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", tryPlay);
    };
  }, [shouldLoad, autoPlay, onScreen]);

  return (
    <video
      ref={ref}
      {...props}
      src={shouldLoad ? src : undefined}
      poster={poster}
      muted={muted}
      preload={shouldLoad ? preload ?? "auto" : "none"}
    />
  );
}
