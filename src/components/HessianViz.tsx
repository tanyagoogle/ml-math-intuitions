"use client";

import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

interface HessianVizProps {
  className?: string;
}

export default function HessianViz({ className }: HessianVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // H = [[l1, 0], [0, l2]] (Aligned with axes for simplicity of intuition)
  // z = 0.5 * (l1*x^2 + l2*y^2)
  const [lambda1, setLambda1] = useState(1.0);
  const [lambda2, setLambda2] = useState(1.0);

  // Rotation inputs
  const [azimuth, setAzimuth] = useState(45);
  const [elevation, setElevation] = useState(30);

  const width = 600;
  const height = 400;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 3D Engine Constants
    const gridRes = 20;
    const range = 2; // [-2, 2]
    const scale = 80;

    // Precompute rotation matrices
    const th = azimuth * Math.PI / 180;
    const phi = elevation * Math.PI / 180;

    // Isometric projection logic
    const project = (x: number, y: number, z: number) => {
      // Rotate around Y (Azimuth)
      // x' = x cos th - z sin th
      // z' = x sin th + z cos th
      let x1 = x * Math.cos(th) - z * Math.sin(th);
      let y1 = y;
      let z1 = x * Math.sin(th) + z * Math.cos(th);

      // Rotate around X (Elevation)
      // y' = y cos phi - z' sin phi
      // z'' = y sin phi + z' cos phi
      let y2 = y1 * Math.cos(phi) - z1 * Math.sin(phi);
      // let z2 = y1 * Math.sin(phi) + z1 * Math.cos(phi);

      // Project to screen
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 - y2 * scale // Invert Y
      };
    };

    const func = (x: number, y: number) => {
      return 0.5 * (lambda1 * x * x + lambda2 * y * y);
    };

    // Generate Grid Points
    // We draw lines along X and lines along Y
    ctx.lineWidth = 1.5;

    // Draw "Back" lines first? Painter's algorithm is hard with grid.
    // Simple wireframe is okay if transparency or just single color.
    // Let's color lines by Z value for depth/shape cue.

    const points: { x: number, y: number, z: number, px: number, py: number }[] = [];

    for (let u = 0; u <= gridRes; u++) {
      for (let v = 0; v <= gridRes; v++) {
        const x = (u / gridRes) * 2 * range - range;
        const y = (v / gridRes) * 2 * range - range;
        const z = func(x, y);
        const p = project(x, y, z); // Note: Y in math is Z in 3D usually, let's map math Z to spatial Y?
        // Wait, usually Z is up.
        // My project logic assumes Y is up. Let's swap.
        // x -> x
        // y -> z
        // z(val) -> y (up)
        const pIso = project(x, z, -y); // Rotate 90 deg?
        // Actually let's stick to standard Y-up 3D convention:
        // World: X, Y (Up), Z (Depth)
        // Plot: x=u, z=v, y=func(u,v)
        const pFinal = project(x, z, y); // x=x, y=height, z=depth

        points.push({ x, y: z, z: y, px: pFinal.x, py: pFinal.y });
      }
    }

    const getIdx = (u: number, v: number) => u * (gridRes + 1) + v;

    // Draw Quads (better than lines for surface feel?)
    // Or just lines. Lines are cleaner for "Math intuition".

    for (let u = 0; u < gridRes; u++) {
      for (let v = 0; v < gridRes; v++) {
        const idx00 = getIdx(u, v);
        const idx10 = getIdx(u + 1, v);
        const idx01 = getIdx(u, v + 1);
        const idx11 = getIdx(u + 1, v + 1);

        const p00 = points[idx00];
        const p10 = points[idx10];
        const p01 = points[idx01];
        const p11 = points[idx11];

        // Average Z (height) for color
        const avgH = (p00.y + p10.y + p01.y + p11.y) / 4;

        // Color map
        // Range roughly -4 to 4?
        const norm = Math.max(-1, Math.min(1, avgH / 2));
        let r = 0, g = 0, b = 0;
        if (norm > 0) { r = 255; g = 255 - norm * 200; b = 255 - norm * 200; } // Red/White
        else { b = 255; r = 255 + norm * 200; g = 255 + norm * 200; } // Blue/White

        // Use stroke
        ctx.strokeStyle = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},0.6)`;
        ctx.beginPath();
        ctx.moveTo(p00.px, p00.py);
        ctx.lineTo(p10.px, p10.py);
        ctx.lineTo(p11.px, p11.py);
        ctx.lineTo(p01.px, p01.py);
        ctx.closePath();
        // Trace
        ctx.stroke();

        // Fill for opacity/occlusion simulation?
        // ctx.fillStyle = `rgba(${r},${g},${b},0.1)`;
        // ctx.fill();
      }
    }

    // Axes
    const o = project(0, 0, 0); // Origin (0,0,0)
    const axX = project(range, 0, 0);
    const axY = project(0, range, 0); // height
    const axZ = project(0, 0, range);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff0000"; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axX.x, axX.y); ctx.stroke(); // X
    ctx.strokeStyle = "#00ff00"; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axY.x, axY.y); ctx.stroke(); // Y (Height)
    ctx.strokeStyle = "#0000ff"; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axZ.x, axZ.y); ctx.stroke(); // Z

  }, [lambda1, lambda2, azimuth, elevation]);

  let type = "";
  if (lambda1 > 0 && lambda2 > 0) type = "Positive Definite (Bowl 🥣)";
  else if (lambda1 < 0 && lambda2 < 0) type = "Negative Definite (Peak 🏔️)";
  else if (lambda1 === 0 || lambda2 === 0) type = "Semi-Definite (Valley)";
  else type = "Indefinite (Saddle 🐎)";

  return (
    <div className={clsx("flex flex-col items-center w-full p-6", className)}>
      <h3 className="text-xl font-bold mb-4">Hessian Geometry (3D)</h3>
      <div className="text-center mb-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Shape: <strong className="text-[var(--accent)] text-lg">{type}</strong>
        </p>
      </div>

      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-1 w-32">
          <label className="text-xs font-mono text-[var(--text-dim)]">λ₁ (X Curvature)</label>
          <input
            type="range" min="-2" max="2" step="0.1"
            value={lambda1} onChange={e => setLambda1(parseFloat(e.target.value))}
          />
          <span className="text-right font-mono text-xs">{lambda1}</span>
        </div>
        <div className="flex flex-col gap-1 w-32">
          <label className="text-xs font-mono text-[var(--text-dim)]">λ₂ (Z Curvature)</label>
          <input
            type="range" min="-2" max="2" step="0.1"
            value={lambda2} onChange={e => setLambda2(parseFloat(e.target.value))}
          />
          <span className="text-right font-mono text-xs">{lambda2}</span>
        </div>
      </div>

      <div className="relative border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-black/20 shadow-2xl w-full max-w-[600px]">
        <canvas ref={canvasRef} width={width} height={height} className="w-full" />
        <div className="absolute bottom-2 right-2 text-xs text-[var(--text-dim)] pointer-events-none">
          Isometric View
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--text-dim)] max-w-[400px] text-center">
        The Hessian Eigenvalues λ₁, λ₂ control the curvature along the principal axes.
      </p>
    </div>
  );
}
