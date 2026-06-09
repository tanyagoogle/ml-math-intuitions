'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ConcentrationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimension, setDimension] = useState(2);
  const animationRef = useRef<number>(0);

  const generatePoints = useCallback((dim: number, n: number): number[][] => {
    const points: number[][] = [];
    for (let i = 0; i < n; i++) {
      const point: number[] = [];
      for (let d = 0; d < dim; d++) {
        point.push((Math.random() - 0.5) * 2);
      }
      points.push(point);
    }
    return points;
  }, []);

  const magnitude = (point: number[]): number => {
    return Math.sqrt(point.reduce((sum, x) => sum + x * x, 0));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = 2000;
    const points = generatePoints(dimension, n);
    const mags = points.map(magnitude);

    const maxR = Math.sqrt(dimension);
    const shellWidth = maxR / 20;
    const histogram: number[] = new Array(20).fill(0);

    mags.forEach(m => {
      const bin = Math.min(Math.floor(m / shellWidth), 19);
      histogram[bin]++;
    });

    const maxCount = Math.max(...histogram);

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const padding = { left: 60, right: 30, top: 40, bottom: 50 };
      const chartWidth = rect.width - padding.left - padding.right;
      const chartHeight = rect.height - padding.top - padding.bottom;

      ctx.strokeStyle = 'var(--border-subtle)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, rect.height - padding.bottom);
      ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom);
      ctx.stroke();

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Distance from Origin (r)', rect.width / 2, rect.height - 10);

      ctx.save();
      ctx.translate(20, rect.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Point Count', 0, 0);
      ctx.restore();

      const barWidth = chartWidth / histogram.length - 2;

      histogram.forEach((count, i) => {
        const x = padding.left + i * (chartWidth / histogram.length) + 1;
        const barHeight = (count / maxCount) * chartHeight;
        const y = rect.height - padding.bottom - barHeight;

        const hue = 200 + (i / histogram.length) * 60;
        const gradient = ctx.createLinearGradient(x, y, x, rect.height - padding.bottom);
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue}, 70%, 40%, 0.6)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.8)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
      });

      const peakBin = histogram.indexOf(maxCount);
      const peakX = padding.left + (peakBin + 0.5) * (chartWidth / histogram.length);
      const peakY = padding.top + 20;

      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(peakX, rect.height - padding.bottom - (maxCount / maxCount) * chartHeight - 10);
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ff00ff';
      ctx.font = '11px var(--font-mono)';
      ctx.textAlign = 'center';
      const peakRadius = ((peakBin + 0.5) * shellWidth).toFixed(2);
      ctx.fillText(`Peak at r ≈ ${peakRadius}`, peakX, peakY - 5);

      ctx.font = '14px var(--font-sans)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'left';
      ctx.fillText(`${dimension}D Hypercube`, padding.left, 25);

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText(`√d ≈ ${Math.sqrt(dimension).toFixed(2)}`, padding.left + 120, 25);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimension, generatePoints]);

  const theoreticalPeak = Math.sqrt(dimension / 3);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[2, 5, 10, 50, 100].map(d => (
          <button
            key={d}
            onClick={() => setDimension(d)}
            style={{
              background: dimension === d ? 'var(--accent)' : 'transparent',
              color: dimension === d ? 'hsl(var(--bg-primary-hsl))' : 'var(--text-primary)',
              border: `1px solid ${dimension === d ? 'var(--accent)' : 'var(--border-strong)'}`,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              minWidth: '60px',
            }}
          >
            {d}D
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '300px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
          {dimension <= 3 && 'In low dimensions, points are spread relatively evenly throughout the volume.'}
          {dimension > 3 && dimension <= 10 && 'Notice how points start clustering away from the center as dimensions increase.'}
          {dimension > 10 && dimension <= 50 && 'The concentration effect becomes pronounced—nearly all points are in a thin shell near the boundary.'}
          {dimension > 50 && `In ${dimension}D, virtually all points are at distance ≈${theoreticalPeak.toFixed(1)} from the center. The "center" is empty!`}
        </p>
      </div>
    </div>
  );
}
