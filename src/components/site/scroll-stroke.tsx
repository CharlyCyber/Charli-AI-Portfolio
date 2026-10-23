"use client";

/* ────────────────────────────────────────────────────────────────
   ScrollStroke — «El trazo que sigue el scroll» (v3: fusionado).
   Efecto Skiper 19 (Skiper UI, @gurvinder-singh02; inspirado en
   comgio.ai). Solo la línea que se dibuja con el scroll — sin
   titular, sin tarjeta — y ahora SIN sección propia: el trazo se
   FUSIONA con las secciones reales de la página. El componente
   envuelve «Quién soy» + «Proyectos destacados» y superpone un
   lienzo absoluto que:
   · NACE en el slide 05 · DISEÑO: el borde superior del lienzo se
     ancla en runtime a la posición FINAL de ese slide (bottom de la
     sección horizontal − alto del slide: el carrusel sticky termina
     apoyado al fondo de su sección y el último slide comparte su
     borde superior — válido también con las discrepancias 100vh/
     innerHeight de móvil). Cuando el carrusel termina, el slide
     05 · DISEÑO llena exactamente el viewport y el trazo empieza a
     dibujarse SOBRE él, pegado al slide de ahí en adelante (misma
     posición en el documento).
   · RECORRE la sección siguiente («Proyectos destacados») fusionado
     con su contenido: p = 0 con el 05 · DISEÑO centrado y p = 1
     cuando el final de «Proyectos» llega al borde inferior del
     viewport (el trazo completo queda dibujado al despedir la
     sección). La altura del lienzo la dictan las propias secciones.
   · GEOMETRÍA EN ESPACIO DE PÍXELES (lección v3.0): el estirado no
     uniforme (preserveAspectRatio="none" + h-full) se HORNEA en el
     propio `d` del path — se reescriben las coordenadas al tamaño
     real del lienzo y el SVG renderiza 1:1 (sin viewBox). Así un
     strokeWidth de 8 es uniforme de verdad en px. Es la única vía
     estable: vector-effect="non-scaling-stroke" (probado en vivo)
     NO se pinta en Chromium con escalas no uniformes grandes, y sin
     él el grosor variaría hasta 5× entre tramos horizontales y
     verticales (en móvil, 1px frente a 36px). El `d` se recalcula
     cuando cambia el tamaño del lienzo (resize / carga de layout).
   · ANCLA DE PUNTA (heredada de la v2, sin zonas muertas): el trazo
     concentra ~60 % de su arco en los garabatos de la zona alta; se
     muestrea la geometría real del path (getPointAtLength, píxeles)
     y la fracción dibujada f = max(p, f_mín) donde f_mín es la
     primera fracción de arco cuya y alcanza la línea de anclaje
     (30vh por debajo del borde superior): la punta NUNCA sube de esa
     línea — el trazo se «alimenta» desde arriba y la punta baja por
     la pantalla al ritmo del scroll (monótona: máximos acumulados +
     búsqueda binaria).
   · SIN reloj de animaciones (lección Tasks 20–21): el progreso se
     calcula del LAYOUT (getBoundingClientRect) en un latido doble
     rAF + intervalo de 50 ms y se escribe directo en
     style.strokeDashoffset (dedup por valor). Con pathLength=1 y
     strokeDasharray=1, strokeDashoffset = 1−f dibuja exactamente
     [0, f] del trazo.
   · Overlay puramente decorativo: aria-hidden + pointer-events-none
     (no bloquea la interacción de las secciones que atraviesa) y
     z-30 (sobre el contenido, bajo navbar/loader/banner).
   · Créditos (licencia Skiper UI free): atribución requerida —
     recreación independiente, no asociada a comgio.ai.
   ──────────────────────────────────────────────────────────────── */

import { useEffect, useRef, type ReactNode } from "react";

/* Ruta del trazo tal cual en el original de Skiper 19 (solo
   comandos absolutos M/C) */
const STROKE_PATH =
  "M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89";

/* ViewBox de referencia del trazo original: −20 −12 1298 2702 */
const VB_X = -20;
const VB_Y = -12;
const VB_W = 1298;
const VB_H = 2702;

/* Muestras de la geometría del path (fracciones de arco) */
const ARC_SAMPLES = 600;
/* La punta nunca sube más allá de esta fracción del viewport */
const TIP_ANCHOR_VH = 0.3;
/* Grosor del trazo en px CSS (render 1:1 → uniforme de verdad) */
const STROKE_PX = 8;

/* Reescribe el `d` original (comandos absolutos M/C) al espacio de
   píxeles del lienzo: escala no uniforme horneada en la geometría.
   Con el SVG renderizando 1:1 (sin viewBox), strokeWidth queda en
   px reales — sin vector-effect (que Chromium no pinta con escalas
   no uniformes grandes) y sin la variación 1-5× del grosor que
   sufriría un strokeWidth escalado. */
function buildPixelPath(d: string, w: number, h: number): string {
  const sx = w / VB_W;
  const sy = h / VB_H;
  const commands = d.match(/[MCAZ][^MCAZ]*/g) ?? [];
  return commands
    .map((cmd) => {
      const letter = cmd[0];
      const nums =
        cmd
          .slice(1)
          .match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g)
          ?.map(Number) ?? [];
      const out: string[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = (nums[i] - VB_X) * sx;
        const y = (nums[i + 1] - VB_Y) * sy;
        out.push(x.toFixed(2), y.toFixed(2));
      }
      return letter + out.join(" ");
    })
    .join("");
}

export function ScrollStroke({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  /* ── Driver del trazo: reloj de pared + escrituras directas ── */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!wrapper || !overlay || !svg || !path) return;

    /* Anclas del recorrido: la sección horizontal del «Quién soy»
       y su ÚLTIMO slide (05 · DISEÑO). */
    const section = wrapper.querySelector<HTMLElement>(
      "#quien-soy > section",
    );
    const lastSlide = wrapper.querySelector<HTMLElement>(
      "#quien-soy > section > ul > li:last-child",
    );
    if (!section || !lastSlide) return;

    /* Geometría en píxeles: y de cada fracción de arco y su máximo
       acumulado (monótono → búsqueda binaria). Se (re)construye
       cuando cambia el tamaño del lienzo. */
    let geoW = 0;
    let geoH = 0;
    let yStart = 0;
    let prefixMax = new Float64Array(ARC_SAMPLES + 1);

    const rebuild = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      if (Math.abs(w - geoW) < 1 && Math.abs(h - geoH) < 1) return;
      geoW = w;
      geoH = h;
      path.setAttribute("d", buildPixelPath(STROKE_PATH, w, h));
      const total = path.getTotalLength();
      let running = -Infinity;
      for (let i = 0; i <= ARC_SAMPLES; i++) {
        const y = path.getPointAtLength((total * i) / ARC_SAMPLES).y;
        if (y > running) running = y;
        prefixMax[i] = running;
      }
      yStart = path.getPointAtLength(0).y;
    };

    let disposed = false;
    let last = "";
    let lastTop = "";
    let rafId = 0;
    let timerId: number | null = null;

    const paint = () => {
      if (disposed) return;
      const vh = window.innerHeight;

      /* ── 1. Anclar el nacimiento del trazo al slide 05 · DISEÑO ──
         Posición FINAL del slide = bottom de la sección horizontal
         − alto del slide. El lienzo nace ahí y baja hasta el final
         del wrapper (fin de «Proyectos destacados»). */
      const sectionRect = section.getBoundingClientRect();
      const slideH = lastSlide.getBoundingClientRect().height;
      const wrapperTop = wrapper.getBoundingClientRect().top;
      const nextTop = `${Math.round(sectionRect.bottom - slideH - wrapperTop)}px`;
      if (nextTop !== lastTop) {
        lastTop = nextTop;
        overlay.style.top = nextTop;
      }

      /* ── 2. Geometría al tamaño real del lienzo (1:1 en px) ── */
      const rect = overlay.getBoundingClientRect();
      rebuild(rect.width, rect.height);

      /* ── 3. Progreso del recorrido fusionado ──
         p = 0 → borde superior del lienzo en el borde superior del
         viewport: el carrusel horizontal acaba de completarse y el
         slide 05 · DISEÑO llena la pantalla (el trazo empieza a
         dibujarse justo en esa sección).
         p = 1 → borde inferior del lienzo (fin de «Proyectos») en
         el borde inferior del viewport. */
      let p: number;
      if (rect.height > vh) {
        p = Math.min(1, Math.max(0, -rect.top / (rect.height - vh)));
      } else {
        p = rect.top < 0 ? 1 : 0;
      }

      /* ── 4. Ancla de punta: f = max(p, f_mín) ──
         f_mín = primera fracción de arco cuya y alcanza la línea
         horizontal situada a TIP_ANCHOR_VH·vh por debajo del borde
         superior del viewport (en píxeles del path — render 1:1).
         La punta nunca sube de esa línea: el trazo se alimenta desde
         arriba y desciende visible por la pantalla. */
      let f = p;
      const svgRect = svg.getBoundingClientRect();
      if (svgRect.height > 0) {
        const yThresh = vh * TIP_ANCHOR_VH - svgRect.top;
        if (yThresh > yStart) {
          /* búsqueda binaria: primer i con prefixMax[i] ≥ yThresh */
          let lo = 0;
          let hi = ARC_SAMPLES;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (prefixMax[mid] >= yThresh) hi = mid;
            else lo = mid + 1;
          }
          f = lo >= ARC_SAMPLES ? 1 : Math.max(f, lo / ARC_SAMPLES);
        }
      }

      /* pathLength=1 + strokeDasharray=1 → dashoffset = 1−f dibuja
         exactamente [0, f] del trazo desde su inicio. */
      const next = (1 - f).toFixed(4);
      if (next !== last) {
        last = next;
        path.style.strokeDashoffset = next;
      }
    };

    /* Latido doble (técnica del loader / LoopingWords / SpecialText):
       rAF donde el bucle de render vive + intervalo de 50 ms como
       garantía donde rAF está frenado (vista previa embebida). Las
       escrituras son directas e idempotentes (dedup por valor). */
    const rafLoop = () => {
      paint();
      if (!disposed) rafId = requestAnimationFrame(rafLoop);
    };
    const wake = () => paint();

    rafId = requestAnimationFrame(rafLoop);
    timerId = window.setInterval(paint, 50);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    document.addEventListener("visibilitychange", wake);
    paint();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (timerId !== null) window.clearInterval(timerId);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {children}

      {/* El trazo — superpuesto y fusionado a las secciones: nace
          sobre el slide 05 · DISEÑO y desciende dibujándose con el
          scroll a través de «Proyectos destacados». El `d` en px lo
          escribe el driver (geometría 1:1, sin viewBox); el
          dashoffset inicial (1) lo esconde por completo hasta que el
          scroll empieza a dibujarlo. Decorativo: aria-hidden (nada
          que anunciar) y pointer-events-none (no bloquea tarjetas ni
          enlaces que atraviesa). */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
        style={{ top: "75%" }}
      >
        <svg
          ref={svgRef}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-full w-full"
        >
          <path
            ref={pathRef}
            pathLength={1}
            stroke="#c8f24e"
            strokeWidth={STROKE_PX}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1"
            style={{ strokeDashoffset: "1" }}
          />
        </svg>
      </div>
    </div>
  );
}
