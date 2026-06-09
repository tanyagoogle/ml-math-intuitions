'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface DataPoint {
  x: number;
  y: number;
  variance: number;
  label: string;
  color: string;
}

export default function LatentGeometryViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [showRulers, setShowRulers] = useState(true);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const points: DataPoint[] = [
    { x: -120, y: -60, variance: 0.1, label: 'Cat', color: '#ff6b6b' },
    { x: 120, y: -60, variance: 0.8, label: 'Animal?', color: '#4ecdc4' },
    { x: 0, y: 80, variance: 0.3, label: 'Dog', color: '#ffe66d' },
  ];

  const getRadius = useCallback((variance: number): number => {
    return 15 + variance * 80;
  }, []);

  const getInfoDistance = useCallback((variance: number): number => {
    return 1 / (variance + 0.1);
  }, []);

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

      ctx.beginPath();
      for (let i = 1; i <= 3; i++) {
        ctx.arc(centerX, centerY, i * 80, 0, Math.PI * 2);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      points.forEach((point, idx) => {
        const px = centerX + point.x;
        const py = centerY + point.y;
        const radius = getRadius(point.variance);

        const pulseRadius = radius + Math.sin(timeRef.current * 2 + idx) * 3;

        for (let r = pulseRadius; r > 0; r -= 5) {
          const alpha = (1 - r / pulseRadius) * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = point.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 12px var(--font-mono)';
        ctx.fillStyle = point.color;
        ctx.textAlign = 'center';
        ctx.fillText(point.label, px, py - pulseRadius - 12);

        if (showRulers) {
          const rulerLength = 40 / (point.variance + 0.2);
          ctx.beginPath();
          ctx.moveTo(px - rulerLength / 2, py + pulseRadius + 15);
          ctx.lineTo(px + rulerLength / 2, py + pulseRadius + 15);
          ctx.strokeStyle = point.color;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(px - rulerLength / 2, py + pulseRadius + 10);
          ctx.lineTo(px - rulerLength / 2, py + pulseRadius + 20);
          ctx.moveTo(px + rulerLength / 2, py + pulseRadius + 10);
          ctx.lineTo(px + rulerLength / 2, py + pulseRadius + 20);
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '10px var(--font-mono)';
          ctx.fillStyle = 'var(--text-dim)';
          ctx.fillText(`σ²=${point.variance.toFixed(1)}`, px, py + pulseRadius + 35);
        }
      });

      if (selectedPoint !== null) {
        const point = points[selectedPoint];
        const px = centerX + point.x;
        const py = centerY + point.y;
        const radius = getRadius(point.variance);

        ctx.beginPath();
        ctx.arc(px, py, radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        const infoBox = {
          x: rect.width - 180,
          y: 20,
          w: 160,
          h: 100,
        };

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(infoBox.x, infoBox.y, infoBox.w, infoBox.h);
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(infoBox.x, infoBox.y, infoBox.w, infoBox.h);

        ctx.font = 'bold 14px var(--font-mono)';
        ctx.fillStyle = point.color;
        ctx.textAlign = 'left';
        ctx.fillText(point.label, infoBox.x + 10, infoBox.y + 25);

        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText(`Variance: ${point.variance.toFixed(2)}`, infoBox.x + 10, infoBox.y + 50);
        ctx.fillText(`Info Dist: ${getInfoDistance(point.variance).toFixed(1)}`, infoBox.x + 10, infoBox.y + 70);
        ctx.fillText(`Ruler: ${point.variance < 0.3 ? 'Small (Mountain)' : point.variance > 0.5 ? 'Large (Valley)' : 'Medium'}`, infoBox.x + 10, infoBox.y + 90);
      }

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Low variance = Sharp peak = Tiny ruler (expensive to move)', centerX, rect.height - 35);
      ctx.fillText('High variance = Wide fog = Large ruler (cheap to move)', centerX, rect.height - 18);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [points, selectedPoint, showRulers, getRadius, getInfoDistance]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    let closest = -1;
    let minDist = Infinity;

    points.forEach((point, idx) => {
      const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (dist < getRadius(point.variance) + 20 && dist < minDist) {
        closest = idx;
        minDist = dist;
      }
    });

    setSelectedPoint(closest === selectedPoint ? null : closest);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowRulers(!showRulers)}
          style={{
            background: showRulers ? 'var(--accent-muted)' : 'transparent',
            border: `1px solid ${showRulers ? 'var(--accent)' : 'var(--border-strong)'}`,
            color: showRulers ? 'var(--accent)' : 'var(--text-primary)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {showRulers ? 'Hide Rulers' : 'Show Rulers'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '380px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        {points.map((point, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPoint(idx === selectedPoint ? null : idx)}
            style={{
              padding: '1rem',
              background: selectedPoint === idx ? `${point.color}20` : 'hsla(0, 0%, 100%, 0.03)',
              borderRadius: '12px',
              border: `1px solid ${selectedPoint === idx ? point.color : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: point.color }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{point.label}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              σ² = {point.variance} → {point.variance < 0.3 ? 'Mountain' : point.variance > 0.5 ? 'Valley' : 'Hillside'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
