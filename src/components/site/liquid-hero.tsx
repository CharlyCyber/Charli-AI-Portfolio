"use client";

/* ────────────────────────────────────────────────────────────────
   Liquid Sculpture Hero — CHARLI AI
   Hero editorial con una escultura 3D que se convierte en ~100k
   partículas líquidas bajo el cursor (WebGL2 GPGPU).
   Reimplementación limpia en TypeScript del componente MIT
   "Liquid Sculpture Hero" de Guglielmo Giannattasio (21st.dev),
   adaptada al contenido de CHARLI AI.
   En móvil, el efecto del cursor se controla inclinando el teléfono
   (DeviceOrientation + permiso iOS).
   ──────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Smartphone } from "lucide-react";
import { FlipGroup, FlipText, flipWords } from "@/components/ui/flip-links";
import { LoopingWords } from "@/components/ui/looping-words-with-gsap";
import { SpecialText } from "@/components/ui/special-text";
import { useLoaderState } from "./loader-store";

/* ══ Configuración ══════════════════════════════════════════════ */

const CONFIG = {
  images: {
    desktop: "/images/sculpture-light.webp",
    mobile: "/images/sculpture-mobile-light.webp",
    alt: "Escultura abstracta de filamentos metálicos entrelazados y partículas",
  },
  eyebrow: "CHARLI AI — Tecnólogo creativo en IA",
  /* Titular en bucle (réplica del "Looping Words with Selector"
     de Osmo): las palabras ascienden con easing elástico dentro de
     una ventana de 3 líneas (vecinas fundidas) y un selector de
     esquinas negras abraza el ancho de la palabra centrada */
  headlineWords: [
    "Portafolio",
    "IA",
    "Diseño Web",
    "Desarrollo",
    "Diseño Gráfico",
    "Programación",
    "No-Code",
    "Low-Code",
  ],
  body: "Diseño experiencias digitales, sistemas creativos y automatizaciones potenciadas por IA — con la precisión de la ingeniería y el criterio del oficio.",
  /* v1.45: sin sección «Contacto» — el CTA aterriza en «¿Tienes
     un proyecto en mente?» (footer), cuyo botón es WhatsApp directo */
  primaryCta: { label: "Reservar llamada", href: "#proyecto-en-mente" },
  secondaryCta: { label: "Ver proyectos", href: "#proyectos" },
  hint: "Mueve el cursor sobre la forma",
  hintTouch: "Toca la forma",
  hintTilt: "Inclina el móvil para agitar la forma",
  tiltPill: "Activar movimiento",
  credit: "motion según guglielmogiannattasio.it",
  backdrop: "charli",
  bg: "#EBE9E5",
  fg: "#151514",
} as const;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ══ Shaders GLSL (WebGL2) ══════════════════════════════════════ */

/* Ruido + campo ambiente compartido */
const GLSL_NOISE = /* glsl */ `
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
vec2 ambientField(vec2 uv, float t){
  vec2 q = uv*vec2(3.2,1.7);
  vec2 a = vec2(vnoise(q+vec2(t*0.11,0.0))-0.5, vnoise(q+vec2(5.2,t*0.08)+3.1)-0.5);
  vec2 q2 = uv*vec2(7.5,4.0) + vec2(-t*0.19, t*0.13);
  vec2 b = vec2(vnoise(q2+1.7)-0.5, vnoise(q2+9.3)-0.5);
  return a + b*0.45;
}`;

/* Energía del cursor (para mostrar/ocultar partículas) */
const GLSL_ENERGY = /* glsl */ `
float energyAt(vec2 rectPx, vec2 mouse, float radius, float presence, float wakeEnergy){
  vec2 d = rectPx - mouse;
  float f = exp(-dot(d,d)/(radius*radius))*presence;
  return smoothstep(0.06, 0.5, f*1.15 + wakeEnergy*1.7);
}`;

/* Quad a pantalla completa */
const VERT_QUAD = /* glsl */ `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }`;

/* 1 · Campo de flujo: el cursor deja una estela líquida persistente */
const FRAG_FLOW = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform vec2 uSize;
uniform float uRadius;
uniform float uPresence;
uniform float uDecay;
vec2 decV(vec4 c){ return (c.rg*255.0-128.0)/127.0; }
void main(){
  vec2 v0 = decV(texture(uPrev, vUv));
  vec2 uv = vUv - v0*uTexel*2.5;
  vec4 c = texture(uPrev, uv)*0.52
    + 0.12*(texture(uPrev, uv+vec2(uTexel.x,0.0)) + texture(uPrev, uv-vec2(uTexel.x,0.0))
          + texture(uPrev, uv+vec2(0.0,uTexel.y)) + texture(uPrev, uv-vec2(0.0,uTexel.y)));
  vec2 v = decV(c);
  float p = c.b;
  vec2 d = (vUv-uMouse)*uSize;
  float f = exp(-dot(d,d)/(uRadius*uRadius))*uPresence;
  float sp = clamp(length(uVel)*2.5, 0.0, 1.0);
  v += uVel*f*0.22;
  p = max(p, f*sp);
  v *= uDecay;
  p *= uDecay;
  v = sign(v)*max(abs(v)-1.2/127.0, 0.0);
  p = max(p-1.2/255.0, 0.0);
  v = clamp(v, -1.0, 1.0);
  o = vec4((v*127.0+128.0)/255.0, p, 1.0);
}`;

/* 2 · Simulación de partículas: explosión + remolino + wake + curl + retorno elástico */
const FRAG_SIM = /* glsl */ `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uFlow;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uPresence;
uniform float uStrength;
uniform float uSpread;
uniform float uTurb;
uniform float uReturn;
uniform float uTime;
uniform float uDt;
uniform float uIntro;
${GLSL_NOISE}
vec2 curl(vec2 p){
  const float e = 0.35;
  float a = vnoise(p+vec2(0.0,e)) - vnoise(p-vec2(0.0,e));
  float b = vnoise(p+vec2(e,0.0)) - vnoise(p-vec2(e,0.0));
  return vec2(a, -b)/(2.0*e);
}
void main(){
  ivec2 ij = ivec2(gl_FragCoord.xy);
  vec4 hm = texelFetch(uHome, ij, 0);
  if(hm.w <= 0.0){ o = vec4(0.0); return; }
  vec4 st = texelFetch(uState, ij, 0);
  vec2 off = st.xy;
  vec2 vel = st.zw;
  float sd = hm.z;
  float light = 0.45 + sd*1.1;

  vec2 p = hm.xy*uSize + off;
  vec4 fl = texture(uFlow, clamp(p/uSize, 0.0, 1.0));
  vec2 wake = (fl.rg*255.0-128.0)/127.0;
  float pr = fl.b;

  vec2 toM = p - uMouse;
  float r2 = dot(toM,toM);
  float f = exp(-r2/(uRadius*uRadius))*uPresence;
  vec2 n = toM*inversesqrt(r2+1.0);
  float e = clamp(pr*2.0 + f, 0.0, 1.0);

  vec2 acc = vec2(0.0);
  acc += n*f*1.25*uStrength*uSpread*light;
  acc += vec2(-n.y, n.x)*f*1.45*uStrength*uSpread*(0.4+sd);
  acc += (wake*42.0*uSpread*light - vel)*e*0.08;
  vec2 q = p*0.0095 + vec2(uTime*0.35, -uTime*0.2);
  vec2 c = curl(q) + 0.5*curl(q*2.3 + 7.1);
  acc += c*(e*1.2*uSpread + uIntro*1.5)*uTurb*light;
  float k = (0.006 + 0.02*uReturn)*(0.65+sd*0.7)*(1.0 - uIntro*0.75);
  acc -= off*k;

  vel += acc*uDt;
  vel *= pow(mix(0.93, 0.955, e), uDt);
  off += vel*uDt;
  if(dot(off,off) < 0.0004 && dot(vel,vel) < 0.0004){ off = vec2(0.0); vel = vec2(0.0); }
  o = vec4(off, vel);
}`;

/* 3 · Render de partículas: quads instanciados estirados (streaks de cometa) */
const VERT_PART = /* glsl */ `#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uCol;
uniform sampler2D uFlow;
uniform int uTexW;
uniform vec4 uRect;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uPresence;
uniform float uDot;
uniform float uTime;
uniform float uAmbient;
uniform float uStreak;
uniform float uIntroVis;
uniform float uRest;
uniform vec3 uTint;
out vec2 vLocal;
out float vHalfLen;
out float vR;
out vec3 vCol;
out float vA;
${GLSL_NOISE}
${GLSL_ENERGY}
void main(){
  int id = gl_InstanceID;
  ivec2 ij = ivec2(id % uTexW, id / uTexW);
  vec4 hm = texelFetch(uHome, ij, 0);
  vec4 st = texelFetch(uState, ij, 0);
  vec4 cl = texelFetch(uCol, ij, 0);

  float wakeE = texture(uFlow, hm.xy).b;
  float E = energyAt(hm.xy*uRect.zw, uMouse, uRadius, uPresence, wakeE);
  float lift = smoothstep(0.35, 2.5, length(st.xy));
  float a = max(max(E, lift), max(uRest, 1.0-uIntroVis));
  if(a < 0.01 || hm.w <= 0.0){ gl_Position = vec4(2.0,2.0,2.0,1.0); return; }

  vec2 base = uRect.xy + hm.xy*uRect.zw + st.xy;
  base -= ambientField(hm.xy, uTime)*10.0*uAmbient;

  vec2 v = st.zw;
  float sp = length(v);
  vec2 dir = sp > 0.001 ? v/sp : vec2(1.0,0.0);
  float r = uDot*hm.w*0.5;
  float len = min(sp*1.25, 18.0)*uStreak;
  vec2 lc = aCorner*vec2(r + len*0.5 + 1.0, r + 1.0);
  vec2 center = base - dir*len*0.5;
  vec2 world = center + dir*lc.x + vec2(-dir.y, dir.x)*lc.y;

  vec2 clip = world/uRes*2.0-1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vLocal = lc;
  vHalfLen = len*0.5;
  vR = r;
  vec3 col = cl.rgb*uTint;
  /* v1.45 — la muestra puntual de color se veía apagada: leve
     realce de saturación + contraste (la escultura es
     beige/gris sobre fondo claro; sin esto las ondas parecen
     veladas por una capa gris). */
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 1.14);
  col = clamp((col - 0.5)*1.08 + 0.5, 0.0, 1.0);
  float glint = smoothstep(2.0, 16.0, sp);
  col = mix(col, min(col*1.18 + vec3(0.07,0.075,0.085), vec3(1.0)), glint*0.75);
  vCol = col;
  vA = a;
}`;

/* Fragment de partícula: cápsula SDF con cola que se adelgaza */
const FRAG_PART = /* glsl */ `#version 300 es
precision highp float;
in vec2 vLocal;
in float vHalfLen;
in float vR;
in vec3 vCol;
in float vA;
uniform float uDpr;
out vec4 o;
void main(){
  vec2 q = vec2(max(abs(vLocal.x)-vHalfLen, 0.0), vLocal.y);
  float d = length(q) - vR;
  /* v1.45 — borde nítido «HD»: el rampa fija anterior
     (0.5 - d*uDpr) dejaba el borde de cada partícula al 50% de
     alfa y el interior lavado (la escultura se veía opaca). El
     antialias derivado de fwidth mantiene el interior al 100% y
     suaviza SOLO el último píxel del borde, a cualquier DPR. */
  float aa = fwidth(d)*0.75 + 1e-4;
  float a = 1.0 - smoothstep(-aa, aa, d);
  float tail = vHalfLen > 0.0 ? clamp(0.5 - vLocal.x/(2.0*(vHalfLen+vR)), 0.0, 1.0) : 0.0;
  a *= 1.0 - tail*0.55;
  a *= vA;
  if(a < 0.004) discard;
  o = vec4(vCol*a, a);
}`;

/* 4 · Capa de imagen: la escultura se distorsiona y se disuelve donde hay energía */
const FRAG_IMG = /* glsl */ `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uImg;
uniform sampler2D uFlow;
uniform vec2 uRes;
uniform float uDpr;
uniform vec4 uRect;
uniform vec3 uBg;
uniform vec3 uImgBg;
uniform vec2 uMouse;
uniform float uPresence;
uniform float uRadius;
uniform float uStrength;
uniform float uTime;
uniform float uAmbient;
uniform float uIntroVis;
uniform float uRest;
uniform float uAlphaMode;
${GLSL_NOISE}
${GLSL_ENERGY}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y)/uDpr;
  vec2 size = uRect.zw;
  vec2 uv = (px-uRect.xy)/size;
  if(uv.x < -0.05 || uv.x > 1.05 || uv.y < -0.12 || uv.y > 1.12){ o = vec4(0.0); return; }
  vec4 fl = texture(uFlow, clamp(uv,0.0,1.0));
  vec2 vel = (fl.rg*255.0-128.0)/127.0;
  vec2 rp = uv*size;
  vec2 toM = rp - uMouse;
  float fall = exp(-dot(toM,toM)/(uRadius*uRadius))*uPresence;
  vec2 disp = -toM*0.22*uStrength*fall - vel*10.0*uStrength;
  disp += ambientField(uv, uTime)*10.0*uAmbient;
  vec2 suv = uv + disp/size;
  vec4 tx = texture(uImg, suv);
  vec3 col = tx.rgb;
  vec2 e = smoothstep(vec2(0.0), vec2(0.004,0.01), suv) * smoothstep(vec2(1.0), vec2(0.996,0.99), suv);
  float key = uAlphaMode > 0.5 ? tx.a : smoothstep(0.012, 0.05, length(col-uImgBg));
  float k = key*e.x*e.y;
  float E = energyAt(rp, uMouse, uRadius, uPresence, fl.b);
  float show = (1.0 - max(E, uRest))*uIntroVis;
  vec3 mat = uAlphaMode > 0.5 ? col : col*(uBg/max(uImgBg, vec3(0.001)));
  float A = k*show;
  o = vec4(mat*A, A);
}`;

/* ══ Motor WebGL2 ═══════════════════════════════════════════════ */

type EngineOpts = {
  strength: number;
  radius: number;
  density: number;
  spread: number;
  dotSize: number;
  turbulence: number;
  liquid: number;
  streaks: boolean;
  restStyle: "image" | "particles";
  returnSpeed: number;
  ambient: boolean;
  ambientIntensity: number;
  speed: number;
  intro: boolean;
  interactive: boolean;
  reducedMotion: boolean;
  bg: [number, number, number];
};

const TEX_W = 768; // ancho de las texturas de partículas
const FLOW_W = 256; // resolución del campo de flujo (192→256 en v1.45: estelas más finas)
const SETTLE_FRAMES = 270; // frames de calma antes de dormir el RAF

type Rect = { x: number; y: number; w: number; h: number };

class LiquidEngine {
  private gl: WebGL2RenderingContext;
  private opts: EngineOpts;
  private onFail: () => void;

  private pFlow!: Prog; private pSim!: Prog; private pPart!: Prog; private pImg!: Prog;
  private vao: WebGLVertexArrayObject | null = null;
  private quad: WebGLBuffer | null = null;

  private flowTex: WebGLTexture[] = [];
  private flowFb: WebGLFramebuffer[] = [];
  private flowIdx = 0;
  private flowW = FLOW_W; private flowH = 104;
  private stateTex: WebGLTexture[] = [];
  private stateFb: WebGLFramebuffer[] = [];
  private stateIdx = 0;
  private stateDirty = false;
  private stateFormat!: { internal: number; type: number };

  private homeTex: WebGLTexture | null = null;
  private colTex: WebGLTexture | null = null;
  private imgTex: WebGLTexture | null = null;
  private texH = 1; private n = 0; private gridW = 1;
  private alphaMode = false;
  private imgBg: [number, number, number] = [0.918, 0.914, 0.906];
  private aspect = 2.5;
  /* v1.45 — calidad visual por niveles (sustituye al binario
     lowPower, que condenaba a CUALQUIER móvil —aunque tuviera
     GPU sobrada— a la rejilla gruesa de 420 y DPR 1,5: de ahí
     que las ondas se vieran «opacas» y sin HD). Tres niveles
     según puntero, núcleos y memoria declarada:
       · alto:  rejilla 980, DPR ≤ 2,    presupuesto 9,0 Mpx
       · medio: rejilla 760, DPR ≤ 1,75, presupuesto 6,5 Mpx
       · bajo:  rejilla 520, DPR ≤ 1,5,  presupuesto 4,2 Mpx */
  private gridBase = 760;
  private maxDpr = 1.75;
  private pixelBudget = 6.5e6;

  private rect: Rect = { x: 0, y: 0, w: 1, h: 1 };
  private cssW = 1; private cssH = 1;
  private target = { x: -9999, y: -9999 };
  private mouse = { x: -9999, y: -9999 };
  private prevMouse = { x: -9999, y: -9999 };
  private mvel = { x: 0, y: 0 };
  private presence = 0; private presenceTarget = 0;
  private burst = 0;
  private flowing = 0;
  private lastInput = -1e9;
  private settle = 1e9;
  private touchRelease = 0;
  private time = 0;
  private introT = 1;
  private raf = 0;
  private running = false;
  private last = 0;
  private visible = true;
  private ready = false;
  private destroyed = false;
  private lost = false;
  private onFirstFrame: (() => void) | null = null;
  private firstFrameSent = false;
  private lastImage: HTMLImageElement | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    opts: Partial<EngineOpts>,
    onFail: () => void,
  ) {
    this.opts = {
      strength: 1, radius: 220, density: 1, spread: 1, dotSize: 1,
      turbulence: 1, liquid: 1, streaks: true, restStyle: "image",
      returnSpeed: 1, ambient: false, ambientIntensity: 1, speed: 1,
      intro: true, interactive: true, reducedMotion: false,
      bg: hexToRgb(CONFIG.bg), ...opts,
    };
    this.onFail = onFail;
    const gl = canvas.getContext("webgl2", {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (cores <= 4 || (memory !== undefined && memory <= 3)) {
      /* gama baja real */
      this.gridBase = 520;
      this.maxDpr = 1.5;
      this.pixelBudget = 4.2e6;
    } else if (!coarse && cores >= 6) {
      /* escritorio capaz: máxima definición */
      this.gridBase = 980;
      this.maxDpr = 2;
      this.pixelBudget = 9.0e6;
    }
    /* resto (móviles/tabletas capaces y equipos intermedios):
       los valores «medio» por defecto de los campos */
    this.initGL();
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault(); this.lost = true; this.stop(); this.onFail();
    }, false);
  }

  /* ── infraestructura ── */
  private initGL() {
    const gl = this.gl;
    const extF = gl.getExtension("EXT_color_buffer_float");
    const extH = extF ? null : gl.getExtension("EXT_color_buffer_half_float");
    if (!extF && !extH) throw new Error("No float render targets");
    this.stateFormat = { internal: gl.RGBA16F, type: gl.HALF_FLOAT };
    this.pFlow = mkProg(gl, VERT_QUAD, FRAG_FLOW);
    this.pSim = mkProg(gl, VERT_QUAD, FRAG_SIM);
    this.pPart = mkProg(gl, VERT_PART, FRAG_PART);
    this.pImg = mkProg(gl, VERT_QUAD, FRAG_IMG);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (let i = 0; i < 2; i++) {
      const t = this.mkTex(gl.RGBA8, this.flowW, this.flowH, gl.RGBA, gl.UNSIGNED_BYTE, null, gl.LINEAR);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      this.flowTex.push(t); this.flowFb.push(fb);
    }
    this.clearFlow();
  }

  private mkTex(internal: number, w: number, h: number, fmt: number, type: number, data: ArrayBufferView | null, filter: number) {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, fmt, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  private clearFlow() {
    const gl = this.gl;
    for (const fb of this.flowFb) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, this.flowW, this.flowH);
      gl.clearColor(128 / 255, 128 / 255, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private clearState() {
    const gl = this.gl;
    for (const fb of this.stateFb) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, TEX_W, this.texH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.stateDirty = false;
  }

  /* ── imagen + muestreo de partículas ── */
  setImage(img: HTMLImageElement) {
    if (this.destroyed || this.lost) return;
    const gl = this.gl;
    this.lastImage = img;
    this.aspect = img.naturalWidth / img.naturalHeight || 2.5;
    this.flowH = Math.max(32, Math.round(this.flowW / this.aspect));
    for (const t of this.flowTex) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.flowW, this.flowH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    this.clearFlow();
    if (this.imgTex) gl.deleteTexture(this.imgTex);
    this.imgTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.buildParticles(img);
    this.ready = true;
    if (this.opts.intro && !this.opts.reducedMotion) this.startIntro();
    this.wake();
  }

  private buildParticles(img: HTMLImageElement) {
    const gl = this.gl;
    // Conserva la textura orgánica del efecto sin monopolizar la GPU durante
    // la carga inicial. Ancho de rejilla por nivel de calidad (v1.45;
    // antes 420/720, demasiado grueso en pantallas grandes y retina).
    const base = this.gridBase;
    const gw = Math.round(base * Math.sqrt(clamp(this.opts.density, 0.15, 2)));
    const gh = Math.max(1, Math.round(gw / this.aspect));
    this.gridW = gw;
    let data: Uint8ClampedArray;
    try {
      const c = document.createElement("canvas");
      c.width = gw; c.height = gh;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, gw, gh);
      data = ctx.getImageData(0, 0, gw, gh).data;
    } catch {
      throw new Error("Image is not CORS-readable");
    }
    /* ¿la imagen lleva alpha (cut-out) o fondo plano (chroma-key)? */
    let alphaHits = 0;
    for (let i = 3; i < data.length; i += 4 * 7) if (data[i] < 250) alphaHits++;
    this.alphaMode = alphaHits > data.length / (4 * 7) / 20;
    if (this.alphaMode) {
      /* fondo plano: promedio de las 4 esquinas */
      let r = 0, g = 0, b = 0, n = 0;
      const s = Math.max(2, Math.round(gw * 0.012));
      for (const [ox, oy] of [[0, 0], [gw - s, 0], [0, gh - s], [gw - s, gh - s]] as const) {
        for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
          const i = (y * gw + x) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
      }
      this.imgBg = [r / n / 255, g / n / 255, b / n / 255];
    }
    /* muestreo: un hogar por cada 7º píxel que pertenezca a la escultura */
    const home: number[] = [];
    const col: number[] = [];
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = (y * gw + x) * 4;
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        if (this.alphaMode) {
          const a = data[i + 3] / 255;
          if (a < 0.12 || (a < 0.5 && Math.random() > a * 2)) continue;
        } else {
          const d = Math.hypot(r - this.imgBg[0], g - this.imgBg[1], b - this.imgBg[2]);
          if (d < 0.03 || (d < 0.07 && Math.random() > (d - 0.03) / 0.04)) continue;
        }
        const jx = (Math.random() - 0.5) * 0.6;
        const jy = (Math.random() - 0.5) * 0.6;
        home.push((x + 0.5 + jx) / gw, (y + 0.5 + jy) / gh, Math.random(), 0.85 + Math.random() * 0.3);
        col.push(data[i], data[i + 1], data[i + 2], 255);
      }
    }
    const count = home.length / 4;
    this.n = count;
    this.texH = Math.max(1, Math.ceil(count / TEX_W));
    const total = TEX_W * this.texH;
    const homeArr = new Float32Array(total * 4);
    homeArr.set(home);
    const colArr = new Uint8Array(total * 4);
    colArr.set(col);
    for (const t of [this.homeTex, this.colTex, ...this.stateTex]) {
      if (t) gl.deleteTexture(t);
    }
    for (const fb of this.stateFb) gl.deleteFramebuffer(fb);
    this.stateTex = []; this.stateFb = [];
    this.homeTex = this.mkTex(gl.RGBA32F, TEX_W, this.texH, gl.RGBA, gl.FLOAT, homeArr, gl.NEAREST);
    this.colTex = this.mkTex(gl.RGBA8, TEX_W, this.texH, gl.RGBA, gl.UNSIGNED_BYTE, colArr, gl.NEAREST);
    for (let i = 0; i < 2; i++) {
      const t = this.mkTex(this.stateFormat.internal, TEX_W, this.texH, gl.RGBA, this.stateFormat.type, null, gl.NEAREST);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      this.stateTex.push(t); this.stateFb.push(fb);
    }
    this.clearState();
  }

  /* ── API pública ── */
  setOptions(o: Partial<EngineOpts>) {
    const rebuild =
      (o.density !== undefined && o.density !== this.opts.density);
    this.opts = { ...this.opts, ...o };
    if (rebuild && this.ready && this.lastImage) {
      try { this.buildParticles(this.lastImage); } catch { this.onFail(); }
    }
    this.wake();
  }

  resize(w: number, h: number, rect: Rect) {
    this.cssW = Math.max(1, w); this.cssH = Math.max(1, h);
    this.rect = rect;
    let dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    if (this.cssW * this.cssH * dpr * dpr > this.pixelBudget) {
      dpr = Math.max(1, Math.sqrt(this.pixelBudget / (this.cssW * this.cssH)));
    }
    const W = Math.round(this.cssW * dpr), H = Math.round(this.cssH * dpr);
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W; this.canvas.height = H;
    }
    this.draw();
  }

  setVisible(v: boolean) {
    this.visible = v;
    if (v) this.wake();
    else this.stop();
  }

  pointer(kind: "move" | "down" | "leave" | "up", x: number, y: number, touch: boolean) {
    if (!this.opts.interactive || this.lost) return;
    const now = performance.now();
    if (kind === "leave" || kind === "up") {
      if (touch) this.touchRelease = now + 260;
      else this.presenceTarget = 0;
      this.wake(); return;
    }
    if (this.mouse.x < -9000 || kind === "down") {
      this.mouse.x = this.prevMouse.x = x;
      this.mouse.y = this.prevMouse.y = y;
    }
    this.target.x = x; this.target.y = y;
    this.presenceTarget = 1;
    this.lastInput = now; this.settle = 0;
    if (kind === "down") { this.burst = 1; this.touchRelease = 0; }
    this.wake();
  }

  startIntro() { this.introT = 0; this.wake(); }
  onFirstPaint(cb: () => void) { this.onFirstFrame = cb; }

  private radiusPx() { return this.opts.radius * clamp(this.rect.w / 1400, 0.6, 1.25); }
  private strengthVal() { return this.opts.strength * (this.opts.reducedMotion ? 0.5 : 1); }

  private wake() {
    if (!this.ready || this.running || !this.visible || this.destroyed || this.lost) {
      if (this.ready && !this.running) this.draw();
      return;
    }
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop() { this.running = false; cancelAnimationFrame(this.raf); }

  /* ── bucle ── */
  private frame = (now: number) => {
    if (!this.running) return;
    const dt = clamp((now - this.last) / 16.6667, 0.25, 3);
    this.last = now;
    const o = this.opts;
    const ambientOn = o.ambient && !o.reducedMotion;
    if (this.touchRelease && now > this.touchRelease) {
      this.presenceTarget = 0; this.touchRelease = 0;
    }
    /* suavizado del cursor */
    const s = 1 - Math.pow(1 - 0.22, dt);
    this.mouse.x += (this.target.x - this.mouse.x) * s;
    this.mouse.y += (this.target.y - this.mouse.y) * s;
    const vx = (this.mouse.x - this.prevMouse.x) / dt;
    const vy = (this.mouse.y - this.prevMouse.y) / dt;
    this.prevMouse.x = this.mouse.x; this.prevMouse.y = this.mouse.y;
    this.mvel.x += (clamp(vx, -60, 60) - this.mvel.x) * 0.5;
    this.mvel.y += (clamp(vy, -60, 60) - this.mvel.y) * 0.5;
    /* presencia / flujo */
    const tp = this.presenceTarget > this.presence ? 0.1 : 0.035;
    this.presence += (this.presenceTarget - this.presence) * (1 - Math.pow(1 - tp, dt));
    if (this.presence < 0.001 && this.presenceTarget === 0) this.presence = 0;
    const tf = this.presenceTarget > this.flowing ? 0.05 : 0.018;
    this.flowing += (this.presenceTarget - this.flowing) * (1 - Math.pow(1 - tf, dt));
    if (this.flowing < 0.002 && this.presenceTarget === 0) this.flowing = 0;
    if (this.introT < 1) {
      this.introT = Math.min(1, this.introT + Math.min(dt * 16.6667, 100) / 3200);
    }
    const active = this.presence > 0.001 || this.burst > 0;
    this.settle = active ? 0 : this.settle + dt;
    const introPlaying = this.introT < 1;

    if (!active && this.settle >= SETTLE_FRAMES && !introPlaying) {
      if (ambientOn) {
        this.raf = requestAnimationFrame(this.frame);
        this.time += dt * 2 * o.speed / 60;
        this.draw(); this.firstPaint();
        return;
      }
      this.draw(); this.firstPaint(); this.stop();
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
    this.time += dt * o.speed * (1 + this.flowing * 1.6) / 60;
    this.stepFlow(dt);
    this.stepSim(dt);
    this.burst = Math.max(0, this.burst - 0.1 * dt);
    this.draw();
    this.firstPaint();
  };

  private firstPaint() {
    if (this.firstFrameSent) return;
    this.firstFrameSent = true;
    if (this.onFirstFrame) {
      const cb = this.onFirstFrame;
      this.onFirstFrame = null;
      requestAnimationFrame(() => cb());
    }
  }

  private stepFlow(dt: number) {
    const gl = this.gl, p = this.pFlow, dst = 1 - this.flowIdx;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.flowFb[dst]);
    gl.viewport(0, 0, this.flowW, this.flowH);
    gl.disable(gl.BLEND);
    gl.useProgram(p.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(p.u.uPrev!, 0);
    gl.uniform2f(p.u.uTexel!, 1 / this.flowW, 1 / this.flowH);
    const r = this.rect;
    gl.uniform2f(p.u.uMouse!, (this.mouse.x - r.x) / r.w, (this.mouse.y - r.y) / r.h);
    gl.uniform2f(p.u.uVel!, clamp(this.mvel.x / 40, -1, 1), clamp(this.mvel.y / 40, -1, 1));
    gl.uniform2f(p.u.uSize!, r.w, r.h);
    gl.uniform1f(p.u.uRadius!, this.radiusPx());
    gl.uniform1f(p.u.uPresence!, Math.max(this.presence, this.burst));
    gl.uniform1f(p.u.uDecay!, 1 - 0.055 * dt);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.flowIdx = dst;
  }

  private stepSim(dt: number) {
    if (!this.n) return;
    const gl = this.gl, p = this.pSim, o = this.opts, dst = 1 - this.stateIdx;
    const intro = o.reducedMotion || !o.intro ? 0 : Math.pow(1 - this.introT, 2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFb[dst]);
    gl.viewport(0, 0, TEX_W, this.texH);
    gl.disable(gl.BLEND);
    gl.useProgram(p.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
    gl.uniform1i(p.u.uState!, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
    gl.uniform1i(p.u.uHome!, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(p.u.uFlow!, 2);
    const r = this.rect;
    gl.uniform2f(p.u.uSize!, r.w, r.h);
    gl.uniform2f(p.u.uMouse!, this.mouse.x - r.x, this.mouse.y - r.y);
    gl.uniform1f(p.u.uRadius!, this.radiusPx());
    gl.uniform1f(p.u.uPresence!, Math.max(this.presence, this.burst));
    gl.uniform1f(p.u.uStrength!, this.strengthVal() * (1 + this.burst * 1.5));
    gl.uniform1f(p.u.uSpread!, clamp(o.spread, 0, 2));
    gl.uniform1f(p.u.uTurb!, clamp(o.turbulence, 0, 2) * (o.reducedMotion ? 0.3 : 1));
    gl.uniform1f(p.u.uReturn!, clamp(o.returnSpeed, 0, 2));
    gl.uniform1f(p.u.uTime!, this.time);
    gl.uniform1f(p.u.uDt!, dt);
    gl.uniform1f(p.u.uIntro!, intro);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.stateIdx = dst;
    this.stateDirty = true;
  }

  private draw() {
    if (!this.ready || this.lost || this.destroyed) return;
    const gl = this.gl, o = this.opts, r = this.rect;
    const introVis = o.reducedMotion || !o.intro ? 1 : Math.pow(this.introT, 2.2);
    const ambient =
      (o.ambient && !o.reducedMotion ? clamp(o.ambientIntensity, 0, 2) : 0) +
      this.flowing * 0.85 * clamp(o.liquid, 0, 2) * (o.reducedMotion ? 0.3 : 1);
    const rest = o.restStyle === "particles" ? 1 : 0;
    const [bgR, bgG, bgB] = o.bg;
    const [ibR, ibG, ibB] = this.imgBg;
    const dpr = this.canvas.width / this.cssW;
    const presence = Math.max(this.presence, this.burst);
    const mx = this.mouse.x - r.x, my = this.mouse.y - r.y;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);

    /* pasada 1 · imagen de la escultura */
    const pi = this.pImg;
    gl.useProgram(pi.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
    gl.uniform1i(pi.u.uImg!, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(pi.u.uFlow!, 1);
    gl.uniform2f(pi.u.uRes!, this.cssW, this.cssH);
    gl.uniform1f(pi.u.uDpr!, dpr);
    gl.uniform4f(pi.u.uRect!, r.x, r.y, r.w, r.h);
    gl.uniform3f(pi.u.uBg!, bgR, bgG, bgB);
    gl.uniform3f(pi.u.uImgBg!, ibR, ibG, ibB);
    gl.uniform2f(pi.u.uMouse!, mx, my);
    gl.uniform1f(pi.u.uPresence!, presence);
    gl.uniform1f(pi.u.uRadius!, this.radiusPx());
    gl.uniform1f(pi.u.uStrength!, this.strengthVal());
    gl.uniform1f(pi.u.uTime!, this.time);
    gl.uniform1f(pi.u.uAmbient!, ambient);
    gl.uniform1f(pi.u.uIntroVis!, introVis);
    gl.uniform1f(pi.u.uRest!, rest);
    gl.uniform1f(pi.u.uAlphaMode!, this.alphaMode ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!this.n || (!this.stateDirty && rest === 0 && introVis >= 1)) return;

    /* pasada 2 · partículas (premultiplicadas) */
    const pp = this.pPart;
    gl.useProgram(pp.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
    gl.uniform1i(pp.u.uState!, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
    gl.uniform1i(pp.u.uHome!, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.colTex);
    gl.uniform1i(pp.u.uCol!, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(pp.u.uFlow!, 3);
    gl.uniform1i(pp.u.uTexW!, TEX_W);
    gl.uniform4f(pp.u.uRect!, r.x, r.y, r.w, r.h);
    gl.uniform2f(pp.u.uRes!, this.cssW, this.cssH);
    gl.uniform2f(pp.u.uMouse!, mx, my);
    gl.uniform1f(pp.u.uRadius!, this.radiusPx());
    gl.uniform1f(pp.u.uPresence!, presence);
    const dot = (r.w / this.gridW) * 1.45 * clamp(o.dotSize, 0.2, 3);
    gl.uniform1f(pp.u.uDot!, dot);
    gl.uniform1f(pp.u.uTime!, this.time);
    gl.uniform1f(pp.u.uAmbient!, ambient);
    gl.uniform1f(pp.u.uStreak!, (o.streaks ? 1 : 0) * (0.45 + 0.55 * introVis));
    gl.uniform1f(pp.u.uIntroVis!, introVis);
    gl.uniform1f(pp.u.uRest!, rest);
    gl.uniform1f(pp.u.uDpr!, dpr);
    if (this.alphaMode) gl.uniform3f(pp.u.uTint!, 1, 1, 1);
    else gl.uniform3f(
      pp.u.uTint!,
      bgR / Math.max(ibR, 0.001),
      bgG / Math.max(ibG, 0.001),
      bgB / Math.max(ibB, 0.001),
    );
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.n);
    gl.disable(gl.BLEND);
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onLostStatic, false);
    const gl = this.gl;
    if (!this.lost) {
      if (this.quad) gl.deleteBuffer(this.quad);
      if (this.vao) gl.deleteVertexArray(this.vao);
      for (const t of [...this.flowTex, ...this.stateTex, this.imgTex, this.homeTex, this.colTex]) {
        if (t) gl.deleteTexture(t);
      }
      for (const fb of [...this.flowFb, ...this.stateFb]) gl.deleteFramebuffer(fb);
      for (const p of [this.pFlow, this.pSim, this.pPart, this.pImg]) {
        if (p) gl.deleteProgram(p.program);
      }
    }
    /* No llamamos a WEBGL_lose_context: el mismo canvas puede re-montarse
       (HMR / re-render) y getContext("webgl2") devolvería el contexto
       perdido. Los recursos GL liberados arriba son suficientes. */
  }
  private onLostStatic = (e: Event) => { e.preventDefault(); };
}

/* ── utilidades WebGL ── */
type Prog = { program: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
function mkProg(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): Prog {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader error");
    }
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "link error");
  }
  /* nombres de uniforms, extraídos del fuente */
  const u: Record<string, WebGLUniformLocation | null> = {};
  const names = new Set<string>();
  for (const src of [vsSrc, fsSrc]) {
    for (const m of src.matchAll(/uniform\s+\w+\s+(\w+)/g)) names.add(m[1]);
  }
  for (const n of names) u[n] = gl.getUniformLocation(program, n);
  return { program, u };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255];
}

/* Rect de la escultura según viewport (igual que el original) */
function computeRect(
  vw: number, vh: number, aspect: number,
  contentBox: { top: number; bottom: number },
  place: { scale: number; mobileScale: number; x: number; y: number },
): Rect {
  const ch = Math.max(80, contentBox.bottom - contentBox.top);
  let w: number, h: number;
  if (vw >= 1024) { w = vw * 1.02 * place.scale; h = ch * 1.1 * place.scale; }
  else if (vw >= 640) { w = vw * 1.3 * place.scale; h = ch * 1.15 * place.scale; }
  else if (aspect < 1.3) { w = vw * 1.0 * place.mobileScale; h = ch * 1.0 * place.mobileScale; }
  /* rama móvil (vw<640, imagen desktop horizontal ~2.5:1):
     vw*1.5/ch*1.0 → 585×234 en 390×844, centrada (Recovery-1) */
  else { w = vw * 1.5 * place.mobileScale; h = ch * 1.0 * place.mobileScale; }
  if (w / aspect > h) w = h * aspect;
  h = w / aspect;
  const cx = vw * (0.5 + place.x / 100);
  const cy = (contentBox.top + contentBox.bottom) / 2 + vh * (place.y / 100);
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/* ══ Componente React ═══════════════════════════════════════════ */

export function LiquidHero() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LiquidEngine | null>(null);
  const tiltBase = useRef<{ gamma: number; beta: number } | null>(null);
  const tiltOnRef = useRef(false);

  const [glOn, setGlOn] = useState(false);
  const [touched, setTouched] = useState(false);
  const [tiltOn, setTiltOn] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  /* En táctil la píldora «Activar movimiento» está disponible desde
     el principio (ya no hay que tocar primero): vive en la posición
     fijada del antiguo botón «Descargar código» (abajo a la derecha).
     Hasta que el loader termina, la cortina la tapa igualmente. */
  const [showPill, setShowPill] = useState(false);

  /* el bucle del titular arranca al levantarse la cortina del loader */
  const { done: loaderDone } = useLoaderState();

  /* ── tilt: inclinar el móvil mueve el punto de interacción ── */
  const onDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma == null && e.beta == null) return;
    if (!tiltBase.current) tiltBase.current = { gamma: e.gamma ?? 0, beta: e.beta ?? 0 };
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const x = clamp(((e.gamma ?? 0) - tiltBase.current.gamma) / 30, -1, 1);
    const y = clamp(((e.beta ?? 0) - tiltBase.current.beta) / 30, -1, 1);
    const px = rect.width * (0.5 + x * 0.42);
    const py = rect.height * (0.5 - y * 0.42);
    engineRef.current?.pointer("move", px, py, true);
    setTouched(true);
  }, []);

  const enableTilt = useCallback(async () => {
    const DOE = window.DeviceOrientationEvent as
      (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }) | undefined;
    if (DOE && typeof DOE.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") return;
      } catch { return; }
    }
    window.addEventListener("deviceorientation", onDeviceOrientation);
    tiltBase.current = null;
    tiltOnRef.current = true;
    setTiltOn(true);
    setShowPill(false);
  }, [onDeviceOrientation]);

  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current, img = imgRef.current;
    if (!root || !canvas || !img) return;

    const rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchQuery = window.matchMedia("(pointer: coarse)");
    const syncTouch = () => {
      setIsTouch(touchQuery.matches);
      if (!touchQuery.matches) setShowPill(false);
      else if (!tiltOnRef.current) setShowPill(true);
    };
    /* sin setState síncrono dentro del efecto */
    const touchRaf = requestAnimationFrame(syncTouch);
    touchQuery.addEventListener?.("change", syncTouch);

    let engine: LiquidEngine | null = null;
    const fail = () => setGlOn(false);
    try {
      engine = new LiquidEngine(canvas, {
        reducedMotion: rmQuery.matches,
        interactive: true,
        intro: !rmQuery.matches,
        /* como el default del original: la escultura vive como
           partículas líquidas grandes al centro, con deriva ambiente */
        ambient: true,
        restStyle: "particles",
      }, fail);
      engineRef.current = engine;
    } catch { fail(); return; }

    /* imagen — SIEMPRE la desktop (horizontal): la variante vertical
       era la «inclinada» que se veía mal en móvil (Recovery-1) */
    const pickSrc = () => CONFIG.images.desktop;
    let curSrc = "";
    const loadImage = (src: string) => {
      if (src === curSrc) return;
      curSrc = src;
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        img.src = src;
        try { engineRef.current?.setImage(im); setGlOn(true); }
        catch { fail(); }
        /* cuando el <img> de fallback ya conoce su tamaño natural,
           se recalcula el layout (aspect correcto desktop/móvil) */
        const relayout = () => layout();
        if (typeof img.decode === "function") img.decode().then(relayout).catch(relayout);
        else img.onload = relayout;
      };
      im.onerror = fail;
      im.src = src;
    };
    loadImage(pickSrc());

    /* layout: rect de la escultura + tamaño del canvas */
    const layout = () => {
      loadImage(pickSrc());
      const r = root.getBoundingClientRect();
      const stage = root.querySelector<HTMLElement>(".sh-stage");
      const im = imgRef.current;
      const aspect = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 2.5;
      /* como el default del original: la escultura se dimensiona y
         centra sobre el viewport completo del hero — grande, al
         centro, con el texto superpuesto. La caja se pasa en
         coordenadas locales al root (independientes del scroll) */
      const rect = computeRect(
        r.width, r.height, aspect,
        { top: 0, bottom: r.height },
        { scale: 1, mobileScale: 1, x: 0, y: 0 },
      );
      engineRef.current?.resize(r.width, r.height, rect);
      /* el fallback img se posiciona sobre el rect de la escultura */
      if (im && stage) {
        im.style.left = `${rect.x}px`;
        im.style.top = `${rect.y}px`;
        im.style.width = `${rect.w}px`;
        im.style.height = `${rect.h}px`;
        /* Fix-CLS: revelar el fallback solo tras su primer posicionamiento */
        im.dataset.sized = "1";
      }
      /* hint centrado sobre la escultura */
      const hint = root.querySelector<HTMLElement>(".sh-hint");
      if (hint) {
        hint.style.left = `${rect.x + rect.w / 2}px`;
        hint.style.top = `${rect.y - 26}px`;
        hint.dataset.positioned = "1";
      }
    };
    layout();

    const ro = new ResizeObserver(layout);
    ro.observe(root);
    if (backdropRef.current) ro.observe(backdropRef.current);

    const io = new IntersectionObserver((entries) => {
      for (const en of entries) engineRef.current?.setVisible(en.isIntersecting && !document.hidden);
    });
    io.observe(root);
    const onVis = () => engineRef.current?.setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const onMq = () => engineRef.current?.setOptions({ reducedMotion: rmQuery.matches });
    rmQuery.addEventListener?.("change", onMq);

    /* puntero */
    const pos = (e: PointerEvent): [number, number] => {
      const b = root.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };
    const mark = () => setTouched(true);
    const onMove = (e: PointerEvent) => {
      const [x, y] = pos(e);
      const isTouch = e.pointerType === "touch";
      if (isTouch && e.buttons === 0 && e.pressure === 0) return;
      engineRef.current?.pointer("move", x, y, isTouch);
      mark();
    };
    const onDown = (e: PointerEvent) => {
      const [x, y] = pos(e);
      engineRef.current?.pointer("down", x, y, e.pointerType === "touch");
      mark();
      /* pill de tilt solo en táctil, si aún no está activo */
      if (e.pointerType === "touch" && !tiltOnRef.current) setShowPill(true);
    };
    const onUp = (e: PointerEvent) =>
      engineRef.current?.pointer("up", 0, 0, e.pointerType === "touch");
    const onLeave = () => engineRef.current?.pointer("leave", 0, 0, false);

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onDown, { passive: true });
    root.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(touchRaf);
      touchQuery.removeEventListener?.("change", syncTouch);
      ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      rmQuery.removeEventListener?.("change", onMq);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
      engine?.destroy();
      engineRef.current = null;
    };
  }, [onDeviceOrientation]);

  const hint = tiltOn ? CONFIG.hintTilt : isTouch ? CONFIG.hintTouch : CONFIG.hint;

  return (
    <section
      ref={rootRef as React.RefObject<HTMLElement>}
      id="inicio"
      className="sh-root"
      data-gl={glOn ? "on" : "off"}
      data-touched={touched ? "1" : "0"}
      style={{
        "--sh-bg": CONFIG.bg,
        "--sh-fg": CONFIG.fg,
        "--sh-acc": CONFIG.fg,
        "--sh-head": "'Geist', 'Helvetica Neue', Arial, sans-serif",
        "--sh-accent": "'Instrument Serif', 'Times New Roman', serif",
        "--sh-body": "'Geist', 'Helvetica Neue', Arial, sans-serif",
        "--sh-h": "100svh",
      } as React.CSSProperties}
      aria-label="CHARLI AI — presentación"
    >
      {/* palabra fantasma detrás de la escultura */}
      <div ref={backdropRef} className="sh-backdrop" aria-hidden="true">
        <FlipText text={CONFIG.backdrop} />
      </div>

      {/* lienzo WebGL + fallback */}
      <div className="sh-stage" aria-hidden="true">
        <canvas ref={canvasRef} className="sh-canvas" />
        <img ref={imgRef} className="sh-fallback" src={CONFIG.images.desktop} alt="" draggable={false} />
      </div>

      <span className="sh-spacer" />

      {/* hint sobre la escultura */}
      <span className="sh-hint" aria-hidden="true">
        <SpecialText active={loaderDone} speed={13}>
          {hint}
        </SpecialText>
      </span>

      {/* contenido editorial */}
      <div className="sh-content">
        <div className="sh-head">
          <p className="sh-eyebrow">
            <SpecialText active={loaderDone} delay={0.2} speed={14}>
              {CONFIG.eyebrow}
            </SpecialText>
          </p>
          <h1
            className="sh-h1 sh-h1--loop"
            aria-label="Portafolio · IA · Diseño Web · Desarrollo · Diseño Gráfico · Programación · No-Code · Low-Code"
          >
            <LoopingWords words={CONFIG.headlineWords} active={loaderDone} />
          </h1>
        </div>
        <div className="sh-aside">
          <p className="sh-body">{CONFIG.body}</p>
          <div className="sh-ctas">
            <FlipGroup>
              <a href={CONFIG.primaryCta.href} className="sh-btn">
                <span>{flipWords(CONFIG.primaryCta.label)}</span>
                <ArrowRight className="size-4" strokeWidth={2} />
              </a>
            </FlipGroup>
            <FlipGroup>
              <a href={CONFIG.secondaryCta.href} className="sh-txt">
                <span>{flipWords(CONFIG.secondaryCta.label)}</span>
                <ArrowRight className="size-4" strokeWidth={2} />
              </a>
            </FlipGroup>
          </div>
        </div>
      </div>

      {/* pill para activar el movimiento por inclinación (solo táctil,
          tras levantarse la cortina del loader) */}
      {loaderDone && showPill && !tiltOn && (
        <button
          type="button"
          className="sh-tilt-pill"
          onClick={enableTilt}
        >
          <Smartphone className="size-3.5" strokeWidth={2} />
          <SpecialText inView speed={18}>
            {CONFIG.tiltPill}
          </SpecialText>
        </button>
      )}

      <a
        className="sh-credit"
        href="https://guglielmogiannattasio.it"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SpecialText active={loaderDone} delay={0.6} speed={14}>
          {CONFIG.credit}
        </SpecialText>
      </a>
    </section>
  );
}

