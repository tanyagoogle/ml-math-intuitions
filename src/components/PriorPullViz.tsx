'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface LatentPoint {
  x: number;
  y: number;
  label: string;
  color: string;
}

export default function PriorPullViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGeodesic, setShowGeodesic] = useState(true);
  const [showEuclidean, setShowEuclidean] = useState(true);
  const [interpolation, setInterpolation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const pointA: LatentPoint = { x: -120, y: -40, label: 'Cat', color: '#ff6b6b' };
  const pointB: LatentPoint = { x: 120, y: 50, label: 'Car', color: '#4ecdc4' };

  const animateInterpolation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setInterpolation(0);

    const startTime = performance.now();
    const duration = 3000;

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

      for (let r = 150; r > 0; r -= 10) {
        const alpha = (1 - r / 150) * 0.15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.fill();

      ctx.font = 'bold 11px var(--font-mono)';
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.fillText('Prior N(0,0)', centerX, centerY + 25);
      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('(Maximum Uncertainty)', centerX, centerY + 40);

      if (showEuclidean) {
        ctx.beginPath();
        ctx.moveTo(centerX + pointA.x, centerY + pointA.y);
        ctx.lineTo(centerX + pointB.x, centerY + pointB.y);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (showGeodesic) {
        const pullStrength = 0.6;
        const controlX = 0;
        const controlY = (pointA.y + pointB.y) / 2 * (1 - pullStrength);

        ctx.beginPath();
        ctx.moveTo(centerX + pointA.x, centerY + pointA.y);
        ctx.quadraticCurveTo(
          centerX + controlX,
          centerY + controlY,
          centerX + pointB.x,
          centerY + pointB.y
        );
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.stroke();

        const midT = 0.5;
        const midX = (1 - midT) ** 2 * pointA.x + 2 * (1 - midT) * midT * controlX + midT ** 2 * pointB.x;
        const midY = (1 - midT) ** 2 * pointA.y + 2 * (1 - midT) * midT * controlY + midT ** 2 * pointB.y;

        ctx.beginPath();
        ctx.moveTo(centerX + midX, centerY + midY);
        ctx.lineTo(centerX, centerY);
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const getEuclideanPoint = (t: number) => ({
        x: pointA.x + (pointB.x - pointA.x) * t,
        y: pointA.y + (pointB.y - pointA.y) * t,
      });

      const getGeodesicPoint = (t: number) => {
        const pullStrength = 0.6;
        const controlX = 0;
        const controlY = (pointA.y + pointB.y) / 2 * (1 - pullStrength);
        return {
          x: (1 - t) ** 2 * pointA.x + 2 * (1 - t) * t * controlX + t ** 2 * pointB.x,
          y: (1 - t) ** 2 * pointA.y + 2 * (1 - t) * t * controlY + t ** 2 * pointB.y,
        };
      };

      if (showEuclidean) {
        const eucPoint = getEuclideanPoint(interpolation);
        ctx.beginPath();
        ctx.arc(centerX + eucPoint.x, centerY + eucPoint.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (showGeodesic) {
        const geoPoint = getGeodesicPoint(interpolation);
        ctx.beginPath();
        ctx.arc(centerX + geoPoint.x, centerY + geoPoint.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (interpolation > 0.3 && interpolation < 0.7) {
          ctx.font = '10px var(--font-mono)';
          ctx.fillStyle = '#a78bfa';
          ctx.textAlign = 'center';
          ctx.fillText('Pulled toward prior', centerX + geoPoint.x, centerY + geoPoint.y + 25);
          ctx.fillText('("Generic" region)', centerX + geoPoint.x, centerY + geoPoint.y + 38);
        }
      }

      ctx.beginPath();
      ctx.arc(centerX + pointA.x, centerY + pointA.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = pointA.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = 'bold 10px var(--font-sans)';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pointA.label, centerX + pointA.x, centerY + pointA.y);

      ctx.beginPath();
      ctx.arc(centerX + pointB.x, centerY + pointB.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = pointB.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillText(pointB.label, centerX + pointB.x, centerY + pointB.y);

      const decodedY = rect.height - 70;
      const decodedWidth = 60;
      const decodedHeight = 45;

      const geoPoint = getGeodesicPoint(interpolation);
      const distFromCenter = Math.sqrt(geoPoint.x ** 2 + geoPoint.y ** 2);
      const genericness = 1 - Math.min(distFromCenter / 150, 1);

      ctx.fillStyle = 'hsla(0, 0%, 100%, 0.05)';
      ctx.fillRect(centerX - decodedWidth / 2 - 10, decodedY - 10, decodedWidth + 20, decodedHeight + 35);

      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Decoded Output', centerX, decodedY - 20);

      const catness = 1 - interpolation;
      const carness = interpolation;
      const blur = genericness * 0.5;

      const gradient = ctx.createLinearGradient(
        centerX - decodedWidth / 2,
        decodedY,
        centerX + decodedWidth / 2,
        decodedY
      );
      gradient.addColorStop(0, `rgba(255, 107, 107, ${catness * (1 - blur)})`);
      gradient.addColorStop(0.5, `rgba(167, 139, 250, ${blur})`);
      gradient.addColorStop(1, `rgba(78, 205, 196, ${carness * (1 - blur)})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - decodedWidth / 2, decodedY, decodedWidth, decodedHeight);
      ctx.strokeStyle = 'var(--border-subtle)';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - decodedWidth / 2, decodedY, decodedWidth, decodedHeight);

      ctx.font = '9px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      if (genericness > 0.4) {
        ctx.fillText('Blurry / Generic', centerX, decodedY + decodedHeight + 15);
      } else if (interpolation < 0.3) {
        ctx.fillText('Cat-like', centerX, decodedY + decodedHeight + 15);
      } else if (interpolation > 0.7) {
        ctx.fillText('Car-like', centerX, decodedY + decodedHeight + 15);
      } else {
        ctx.fillText('Transition', centerX, decodedY + decodedHeight + 15);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showGeodesic, showEuclidean, interpolation]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowEuclidean(!showEuclidean)}
          style={{
            background: showEuclidean ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${showEuclidean ? '#ff4444' : 'var(--border-strong)'}`,
            color: showEuclidean ? '#ff4444' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Euclidean
        </button>
        <button
          onClick={() => setShowGeodesic(!showGeodesic)}
          style={{
            background: showGeodesic ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            border: `1px solid ${showGeodesic ? '#00ff88' : 'var(--border-strong)'}`,
            color: showGeodesic ? '#00ff88' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Geodesic
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
          Animate Cat → Car
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '420px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={interpolation}
          onChange={(e) => setInterpolation(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>Cat</span>
          <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Generic Blob</span>
          <span style={{ color: '#4ecdc4', fontSize: '0.85rem' }}>Car</span>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
        The geodesic path curves toward the prior (center) because that region has maximum variance (lowest information cost).
        This causes the &quot;fade to gray&quot; effect in the middle of interpolations.
      </p>
    </div>
  );
}
