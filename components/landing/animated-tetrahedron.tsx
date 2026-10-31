"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number; z: number };

/** ASCII tetrahedron from the original template (final call to action). */
export function AnimatedTetrahedron({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let time = 0;
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const vertices: Point[] = [
      { x: 0, y: 1, z: 0 },
      { x: -0.943, y: -0.333, z: -0.5 },
      { x: 0.943, y: -0.333, z: -0.5 },
      { x: 0, y: -0.333, z: 1 },
    ];
    const edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [2, 3], [3, 1],
    ];
    const faces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2],
    ];

    const rotate = (p: Point): Point => {
      const ay = time * 0.4;
      const ax = time * 0.3;
      const az = time * 0.2;
      const y1 = { x: p.x * Math.cos(ay) - p.z * Math.sin(ay), y: p.y, z: p.x * Math.sin(ay) + p.z * Math.cos(ay) };
      const x1 = { x: y1.x, y: y1.y * Math.cos(ax) - y1.z * Math.sin(ax), z: y1.y * Math.sin(ax) + y1.z * Math.cos(ax) };
      return { x: x1.x * Math.cos(az) - x1.y * Math.sin(az), y: x1.x * Math.sin(az) + x1.y * Math.cos(az), z: x1.z };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.7;

      ctx.font = "18px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const points: { x: number; y: number; z: number; char: string }[] = [];
      const push = (raw: Point) => {
        const p = rotate(raw);
        const depth = (p.z + 1.5) / 3;
        points.push({
          x: centerX + p.x * scale,
          y: centerY - p.y * scale,
          z: p.z,
          char: chars[Math.min(Math.floor(depth * (chars.length - 1)), chars.length - 1)],
        });
      };

      for (const [i, j] of edges) {
        const a = vertices[i];
        const b = vertices[j];
        for (let t = 0; t <= 1; t += 0.05) {
          push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
        }
      }
      for (const [i, j, k] of faces) {
        const a = vertices[i];
        const b = vertices[j];
        const c = vertices[k];
        for (let u = 0; u <= 1; u += 0.12) {
          for (let v = 0; v <= 1 - u; v += 0.12) {
            const w = 1 - u - v;
            push({ x: a.x * u + b.x * v + c.x * w, y: a.y * u + b.y * v + c.y * w, z: a.z * u + b.z * v + c.z * w });
          }
        }
      }

      points.sort((a, b) => a.z - b.z);
      for (const point of points) {
        ctx.fillStyle = `rgba(20, 17, 15, ${Math.min(0.15 + (point.z + 1.5) * 0.25, 0.9)})`;
        ctx.fillText(point.char, point.x, point.y);
      }

      time += 0.015;
      if (!reduceMotion) frame = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
}
