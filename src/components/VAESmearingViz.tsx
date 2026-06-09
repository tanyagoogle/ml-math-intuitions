'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function VAESmearingViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [klWeight, setKlWeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>(0);

  const digits = [
    { cx: -100, cy: 0, label: '1', color: '#4ecdc4' },
    { cx: 100, cy: 0, label: '0', color: '#ff6b6b' },
  ];

  const drawDigit = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, digit: string, size: number, alpha: number = 1) => {
    ctx.font = `bold ${size}px var(--font-mono)`;
    ctx.fillStyle = digit === '1' ? `rgba(78, 205, 196, ${alpha})` : `rgba(255, 107, 107, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, x, y);
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

      const baseRadius = 20;
      const maxRadius = 120;
      const smearRadius = baseRadius + klWeight * (maxRadius - baseRadius);

      digits.forEach(digit => {
        const pullStrength = klWeight * 0.6;
        const adjustedX = centerX + digit.cx * (1 - pullStrength);
        const adjustedY = centerY + digit.cy;

        const gradient = ctx.createRadialGradient(
          adjustedX, adjustedY, 0,
          adjustedX, adjustedY, smearRadius
        );
        gradient.addColorStop(0, digit.color.replace(')', ', 0.8)').replace('rgb', 'rgba').replace('#', 'rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (_, r, g, b) => `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.8)`));
        gradient.addColorStop(0.3, digit.color + '66');
        gradient.addColorStop(0.6, digit.color + '33');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(adjustedX, adjustedY, smearRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        drawDigit(ctx, adjustedX, adjustedY, digit.label, 40, 1);
      });

      if (klWeight > 0.4) {
        const overlapAlpha = (klWeight - 0.4) / 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);

        const mixGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
        mixGradient.addColorStop(0, `rgba(180, 150, 180, ${overlapAlpha * 0.6})`);
        mixGradient.addColorStop(1, 'rgba(180, 150, 180, 0)');
        ctx.fillStyle = mixGradient;
        ctx.fill();

        if (klWeight > 0.7) {
          ctx.font = '14px var(--font-mono)';
          ctx.fillStyle = `rgba(180, 150, 180, ${(klWeight - 0.7) / 0.3})`;
          ctx.textAlign = 'center';
          ctx.fillText('Valid hybrid region', centerX, centerY + 50);
        }
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();

      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Standard Normal (0,0)', centerX, centerY - 130);

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [klWeight, drawDigit]);

  const animateKL = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const startKL = klWeight;
    const targetKL = klWeight < 0.5 ? 1 : 0;
    const startTime = performance.now();
    const duration = 1500;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setKlWeight(startKL + (targetKL - startKL) * eased);

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
          onClick={animateKL}
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
          {klWeight < 0.5 ? 'Apply KL Divergence' : 'Remove KL Divergence'}
        </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No KL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={klWeight}
            onChange={(e) => setKlWeight(parseFloat(e.target.value))}
            style={{ width: '200px', accentColor: 'var(--accent)' }}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Full KL</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          KL Divergence Weight: <strong style={{ color: 'var(--accent)' }}>{klWeight.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}
