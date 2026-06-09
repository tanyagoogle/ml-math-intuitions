"use client";

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface ScalarDerivativeVizProps {
  className?: string;
}

export default function ScalarDerivativeViz({ className }: ScalarDerivativeVizProps) {
  const [x, setX] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Function: f(x) = x^3 - 3x
  // Derivative: f'(x) = 3x^2 - 3
  const f = (val: number) => Math.pow(val, 3) - 3 * val;
  const df = (val: number) => 3 * Math.pow(val, 2) - 3;

  // Viewport settings
  const width = 600;
  const height = 400;
  // Domain: [-2.5, 2.5]
  const xMin = -2.5;
  const xMax = 2.5;
  // Range: approx [-3, 3] to fit comfortably
  const yMin = -4; // increased range for tangent lines
  const yMax = 4;

  const xScale = (val: number) => ((val - xMin) / (xMax - xMin)) * width;
  const yScale = (val: number) => height - ((val - yMin) / (yMax - yMin)) * height;

  // Inverse scale for interactions
  const xInverse = (px: number) => (px / width) * (xMax - xMin) + xMin;

  // Generate path for the curve
  const generatePath = () => {
    let d = "";
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const currX = xMin + t * (xMax - xMin);
      const currY = f(currX);
      const px = xScale(currX);
      const py = yScale(currY);
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    return d;
  };

  const handleInteractionStart = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const newX = Math.max(xMin, Math.min(xMax, xInverse(offsetX)));
    setX(newX);
    setIsDragging(true);
  };

  const handleInteractionMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const newX = Math.max(xMin, Math.min(xMax, xInverse(offsetX)));
    setX(newX);
  };



  // Tangent line calculation
  // y - y0 = m(x - x0) => y = m(x - x0) + y0
  const slope = df(x);
  const y0 = f(x);

  // Calculate tangent line start and end points for drawing (clamped to visual usage)
  const tangentLength = 1.0; // in domain units
  const tX1 = x - tangentLength;
  const tY1 = slope * (tX1 - x) + y0;
  const tX2 = x + tangentLength;
  const tY2 = slope * (tX2 - x) + y0;

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  return (
    <div
      className={clsx("flex flex-col items-center select-none w-full p-6", className)}
      ref={containerRef}
    >
      <h3 className="text-xl font-bold mb-4">Visualizing Scalar Derivatives</h3>
      <div className="relative w-full max-w-[600px] aspect-[3/2] cursor-crosshair"
        onMouseDown={(e) => handleInteractionStart(e.clientX)}
        onMouseMove={(e) => handleInteractionMove(e.clientX)}
        onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleInteractionMove(e.touches[0].clientX)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid/Axes */}
          <line x1={0} y1={yScale(0)} x2={width} y2={yScale(0)} stroke="var(--border-subtle)" strokeWidth={1} />
          <line x1={xScale(0)} y1={0} x2={xScale(0)} y2={height} stroke="var(--border-subtle)" strokeWidth={1} />

          {/* Function Curve */}
          <path d={generatePath()} fill="none" stroke="var(--accent)" strokeWidth={3} />

          {/* Tangent Line */}
          <line
            x1={xScale(tX1)} y1={yScale(tY1)}
            x2={xScale(tX2)} y2={yScale(tY2)}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5,5"
          />

          {/* Current Point */}
          <circle
            cx={xScale(x)}
            cy={yScale(y0)}
            r={6}
            fill="#ef4444"
            className="cursor-pointer transition-transform hover:scale-125"
          />

          {/* Derivative value text */}
          <text
            x={xScale(x)}
            y={yScale(y0) - 20}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="14"
            className="pointer-events-none font-mono"
          >
            f{'\u2032'}({x.toFixed(2)}) = {slope.toFixed(2)}
          </text>
        </svg>
      </div>
      <div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
        Function: <span className="font-mono text-[var(--accent)]">f(x) = x³ - 3x</span>
        <br />
        Current Slope: <span className="font-mono text-white">{slope.toFixed(3)}</span>
      </div>
      <p className="mt-2 text-xs text-[var(--text-dim)]">
        Drag horizontally to change x
      </p>
    </div>
  );
}
