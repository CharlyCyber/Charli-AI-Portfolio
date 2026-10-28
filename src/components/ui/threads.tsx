"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────
   Threads — fondo de hilos verticales ondulantes (React Bits ·
   reimplementación propia en WebGL puro, sin dependencias).

   · API de props idéntica al componente original (color, lineCount,
     thickness, softness, amplitude, distance, waves, speed, split,
     fray, angle, taper, brightness, parting, enableMouseInteraction,
     fade, opacity). `fray` se acepta por compatibilidad de API (este
     diseño no lo usa).
   · EXTENSIÓN 1 — SCROLL: el fondo reacciona al scroll del tramo en
     que vive: descubre la <section> contenedora y mapea su progreso
     (0→1) a dos uniformes del shader — los hilos derivan en x
     (parallax respecto a los slides, que viajan 4×aspect) y su fase
     de onda avanza (los hilos ondulan al desplazarse).
   · EXTENSIÓN 2 — GIROSCOPIO (móvil): con enableMouseInteraction, la
     orientación del dispositivo (gamma = inclinación izq/der, beta =
     frente/atrás) mueve el punto de influencia en 2D: girar el
     celular en cualquier dirección aparta los hilos. iOS exige
     pedir permiso desde un gesto del usuario (primer toque); en
     Android el listener se liga directo. El puntero/táctil también
     mueve el punto (pointermove a nivel window — el canvas vive
     DEBAJO de los slides y no recibe los eventos él solo).
   · El punto de influencia se suaviza por frame (lerp) para que el
     apartado fluya; los hilos tienen fase/frecuencia/brillo únicos
     (hash por índice) para que la deriva de scroll sea perceptible
     (un campo uniforme desplazado se vería igual a sí mismo).
   · Rendimiento: solo anima con la sección en pantalla
     (IntersectionObserver) y con la pestaña visible; dpr con tope
     2 y presupuesto de ~7 Mpx (v1.45); prefers-reduced-motion →
     un solo fotograma estático.
   ──────────────────────────────────────────────────────────────── */

export type ThreadsProps = {
  color?: string;
  lineCount?: number;
  thickness?: number;
  softness?: number;
  amplitude?: number;
  distance?: number;
  waves?: number;
  speed?: number;
  split?: number;
  /** Aceptado por compatibilidad de API (sin efecto en este porte) */
  fray?: number;
  angle?: number;
  taper?: number;
  brightness?: number;
  parting?: number;
  enableMouseInteraction?: boolean;
  fade?: number;
  opacity?: number;
  className?: string;
};

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uLineCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uAmplitude;
uniform float uDistance;
uniform float uWaves;
uniform float uSpeed;
uniform float uSplit;
uniform float uAngle;
uniform float uTaper;
uniform float uBrightness;
uniform float uParting;
uniform float uFade;
uniform float uOpacity;
uniform vec3  uColor;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
  float w = uResolution.x;
  float h = uResolution.y;
  float aspect = w / h;
  /* espacio en «unidades-y»: x en [0, aspect], y en [0,1], origen abajo */
  float px = gl_FragCoord.x / h;
  float v  = gl_FragCoord.y / h;
  float t  = uTime * uSpeed;

  float edge = 1.0;
  if (uFade > 0.001) {
    edge = smoothstep(0.0, uFade, v) * (1.0 - smoothstep(1.0 - uFade, 1.0, v));
  }

  float part = 1.0;
  if (uParting > 0.001) {
    part = mix(1.0, smoothstep(0.03, 0.14, abs(v - 0.5)), uParting);
  }

  float cell = aspect / uLineCount;
  float acc = 0.0;

  for (float i = 0.0; i < 160.0; i++) {
    if (i >= uLineCount) break;
    float rnd  = hash(i + 1.0);
    float rnd2 = hash(i * 3.7 + 11.0);

    float base = (i + 0.5) * cell;
    base -= uScroll * 0.45 * aspect;                 /* deriva con el scroll */
    base += uAngle * (v - 0.5);                      /* inclinación (shear)  */
    base += uSplit * cell * 0.5 * step(0.5, rnd2);   /* medio paso alternado */

    float phase = rnd * 6.28318;
    float freq  = uWaves * (0.75 + 0.5 * rnd2);
    float x = base
      + uAmplitude * 0.014
        * sin(v * freq * 6.28318 + t * (0.7 + 0.6 * rnd) + phase + uScroll * 5.0);

    /* separación alrededor del punto de influencia (puntero o giro) */
    float dxm  = x - uMouse.x;
    float dym  = v - uMouse.y;
    float dist = length(vec2(dxm, dym));
    float infl = 1.0 - smoothstep(0.0, uDistance, dist);
    infl = infl * infl;
    x += (dxm / max(dist, 1e-4)) * infl * 0.17 * (0.55 + 0.75 * rnd2);

    /* distancia píxel↔curva, grosor afilado hacia los extremos */
    float dx = abs(px - x);
    float taperF = 1.0 - uTaper * (1.0 - sin(3.14159 * v));
    float th = max(uThickness * taperF, 0.4) / h;
    float soft = max(uSoftness, 0.6) / h;
    float line = 1.0 - smoothstep(th, th + soft, dx);

    float b = mix(0.7, 1.0, rnd) * uBrightness;
    acc += line * b * part;
  }

  float a = clamp(acc, 0.0, 1.0) * uOpacity * edge;
  gl_FragColor = vec4(uColor, a);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  let s = m[1];
  if (s.length === 3)
    s = s
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(s, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function Threads({
  color = "#ffffff",
  lineCount = 40,
  thickness = 1.4,
  softness = 0,
  amplitude = 1,
  distance = 0.7,
  waves = 1.25,
  speed = 1,
  split = 0,
  angle = 0,
  taper = 0.75,
  brightness = 1,
  parting = 0,
  enableMouseInteraction = true,
  fade = 0.35,
  opacity = 1,
  className,
}: ThreadsProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });
    if (!gl) return; // sin WebGL: queda el color base del contenedor

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(program, n);
    const u = {
      resolution: U("uResolution"),
      time: U("uTime"),
      mouse: U("uMouse"),
      scroll: U("uScroll"),
      lineCount: U("uLineCount"),
      thickness: U("uThickness"),
      softness: U("uSoftness"),
      amplitude: U("uAmplitude"),
      distance: U("uDistance"),
      waves: U("uWaves"),
      speed: U("uSpeed"),
      split: U("uSplit"),
      angle: U("uAngle"),
      taper: U("uTaper"),
      brightness: U("uBrightness"),
      parting: U("uParting"),
      fade: U("uFade"),
      opacity: U("uOpacity"),
      color: U("uColor"),
    };
    const rgb = hexToRgb(color);
    gl.uniform3f(u.color, rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(u.thickness, thickness);
    gl.uniform1f(u.softness, softness);
    gl.uniform1f(u.amplitude, amplitude);
    /* guards: fade ≥ 0.49 haría edge0 == edge1 en smoothstep (indefinido
       en GLSL); distance 0 también — se acotan antes de subirlos */
    gl.uniform1f(u.distance, Math.max(0.001, distance));
    gl.uniform1f(u.waves, waves);
    gl.uniform1f(u.speed, speed);
    gl.uniform1f(u.split, split);
    gl.uniform1f(u.angle, angle);
    gl.uniform1f(u.taper, taper);
    gl.uniform1f(u.brightness, brightness);
    gl.uniform1f(u.parting, parting);
    gl.uniform1f(u.fade, Math.min(0.49, Math.max(0, fade)));
    gl.uniform1f(u.opacity, opacity);

    /* Densidad adaptativa: los lineCount de referencia están pensados
       para lienzo horizontal; en portrait quedarían a ~10 px de
       separación (una cortina de pelo) — se escala con el aspect para
       conservar la proporción visual del original (mínimo 50%). */
    let dpr = 1;
    const resize = () => {
      const cssW = host.clientWidth || 1;
      const cssH = host.clientHeight || 1;
      const aspect = cssW / cssH;
      const lines = Math.max(
        8,
        Math.round(
          lineCount * Math.min(1, Math.max(0.5, aspect / 1.6)),
        ),
      );
      /* v1.45 — definición HD: tope DPR 2 (antes 1,5, que en
         pantallas retina difuminaba los hilos y los apagaba)
         con presupuesto de ~7 Mpx para no disparar el coste del
         fragment a pantalla completa en monitores 4K. */
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cssW * cssH * dpr * dpr > 7.0e6) {
        dpr = Math.max(1, Math.sqrt(7.0e6 / (cssW * cssH)));
      }
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(u.lineCount, lines);
      gl.uniform2f(u.resolution, canvas.width, canvas.height);
      if (reduced) drawStatic();
    };

    /* Cursor virtual (puntero/táctil o giroscopio), suavizado en rAF */
    const target = { x: -10, y: 0.5 };
    const cur = { x: -10, y: 0.5 };

    const setFromClient = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      if (r.height < 1) return;
      target.x = (cx - r.left) / r.height;
      target.y = 1 - (cy - r.top) / r.height;
    };
    const onPointer = (e: PointerEvent) => setFromClient(e.clientX, e.clientY);

    /* Giroscopio: gamma (izq/der ±90°) y beta (frente/atrás 0-180°)
       → punto de influencia 2D. Vertical (beta 90°) = centro. */
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const r = canvas.getBoundingClientRect();
      const aspect = (r.width || 1) / (r.height || 1);
      const gx = Math.max(-1, Math.min(1, e.gamma / 45));
      const by = Math.max(-1, Math.min(1, (e.beta - 90) / 90));
      target.x = aspect * (0.5 + gx * 0.42);
      target.y = clamp01(0.5 - by * 0.42);
    };
    let gyroBound = false;
    const bindGyro = () => {
      if (gyroBound) return;
      gyroBound = true;
      window.addEventListener("deviceorientation", onOrient);
    };
    const askGyro = () => {
      window.removeEventListener("touchend", askGyro);
      window.removeEventListener("click", askGyro);
      const DOE = window.DeviceOrientationEvent as
        | (typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<string>;
          })
        | undefined;
      if (!DOE) return;
      if (typeof DOE.requestPermission === "function") {
        DOE.requestPermission()
          .then((res) => {
            if (res === "granted") bindGyro();
          })
          .catch(() => {});
      } else {
        bindGyro();
      }
    };

    if (enableMouseInteraction) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      const DOE = window.DeviceOrientationEvent as
        | (typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<string>;
          })
        | undefined;
      if (DOE && typeof DOE.requestPermission === "function") {
        /* iOS: el permiso exige un gesto del usuario */
        window.addEventListener("touchend", askGyro);
        window.addEventListener("click", askGyro);
      } else {
        bindGyro(); /* Android: sin permiso */
      }
    }

    /* Progreso del scroll del tramo contenedor: su <section> mide
       n·100vh; 0→1 mientras el carrusel recorre sus slides. Los hilos
       derivan (parallax) y ondulan con él. */
    const section = host.closest("section");
    let prog = 0;
    const readScroll = () => {
      if (!section) return;
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      prog = span > 0 ? clamp01(-r.top / span) : 0;
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const drawStatic = () => {
      readScroll();
      gl.uniform1f(u.time, 0);
      gl.uniform2f(u.mouse, -10, 0.5);
      gl.uniform1f(u.scroll, prog);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let running = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      cur.x += (target.x - cur.x) * 0.085;
      cur.y += (target.y - cur.y) * 0.085;
      readScroll();
      gl.uniform1f(u.time, (now - t0) / 1000);
      gl.uniform2f(u.mouse, cur.x, cur.y);
      gl.uniform1f(u.scroll, prog);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* Solo anima con la sección en pantalla y la pestaña visible */
    const io = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? start() : stop()),
      { rootMargin: "10% 0px" },
    );
    io.observe(host);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    if (reduced) drawStatic();
    else start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (enableMouseInteraction) {
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerdown", onPointer);
        window.removeEventListener("touchend", askGyro);
        window.removeEventListener("click", askGyro);
        if (gyroBound)
          window.removeEventListener("deviceorientation", onOrient);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [
    color,
    lineCount,
    thickness,
    softness,
    amplitude,
    distance,
    waves,
    speed,
    split,
    angle,
    taper,
    brightness,
    parting,
    enableMouseInteraction,
    fade,
    opacity,
  ]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
