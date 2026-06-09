'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function CrumpledPaperViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crumpleAmount, setCrumpleAmount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.5 });
  const animationRef = useRef<number>(0);

  const generateGrid = useCallback((crumple: number) => {
    const points: { x: number; y: number; z: number; u: number; v: number }[] = [];
    const gridSize = 20;

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const u = (i / gridSize) * 2 - 1;
        const v = (j / gridSize) * 2 - 1;

        const flatX = u * 100;
        const flatY = v * 100;
        const flatZ = 0;

        const freq1 = 2.5;
        const freq2 = 1.8;
        const amp = 40 * crumple;

        const crumpledZ =
          amp * Math.sin(u * freq1 * Math.PI) * Math.cos(v * freq2 * Math.PI) +
          amp * 0.5 * Math.sin((u + v) * 3 * Math.PI) +
          amp * 0.3 * Math.cos(u * 4 * Math.PI) * Math.sin(v * 2 * Math.PI);

        const squeeze = 1 - crumple * 0.3;
        const crumpledX = flatX * squeeze + crumple * 10 * Math.sin(v * 2 * Math.PI);
        const crumpledY = flatY * squeeze + crumple * 10 * Math.cos(u * 2 * Math.PI);

        points.push({
          x: flatX * (1 - crumple) + crumpledX * crumple,
          y: flatY * (1 - crumple) + crumpledY * crumple,
          z: flatZ * (1 - crumple) + crumpledZ * crumple,
          u: i,
          v: j,
        });
      }
    }
    return points;
  }, []);

  const project = useCallback((point: { x: number; y: number; z: number }, rotX: number, rotY: number) => {
    let { x, y, z } = point;

    let cosY = Math.cos(rotY);
    let sinY = Math.sin(rotY);
    let newX = x * cosY + z * sinY;
    let newZ = -x * sinY + z * cosY;
    x = newX;
    z = newZ;

    let cosX = Math.cos(rotX);
    let sinX = Math.sin(rotX);
    let newY = y * cosX - z * sinX;
    newZ = y * sinX + z * cosX;
    y = newY;
    z = newZ;

    const perspective = 300 / (300 + z);

    return {
      x: x * perspective,
      y: y * perspective,
      depth: z,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const points = generateGrid(crumpleAmount);
      const gridSize = 20;

      const rotY = rotation.y + 0.002;
      setRotation(prev => ({ ...prev, y: rotY }));

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const idx = i * (gridSize + 1) + j;
          const p1 = project(points[idx], rotation.x, rotY);
          const p2 = project(points[idx + 1], rotation.x, rotY);
          const p3 = project(points[idx + gridSize + 1], rotation.x, rotY);
          const p4 = project(points[idx + gridSize + 2], rotation.x, rotY);

          const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
          const alpha = 0.3 + (avgDepth + 100) / 200 * 0.5;

          const hue = 200 + (i / gridSize) * 40 + (j / gridSize) * 20;
          ctx.fillStyle = `hsla(${hue}, 60%, 50%, ${alpha * 0.4})`;
          ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(centerX + p1.x, centerY + p1.y);
          ctx.lineTo(centerX + p2.x, centerY + p2.y);
          ctx.lineTo(centerX + p4.x, centerY + p4.y);
          ctx.lineTo(centerX + p3.x, centerY + p3.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';

      if (crumpleAmount < 0.3) {
        ctx.fillText('2D Latent Space (Uncrumpled)', centerX, rect.height - 20);
      } else if (crumpleAmount > 0.7) {
        ctx.fillText('High-Dimensional Input Space (Crumpled)', centerX, rect.height - 20);
      } else {
        ctx.fillText('Partially Unfolded', centerX, rect.height - 20);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [crumpleAmount, rotation, generateGrid, project]);

  const animateCrumple = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const targetCrumple = crumpleAmount < 0.5 ? 1 : 0;
    const startCrumple = crumpleAmount;
    const startTime = performance.now();
    const duration = 1500;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCrumpleAmount(startCrumple + (targetCrumple - startCrumple) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={animateCrumple}
          disabled={isAnimating}
          style={{
            background: 'var(--accent)',
            color: 'hsl(var(--bg-primary-hsl))',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          {crumpleAmount < 0.5 ? 'Crumple Paper' : 'Uncrumple Paper'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '350px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Flat (Latent)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={crumpleAmount}
            onChange={(e) => setCrumpleAmount(parseFloat(e.target.value))}
            style={{
              width: '200px',
              accentColor: 'var(--accent)',
            }}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Crumpled (Input)</span>
        </div>
      </div>
    </div>
  );
}
