"use client";

import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

interface VectorGradientVizProps {
  className?: string;
}

export default function VectorGradientViz({ className }: VectorGradientVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.8, y: 0.8 });
  const [gradient, setGradient] = useState({ dx: 0, dy: 0 });

  const f = (x: number, y: number) => 2 * Math.exp(-(x * x + y * y) / 2);
  const grad = (x: number, y: number) => {
    const val = f(x, y);
    return { dx: -x * val, dy: -y * val };
  };

  const size = 200;
  const range = 3;

  const domainToPixel = (v: number) => ((v + range) / (2 * range)) * size;
  const pixelToDomain = (px: number) => (px / size) * (2 * range) - range;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    const maxVal = f(0, 0);

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const x = pixelToDomain(px);
        const mathY = -pixelToDomain(py);
        const val = f(x, mathY);
        const normalized = val / maxVal;

        const r = 10 + 200 * normalized;
        const g = 10 + 245 * normalized;
        const b = 30 + 225 * normalized;

        const index = (py * size + px) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, []);

  useEffect(() => {
    setGradient(grad(mousePos.x, mousePos.y));
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;

    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const x = pixelToDomain(px);
    const y = -pixelToDomain(py);

    setMousePos({ x, y });
    setGradient(grad(x, y));
  };

  const arrowScale = 25;
  const pxX = domainToPixel(mousePos.x);
  const pxY = domainToPixel(-mousePos.y);
  const endX = pxX + gradient.dx * arrowScale;
  const endY = pxY - gradient.dy * arrowScale;

  return (
    <div className={clsx("w-full p-4", className)}>
      <div className="flex items-start gap-6">
        <div
          className="relative cursor-crosshair rounded-lg overflow-hidden border border-[var(--border-subtle)]"
          style={{ width: '200px', height: '200px', flexShrink: 0 }}
          onMouseMove={handleMouseMove}
        >
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          <svg
            viewBox={`0 0 ${size} ${size}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <marker id="arrowhead-grad" markerWidth="10" markerHeight="7"
                refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>
            <line
              x1={pxX} y1={pxY}
              x2={endX} y2={endY}
              stroke="#ef4444"
              strokeWidth={2}
              markerEnd="url(#arrowhead-grad)"
            />
            <circle cx={pxX} cy={pxY} r={3} fill="#ef4444" />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Gradient Field
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            The red arrow shows ∇f—the direction of steepest ascent, pointing toward the peak at (0,0).
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>pos </span>
              <span style={{ color: 'var(--text-primary)' }}>({mousePos.x.toFixed(1)}, {mousePos.y.toFixed(1)})</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>∇f </span>
              <span style={{ color: '#ef4444' }}>[{gradient.dx.toFixed(2)}, {gradient.dy.toFixed(2)}]</span>
            </div>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Hover to explore
          </p>
        </div>
      </div>
    </div>
  );
}
