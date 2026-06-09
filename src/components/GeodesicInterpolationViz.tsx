'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  variance: number;
}

export default function GeodesicInterpolationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interpolation, setInterpolation] = useState(0);
  const [pathType, setPathType] = useState<'euclidean' | 'geodesic'>('euclidean');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const landscape: Point[] = [];
  const gridSize = 20;
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const x = (i / gridSize - 0.5) * 300;
      const y = (j / gridSize - 0.5) * 300;

      const mountain1 = Math.exp(-((x + 50) ** 2 + (y - 30) ** 2) / 2000) * 0.9;
      const mountain2 = Math.exp(-((x - 80) ** 2 + (y + 60) ** 2) / 1500) * 0.7;
      const valley = 0.3 + Math.sin(x / 50) * 0.1;

      const variance = Math.max(0.1, valley - mountain1 - mountain2);
      landscape.push({ x, y, variance });
    }
  }

  const pointA = { x: -100, y: -80 };
  const pointB = { x: 100, y: 60 };

  const getVarianceAt = useCallback((x: number, y: number): number => {
    const mountain1 = Math.exp(-((x + 50) ** 2 + (y - 30) ** 2) / 2000) * 0.9;
    const mountain2 = Math.exp(-((x - 80) ** 2 + (y + 60) ** 2) / 1500) * 0.7;
    const valley = 0.3 + Math.sin(x / 50) * 0.1;
    return Math.max(0.1, valley - mountain1 - mountain2);
  }, []);

  const getEuclideanPath = useCallback((t: number): { x: number; y: number } => {
    return {
      x: pointA.x + (pointB.x - pointA.x) * t,
      y: pointA.y + (pointB.y - pointA.y) * t,
    };
  }, []);

  const getGeodesicPath = useCallback((t: number): { x: number; y: number } => {
    const controlX = 0;
    const controlY = -100;

    const x = (1 - t) ** 2 * pointA.x + 2 * (1 - t) * t * controlX + t ** 2 * pointB.x;
    const y = (1 - t) ** 2 * pointA.y + 2 * (1 - t) * t * controlY + t ** 2 * pointB.y;

    return { x, y };
  }, []);

  const animateInterpolation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setInterpolation(0);

    const startTime = performance.now();
    const duration = 2500;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setInterpolation(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.02;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const cellSize = 15;
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i / gridSize - 0.5) * 300;
          const y = (j / gridSize - 0.5) * 300;
          const variance = getVarianceAt(x, y);

          const hue = 200 + (1 - variance) * 60;
          const lightness = 15 + variance * 25;

          ctx.fillStyle = `hsl(${hue}, 60%, ${lightness}%)`;
          ctx.fillRect(
            centerX + x - cellSize / 2,
            centerY + y - cellSize / 2,
            cellSize,
            cellSize
          );
        }
      }

      const drawPath = (getPoint: (t: number) => { x: number; y: number }, color: string, dashed: boolean) => {
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.02) {
          const p = getPoint(t);
          if (t === 0) {
            ctx.moveTo(centerX + p.x, centerY + p.y);
          } else {
            ctx.lineTo(centerX + p.x, centerY + p.y);
          }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        if (dashed) ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawPath(getEuclideanPath, pathType === 'euclidean' ? '#ff4444' : 'rgba(255, 68, 68, 0.3)', true);
      drawPath(getGeodesicPath, pathType === 'geodesic' ? '#00ff88' : 'rgba(0, 255, 136, 0.3)', false);

      const currentPoint = pathType === 'euclidean'
        ? getEuclideanPath(interpolation)
        : getGeodesicPath(interpolation);

      const currentVariance = getVarianceAt(currentPoint.x, currentPoint.y);
      const travelerColor = pathType === 'euclidean' ? '#ff4444' : '#00ff88';

      ctx.beginPath();
      ctx.arc(centerX + currentPoint.x, centerY + currentPoint.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = `${travelerColor}40`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX + currentPoint.x, centerY + currentPoint.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = travelerColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX + pointA.x, centerY + pointA.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#4ecdc4';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = 'bold 12px var(--font-sans)';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', centerX + pointA.x, centerY + pointA.y);

      ctx.beginPath();
      ctx.arc(centerX + pointB.x, centerY + pointB.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ff00ff';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText('B', centerX + pointB.x, centerY + pointB.y);

      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Low Variance (Mountain)', centerX - 50, centerY + 40);
      ctx.fillText('Low Variance (Mountain)', centerX + 80, centerY - 50);

      const infoY = 25;
      ctx.font = '11px var(--font-mono)';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText(`Position: (${currentPoint.x.toFixed(0)}, ${currentPoint.y.toFixed(0)})`, 15, infoY);
      ctx.fillText(`Local σ²: ${currentVariance.toFixed(2)}`, 15, infoY + 18);

      const terrain = currentVariance < 0.15 ? 'MOUNTAIN (High Cost!)' : currentVariance > 0.25 ? 'Valley (Low Cost)' : 'Hillside';
      ctx.fillStyle = currentVariance < 0.15 ? '#ff4444' : currentVariance > 0.25 ? '#00ff88' : '#ffe66d';
      ctx.fillText(`Terrain: ${terrain}`, 15, infoY + 36);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff4444';
      ctx.fillText('--- Euclidean (straight line)', rect.width - 15, infoY);
      ctx.fillStyle = '#00ff88';
      ctx.fillText('— Geodesic (avoids mountains)', rect.width - 15, infoY + 18);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [interpolation, pathType, getVarianceAt, getEuclideanPath, getGeodesicPath]);

  const calculatePathCost = useCallback((getPoint: (t: number) => { x: number; y: number }): number => {
    let cost = 0;
    const steps = 50;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const p = getPoint(t);
      const variance = getVarianceAt(p.x, p.y);
      cost += 1 / (variance + 0.1);
    }
    return cost / steps;
  }, [getVarianceAt]);

  const euclideanCost = calculatePathCost(getEuclideanPath);
  const geodesicCost = calculatePathCost(getGeodesicPath);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPathType('euclidean')}
          style={{
            background: pathType === 'euclidean' ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${pathType === 'euclidean' ? '#ff4444' : 'var(--border-strong)'}`,
            color: pathType === 'euclidean' ? '#ff4444' : 'var(--text-primary)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Euclidean Path
        </button>
        <button
          onClick={() => setPathType('geodesic')}
          style={{
            background: pathType === 'geodesic' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            border: `1px solid ${pathType === 'geodesic' ? '#00ff88' : 'var(--border-strong)'}`,
            color: pathType === 'geodesic' ? '#00ff88' : 'var(--text-primary)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Geodesic Path
        </button>
        <button
          onClick={animateInterpolation}
          disabled={isAnimating}
          style={{
            background: 'var(--accent)',
            color: 'hsl(var(--bg-primary-hsl))',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          {isAnimating ? 'Interpolating...' : 'Start Interpolation'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '400px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(255, 68, 68, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 68, 68, 0.3)',
        }}>
          <h4 style={{ color: '#ff4444', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Euclidean Path</h4>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: '#ff4444' }}>
            {euclideanCost.toFixed(1)}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Information cost (plows through mountains)
          </p>
        </div>
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 136, 0.3)',
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Geodesic Path</h4>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: '#00ff88' }}>
            {geodesicCost.toFixed(1)}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Information cost (curves around mountains)
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={interpolation}
          onChange={(e) => setInterpolation(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: pathType === 'euclidean' ? '#ff4444' : '#00ff88' }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0 0 0' }}>
          Interpolation: <strong style={{ color: 'var(--accent)' }}>{(interpolation * 100).toFixed(0)}%</strong>
        </p>
      </div>
    </div>
  );
}
