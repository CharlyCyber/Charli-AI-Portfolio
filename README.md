# CHARLI AI — Portafolio y Resumen Comercial

Portafolio web interactivo de **CHARLI AI** (Tecnólogo Creativo en IA). Sitio one-page
con **Liquid Sculpture Hero** (escultura de partículas líquidas grandes al centro
que reaccionan al cursor / a la inclinación del móvil) y su titular en bucle
**Looping Words** (réplica del clásico de Osmo), efecto **scramble/decode**
(SpecialText) en todas las letras pequeñas del sitio, sección «Quién soy» con
**scroll horizontal anidado** sobre un fondo **Threads** oscuro (hilos blancos
interactivos: reaccionan al cursor, al scroll y al giroscopio del móvil), palabras
gigantes Anton, **trazo manuscrito scrubbed** alrededor del título «Quién soy»
(se dibuja al bajar el scroll y retrocede al subir), **tarjeta elástica 3D**
(Lanyard: cuelga, se estira al arrastrar, regresa con física elástica y gira al
clic — anverso foto / reverso logo alien), **Condiciones comerciales** con
**FlowingMenu** (franstiras que se expanden con marquee Anton hacia la izquierda),
footer con fondo **Squares** 3D, **loader honeycomb 100 % visual** (sin texto),
efecto flip letra a letra en todas las letras grandes y botones, smooth scroll,
animaciones scroll-driven, motion graphics en loop y todo el contenido comercial:
servicios, proyectos, tarifas (CUP/USD) y contacto — íntegramente en español.

> Lenguaje visual inspirado en cosmos.studio · Hero basado en "Liquid Sculpture Hero"
> (MIT) de [Guglielmo Giannattasio](https://guglielmogiannattasio.it), reimplementado
> y adaptado a CHARLI AI · Scroll horizontal inspirado en [Matt Perry](https://twitter.com/mattgperry)
> (componente de 21st.dev) · Tarjetas apiladas inspiradas en Skiper 17 (StickyCard_002) ·
> Trazo que se dibuja con el scroll inspirado en Skiper 19 (ApidejOj) · Hover-img de
> servicios inspirado en Obsidian UI (hover-img.json) · Fondo Threads y tarjeta elástica
> Lanyard: React Bits (WebGL/three.js, reimplementados en TypeScript) · Trazo manuscrito
> del título: adaptación de "Hand Written Title" de KokonotUI (hand-writing-text.tsx) ·
> FlowingMenu: React Bits (flowing-menu.tsx, con extensión táctil propia) · Squares:
> React Bits (squares.tsx)

## ✨ Novedades v1.46 — Precios con blob de degradado · Marquesina en movimiento constante

- **Las 3 tarjetas de precios visten GradientBlobCard** (21st.dev, en
  `ui/gradient-bold-card.tsx`): panel de cristal sobre un blob rosa→rojo→
  amarillo que recorre las 4 esquinas en bucle de 5 s, visible difuminado
  tras el contenido y como marco de color de 5 px, con la sombra neumórfica
  doble del original. Adaptado de caja fija vacía (200×250) a contenedor con
  contenido real (precio, features y botón intactos); la destacada usa el
  cristal en tono oscuro, cada blob va desincronizado y los keyframes viven
  una sola vez en `globals.css` (`.animate-blob-card`).
- **Marquesina curva en movimiento constante**: fuera el arrastre (ni cursor
  ni dedo) y fuera también la pausa ante `prefers-reduced-motion` — con esa
  preferencia activa en el sistema la franja quedaba estática hasta tocarla.
  Ahora las palabras avanzan solas hacia la izquierda sin parar, con
  velocidad por tiempo (idéntica a 30/60/120 Hz, más suave).

## ✨ Novedades v1.45 — Ondas HD · Sin sección Contacto · Vídeos inmediatos · Marquesina curva · Titular shutter

- **Ondas con la definición recuperada**: la escultura líquida del hero estaba
  capada (rejilla de 420/720, DPR ≤1,5 en cualquier móvil y borde de partícula
  al 50 % de alfa → imagen opaca). Ahora hay 3 niveles de calidad según el
  dispositivo (rejilla 520/760/980, DPR ≤2 con presupuesto de píxeles),
  antialias por `fwidth` (interior al 100 %, solo se suaviza el último píxel)
  y leve realce de saturación/contraste. Los hilos ondulantes (Threads) de
  «Quién soy» suben a DPR 2 con más brillo y grosor.
- **Eliminada la sección «Contacto»** (el CTA «Empieza tu proyecto con
  CHARLI»): el cierre de la página es Tarifas → «¿Tienes un proyecto en
  mente?» (footer), y **su botón «Empezar proyecto» es ahora el de WhatsApp
  directo** (wa.me con el mensaje ya redactado). Todos los enlaces que iban a
  `#contacto` aterrizan en `#proyecto-en-mente`.
- **Vídeos que ya están cuando llegas**: los tres MP4 (13,6 MB, con el átomo
  `moov` al final = sin reproducción hasta descargar casi todo) están
  re-codificados con `+faststart` y pesan 4,0 MB en total (Enfoque de
  trabajo: `mixkit-44818`; Motion & Diseño Gráfico: `works-ticker`;
  Dirección creativa que respira: `mixkit-4192-screens`). `LazyVideo` carga a
  2.000 px de distancia o con el navegador en reposo tras abrir la página,
  `preload="auto"`, pausa fuera de pantalla y **póster = fotograma real** del
  propio vídeo (antes mostraba fotos ajenas de relleno).
- **Tarjeta elástica 3D sin espera**: monta a 2.500 px o en el primer reposo
  del navegador (su rAF ya se pausaba sola fuera de pantalla); la foto
  estática queda solo como fallback sin WebGL y se funde al estar lista,
  sin corte brusco.
- **Marquesina curva bajo «Colaboración en tiempo real»**: la tira
  rectangular se sustituye por **CurvedLoop** (21st.dev) — las mismas
  palabras recorren un arco en bucle infinito lento y arrastrable. Sin
  `setState` a 60 fps, con pausa fuera de pantalla y respeto a
  `prefers-reduced-motion`.
- **«Proyectos destacados» a secas y centrado**: fuera la etiqueta
  «Proyectos» y el botón «Ver todos los trabajos»; el titular lleva el
  efecto **shutter** (rebanadas que barren cada letra, clic = repetir),
  adaptado de pantalla hero a titular de sección, en la paleta del sitio.

## ✨ Novedades v1.44 — Threads interactivo · Imágenes de servicios · Trazo 2:1

- **Fondo Threads (React Bits) en «Quién soy»**: desde el slide AUTODIDACTA hasta
  DISEÑO, hilos blancos verticales ondulantes sobre fondo #0f1011 que reaccionan al
  cursor (se apartan), al scroll (deriva + fase de onda) y **al giroscopio del móvil**
  (los hilos siguen la inclinación del dispositivo; permiso iOS al primer toque).
  Reimplementación propia en WebGL puro, con las props del usuario.
- **Trazo «Quién soy» más grande y al ritmo del scroll**: la caja mantiene la
  proporción EXACTA 2:1 del viewBox (sin letterboxing) — el bucle abarca 2-3× el
  ancho del título — y el dibujo está atado al scroll: baja = dibuja, sube = retrocede.
- **Imágenes nuevas en Servicios (hover)**: «Sistemas creativos con IA» muestra la
  imagen del alimento (Pringles pizza) y «Experiencias web con IA» la de la laptop
  (web de Ouaken).
- **Condiciones comerciales**: TODAS las franjas recorren lentamente hacia la
  IZQUIERDA (50 px/s) al activarse (antes alternaban dirección).
- **Loader 100 % visual**: sin un solo texto — solo honeycomb + barra de progreso.
- **Reverso de la tarjeta elástica = logo alien** del navbar (logo-card.webp).
- **Eliminados**: «Desliza para conocer el stack», crédito «Matt Perry», tarjeta
  «Un día con CHARLI» y cordón InfiniteRibbon.
- **Botón «Descargar código»** se eleva automáticamente sobre el banner de cookies.
- **Overlay cross-origin del preview** eliminado (allowedDevOrigins) + favicon.ico.

## ✨ Novedades v1.32 — Todo funciona con «reducir movimiento» activado

**Diagnóstico**: la vista previa del cliente tiene `prefers-reduced-motion`
activado (preferencia del sistema), y eso rompía tres cosas a la vez —
reproducido y verificado emulando la preferencia en el navegador.

- **Solucionado el «1 Issue» (error de hidratación)**:
  `useReducedMotion` lee la preferencia real en la primera renderización
  del cliente mientras el SSR devuelve siempre «false» → el atributo
  `style` del path del óvalo no coincidía servidor/cliente → React 19
  registra «A tree hydrated but some attributes… didn't match» (el «1
  Issue» del overlay de dev). El óvalo ya NO usa useReducedMotion: su
  estado inicial es determinista (`dashoffset: 1`) en SSR y cliente —
  hidratación idéntica siempre. Badge del overlay: **0 Issue** en ambos
  modos.
- **La línea de «Quién soy» ya se dibuja al hacer scroll (también con
  la preferencia activa)**: con reduced-motion el driver del óvalo se
  retiraba y el trazo quedaba INVISIBLE para siempre (React además
  conservaba el atributo del servidor). Ahora el scrub corre siempre:
  es posición pura del scroll — el usuario controla el avance con su
  propio gesto, como la línea lima del slide DISEÑO (que nunca tuvo
  excepción). Verificado: dash 1 → 0,73 → 0,30 en y=650/900 con la
  preferencia activa, y de vuelta al subir.
- **El cordón ya se mueve (movimiento lento, ~55 px/s) con la
  preferencia activa**: el componente Iconiq trae su propio bloque
  reduced-motion que congela la pista (1 ms / 1 iteración). Override en
  globals.css con la clase doblada
  `.iconiq-infinite-ribbon-track.iconiq-infinite-ribbon-track`
  (especificidad 0,2,0 > 0,1,0 — el `<style>` del componente se inyecta
  después de la hoja, con especificidad igual ganaría él), manteniendo
  el componente verbatim. Decisión expresa del cliente (precedente
  v1.25): un cordón estático parece roto.
- **La píldora «Descargar código» ya esquiva el banner de cookies en
  TODOS los entornos**: motion v12 SALTA las animaciones de transform
  con prefers-reduced-motion, así que el lift (subida de la píldora)
  nunca se aplicaba en la vista previa — «el 1 issue continúa». La subida
  ahora va por TRANSICIÓN CSS (`.dl-lift`, compositor, inmune a la
  preferencia): gap de 12 px sobre el banner verificado por pixel-scan
  en 480 px y 390 px, en ambos modos; al aceptar las cookies la píldora
  regresa a su esquina.
- **Lecciones**: (1) NUNCA derivar atributos DOM iniciales de
  `useReducedMotion` (SSR false vs cliente real → mismatch de
  hidratación que React no corrige); (2) motion v12 respeta la
  preferencia saltando transforms — los movimientos FUNCIONALES van por
  transición CSS o escrituras directas; (3) al reemplazar un componente,
  auditar también su CSS de reduced-motion.

## ✨ Novedades v1.31 — Óvalo al ritmo del scroll · Cordones Iconiq amarillos · Botón flotante esquiva el banner

- **Óvalo de «Quién soy» dibujado POR el scroll**: el trazo a mano ya no
  es una animación temporizada que arranca al entrar en vista — ahora
  se dibuja (y se desdibuja) al ritmo del scroll, igual que la línea
  lima del slide DISEÑO: el mismo driver probado del sitio (rAF +
  intervalo de 50 ms, escrituras directas de dashoffset, sin reloj de
  animación). El óvalo arranca cuando el bloque entra completo en el
  viewport y termina de trazarse cuando su borde superior alcanza el
  borde superior de la pantalla (~580 px de scroll en escritorio).
  Con prefers-reduced-motion aparece ya trazado.
- **Cordones cruzados con la forma original de Iconiq**: integración
  verbatim del componente `InfiniteRibbon` (plantilla shadcn) en
  `ui/infinite-ribbon.tsx` — cintas amarillas (`bg-yellow-400`) con
  texto negro, banda fina (py-1), DOS cintas cruzadas ±5° (la primera
  absoluta sobre la segunda, como en su demo) y movimiento LENTO
  (duración calibrada: ~55 px/s con las palabras del stack en Anton).
  Fuera la banda blanca con bordes y las palabras lima/tinta de la
  versión anterior; fuera también el CSS viejo del track (pisaba el
  estilo inline del componente nuevo).
- **Arreglado el issue de la vista previa — el botón «Descargar
  código» ya no queda oculto tras el banner de cookies**: en
  viewports menores a ~1400 px la tarjeta del banner (casi a ancho
  completo) cubría por completo la píldora flotante (z-150 < z-160).
  Ahora el banner mide su tarjeta y publica en un mini store
  (`banner-store.ts`) cuánto debe subir el botón: la píldora se
  eleva con un gap de 12 px por encima del banner mientras éste
  está visible y regresa a su esquina al aceptar las cookies. En
  escritorios anchos no hay solape y el botón no se mueve.

## ✨ Novedades v1.30 — Rectificación: óvalo en «Quién soy» · Loader de ~3 s · Trazo DISEÑO restaurado

- **Pantalla de carga restaurada (~3 s, siempre visible)**: se retiró el
  contador pre-hidratación de la v1.29 (provocaba que la pantalla no
  apareciera en visitas repetidas). El contador vuelve a ser propiedad de
  React (`loader.tsx`): arranca en el primer tick del interval — sube
  visiblemente desde el 0 %, sin saltos — recorre 0→100 % en ~2 s con
  easeInOutSine y la cortina barre en 0,6 s (~3 s de experiencia).
  Aparece en TODAS las visitas (sin salto por sessionStorage).
- **Óvalo a mano en su sitio correcto**: el trazo de KokonutUI ya no
  rodea las palabras gigantes de los slides — ahora envuelve el título
  «Quién soy» del encabezado de la sección (justo debajo del label
  «CHARLI AI — Stack & perfil») y **se dibuja al hacer scroll**:
  pathLength 0→1 (2,5 s, curva manuscrita del original) cuando el bloque
  entra en el viewport (whileInView, una vez; estático con
  prefers-reduced-motion). Las palabras gigantes vuelven a su tamaño
  ~92 vw.
- **Alienígenas eliminados**: la capa de primer plano (los cuatro aliens
  en contemplación, v1.27) se retiró por completo — imagen y
  configuración. Las palabras gigantes cruzan los slides sin obstáculos.
- **Trazo del scroll RESTAURADO (DISEÑO → abajo)**: la línea lima que se
  dibujaba desde la palabra DISEÑO hacia abajo estaba rota desde la
  v1.27 — el selector del último slide (`section > ul > li`) dejó de
  encontrar el elemento cuando la pista pasó a vivir dentro del wrapper
  sticky y el driver abortaba en silencio. Corregido con selector
  descendente (`section ul > li:last-child`): el trazo vuelve a nacer
  sobre el slide 05 · DISEÑO y a dibujarse con el scroll a través de
  «Proyectos destacados».

## ✨ Novedades v1.29 — Óvalo a mano en «Quién soy» + pantalla de carga casi instantánea

- **Óvalo dibujado a mano alrededor de las palabras gigantes** (AUTODIDACTA →
  DISEÑO): adaptación del efecto "Hand Written Title" de KokonutUI
  (`src/components/ui/hand-writing-text.tsx`). Al tomar un slide el
  protagonismo, un trazo de tinta se dibuja alrededor de la palabra
  (pathLength 0→1, 1,6 s, curva de bolígrafo) con el mismo disparo que el
  efecto obturador (IntersectionObserver 0.5, replay en cada entrada) y viaja
  con ella por detrás de los alienígenas. Detalles de la adaptación:
  - **Calibración por tinta real**: el óvalo no usa la caja del texto sino el
  rectángulo de tinta medido con canvas (baseline, tilde de la Ñ incluida) +
  condición de esquina — una elipse que sólo encierra la caja corta las
  esquinas de las primeras/últimas letras, así que el margen vertical se
  deriva de (halfW/a)² + (halfH/b)² ≤ 0.94² y el horizontal se acota al
  espacio hasta el borde del viewport (sin recortes).
  - **Geometría horneada en píxeles** (sin viewBox): con estirado no uniforme,
  `vector-effect="non-scaling-stroke"` no se pinta en Chromium — el bbox
  verdadero del gesto lo da `getBBox()` de un path sonda invisible y el
  remapeo produce grosor de marcador uniforme en cualquier palabra/viewport.
  - `prefers-reduced-motion`: el óvalo aparece trazado, sin animación.
- **Palabras gigantes al ~84vw** (antes ~92vw): con la palabra animada a
  ~96vw (el obturador pierde el kerning y ensancha) la elipse no tenía
  espacio ni para envolver las esquinas ni para caber en pantalla. Siguen
  siendo monumentales y comparten tamaño, línea base y posición exactas.
- **Pantalla de carga casi instantánea y VIVA**: el porcentaje empieza a
  subir ANTES de la hidratación — un script inline justo después del loader
  en el HTML hace el conteo 0→100 % en ~1 s (easeInQuad: arranque suave y
  subida acelerada) desde el primer fotograma pintado; si React tarda, el
  propio script barre la cortina (transición CSS del compositor, ahora
  0,45 s). React sólo remata (store + sessionStorage + unmount) con un
  relevo exprés de respaldo. En visitas repetidas la cortina ni aparece.
  - El número vive en el atributo `data-pct` y se pinta con CSS
  `content: attr()` — un texto alterado pre-hidratación dispara el error
  duro de hidratación de React (regeneraría el subárbol y el contador se
  congelaría); un atributo, sólo un aviso suprimible.
  - Diagnóstico integrado: `window.__charliLog` = [[ms, %], …].

## ✨ Novedades v1.28 — Carga ágil (~2,8 s) + restauración íntegra tras revert del sandbox

- **La pantalla de carga ahora tarda ~2,8 s** (listón del cliente: ≤3 s): conteo
  0→100 % en 1 s + cortina de 0,6 s. Tres cambios de fondo la hacen robusta:
  - El **final del conteo lo dispara el propio interval** del contador (medido:
  los `setTimeout` podían sufrir throttling en la vista previa y la cortina no
  llegaba) + timer de respaldo idempotente.
  - La **cortina es una transición CSS de `transform`** (compositor) — ya no
  depende del hilo principal saturado por la hidratación — con unmount
  determinista y `pointer-events: none` como red de seguridad.
  - El **motor WebGL del hero arranca 1,2 s después** de que la cortina termina:
  su primer frame es la tarea más cara de la página (en render por software
  podía costar >1 s y congelaba el contador). El hero muestra la escultura
  (imagen fallback) y hace su intro justo después del telón.
- **Restauración íntegra v1.21→v1.27** tras un nuevo revert del sandbox (git
  volvió a v1.20): TiltedCard + imágenes cond-*, cordones cruzados InfiniteRibbon
  (60 px/s calibrados), CTA y statement por WhatsApp, terminal Python de
  automatización, Pringles/Quaken en servicios, checklist de seguridad de 19
  puntos, limpieza de créditos en pantalla, efecto obturador en las 5 palabras
  gigantes, tarjeta «Un día con CHARLI» centrada y los alienígenas en
  contemplación — todo verificado de nuevo (desktop + móvil, 0 errores).
- **Fix móvil**: el velo desenfocado de las tarjetas de condiciones se recorta
  al radio de la tarjeta (empujaba 29 px de scroll horizontal).

## ✨ Novedades v1.27 — Los alienígenas en contemplación (palabras por detrás)

- **Nueva capa de primer plano en el scroll horizontal «Quién soy»**: la imagen
  aportada de los cuatro alienígenas sentados se recortó de su fondo blanco
  (keying por conectividad al borde + des-multiplicado del mate blanco: bordes
  limpios sin halo incluso sobre el slide lima) y se sirve como
  `public/images/aliens-cutout.webp` (WebP con alfa, 1672×557, 202 KB,
  `loading="eager"`).
- **Las palabras gigantes pasan por DETRÁS de los aliens**: la capa no se mueve
  con la pista de slides, así que AUTODIDACTA · PROMPTING · AGENTES · CÓDIGO ·
  DISEÑO barren el encuadre mientras los alienígenas, sentados en el borde
  inferior, las contemplan. Oclusión intencionada y calibrada (~25-30 % del área
  de la palabra en desktop): la palabra sigue siendo perfectamente legible.
- **Escala responsive**: en `lg+` la fila completa sangra por los lados (~58 vh
  de alto); por debajo de `lg` se reduce a 50 vh y se centra el alien de la
  túnica naranja, de modo que la palabra queda legible por encima de su cabeza.
- `HorizontalScroll` generaliza el patrón con las props `foreground` /
  `foregroundClassName`.

## ✨ Novedades v1.26 — Efecto shutter en las palabras gigantes + tarjeta de agenda centrada

- **Nuevo componente `hero-shutter-text.tsx`** (adaptación de "Hero Shutter Text"
  de 21st.dev): cada carácter entra desenfocado y afina mientras tres franjas
  de su propio glifo (superior/media/inferior) barren en sentidos alternos con
  destellos lima/tinta. Disparo automático al entrar en viewport (50 %) con
  replay en cada re-entrada, accesible (`aria-label` + capas `aria-hidden`).
- **Aplicado a las 5 palabras gigantes** del scroll horizontal «Quién soy».
  En el slide AGENTES (fondo lima) las franjas de acento son blancas
  (`text-paper`). El tamaño uniforme (fitWords, ~92 vw) queda intacto.
- **Tarjeta «Un día con CHARLI»** reposicionada al **borde inferior central de
  la foto de perfil** (centrado exacto verificado a 0 px en desktop y móvil).

## ✨ Novedades v1.25 — Limpieza de créditos en pantalla + cordón siempre en movimiento

- **11 textos de crédito/versión eliminados** de la interfaz (loader, hero,
  «Quién soy», vídeo de servicios, footer): el sitio queda limpio — las
  atribuciones MIT/origen se conservan aquí y en los comentarios del código
  (requisito de licencia).
- **«¿Tienes un proyecto en mente?»** (footer) muestra el WhatsApp
  (**+53 53463755** → wa.me/5353463755) en lugar del correo.
- **El cordón ya nunca se congela**: exento de `prefers-reduced-motion` (un
  cordón estático parece roto; mismo precedente que el honeycomb del loader).

## ✨ Novedades v1.24 — Seguridad (checklist de 19 puntos) y rendimiento

- **Cabeceras de seguridad**: CSP estricta autohospedada (variantes dev/prod),
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (giroscopio
  libre para TiltedCard), HSTS. `frame-ancestors` a propósito sin fijar (el
  panel de vista previa incrusta por iframe — en producción, añadir
  `frame-ancestors 'none'`).
- **Cero secretos**: sin claves hardcodeadas, `/api` de prueba eliminada,
  query-logs de Prisma sólo en desarrollo, `.env` fuera del ZIP con
  `.env.example` incluido.
- **Rendimiento sin cambio visual**: `loading="lazy"` + `decoding="async"` en
  13 imágenes bajo el pliegue, `preload="metadata"` en los 4 vídeos de fondo
  (autoplay intacto), preload de las fuentes críticas (Switzer 400, Geist,
  VT323), favicon `src/app/icon.png`, metadata completa (canonical, robots,
  OpenGraph con imagen y Twitter card) y caché HTTP por tipo de asset (fuentes
  1 año inmutable; imágenes/vídeos 1 día + SWR; ZIP must-revalidate).
- Puntos 12-17 del checklist (login, usuarios, RLS) no aplican: sitio estático
  sin autenticación — documentado en la checklist original.

## ✨ Novedades v1.21–v1.23 — Condiciones 3D, cordones cruzados y WhatsApp

- **«Condiciones comerciales» como 5 tarjetas 3D** (TiltedCard de React Bits):
  giro suave al mover el cursor, reflejo sutil, tooltip con el título y velo
  inferior (copia desenfocada de la propia imagen + degradado tinta) para un
  texto siempre legible — con las 5 fotos de condiciones generadas a medida
  (pagos, alcance, cambios, terceros, proyectos complejos).
- **Cordones cruzados**: el marquee único pasa a DOS cintas InfiniteRibbon
  (patrón Iconiq) inclinadas ±5° — lima hacia un lado, tinta en reverse —
  calibradas a **60 px/s reales** (duración calculada midiendo la pista con
  las fuentes cargadas; en móvil, 60 s fijos ≈ 60 px/s).
- **CTA y contacto por WhatsApp**: el botón principal de contacto es
  «Escríbeme por WhatsApp» (wa.me/5353463755, respuesta <24 h).
- **Servicios con piezas reales**: Pringles (dirección artística) y Quaken
  (desarrollo web) en las miniaturas hover, y la fila de automatización con
  una **terminal Python determinista** (workflow de agente respondiendo a
  cada nuevo lead, línea activa en lima).

## ✨ Novedades v1.20 — El trazo FUSIONADO a las secciones · Fuera Timeline y "Cómo describo mi trabajo"

- **El trazo ya no vive en una sección propia**: se eliminó la sección intermedia dedicada y la
  línea lima se superpone ahora DIRECTAMENTE sobre las secciones reales de la página — nace
  sobre el slide **05 · DISEÑO** (el borde superior del lienzo se ancla en runtime a la posición
  final de ese slide: bottom de la sección horizontal − alto del slide, válido también con las
  discrepancias 100vh/innerHeight de móvil) y desciende **fusionada al contenido**, atravesando
  la cita de cierre del "Quién soy" y toda la sección **"Proyectos destacados"** (tarjetas
  apiladas incluidas) hasta completarse justo al despedir la sección.
- **Progreso del recorrido fusionado**: p = 0 cuando el carrusel horizontal termina (el slide
  05 · DISEÑO llena exactamente el viewport) y p = 1 cuando el final de "Proyectos" llega al
  borde inferior del viewport. La altura del lienzo la dictan las propias secciones — sin
  alturas fijas en vh.
- **Geometría en espacio de píxeles (fix de render)**: el estirado no uniforme necesario para
  cubrir el recorrido se HORNEA en el propio `d` del path (las coordenadas se reescriben al
  tamaño real del lienzo y el SVG renderiza 1:1, sin viewBox), de modo que un `strokeWidth`
  de 8 px es uniforme de verdad. Es la única vía estable: se probó en vivo que
  `vector-effect="non-scaling-stroke"` NO se pinta en Chromium con escalas no uniformes
  grandes, y sin él el grosor variaría hasta 5× entre tramos horizontales y verticales
  (1 px frente a 36 px en móvil). El `d` se recalcula cuando cambia el tamaño del lienzo.
- **Ancla de punta conservada** (sin zonas muertas): fracción dibujada f = max(p, f_mín) sobre
  la geometría real del path — la punta nunca sube de la línea situada a 30vh del borde
  superior; el trazo se "alimenta" desde arriba y desciende visible al ritmo del scroll.
- **Overlay decorativo no invasivo**: `aria-hidden` + `pointer-events-none` (verificado: nunca
  intercepta clicks — las tarjetas, chips y enlaces de "Proyectos" siguen siendo clicables) y
  `z-30` (sobre el contenido, bajo navbar/loader/banner de cookies).
- **Secciones eliminadas por completo** (a petición del cliente): **"Timeline & Proceso"**
  (los 5 pasos de descubrimiento a publicación) y **"Cómo describo mi trabajo"** (las 4
  tarjetas de disciplinas), junto con sus enlaces «Proceso» del menú móvil y del footer.
- **Verificación end-to-end** (agent-browser + análisis de píxeles + VLM): recorrido muestreado
  en 5 puntos en desktop (1440×900) y 5 en móvil (390×844) con el resto del contenido oculto —
  la línea se pinta en todos los checkpoints intermedios y en el final (p=1 completo, cola del
  trazo visible sobre la galería "Motion & Diseño Gráfico"); VLM: garabato orgánico legítimo,
  fusionado al contenido, sin defectos de layout ni desbordes horizontales.

## ✨ Novedades v1.19 — El trazo que sigue el scroll: SOLO la línea

- **Solo la línea**: a petición del cliente, del efecto Skiper 19 se conservó únicamente la
  línea lima que se dibuja con el scroll — eliminados el titular "El trazo que sigue tu
  scroll", el subtítulo y la tarjeta oscura "CHARLI AI" de la versión anterior.
- **Empieza justo en "05 · DISEÑO"**: el trazo nace inmediatamente tras la última slide del
  "Quién soy" — progreso de travesía: p = 0 cuando la sección asoma por la parte baja del
  viewport (nada más despedirse el slide 05 · DISEÑO) y p = 1 cuando "Proyectos" toma la
  pantalla. Funciona en cualquier altura de sección, sin alturas fijas en vh.
- **Sin zonas muertas (ancla de punta)**: el path original concentra ~60 % de su longitud de
  arco en los garabatos de la zona alta del lienzo; con mapeo uniforme la punta subía del
  viewport y la pantalla quedaba en blanco a mitad de tramo (detectado con VLM y corregido).
  Ahora se muestrea la geometría real del path (getPointAtLength) y la fracción dibujada es
  max(p, f_mín), donde f_mín es la primera fracción de arco cuya y alcanza la línea situada
  a 30vh del borde superior: la punta nunca sube de esa línea — el trazo se "alimenta"
  desde arriba y la punta desciende visible por la pantalla al ritmo del scroll (verificado:
  punta a ~280px del borde en desktop y ~258px en móvil, siempre visible; monótona en el
  scroll gracias a máximos acumulados + búsqueda binaria).
- **Inmune al throttle de la vista previa embebida**: driver de reloj de pared (rAF +
  intervalo de 50 ms + eventos scroll/resize/visibilitychange) con escrituras directas de
  `strokeDashoffset` — el mismo mecanismo ya probado por el loader, el Looping Words y el
  SpecialText.
- **viewBox extendido** (−20 −12 1298 2702) para contener el trazo COMPLETO (la cola del
  original bajaba hasta y≈2669 fuera del viewBox 2319 y se recortaba); sección puramente
  decorativa (aria-hidden), centrada con max-w, sin overflow horizontal en 390px.

## ✨ Novedades v1.18 — Brackets negros · 8 palabras · Efecto scramble/decode en todas las letras pequeñas

- **Brackets negros**: las 4 esquinas en L del selector del Looping Words pasan del azul
  eléctrico (#2600ff) de la referencia original a **negro** (#000000), a petición del cliente.
- **Titular con 8 palabras**: `Portafolio · IA · Diseño Web · Desarrollo · Diseño Gráfico ·
  Programación · No-Code · Low-Code` — "Diseño" pasa a ser "Diseño Gráfico" y se añaden
  Programación, No-Code y Low-Code. Verificado en móvil 390px: la palabra más larga
  (DISEÑO GRÁFICO, 335px) cabe en los 350px disponibles — sin overflow horizontal.
- **SpecialText (21st.dev) en todas las letras pequeñas del sitio**: efecto scramble/decode
  (fase 1: caracteres aleatorios creciendo; fase 2: revelado con cursor "_") aplicado a
  ~130 textos — eyebrows/labels de sección, chips y píldoras, pestañas, enlaces del navbar
  y del footer, nombres de plan y features de tarifas, tags de servicios, cabecera del chat,
  línea de contacto del CTA, botones del banner de cookies y "ZIP · 48 MB" del botón flotante.
  Cada texto decodifica **una vez al entrar en viewport** (IntersectionObserver, stagger en
  cascada dentro de cada grupo) y se re-decodea al cambiar de pestaña en Tarifas/Servicios
  o al abrir el menú móvil. Los textos del hero y el navbar esperan a que la cortina del
  loader termine (prop `active`, mismo patrón que LoopingWords) para que el efecto no
  ocurra oculto. Se excluyen los textos que ya tienen el efecto flip (botones/CTAs), los
  numéricos (precios, contadores, años) y los párrafos multilínea (el efecto es de una línea).
- **Adaptaciones del componente original (documentadas en el propio archivo)**:
  - **Reloj de pared**: el original avanzaba un paso por tick de interval — en la vista
    previa embebida los timers salen ~9,5× tarde y el decode duraría ~18 s. Aquí cada
    latido calcula la fase con `performance.now()` (la técnica del loader y del
    LoopingWords v1.17): la duración es siempre la diseñada. Latido doble rAF + interval
    con escrituras directas de `textContent` (sin re-render de React).
  - **`inline-block` en vez de `inline-flex`**: una run de texto de solo espacios no se
    envuelve en ítem flex anónimo → el span medía 0px de alto y el IntersectionObserver
    con margen negativo no lo reportaba (los labels nunca decodificaban).
  - **Margen `-100px 0px 0px 0px`**: con -100px también abajo, los elementos del final de
    la página (barra inferior del footer) jamás entrarían en la raíz efectiva del observer.
  - Tipografía heredada del contenedor (el original fuerza `font-mono h-4.5`), `whitespace-pre`
    para reservar el ancho final desde el primer paint (sin saltos de layout) y
    `aria-label` con el texto real para lectores de pantalla.
  - Fixes de lint: los `setState` síncronos en efectos del original se difieren un tick.

## ✨ Novedades v1.17 — El bucle cambia de palabra cada 2 s TAMBIÉN en la vista previa embebida

- **Causa raíz encontrada**: en la vista previa embebida el navegador puede
  **pausar el bucle de render** — los tweens de GSAP (ticker rAF) y las
  animaciones WAAPI/CSS infinitas (v1.14–v1.16) avanzaban su reloj pero el
  navegador **no pintaba ni un fotograma**: la palabra quedaba congelada en
  "Portafolio" aunque en un navegador sano el bucle funcionase perfecto.
  La prueba: las dos animaciones que SIEMPRE se vieron en la vista previa
  (la barra del loader y el flip de los CTAs) son las que usan **timers +
  escrituras directas de estilo**.
- **El bucle ya no es una animación — es un driver de reloj de pared**: cada
  latido calcula la fase del ciclo con `performance.now()` (reloj de pared,
  jamás frenado por el navegador) y escribe `transform`/`width` directamente
  en el DOM. Aunque los timers salgan tarde, **la palabra pintada es siempre
  la que corresponde a AHORA**: cadencia real de 2 s por palabra
  (0,8 s de reposo + 1,2 s de slide elástico) en cualquier entorno.
- **Latido doble**: `requestAnimationFrame` (suavidad a 60 fps donde el bucle
  de render vive) + `setInterval` de 50 ms (garantía donde rAF está congelado
  — la misma técnica del loader). Escrituras idempotentes y deduplicadas:
  coste cero durante los reposos.
- **Curvas del original evaluadas en JS**: el rebote `elastic.out(1, 0.85)`
  del slide y la persecución `expo.out` del selector se calculan por latido
  (mismas curvas de GSAP, sin depender de su reloj de animaciones).
- **`transform` de reposo inline en el JSX**: el primer paint (aún sin JS)
  ya muestra "Portafolio" centrada — y si el JS no corriese, el titular
  quedaría estático en la primera palabra, no en la segunda.
- **`prefers-reduced-motion`**: el bucle sigue (es la identidad del hero)
  pero el slide es lineal, sin rebote elástico.

## ✨ Novedades v1.16 — Bucle a 2 s garantizado · Sin rectángulo · Alineado al eyebrow

- **La palabra ahora cambia cada 2 segundos de verdad, siempre**: el bucle
  dejó de depender de cadenas de callbacks JS (que en la vista previa
  embebida avanzaban a ~13 s por palabra porque el navegador frena los
  timers ~10× y el rAF a ~2 fps) y ahora es **una única animación infinita
  por elemento** (Web Animations API): el transform de la lista y el ancho
  del selector arrancan juntos sobre la misma línea de tiempo y **todo el
  ciclo se calcula del reloj del documento** — sin un solo callback de JS
  en régimen permanente, la cadencia de 2 s por palabra (0,8 s de reposo +
  1,2 s de slide elástico, como el original) es real a cualquier framerate,
  y el transform lo compone el compositor (fluido aunque el hilo principal
  vaya saturado). Selector y palabra comparten reloj: nunca se
  desincronizan.
- **Costura del bucle sin reordenar el DOM**: la lista lleva una copia de
  la primera palabra al final; la última iteración la muestra centrada y el
  reinicio salta a la original — mismas letras, mismo ancho, transición
  invisible (sustituye al truco `appendChild` del original, que mutaba el
  DOM en cada vuelta).
- **Sin el rectángulo de fondo**: el fundido de las palabras vecinas ya no
  es una capa de degradado con color plano pintada encima del hero (que se
  veía como un bloque rectangular sobre el fondo texturizado) — ahora es
  una **máscara del contenedor** (`mask-image`, 5%→40% / 60%→95%): las
  vecinas se funden a transparente dejando ver el fondo real (ruido,
  escultura y brillo), sin pintar nada.
- **Palabras emparejadas con el eyebrow**: la ventana del bucle está
  anclada a la izquierda inferior del hero, con la lista y el selector
  alineados al mismo borde izquierdo que "CHARLI AI — Tecnólogo creativo
  en IA" (antes la palabra flotaba centrada en su columna).
- Curvas del original (`elastic.out(1, 0.85)` y `expo.out` de GSAP)
  muestreadas a `linear()` de CSS para los keyframes (con fallback a
  bezier clásico); rebuild al redimensionar o al cargar las fuentes web
  conservando la fase del ciclo; `prefers-reduced-motion` respetado
  (palabra fija); keyframe explícito en offset 1 para eliminar la región
  colgante tras el último keyframe (evitaba un ancho de selector
  transitorio erróneo junto a la costura).

## ✨ Novedades v1.15 — Looping Words fiel al original · Ya nunca estático

- **Réplica visual exacta de la referencia original de Osmo** (se
  recuperó el CSS oficial del recurso `looping-words-with-selector`):
  la ventana ahora mide **3 líneas** (`calc(0.9em * 3)`) — la palabra
  central se ve nítida y las **vecinas quedan fundidas** arriba y
  abajo (degradado del color del fondo, 5%→40% / 60%→95%) —, la
  lista está **centrada y en MAYÚSCULAS**, y el selector vive en el
  centro exacto (`left/top 50%` + `translate(-50%, -50%)`, alto de
  una línea) con **4 esquinas en L pequeñas** (0,125 em, trazo
  0,035 em) en el **azul eléctrico #2600ff** de la referencia.
  (Antes: palabras a la izquierda, selector pegado al borde,
  ventana de 1 línea sin vecinas y esquinas grandes de tinta.)
- **La palabra ya no se queda estática**: el scheduling pasó de
  `gsap.delayedCall` a **`window.setTimeout`** — el ticker de GSAP
  descansa entre tweens y, si el navegador pausa el rAF (vista
  previa embebida), un delayedCall nunca dispara y el bucle muere
  en la primera palabra; los timers siguen vivos (por eso el flip
  de los botones sí se veía). Se mantiene
  `gsap.ticker.lagSmoothing(0)` y se añade un **watchdog** que
  fuerza la finalización de cualquier tween colgado a los 2,2 s —
  el bucle no puede morir.
- **Re-snap geométrico del selector**: al aterrizar cada palabra se
  mide la que REALMENTE ha quedado centrada y el frame se ajusta a
  su ancho exacto — inmune a tweens perdidos o índices
  desincronizados (verificado: frame = palabra visible en el 100%
  de los aterrizajes muestreados).
- **Geometría del original restaurada**: con la ventana de 3 líneas
  la palabra nítida es siempre `currentIndex + 1` (el "+1" de la
  demo NO era un bug — la corrección v1.14 era la equivocada) y la
  medición usa la **colección viva** `wordList.children`, que se
  reordena sola con el truco del `appendChild` (un array congelado
  apuntaba a la palabra equivocada tras la primera rotación del
  DOM).
- **Arranque como la referencia**: la primera palabra visible es
  **"Portafolio"** (desplazamiento inicial de +1 línea con hueco
  fundido arriba), luego el ciclo Portafolio → IA → Diseño Web →
  Desarrollo → Diseño se repite (verificado por simulación y
  muestreo DOM). `aria-label="Portafolio"` en el H1.
- **ZIP completo (48 MB, 152 archivos)**: el staging se reconstruyó
  como espejo exacto del repositorio — los ZIP anteriores (35 MB)
  no incluían varios vídeos `public/videos/` que el sitio sí
  referencia (el proyecto descargado les daría 404). Se excluye
  únicamente `mixkit-3925-light.mp4` (3,3 MB, sin ninguna
  referencia en el código) y la etiqueta del botón flotante se
  actualiza a "ZIP · 48 MB".
- **Escala ajustada**: clamps 104/88/48 px (desktop/tablet/móvil)
  para que la ventana de 3 líneas (2,7 em) no coma el hero — sin
  overflow en 390 px, CTAs y body intactos, selector centrado al
  píxel (`selCx = wordCx` en desktop y móvil).

## ✨ Novedades v1.14 — Titular del hero con Looping Words (Osmo)

- **El H1 del hero ya no es estático**: donde estaba
  "Inteligencia que responde." ahora hay un **Looping Words** —
  el clásico de [Osmo](https://www.osmo.supply/) (vía 21st.dev) —
  con las palabras **Portafolio · IA · Diseño Web · Desarrollo ·
  Diseño** subiendo en bucle infinito con easing elástico
  (`elastic.out(1, 0.85)`), mientras un **selector de 4 esquinas**
  estilo viewfinder ajusta su ancho (expo 0,5 s) al de la palabra
  en curso — de "IA" (estrecho) a "Diseño Web" (ancho).
- **Mecánica original intacta**: lista de palabras desplazada por
  `yPercent`, truco de bucle sin costuras (el primer `<li>` se
  mueve al final y el índice se reajusta sin salto visible) y
  alturas por slot en `em` → escala con el `clamp()` del titular
  en cada breakpoint (140 px máx. desktop, 62 px máx. móvil).
- **A prueba de throttle**: el bucle se reescribió con un
  **planificador serializado** (el siguiente movimiento solo se
  agenda al completar el actual, `gsap.delayedCall`) y
  `gsap.ticker.lagSmoothing(0)` — en la vista previa embebida el
  rAF cae a ~1 tick/2,7 s y el lagSmoothing por defecto congelaba
  la animación en la cola elástica; ahora el reloj salta al
  presente y las palabras avanzan en orden (a 60 fps, ritmo
  original de 2 s por palabra).
- **Corrección sobre la demo original**: el selector se dimensiona
  a la palabra que ENTRA (`currentIndex % total`), no a la
  siguiente (`currentIndex + 1`) — el frame siempre abraza la
  palabra visible (en la demo original el frame va una palabra
  por detrás).
- **Sincronía con el loader** (`active={loaderDone}`): el bucle no
  arranca tras la cortina; y **prefers-reduced-motion**: primera
  palabra fija + selector estático, sin bucle.
- Se retira el efecto flip del H1 (las 5 palabras suben en bucle ahora);
  el flip se mantiene en el resto del sitio y en los botones.

## ✨ Novedades v1.13 — "Diseños Webs" con muestra real · Ranking legible

- **Tercera tarjeta renombrada a "Diseños Webs"** (antes "CHARLI AI
  Portfolio"): ahora presenta una **muestra real de diseño web** — la
  página de *pupita's* (gestora de redes sociales) — dentro de un
  **marco de navegador flotante** (`mockup`): barra con tres puntos,
  URL visible `pupitas-manager.vercel.app`, rotación −1,6° que se
  endereza al hover, sobre fondo tinta con brillo cálido ámbar que
  acompaña la paleta de la muestra. El propio marco enlaza al sitio.
- **Chips de enlaces externos** (`links` + `LinkChips`): bajo la
  descripción, dos chips estilo terminal con icono, dominio y etiqueta —
  **`pupitas-manager.vercel.app` · NUEVO** (el diseño actual) y
  **`portafolio-charli.vercel.app` · ANTIGUO** (el portafolio anterior),
  ambos abiertos en pestaña nueva.
- **Ranking IA legible en la segunda tarjeta**: la imagen del leaderboard
  (`work-ranking.jpg`) ahora lleva **difuminado oscuro horneado píxel a
  píxel** debajo de la fila **DeepSeek-V4** (GaussianBlur 16 + brillo
  0,25, rampa y=562→598 sobre 600×1037): GPT-5.2, Claude Opus 4.5,
  Gemini 3 Pro, Grok 4.1 y DeepSeek-V4 se leen nítidos arriba, y la zona
  inferior —donde vive el texto de la tarjeta— queda oscura y sin texto
  del ranking que choque con el título, la descripción y el chip del repo.
  Al hornearlo en la imagen, el recorte de `object-cover` nunca deja
  asomar filas legibles debajo, en ningún viewport.

## ✨ Novedades v1.12 — El flip ya NO depende del cursor · Botones con el mismo efecto

- **Ola al entrar en viewport (sin cursor)**: cada palabra observa su propia
  intersección con el viewport (`IntersectionObserver`, margen del 10%) y al
  **entrar en pantalla dispara la ola completa** — el volteo en cascada se ve
  al hacer scroll, sin hover y sin esperas: el titular saluda al entrar.
  Al re-entrar en viewport vuelve a olear (anti-rebote de 1,8 s para no
  martillar con micro-scrolls en el borde).
- **Burbuja en bucle solo mientras visible**: los timers del bucle (~4,6 s,
  hold 1,6 s) ahora **solo corren para texto en pantalla** — v1.11 burbujeaba
  a ciegas incluso con el titular fuera del viewport. Si la palabra sale a
  mitad de ola, baja limpia (cleanup determinista, sin estados pegados).
  Esto además hace el efecto **resistente al throttling de timers** de pestañas
  en segundo plano / vista previa embebida: la ola de viewport (eventos de IO,
  no throttled) siempre se ve al scrollear.
- **Arranque sincronizado con el loader**: la primera ola se pospone hasta que
  la cortina del loader termina de levantar (~4,2 s; 0,5 s si ya se completó
  en la sesión vía `sessionStorage`) para no voltear a ciegas tras el telón.
- **Hover con respuesta inmediata**: al pasar el cursor el stagger es solo por
  letra (25 ms, como la demo original) — la cascada entre palabras (45 ms)
  queda reservada a la ola automática. Antes la 2ª palabra de un titular
  respondía al hover con ~250 ms de retraso heredado de la ola.
- **Botones con el mismo efecto** — nuevo **`FlipGroup`**: envuelve el botón y
  extiende el hover a **toda su superficie** (iconos y padding incluidos, vía
  contexto de React), y las etiquetas de los CTA principales voltean letra a
  letra (ola al entrar en viewport + burbuja + hover): "Reservar llamada"
  (navbar desktop, menú móvil y hero), "Ver proyectos", **"Empezar proyecto"
  ×3** (tarifas), "Escríbeme" y "WhatsApp directo" (contacto) y "Descargar
  código" (pill flotante).
- **`prefers-reduced-motion`**: desactiva la ola de viewport y la burbuja (el
  hover se mantiene, como acción directa del usuario).

### v1.11 — Efecto flip letra a letra en TODAS las letras grandes

- **Flip Links integrado a la escala del sitio** (`src/components/ui/flip-links.tsx`,
  basado en el componente Flip Link de 21st.dev/vaib215): cada palabra grande
  **voltea letra a letra** — la fila superior sube escalonada (25 ms por letra)
  mientras su copia gemela sube desde abajo. **En hover** (como el original) y
  también **en burbuja automática**: sin cursor, el volteo se dispara solo en
  bucle (~4,6 s, mantenimiento 1,6 s) con **desfase determinista por texto**
  (hash → sin mismatch de hidratación), de modo que las 73 palabras del sitio
  burbujean desincronizadas de forma orgánica; cada titular comparte fase y
  encadena retardos (45 ms entre palabras) para voltear como **una sola ola**.
- **Cobertura**: H1 del hero ("Inteligencia que / responde.", una ola para las
  dos líneas) · palabra fantasma "charli" del fondo · las **5 palabras gigantes
  de "Quién soy"** (el ajuste uniforme de tamaño sigue midiendo el wrapper y
  ahora fija 13,4 vw compartidos) · el encabezado "Quién soy" · **todos los
  titulares display del sitio** (Sobre mí, Proyectos, Servicios, Enfoque de
  trabajo, Proceso, Cuatro disciplinas, Tarifas, CTA "Empieza tu proyecto con
  CHARLI") vía `MaskLines` (prop `flip`) · **el email del footer**.
- **`flipWords(node)`**: divide cada PALABRA (no cada línea) en un `FlipText`,
  recorriendo el árbol React de forma recursiva y conservando los elementos
  anidados (spans con itálicas serif, el enlace del email…) y el flujo inline —
  los saltos de línea naturales del titular siguen funcionando en móvil. Las
  letras son inline-block en flujo normal (no flex) para **conservar el
  letter-spacing** del titular entre letras.
- **Robustez tipográfica**: `pl/pr 0.06/0.1 em + pb 0.14 em` con márgenes
  negativos compensados — los descendentes (g, j, p, q, y) no se recortan en
  reposo, la fila entrante queda totalmente oculta (translateY ±120%), los
  voladizos de itálicas (Instrument Serif) no se clipean y la posición de cada
  glifo es exactamente la original. Texto real para lectores de pantalla
  (`sr-only`) con las filas animadas `aria-hidden`.
- **`prefers-reduced-motion`**: la burbuja automática se desactiva (el volteo
  por hover es acción directa del usuario y se mantiene).

### v1.10 — Foto de perfil real · Enfoque de trabajo 100% IA · Sin reel

- **Foto de perfil real en "Sobre mí"**: la imagen de stock del portátil se
  sustituye por el **retrato real de Charli** (`public/images/charli-perfil.jpg`,
  1024×1308 — recorte sesgado hacia arriba para que la cabeza sobreviva al
  recorte vertical del parallax) en la columna derecha, con la tarjeta
  "Un día con CHARLI" superpuesta igual que antes. El mismo retrato, en
  **recorte cuadrado centrado en la cara** (`charli-avatar.jpg`, 320×320),
  pasa a ser el **avatar del chat** junto a "CHARLI · escribiendo…" en el
  mockup de colaboración en tiempo real. Retiradas las imágenes de stock
  `about-workspace.jpg` y `autodidact.jpg`.
- **"Enfoque de trabajo" reescrito sobre la IA**: la sección oscura abandona
  el mensaje cromático ("Blancos, negros y grises…") y ahora comunica el
  **impacto, la mejora y la potenciación que provoca hoy integrar la IA en
  cada proyecto**, con su **necesidad obligatoria** — titular "La IA integrada
  en cada proyecto *potencia*, mejora y multiplica su impacto — y hoy es
  indispensable" + párrafo: "Integrarla ya no es una ventaja: es una necesidad
  obligatoria…". Los contadores odométricos (2+ años, 3 APIs, 5 entornos,
  100%) se mantienen.
- **Eliminado el botón "Ver reel · 0:24"**: fuera el botón circular de
  reproducción y su lightbox de vídeo; el titular ocupa ahora todo el ancho
  de la sección sobre el vídeo de fondo en loop. El vídeo del reel
  (`mixkit-31562.mp4`) deja de empaquetarse — el ZIP baja a ~35 MB.

### v1.9 — Contador a prueba de congelación · Palabras uniformes · Proyectos con repos y demos

- **Ascensión 0% → 100% garantizada en la pantalla de carga**: el porcentaje y
  la barra ya no dependen de `requestAnimationFrame` ni de re-renders de React
  — se actualizan por **intervalo (50 ms) con escritura directa al DOM** vía
  refs (`textContent` / `style.width`). El hilo principal llega saturado
  durante la carga inicial (hidratación, WebGL, fuentes, vídeos) y el bucle de
  render puede pausarse (pestaña en segundo plano, preview embebida): el
  honeycomb seguía animando (transform/opacity corren en el compositor) pero
  el número se quedaba congelado en 0%. Con timers + escritura directa, el
  0→100 asciende siempre, sincronizado con la barra (24 → 53 → 81 → 98 → 100).
- **"Quién soy" — todas las palabras al tamaño de AUTODIDACTA**: `fitWords`
  ahora mide las cinco palabras y aplica a **todas el mismo font-size** (el
  mínimo calculado, dictado por AUTODIDACTA, la más larga, ~92vw de ancho):
  misma altura de letra y línea base en los 5 slides; las cortas (AGENTES,
  CÓDIGO, DISEÑO…) simplemente ocupan menos ancho. Antes cada palabra se
  escalaba por separado para llenar ~92vw y las cortas salían gigantes.
- **Proyectos destacados con repos reales y demos visuales**:
  - **Telegram Intelligence Bot**: las **dos capturas reales del bot**
    (`telegram-demo-1/2.jpg`, 720×1471 — búsqueda "Matrix" con lista numerada
    de 14 coincidencias y la ficha final con póster, tipo y sinopsis) flotan
    sobre un fondo oscuro con brillo lima, ligeramente rotadas. Debajo, un
    **chip terminal** `gh repo clone CharlyCyber/Telegram-Visual-Bot` con
    icono de terminal, enlace al repo de GitHub y **botón de copiar** (con
    feedback ✓ lima y fallback sin Clipboard API).
  - **AI Intelligence Agent**: nueva imagen de fondo — un **leaderboard de
    benchmarks de modelos de IA** ("RANKING·IA": ELO de GPT-5.2, Claude Opus
    4.5, Gemini 3 Pro, Grok 4.1, DeepSeek-V4, Qwen3-Max y Llama 4, con barras
    lima, deltas de 30 días y filas fantasma desvanecidas), renderizado a
    partir de un HTML con la tipografía y paleta del sitio (600×1037) —
    sesgado arriba para que ningún recorte vertical de `object-cover` pierda
    el ranking. Chip `gh repo clone CharlyCyber/Ranking-IA` igual al anterior.
  - Retiradas las imágenes de stock `work-telegram.jpg` y `work-aiagent.jpg`.

### v1.8 — Hero sin ticker · Loader siempre animado

- **Hero sin barra de ticker**: eliminada por completo la franja "Estudios de
  luz & motion · Loop · IA · Loops experimentales de luz, ritmo y composición
  generados con IA" que flotaba bajo el navbar — el hero recupera su aire
  original: escultura al centro, wordmark gigante y hint "MUEVE EL CURSOR"
  recolocado libremente sobre la forma (sin clamp). El navbar conserva el logo
  a la izquierda de "CHARLI AI", el menú y "Reservar llamada".
- **Loader con animación garantizada**: el honeycomb **nunca más queda
  estático**. (1) Se retiró el apagado por `prefers-reduced-motion` — la
  pantalla dura <3s y su animación es parte esencial del diseño. (2) Los
  `animation-delay` pasaron a **negativos** (−1s…−0.4s): el clúster **nace ya
  en plena onda**, con la mayoría de los hexágonos visibles desde el primer
  fotograma, en vez de empezar vacío (el fill `backwards` + escalonado clásico
  mantenía todo invisible durante los primeros ~0,6s). Keyframes, ciclo de
  2,1s y escalonado de 0,1s intactos; el 0% → 100% con barra de progreso
  sigue exacto.

### v1.7 — Loader con progreso 0→100 · Logo · Ticker del hero · Footer con aurora

- **Pantalla de carga con progreso visible 0% → 100%**: el honeycomb clásico se
  conserva íntegro (7 hexágonos negros pulsando en secuencia) pero ahora es
  **más grande** (`scale: 1.55` vía `.honeycomb-lg`) y va acompañado, centrado
  bajo el clúster, de un **porcentaje grande** (48–60px, dígitos tabulares), una
  **barra de progreso** (224px, relleno exacto al contador) y la etiqueta
  "CARGANDO PORTFOLIO". La curva del contador pasó a `easeInOutSine`
  (arranque y final suaves) para que el avance 0→100 se lea como progreso
  real; abajo quedan dos etiquetas de marca a ambos lados. El clúster nunca
  toca el número (wrapper de 136×128 que respeta el área visual real del
  honeycomb escalado).
- **Logo de marca en el navbar**: la imagen real del logo (`public/images/logo.jpeg`,
  marca blanca sobre negro) sustituye al icono de chispa a la **izquierda de
  "CHARLI AI"**, como insignia circular de 32px con anillo sutil.
- **Barra superior del hero (ticker)**: bajo el navbar flota una franja full-bleed
  con **marquee infinito** (46s, `marquee-x`) que recupera el estudio destacado:
  `ESTUDIOS DE LUZ & MOTION` · píldora lima `LOOP · IA` · "Loops experimentales
  de luz, ritmo y composición generados con IA" — con hairlines arriba/abajo,
  fondo papel al 55% y `backdrop-blur`. `pointer-events: none` (no bloquea la
  interacción con la escultura) y el hint "MUEVE EL CURSOR" se recoloca con un
  clamp para no invadirla nunca (mínimo 14px por debajo).
- **"Quién soy" · slide 03 (AGENTES)**: eliminados los chips
  "5 entornos agénticos" y "3 APIs en un bot"; el slide queda con kicker,
  descripción y skill bar (92).
- **Footer renovado**: fuera la tarjeta "Charli, AI Creative Technologist /
  Reservar llamada con Charli" (quedan email + copy + 4 chips sociales), y el
  fondo negro plano gana un **gradiente oscuro animado** (aurora de lima/oliva
  al 6–16% de opacidad, dos capas `::before/::after` derivando 16s/23s en
  direcciones opuestas, `.footer-aurora`) — texto blanco 100% legible,
  `prefers-reduced-motion` respetado.

### Historial

- v1.12 — Ola de flip al entrar en viewport + burbuja solo mientras visible + hover inmediato · efecto flip en los botones principales (FlipGroup).
- v1.11 — Flip letra a letra (hover + burbuja) en todas las letras grandes del sitio.
- v1.10 — Retrato real en Sobre mí + avatar del chat · Enfoque de trabajo sobre la IA · sin botón de reel.
- v1.9 — Contador 0→100 a prueba de congelación · palabras de "Quién soy" uniformes · tarjetas con repos y demos.
- v1.8 — Hero sin ticker · loader honeycomb siempre animado (delays negativos).
- v1.6 — Loader honeycomb monocromo · palabras gigantes completas · navbar y galería minimalistas.
- v1.5 — Paleta del sitio en "Quién soy" · palabras alineadas · sticky cards · fix de motion v14.
- v1.4 — Partículas por defecto grandes y centradas · sección con scroll horizontal · 100% español.
- v1.3 — Liquid Sculpture Hero (WebGL2 GPGPU, tilt en móvil, Geist + Instrument Serif).
- v1.2 — Galería de motion en Proyectos, strips de motion en Servicios y Proceso,
  tarifas CUP por defecto, Premium USD $600, botones alineados, sin relojes ni
  estilo digital, hero limpio.
- v1.1 — Wordmark Anton.

## 🚀 Requisitos e instalación

- **Node.js 18.18+** (o **Bun 1.0+**)

```bash
npm install        # o: bun install
cp .env.example .env   # DATABASE_URL (SQLite relativa)
npm run db:generate
npm run dev        # http://localhost:3000
```

Producción:

```bash
npm run build
npm start
```

> La base de datos SQLite (`db/custom.db`) viene incluida con el esquema aplicado
> y la conexión usa ruta relativa (`.env`).

## 📁 Estructura

```
├── db/custom.db                  # SQLite (esquema aplicado)
├── prisma/schema.prisma
├── public/
│   ├── fonts/                    # Switzer 400–700 · Anton · Geist (var) ·
│   │                             #   Instrument Serif italic (auto-hospedadas)
│   ├── images/                   # esculturas del hero · retrato y avatar de
│   │                             #   Charli · capturas Telegram · ranking IA
│   └── videos/                   # 5 vídeos motion graphics en loop
└── src/
    ├── app/                      # layout, page (one-page), globals.css (.sh-*, .honeycomb)
    ├── components/site/
    │   ├── liquid-hero.tsx       # hero: motor WebGL2 + UI editorial + tilt
    │   ├── about-horizontal.tsx # "Quién soy" con scroll horizontal (contenido)
    │   ├── works.tsx            # proyectos: tarjetas apiladas GSAP + vídeo 16/9
    │   └── …                     # loader, navbar, services, autodidact,
    │                             #   dark-statement, process, i-describe,
    │                             #   pricing, cta, footer, …
    └── components/ui/
        ├── horizontal-scroll.tsx # motor del scroll horizontal anclado
        │                         #   (sticky + motion/scroll + ajuste de palabras)
        └── flip-links.tsx       # efecto flip letra a letra (hover + burbuja)
                                  #   FlipText · flipWords() · fases deterministas
```

## 🐝 Cómo funciona el loader honeycomb

`src/components/site/loader.tsx` + bloque `.honeycomb` en `src/app/globals.css`:

1. Siete `<div>` hexagonales (rectángulo 24×12 + triángulos CSS `:before/:after`)
   alrededor de uno central, con `animation-delay` **negativos** escalonados de 0.1s
   (−1s…−0.4s: el clúster aparece ya en plena onda, sin zona muerta inicial;
   `honeycomb 2.1s infinite backwards`: escala 0→1→0 con ventanas de opacidad).
2. **Figuras negras** (`#0f1011`, la tinta del sitio) sobre **fondo claro**
   (`bg-paper #ffffff`), monocromo: etiquetas `label-caps` en tinta al 60/45%,
   contador porcentual y hairline de progreso en tinta.
3. **Contador por intervalo + refs**: el % y el relleno de la barra se
   escriben directamente al DOM cada 50 ms (`pctRef.textContent`,
   `fillRef.style.width`, curva easeInOutSine) — sin rAF ni re-render, la
   ascensión 0→100 nunca se congela. Progreso determinista (~2.6s), cortina
   de salida `y: -100%`, marca `charli-loader-done` en `sessionStorage` (una
   vez por sesión) y store compartido (navbar/hero esperan a que termine).
4. `prefers-reduced-motion`: el honeycomb **se mantiene animado siempre** (pantalla breve, <3s); solo los marquees largos se apagan.

## 🎞️ Cómo funciona el Liquid Hero

`src/components/site/liquid-hero.tsx` contiene:

1. **Motor WebGL2** (`LiquidEngine`): 4 programas GLSL —
   campo de flujo (wake del cursor), simulación de partículas
   (ping-pong RGBA16F), render instanciado con streaks, y pasada de
   imagen (distorsión + disolución).
2. **UI editorial**: eyebrow, H1 con acento serif, body, CTAs, hint,
   palabra fantasma "charli" y crédito.
3. **Tilt móvil**: `DeviceOrientationEvent` mapea gamma/beta (±30°) al
   punto de interacción; iOS pide permiso con la píldora y calibra la
   posición neutra al activar.

Por defecto la escultura se renderiza **como partículas en reposo**
(`restStyle: "particles"` + `ambient: true`), grande y centrada sobre
el viewport del hero. En el objeto `CONFIG` y en las opciones del motor
(pasadas al constructor de `LiquidEngine`) puedes volver al modo
`restStyle: "image"` (imagen estática que se disuelve al interactuar).

## 🎞️ Cómo funciona el scroll horizontal ("Quién soy")

`src/components/ui/horizontal-scroll.tsx` (genérico) +
`src/components/site/about-horizontal.tsx` (contenido):

1. Una sección de `N × 100vh` contiene un `<ul>` sticky con `N` slides
   `w-screen`; el progreso del scroll de la sección se mapea (con `motion`,
   `ease: "linear"`) a `x: [0, -(N-1) × viewport]`.
2. **Tamaño uniforme de palabra**: al montar (y al resolver
   `document.fonts.ready`), se miden las cinco palabras a su tamaño base
   (20vw) y **todas reciben el mismo `font-size` inline** — el mínimo de los
   tamaños que las harían ~92vw, dictado por la más larga (AUTODIDACTA):
   misma altura de letra y línea base en los 5 slides; las cortas ocupan
   menos ancho. La medición usa `offsetWidth` (layout puro, inmune a la
   transform x del barrido).
3. **Coreografía de alineación**: el slide `i` queda centrado en el viewport
   cuando el progreso es `p = i / (N-1)`; su palabra se anima para estar en
   `x = 0` exactamente en ese instante (offsets de `motion` calculados sobre
   la geometría real de la sección: un par `[v, 1]` resuelve al pixel
   `insetSección + H·v − vh·c`). La palabra vive en un `<span>` dentro de un
   contenedor flex centrado con `whitespace-nowrap` (nunca parte en dos
   líneas).
4. El smooth scroll lo provee Lenis a nivel página (no se anida otro
   Lenis); el wrapper usa `overflow-x: clip` para evitar scroll horizontal
   en navegadores con scrollbar clásica.

Personalización rápida en el objeto `CONFIG` del mismo archivo
(textos, CTAs, colores, imágenes de la escultura).

## 🃏 Cómo funcionan las tarjetas apiladas ("Proyectos destacados")

`src/components/site/works.tsx` (bloque `StickyWorks`), inspirado en el
**StickyCard_002 de Skiper 17**:

1. Las 3 tarjetas (una por proyecto) están apiladas absolutas dentro de un
   contenedor con la proporción del efecto; las inferiores arrancan en
   `y: 100%`.
2. GSAP `ScrollTrigger` ancla (pin) el bloque durante
   `innerHeight × (n − 1)` de scroll, con `scrub: 0.5`.
3. En cada transición: la tarjeta actual se encoge a `scale 0.7` y rota
   `5°` mientras la siguiente sube de `y: 100%` a `y: 0%` — las esquinas
   rotadas de las tarjetas ya cubiertas asoman detrás de la activa.
4. **Demos y repos en tarjeta**: Telegram muestra las dos capturas reales
   del bot flotando sobre fondo oscuro con brillo lima (`shots`, rotación
   ±2°); ambas tarjetas con repo llevan un **chip terminal**
   (`gh repo clone …`) enlazado a GitHub + botón de copiar con feedback.
   AI Intelligence Agent usa como fondo el leaderboard "RANKING·IA"
   (`work-ranking.jpg`, renderizado desde HTML con la tipografía del sitio,
   contenido sesgado arriba para sobrevivir al recorte de `object-cover`,
   y con difuminado oscuro horneado bajo la fila DeepSeek-V4 para que el
   texto de la tarjeta no choque con el ranking). "Diseños Webs" muestra
   una **muestra de diseño web en marco de navegador** (`mockup`,
   `work-disenos-web.jpg` = pupita's) enlazada a
   `pupitas-manager.vercel.app`, con **chips de enlaces** (`links`) a ese
   diseño y al portafolio anterior `portafolio-charli.vercel.app`.
5. Debajo, la galería de motion: **una única tarjeta de vídeo 16/9 a todo
   el ancho** ("Motion & Diseño Gráfico", `aspect-[16/9]` + `object-cover`).
6. Integración: sin `<ReactLenis>` anidado (el sitio ya usa Lenis global,
   sincronizado vía `window.__lenis` → `ScrollTrigger.update`),
   `gsap.context` + cleanup StrictMode-safe y `end` funcional para
   recalcular al redimensionar.

## 🎨 Sistema de diseño

| Rol | Valor |
|---|---|
| Hero | papel `#EBE9E5` · tinta `#151514` · **Geist** + **Instrument Serif** |
| Sitio | fondo `#ffffff` · papel `#f3f4f6` · tinta `#0f1011` · lima `#c8f24e` |
| Loader | fondo `#ffffff` · hexágonos/tinta `#0f1011` (monocromo) |
| "Quién soy" | mismo sistema: blanco · `#f3f4f6` · lima `#c8f24e` (tinta sobre claro) |
| Tipografía sitio | Switzer (UI, display) · Anton (wordmark) |
| Números | Switzer con `font-variant-numeric: tabular-nums` |

Animación: Framer Motion + **motion** (scroll horizontal) + **GSAP ScrollTrigger**
(tarjetas apiladas) + Lenis + WebGL2 propio del hero + CSS keyframes (loader).

## 📄 Créditos de assets

- **Hero**: reimplementación de "Liquid Sculpture Hero" (MIT) de
  [Guglielmo Giannattasio](https://21st.dev/@gughigug) — esculturas originales
  incluidas (`public/images/sculpture-*.webp`).
- **Scroll horizontal**: adaptación del componente de 21st.dev inspirado en
  [Matt Perry](https://twitter.com/mattgperry) (técnica de sección sticky
  animada con `motion`).
- **Tarjetas apiladas**: inspirado en **Skiper 17 — StickyCard_002** de
  [@gurvinder-singh02](https://gxuri.me) (Skiper UI, uso libre con atribución).
- **Efecto flip letra a letra**: basado en el componente **Flip Link** de
  [vaib215](https://21st.dev) (patrón de dos filas con escalonado por letra),
  re-implementado y ampliado (burbuja automática, fases deterministas,
  envoltorio por palabras, robustez tipográfica) en `flip-links.tsx`.
- **Looping Words del hero**: basado en el efecto **Looping Words** de
  [Osmo](https://www.osmo.supply/) (publicado vía 21st.dev), re-implementado
  en `looping-words-with-gsap.tsx` con planificador serializado,
  `lagSmoothing(0)` (resistente al throttle de la vista previa), selector
  sincronizado con la palabra visible y respeto a `prefers-reduced-motion`.
- **Loader honeycomb**: clásico de css-loaders.com (dominio público),
  re-coloreado a tinta del sitio.
- **Vídeos**: [Mixkit License](https://mixkit.co/license/).
- **Imágenes**: retrato y avatar de Charli (propiedad del autor) · capturas
  del bot de Telegram y leaderboard RANKING·IA generados para el proyecto ·
  captura del diseño de *pupita's* (`work-disenos-web.jpg`, diseño web
  propio del autor, desplegado en pupitas-manager.vercel.app) · resto de
  bancos de stock gratuitos.
- **Fuentes**: Switzer (Fontshare, SIL OFL) · Anton, Geist e Instrument Serif
  (Google Fonts, SIL OFL) — todas auto-hospedadas.

## 📜 Licencia y uso

Proyecto de demostración con fines de portafolio. El contenido comercial
pertenece a CHARLI AI. Los assets de terceros mantienen sus licencias
(MIT / SIL OFL / Mixkit / Skiper UI).
