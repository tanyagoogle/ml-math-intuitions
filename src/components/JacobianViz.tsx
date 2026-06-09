"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';

interface JacobianVizProps {
  className?: string;
}

export default function JacobianViz({ className }: JacobianVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [j11, setJ11] = useState(1.0);
  const [j12, setJ12] = useState(0.5);
  const [j21, setJ21] = useState(0.0);
  const [j22, setJ22] = useState(1.0);

  // Focus point in input space (center of the "unit square" we visualize)
  const [focus, setFocus] = useState({ u: 0.5, v: 0.5 });
  const [isDragging, setIsDragging] = useState(false);

  const width = 800; // Total width (two 400px panels)
  const height = 400;
  const panelWidth = width / 2;
  const gridRange = 2; // [-2, 2]

  // Coordinate transforms
  const toPixel = useCallback((val: number, isY = false, offset = 0, range = gridRange) => {
    const p = (val + range) / (2 * range);
    return offset + (isY ? (1 - p) * height : p * panelWidth);
  }, [gridRange, height, panelWidth]);

  const fromPixel = (px: number, isY = false, offset = 0) => {
    const relativePx = px - offset;
    const p = isY ? (1 - relativePx / height) : relativePx / panelWidth;
    return p * (2 * gridRange) - gridRange;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // --- LEFT PANEL: INPUT SPACE (u, v) ---
    // Grid: Identity
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, panelWidth, height);
    ctx.clip();

    ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
    ctx.lineWidth = 1;

    // Draw Blue Grid
    for (let i = -gridRange; i <= gridRange; i += 0.5) {
      // Vertical
      ctx.beginPath();
      ctx.moveTo(toPixel(i, false, 0), 0);
      ctx.lineTo(toPixel(i, false, 0), height);
      ctx.stroke();
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, toPixel(i, true, 0));
      ctx.lineTo(panelWidth, toPixel(i, true, 0));
      ctx.stroke();
    }

    // Axes
    const originX1 = toPixel(0, false, 0);
    const originY1 = toPixel(0, true, 0);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, originY1); ctx.lineTo(panelWidth, originY1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX1, 0); ctx.lineTo(originX1, height); ctx.stroke();

    // Draw "Unit" Square patch centered at focus
    const patchSize = 0.5;
    const p1 = { u: focus.u - patchSize / 2, v: focus.v - patchSize / 2 };
    const p2 = { u: focus.u + patchSize / 2, v: focus.v - patchSize / 2 };
    const p3 = { u: focus.u + patchSize / 2, v: focus.v + patchSize / 2 };
    const p4 = { u: focus.u - patchSize / 2, v: focus.v + patchSize / 2 };

    ctx.fillStyle = "rgba(50, 100, 255, 0.5)";
    ctx.strokeStyle = "rgba(50, 100, 255, 1)";
    ctx.beginPath();
    ctx.moveTo(toPixel(p1.u, false, 0), toPixel(p1.v, true, 0));
    ctx.lineTo(toPixel(p2.u, false, 0), toPixel(p2.v, true, 0));
    ctx.lineTo(toPixel(p3.u, false, 0), toPixel(p3.v, true, 0));
    ctx.lineTo(toPixel(p4.u, false, 0), toPixel(p4.v, true, 0));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = "#fff";
    ctx.font = "14px Inter";
    ctx.fillText("Input Space (u,v)", 10, 20);
    ctx.restore();


    // --- RIGHT PANEL: OUTPUT SPACE (x, y) ---
    // Grid: Transformed by J
    const offset = panelWidth;

    // Calculate necessary range for output space to keep things visible
    const maxValX = (Math.abs(j11) + Math.abs(j12)) * gridRange;
    const maxValY = (Math.abs(j21) + Math.abs(j22)) * gridRange;
    const outRange = Math.max(gridRange, maxValX, maxValY, 1.0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(offset, 0, panelWidth, height);
    ctx.clip();

    // Transformation function
    const transform = (u: number, v: number) => ({
      x: j11 * u + j12 * v,
      y: j21 * u + j22 * v
    });

    // Draw Red Warped Grid
    ctx.strokeStyle = "rgba(255, 100, 100, 0.3)";
    ctx.lineWidth = 1;

    for (let u = -gridRange; u <= gridRange; u += 0.5) {
      const start = transform(u, -gridRange);
      const end = transform(u, gridRange);
      ctx.beginPath();
      ctx.moveTo(toPixel(start.x, false, offset, outRange), toPixel(start.y, true, 0, outRange));
      ctx.lineTo(toPixel(end.x, false, offset, outRange), toPixel(end.y, true, 0, outRange));
      ctx.stroke();
    }
    for (let v = -gridRange; v <= gridRange; v += 0.5) {
      const start = transform(-gridRange, v);
      const end = transform(gridRange, v);
      ctx.beginPath();
      ctx.moveTo(toPixel(start.x, false, offset, outRange), toPixel(start.y, true, 0, outRange));
      ctx.lineTo(toPixel(end.x, false, offset, outRange), toPixel(end.y, true, 0, outRange));
      ctx.stroke();
    }

    // Axes (Transformed basis vectors? Or just global XY axes?)
    const originX2 = toPixel(0, false, offset, outRange);
    const originY2 = toPixel(0, true, 0, outRange);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(offset, originY2); ctx.lineTo(width, originY2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX2, 0); ctx.lineTo(originX2, height); ctx.stroke();
    ctx.setLineDash([]);

    // Draw Transformed Patch (Parallelogram)
    const tp1 = transform(p1.u, p1.v);
    const tp2 = transform(p2.u, p2.v);
    const tp3 = transform(p3.u, p3.v);
    const tp4 = transform(p4.u, p4.v);

    ctx.fillStyle = "rgba(255, 50, 50, 0.5)";
    ctx.strokeStyle = "rgba(255, 50, 50, 1)";
    ctx.beginPath();
    ctx.moveTo(toPixel(tp1.x, false, offset, outRange), toPixel(tp1.y, true, 0, outRange));
    ctx.lineTo(toPixel(tp2.x, false, offset, outRange), toPixel(tp2.y, true, 0, outRange));
    ctx.lineTo(toPixel(tp3.x, false, offset, outRange), toPixel(tp3.y, true, 0, outRange));
    ctx.lineTo(toPixel(tp4.x, false, offset, outRange), toPixel(tp4.y, true, 0, outRange));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = "#fff";
    ctx.fillText("Output Space (Mapping)", offset + 10, 20);

    ctx.restore();

    // Divider
    ctx.strokeStyle = "var(--border-subtle)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelWidth, 0);
    ctx.lineTo(panelWidth, height);
    ctx.stroke();

  }, [j11, j12, j21, j22, focus, toPixel, panelWidth, gridRange, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < panelWidth) setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp to left panel
    if (x > panelWidth) return;

    const u = fromPixel(x, false, 0);
    const v = fromPixel(y, true, 0);
    setFocus({ u, v });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={clsx("flex flex-col items-center w-full p-6", className)}>
      <h3 className="text-xl font-bold mb-4">Jacobian: Linear Transformation</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-[600px] text-center">
        Left: Input Space (Blue Square). Right: Transformed Output (Red Parallelogram).
        <br />
        Notice how the Jacobian matrix <strong className="text-[var(--accent)]">J</strong> stretches and shears the square.
      </p>

      <div className="flex gap-8 mb-6 bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <input type="number" step="0.1" value={j11} onChange={e => setJ11(parseFloat(e.target.value))} className="w-16 bg-[#1e1e1e] border-none rounded text-center font-mono text-sm py-1" />
            <input type="number" step="0.1" value={j21} onChange={e => setJ21(parseFloat(e.target.value))} className="w-16 bg-[#1e1e1e] border-none rounded text-center font-mono text-sm py-1" />
          </div>
          <div className="flex flex-col gap-1">
            <input type="number" step="0.1" value={j12} onChange={e => setJ12(parseFloat(e.target.value))} className="w-16 bg-[#1e1e1e] border-none rounded text-center font-mono text-sm py-1" />
            <input type="number" step="0.1" value={j22} onChange={e => setJ22(parseFloat(e.target.value))} className="w-16 bg-[#1e1e1e] border-none rounded text-center font-mono text-sm py-1" />
          </div>
        </div>
        <div className="flex flex-col justify-center text-xs text-[var(--text-dim)]">
          <div>Determinant: <span className="text-white font-mono">{(j11 * j22 - j12 * j21).toFixed(2)}</span></div>
          <div>(Area Scale Factor)</div>
        </div>
      </div>

      <div
        className="relative w-full max-w-[800px] aspect-[2/1] cursor-crosshair border border-[var(--border-subtle)] rounded-lg overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full"
        />
        <div className="absolute bottom-2 left-2 text-xs font-mono bg-black/50 px-2 py-1 rounded pointer-events-none">
          Drag to move input patch
        </div>
      </div>
    </div>
  );
}
