'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
}

export default function LangevinDynamicsViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showGradient, setShowGradient] = useState(true);
  const [showNoise, setShowNoise] = useState(true);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const energy = useCallback((x: number, y: number) => {
    const peak1 = 2 * Math.exp(-((x - 0.3) ** 2 + (y - 0.3) ** 2) / 0.05);
    const peak2 = 1.5 * Math.exp(-((x + 0.3) ** 2 + (y + 0.2) ** 2) / 0.08);
    const peak3 = 1 * Math.exp(-((x + 0.1) ** 2 + (y - 0.4) ** 2) / 0.04);
    return -(peak1 + peak2 + peak3);
  }, []);

  const gradient = useCallback((x: number, y: number) => {
    const eps = 0.01;
    const dEdx = (energy(x + eps, y) - energy(x - eps, y)) / (2 * eps);
    const dEdy = (energy(x, y + eps) - energy(x, y - eps)) / (2 * eps);
    return { dx: -dEdx, dy: -dEdy };
  }, [energy]);

  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1.6,
        y: (Math.random() - 0.5) * 1.6,
        vx: 0,
        vy: 0,
        trail: [],
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stepSize = 0.02;
    const noiseScale = 0.015;
    const friction = 0.95;

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
      const scale = Math.min(rect.width, rect.height) * 0.45;

      const gridSize = 40;
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i / gridSize - 0.5) * 2;
          const y = (j / gridSize - 0.5) * 2;
          const e = -energy(x, y);
          const intensity = Math.min(1, e / 2);

          const r = Math.floor(intensity * 78);
          const g = Math.floor(intensity * 205);
          const b = Math.floor(intensity * 196);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.4})`;
          const px = centerX + x * scale;
          const py = centerY + y * scale;
          const cellSize = (2 * scale) / gridSize + 1;
          ctx.fillRect(px - cellSize / 2, py - cellSize / 2, cellSize, cellSize);
        }
      }

      if (showGradient) {
        const arrowGridSize = 12;
        for (let i = 0; i < arrowGridSize; i++) {
          for (let j = 0; j < arrowGridSize; j++) {
            const x = (i / arrowGridSize - 0.5) * 1.8 + 0.075;
            const y = (j / arrowGridSize - 0.5) * 1.8 + 0.075;
            const grad = gradient(x, y);
            const mag = Math.sqrt(grad.dx ** 2 + grad.dy ** 2);
            if (mag < 0.1) continue;

            const px = centerX + x * scale;
            const py = centerY + y * scale;
            const arrowLen = Math.min(15, mag * 10);

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + (grad.dx / mag) * arrowLen, py + (grad.dy / mag) * arrowLen);
            ctx.strokeStyle = 'rgba(255, 230, 109, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      if (isRunning) {
        particlesRef.current.forEach(p => {
          const grad = gradient(p.x, p.y);

          if (showGradient) {
            p.vx += grad.dx * stepSize;
            p.vy += grad.dy * stepSize;
          }

          if (showNoise) {
            p.vx += (Math.random() - 0.5) * noiseScale;
            p.vy += (Math.random() - 0.5) * noiseScale;
          }

          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx;
          p.y += p.vy;

          p.x = Math.max(-0.9, Math.min(0.9, p.x));
          p.y = Math.max(-0.9, Math.min(0.9, p.y));

          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 50) p.trail.shift();
        });
      }

      particlesRef.current.forEach(p => {
        if (p.trail.length > 1) {
          ctx.beginPath();
          p.trail.forEach((point, i) => {
            const px = centerX + point.x * scale;
            const py = centerY + point.y * scale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.textAlign = 'left';
      ctx.fillText('High probability (low energy)', 20, 25);
      ctx.fillText('regions attract particles', 20, 42);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, showGradient, showNoise, gradient, energy]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning ? 'rgba(255, 107, 107, 0.2)' : 'var(--accent)',
            border: isRunning ? '1px solid #ff6b6b' : 'none',
            color: isRunning ? '#ff6b6b' : 'hsl(var(--bg-primary-hsl))',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {isRunning ? 'Pause' : 'Start Langevin Dynamics'}
        </button>
        <button
          onClick={() => { initParticles(); }}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Reset Particles
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={showGradient}
            onChange={(e) => setShowGradient(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          Gradient (∇log p)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={showNoise}
            onChange={(e) => setShowNoise(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          Random Noise (ε)
        </label>
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
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(78, 205, 196, 0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(78, 205, 196, 0.3)',
      }}>
        <h4 style={{ color: '#4ecdc4', marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }}>
          The Langevin Dynamics Equation — A Physical Interpretation
        </h4>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          textAlign: 'center',
          color: 'var(--text-primary)',
          marginBottom: '1.5rem',
          padding: '0.75rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
        }}>
          x<sub>t+1</sub> = <span style={{ color: '#ff6b6b' }}>x<sub>t</sub></span> + <span style={{ color: '#ffe66d' }}>(ε/2) · ∇<sub>x</sub> log p(x<sub>t</sub>)</span> + <span style={{ color: '#a78bfa' }}>√ε · z<sub>t</sub></span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📍</div>
            <code style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>x<sub>t</sub></code>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              <strong>Current position</strong><br/>
              Where the particle is right now
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 230, 109, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 230, 109, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⬆️</div>
            <code style={{ color: '#ffe66d', fontSize: '0.9rem' }}>(ε/2) · ∇ log p</code>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              <strong>Gradient push</strong><br/>
              Force toward high-probability (bright) regions
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(167, 139, 250, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎲</div>
            <code style={{ color: '#a78bfa', fontSize: '0.9rem' }}>√ε · z</code>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              <strong>Random jiggle</strong><br/>
              Brownian motion lets particle explore
            </p>
          </div>
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginTop: '1rem',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          <strong>Physical analogy:</strong> Imagine dropping marbles into a bumpy bowl filled with fog.
          The marbles roll downhill toward valleys (<span style={{ color: '#ffe66d' }}>gradient</span>),
          but get randomly jostled by air molecules (<span style={{ color: '#a78bfa' }}>noise</span>).
          Over time, marbles collect in the deepest valleys — the high-probability regions of the distribution.
        </p>
      </div>
    </div>
  );
}
