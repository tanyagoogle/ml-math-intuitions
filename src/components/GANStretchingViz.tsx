'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function GANStretchingViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stretchAmount, setStretchAmount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPath, setShowPath] = useState(true);
  const animationRef = useRef<number>(0);

  const targetRegions = [
    { cx: -100, cy: -60, label: '1', color: '#4ecdc4' },
    { cx: 100, cy: -60, label: '7', color: '#ff6b6b' },
    { cx: -100, cy: 60, label: '0', color: '#ffe66d' },
    { cx: 100, cy: 60, label: '9', color: '#95e1d3' },
  ];

  const mapPoint = useCallback((u: number, v: number, t: number): { x: number; y: number; region: number } => {
    const flatX = (u - 0.5) * 200;
    const flatY = (v - 0.5) * 200;

    const regionX = u < 0.5 ? 0 : 1;
    const regionY = v < 0.5 ? 0 : 1;
    const region = regionX + regionY * 2;

    const target = targetRegions[region];
    const localU = u < 0.5 ? u * 2 : (u - 0.5) * 2;
    const localV = v < 0.5 ? v * 2 : (v - 0.5) * 2;

    const targetX = target.cx + (localU - 0.5) * 60;
    const targetY = target.cy + (localV - 0.5) * 60;

    return {
      x: flatX * (1 - t) + targetX * t,
      y: flatY * (1 - t) + targetY * t,
      region,
    };
  }, [targetRegions]);

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
      const t = stretchAmount;

      const gridSize = 16;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const u1 = i / gridSize;
          const v1 = j / gridSize;
          const u2 = (i + 1) / gridSize;
          const v2 = (j + 1) / gridSize;

          const p1 = mapPoint(u1, v1, t);
          const p2 = mapPoint(u2, v1, t);
          const p3 = mapPoint(u1, v2, t);

          ctx.beginPath();
          ctx.moveTo(centerX + p1.x, centerY + p1.y);
          ctx.lineTo(centerX + p2.x, centerY + p2.y);
          ctx.strokeStyle = `${targetRegions[p1.region].color}44`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(centerX + p1.x, centerY + p1.y);
          ctx.lineTo(centerX + p3.x, centerY + p3.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
          const u = i / gridSize;
          const v = j / gridSize;
          const p = mapPoint(u, v, t);

          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = targetRegions[p.region].color;
          ctx.fill();
        }
      }

      if (showPath) {
        const pathSteps = 30;
        ctx.beginPath();
        for (let i = 0; i <= pathSteps; i++) {
          const pathT = i / pathSteps;
          const u = 0.25;
          const v = 0.25 + pathT * 0.5;
          const p = mapPoint(u, v, t);

          if (i === 0) {
            ctx.moveTo(centerX + p.x, centerY + p.y);
          } else {
            ctx.lineTo(centerX + p.x, centerY + p.y);
          }
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        const startP = mapPoint(0.25, 0.25, t);
        const endP = mapPoint(0.25, 0.75, t);

        ctx.beginPath();
        ctx.arc(centerX + startP.x, centerY + startP.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#4ecdc4';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX + endP.x, centerY + endP.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe66d';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (t > 0.5) {
        ctx.font = 'bold 24px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const alpha = (t - 0.5) * 2;

        targetRegions.forEach(region => {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.fillText(region.label, centerX + region.cx, centerY + region.cy);
        });
      }

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'left';
      if (t < 0.3) {
        ctx.fillText('Input: Uniform noise z ~ N(0,1)', 10, 20);
      } else if (t < 0.7) {
        ctx.fillText('Generator G(z) learning...', 10, 20);
      } else {
        ctx.fillText('Output: G(z) maps to data manifold', 10, 20);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stretchAmount, showPath, mapPoint, targetRegions]);

  const animateStretch = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const startStretch = stretchAmount;
    const targetStretch = stretchAmount < 0.5 ? 1 : 0;
    const startTime = performance.now();
    const duration = 2000;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setStretchAmount(startStretch + (targetStretch - startStretch) * eased);

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
          onClick={animateStretch}
          disabled={isAnimating}
          style={{
            background: '#ffe66d',
            color: 'hsl(240, 10%, 4%)',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          {stretchAmount < 0.5 ? 'Train Generator' : 'Reset to Noise'}
        </button>
        <button
          onClick={() => setShowPath(!showPath)}
          style={{
            background: showPath ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: `1px solid ${showPath ? '#fff' : 'var(--border-strong)'}`,
            color: showPath ? '#fff' : 'var(--text-secondary)',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          {showPath ? 'Hide' : 'Show'} Path
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '320px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Noise</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={stretchAmount}
            onChange={(e) => setStretchAmount(parseFloat(e.target.value))}
            style={{ width: '200px', accentColor: '#ffe66d' }}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Trained</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          The white path stays <strong style={{ color: '#fff' }}>continuous</strong> as the grid stretches—no holes appear!
        </p>
      </div>
    </div>
  );
}
