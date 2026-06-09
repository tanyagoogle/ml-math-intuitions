'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function IntractabilityViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState(2);
  const [sampleCount, setSampleCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [foundValid, setFoundValid] = useState(0);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const samplesRef = useRef<{ x: number; y: number; valid: boolean }[]>([]);

  const startSampling = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSampleCount(0);
    setFoundValid(0);
    samplesRef.current = [];

    const targetSamples = 200;
    const interval = setInterval(() => {
      const newSamples: { x: number; y: number; valid: boolean }[] = [];

      for (let i = 0; i < 5; i++) {
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;

        const targetX = 0.3;
        const targetY = -0.2;
        const targetRadius = 0.15 / Math.pow(dimensions, 0.5);

        const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
        const valid = dist < targetRadius;

        newSamples.push({ x, y, valid });
        if (valid) {
          setFoundValid(prev => prev + 1);
        }
      }

      samplesRef.current = [...samplesRef.current, ...newSamples].slice(-300);
      setSampleCount(prev => prev + 5);

      if (samplesRef.current.length >= targetSamples) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, dimensions]);

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
      const scale = Math.min(rect.width, rect.height) * 0.35;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - scale, centerY - scale, scale * 2, scale * 2);

      for (let i = -1; i <= 1; i += 0.5) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * scale, centerY - scale);
        ctx.lineTo(centerX + i * scale, centerY + scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX - scale, centerY + i * scale);
        ctx.lineTo(centerX + scale, centerY + i * scale);
        ctx.stroke();
      }

      const targetX = 0.3;
      const targetY = -0.2;
      const targetRadius = 0.15 / Math.pow(dimensions, 0.5);

      ctx.beginPath();
      ctx.arc(
        centerX + targetX * scale,
        centerY + targetY * scale,
        targetRadius * scale,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.fillText('Valid latent region', centerX + targetX * scale, centerY + targetY * scale + targetRadius * scale + 15);

      samplesRef.current.forEach((sample, idx) => {
        const age = (samplesRef.current.length - idx) / samplesRef.current.length;
        const alpha = 0.3 + age * 0.7;

        ctx.beginPath();
        ctx.arc(
          centerX + sample.x * scale,
          centerY + sample.y * scale,
          sample.valid ? 6 : 3,
          0,
          Math.PI * 2
        );

        if (sample.valid) {
          ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255, 68, 68, ${alpha * 0.5})`;
          ctx.fill();
        }
      });

      ctx.font = 'bold 14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'left';
      ctx.fillText(`Dimensions: ${dimensions}D`, 20, 30);
      ctx.fillText(`Samples: ${sampleCount}`, 20, 50);

      ctx.fillStyle = foundValid > 0 ? '#00ff88' : '#ff4444';
      ctx.fillText(`Found valid: ${foundValid}`, 20, 70);

      const gridPoints = Math.pow(10, dimensions);
      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.textAlign = 'right';
      ctx.fillText(`Grid points needed: 10^${dimensions} = ${gridPoints.toExponential(1)}`, rect.width - 20, 30);

      const validVolume = Math.pow(targetRadius * 2, dimensions);
      const totalVolume = Math.pow(2, dimensions);
      const hitProb = validVolume / totalVolume;
      ctx.fillText(`P(hit valid) ≈ ${hitProb.toExponential(2)}`, rect.width - 20, 50);

      if (dimensions >= 10) {
        ctx.font = 'bold 12px var(--font-mono)';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('Intractable! Valid region is astronomically small.', centerX, rect.height - 20);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, sampleCount, foundValid]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[2, 5, 10, 50, 100].map(d => (
          <button
            key={d}
            onClick={() => {
              setDimensions(d);
              setSampleCount(0);
              setFoundValid(0);
              samplesRef.current = [];
            }}
            style={{
              background: dimensions === d ? 'var(--accent-muted)' : 'transparent',
              border: `1px solid ${dimensions === d ? 'var(--accent)' : 'var(--border-strong)'}`,
              color: dimensions === d ? 'var(--accent)' : 'var(--text-primary)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {d}D
          </button>
        ))}
        <button
          onClick={startSampling}
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
          {isAnimating ? 'Sampling...' : 'Sample from Prior'}
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'hsla(0, 0%, 100%, 0.03)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Grid Points</div>
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: dimensions > 10 ? '#ff4444' : 'var(--text-primary)' }}>
            10<sup>{dimensions}</sup>
          </div>
        </div>
        <div style={{
          padding: '1rem',
          background: 'hsla(0, 0%, 100%, 0.03)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Valid Volume Fraction</div>
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: '#4ecdc4' }}>
            {(Math.pow(0.15 / Math.pow(dimensions, 0.5) * 2, dimensions) / Math.pow(2, dimensions)).toExponential(1)}
          </div>
        </div>
        <div style={{
          padding: '1rem',
          background: 'hsla(0, 0%, 100%, 0.03)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Status</div>
          <div style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: dimensions <= 5 ? '#00ff88' : dimensions <= 20 ? '#ffe66d' : '#ff4444' }}>
            {dimensions <= 5 ? 'Tractable' : dimensions <= 20 ? 'Difficult' : 'Intractable'}
          </div>
        </div>
      </div>
    </div>
  );
}
