'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import './squares.css';

export interface SquaresProps {
  /** Aspect ratio (width/height) of each square. */
  squareAspectRatio?: number;
  /** Gap between squares in px. */
  gridGap?: number;
  /** Fixed width — defaults to the parent size. */
  width?: number;
  /** Fixed height — defaults to the parent size. */
  height?: number;
  /** How far squares rise towards the camera (px). */
  depth?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Camera tilt in degrees — the subtle 3D perspective. */
  angleThreshold?: number;
  /** Easing factor for the rise/fall transitions (0–1). */
  ease?: number;
  /** Row count — derived from the container when omitted. */
  rows?: number;
  /** Column count — derived from the container when omitted. */
  columns?: number;
  /** Square size in px — overrides `columns`. */
  squareSize?: number;
  /** Base color of the squares. */
  color?: string;
  /** Color the squares take near the cursor. */
  hoverColor?: string;
  /** Outline color of the squares (supports rgba). */
  outlineColor?: string;
  /** Keeps a virtual pointer moving when the visitor is idle. */
  autoAnimate?: boolean;
  /** Tints the square faces near the cursor. */
  faceHover?: boolean;
  /** Corner radius of each square in px. */
  cornerRadius?: number;
  className?: string;
}

interface SquareItem {
  mesh: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
  currentZ: number;
  targetZ: number;
}

const DEFAULTS = {
  squareAspectRatio: 1,
  gridGap: 0,
  depth: 200,
  speed: 0.5,
  angleThreshold: 12,
  ease: 0.05,
  color: '#101214',
  hoverColor: '#c8f24e',
  outlineColor: 'rgba(243,242,237,0.14)',
  autoAnimate: true,
  faceHover: true,
  cornerRadius: 4
};

/** Parse a CSS color into a THREE.Color plus its alpha channel. */
const parseOutline = (value: string): { color: THREE.Color; opacity: number } => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const parts = match[1].split(',').map(p => parseFloat(p.trim()));
    const color = new THREE.Color(parts[0] / 255, parts[1] / 255, parts[2] / 255);
    return { color, opacity: Number.isFinite(parts[3]) ? parts[3] : 1 };
  }
  return { color: new THREE.Color(value), opacity: 1 };
};

export default function Squares({
  squareAspectRatio = DEFAULTS.squareAspectRatio,
  gridGap = DEFAULTS.gridGap,
  width,
  height,
  depth = DEFAULTS.depth,
  speed = DEFAULTS.speed,
  angleThreshold = DEFAULTS.angleThreshold,
  ease = DEFAULTS.ease,
  rows,
  columns,
  squareSize,
  color = DEFAULTS.color,
  hoverColor = DEFAULTS.hoverColor,
  outlineColor = DEFAULTS.outlineColor,
  autoAnimate = DEFAULTS.autoAnimate,
  faceHover = DEFAULTS.faceHover,
  cornerRadius = DEFAULTS.cornerRadius,
  className
}: SquaresProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let resizeTimer: number | undefined;
    let raf = 0;
    let visible = true;
    let cleanupScene: (() => void) | null = null;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const build = () => {
      if (disposed) return;
      const w = width ?? mount.clientWidth;
      const h = height ?? mount.clientHeight;
      if (!w || !h) return;

      /* ------------------------------------------------ scene & camera */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, w / h, 10, 2000);

      const fovRad = THREE.MathUtils.degToRad(25); // half of the 50° fov
      const fitDistance = h / 2 / Math.tan(fovRad);
      const tilt = THREE.MathUtils.degToRad(angleThreshold);
      const distance = fitDistance * 1.16 + depth * 0.22;
      const baseCamX = 0;
      const baseCamY = -Math.sin(tilt) * distance;
      const baseCamZ = Math.cos(tilt) * distance;
      camera.position.set(baseCamX, baseCamY, baseCamZ);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      mount.appendChild(renderer.domElement);

      /* ------------------------------------------------ square geometry */
      const cellWidth = squareSize ?? w / (columns ?? Math.max(4, Math.round(w / 48)));
      const cellHeight = cellWidth / squareAspectRatio;
      const gridRows = rows ?? Math.ceil(h / cellHeight) + 2;
      const gridColumns = columns ?? Math.ceil(w / cellWidth) + 2;
      const gridWidth = gridColumns * cellWidth + (gridColumns - 1) * gridGap;
      const gridHeight = gridRows * cellHeight + (gridRows - 1) * gridGap;

      const radius = Math.max(0, Math.min(cornerRadius, cellWidth / 2, cellHeight / 2));
      const shape = new THREE.Shape();
      const hw = cellWidth / 2;
      const hh = cellHeight / 2;
      shape.moveTo(-hw + radius, -hh);
      shape.lineTo(hw - radius, -hh);
      shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
      shape.lineTo(hw, hh - radius);
      shape.quadraticCurveTo(hw, hh, hw - radius, hh);
      shape.lineTo(-hw + radius, hh);
      shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
      shape.lineTo(-hw, -hh + radius);
      shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);

      const squareGeometry = new THREE.ShapeGeometry(shape, 6);
      const edgeGeometry = new THREE.EdgesGeometry(squareGeometry, 15);
      const { color: outlineRGB, opacity: outlineOpacity } = parseOutline(outlineColor);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: outlineRGB,
        transparent: true,
        opacity: outlineOpacity,
        depthWrite: false
      });

      const baseColor = new THREE.Color(color);
      const hotColor = new THREE.Color(hoverColor);
      const squares: SquareItem[] = [];

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
          const material = new THREE.MeshBasicMaterial({
            color: baseColor.clone(),
            side: THREE.DoubleSide
          });
          const mesh = new THREE.Mesh(squareGeometry, material);
          mesh.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
          mesh.position.set(
            -gridWidth / 2 + cellWidth / 2 + col * (cellWidth + gridGap),
            gridHeight / 2 - cellHeight / 2 - row * (cellHeight + gridGap),
            0
          );
          scene.add(mesh);
          squares.push({ mesh, currentZ: 0, targetZ: 0 });
        }
      }

      /* ------------------------------------------------ pointer */
      const raycaster = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const ndc = new THREE.Vector2();
      const hit = new THREE.Vector3();
      const pointer = new THREE.Vector3(9999, 9999, 0);
      const camNdc = { x: 0, y: 0 };
      let lastMove = 0;
      let hasPointer = false;

      const onPointerMove = (event: PointerEvent) => {
        const rect = mount.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        if (inside) {
          ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          camNdc.x = ndc.x;
          camNdc.y = ndc.y;
          raycaster.setFromCamera(ndc, camera);
          if (raycaster.ray.intersectPlane(plane, hit)) {
            pointer.copy(hit);
          } else {
            pointer.set(9999, 9999, 0);
          }
          lastMove = performance.now();
          hasPointer = true;
        } else if (hasPointer) {
          pointer.set(9999, 9999, 0);
          hasPointer = false;
        }
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });

      /* ------------------------------------------------ animation loop */
      const influence = Math.max(cellWidth, cellHeight) * 2.6;
      let previous = performance.now();

      const tick = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        if (!visible) return;

        const dt = Math.min(now - previous, 50) / (1000 / 60); // in 60fps frames
        previous = now;

        if (autoAnimate && !reducedMotion && now - lastMove > 2200) {
          // idle → a virtual pointer roams the grid so it never sleeps
          const t = now * 0.00035 * (0.6 + speed);
          pointer.set(
            Math.sin(t) * gridWidth * 0.36,
            Math.sin(t * 1.35 + 1.6) * gridHeight * 0.32,
            0
          );
          camNdc.x = pointer.x / (gridWidth / 2);
          camNdc.y = pointer.y / (gridHeight / 2);
        }

        const step = Math.min(1, ease * dt * speed * 2.4);

        for (let i = 0; i < squares.length; i++) {
          const square = squares[i];
          let proximity = 0;
          const dx = square.mesh.position.x - pointer.x;
          const dy = square.mesh.position.y - pointer.y;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq < influence * influence) {
            proximity = 1 - Math.sqrt(distanceSq) / influence;
            proximity = proximity * proximity * (3 - 2 * proximity); // smoothstep
          }
          square.targetZ = reducedMotion ? 0 : depth * proximity;
          square.currentZ += (square.targetZ - square.currentZ) * step;
          square.mesh.position.z = square.currentZ;
          if (faceHover) {
            square.mesh.material.color.copy(baseColor).lerp(hotColor, proximity * 0.9);
          }
        }

        // gentle parallax — the camera leans with the pointer
        const camStep = Math.min(1, 0.04 * dt);
        camera.position.x += (baseCamX + camNdc.x * 26 - camera.position.x) * camStep;
        camera.position.y += (baseCamY + camNdc.y * 18 - camera.position.y) * camStep;
        camera.lookAt(0, 0, 0);

        renderer?.render(scene, camera);
      };

      if (reducedMotion) {
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(tick);
      }

      cleanupScene = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onPointerMove);
        squares.forEach(square => square.mesh.material.dispose());
        edgeMaterial.dispose();
        edgeGeometry.dispose();
        squareGeometry.dispose();
        renderer?.dispose();
        if (renderer?.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
        renderer = null;
      };
    };

    build();

    /* ------------------------------------------------ observers */
    resizeObserver = new ResizeObserver(() => {
      if (disposed) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (disposed || !cleanupScene) return;
        cleanupScene();
        cleanupScene = null;
        build();
      }, 220);
    });
    resizeObserver.observe(mount);

    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      cleanupScene?.();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
    // Rebuild when structural props change; colors/depth are read once per build
  }, [
    squareAspectRatio,
    gridGap,
    width,
    height,
    depth,
    speed,
    angleThreshold,
    ease,
    rows,
    columns,
    squareSize,
    color,
    hoverColor,
    outlineColor,
    autoAnimate,
    faceHover,
    cornerRadius
  ]);

  return <div ref={mountRef} className={`squares ${className ?? ''}`.trim()} aria-hidden="true" />;
};
