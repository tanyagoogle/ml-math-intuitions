'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ForwardDiffusionViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestep, setTimestep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>(0);
  const imageDataRef = useRef<number[][]>([]);

  useEffect(() => {
    const size = 64;
    const data: number[][] = [];
    for (let y = 0; y < size; y++) {
      const row: number[] = [];
      for (let x = 0; x < size; x++) {
        const cx = size / 2;
        const cy = size / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < 20) {
          row.push(0.9);
        } else if (dist < 25) {
          row.push(0.6);
        } else {
          row.push(0.2);
        }
      }
      data.push(row);
    }
    imageDataRef.current = data;
  }, []);

  const getAlphaBar = useCallback((t: number) => {
    const beta = 0.02;
    let alphaBar = 1;
    for (let i = 0; i <= t; i++) {
      alphaBar *= (1 - beta * (1 + i * 0.02));
    }
    return Math.max(0.01, alphaBar);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = 'hsl(240, 10%, 4%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const size = 64;
    const cellSize = Math.min(rect.width, rect.height - 100) / size;
    const offsetX = (rect.width - size * cellSize) / 2;
    const offsetY = 20;

    const alphaBar = getAlphaBar(timestep);
    const noiseLevel = Math.sqrt(1 - alphaBar);
    const signalLevel = Math.sqrt(alphaBar);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const originalValue = imageDataRef.current[y]?.[x] || 0.5;
        const noise = (Math.random() - 0.5) * 2;
        const value = signalLevel * originalValue + noiseLevel * noise * 0.5 + 0.5 * noiseLevel;
        const clampedValue = Math.max(0, Math.min(1, value));

        const r = Math.floor(clampedValue * 78 + (1 - clampedValue) * 30);
        const g = Math.floor(clampedValue * 205 + (1 - clampedValue) * 30);
        const b = Math.floor(clampedValue * 196 + (1 - clampedValue) * 50);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
      }
    }

    const infoY = offsetY + size * cellSize + 30;
    ctx.font = '14px var(--font-mono)';
    ctx.fillStyle = '#ffe66d';
    ctx.textAlign = 'center';
    ctx.fillText(`t = ${timestep} / 100`, rect.width / 2, infoY);

    ctx.font = '12px var(--font-mono)';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.fillText(`ᾱₜ = ${alphaBar.toFixed(4)}  |  Signal: ${(signalLevel * 100).toFixed(1)}%  |  Noise: ${(noiseLevel * 100).toFixed(1)}%`, rect.width / 2, infoY + 25);

    const barWidth = 200;
    const barHeight = 8;
    const barX = rect.width / 2 - barWidth / 2;
    const barY = infoY + 45;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(barX, barY, barWidth * signalLevel, barHeight);

    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(barX + barWidth * signalLevel, barY, barWidth * noiseLevel, barHeight);

    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('Signal', barX, barY + 22);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('Noise', barX + barWidth, barY + 22);
  }, [timestep, getAlphaBar]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimestep(t => {
        if (t >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return t + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: isPlaying ? 'rgba(255, 107, 107, 0.2)' : 'var(--accent)',
            border: isPlaying ? '1px solid #ff6b6b' : 'none',
            color: isPlaying ? '#ff6b6b' : 'hsl(var(--bg-primary-hsl))',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {isPlaying ? 'Pause' : 'Play Forward Process'}
        </button>
        <button
          onClick={() => { setTimestep(0); setIsPlaying(false); }}
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
          Reset
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

      <div style={{ marginTop: '1.5rem' }}>
        <input
          type="range"
          min="0"
          max="100"
          value={timestep}
          onChange={(e) => { setTimestep(parseInt(e.target.value)); setIsPlaying(false); }}
          style={{
            width: '100%',
            height: '6px',
            background: 'var(--border-strong)',
            borderRadius: '10px',
            outline: 'none',
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(78, 205, 196, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(78, 205, 196, 0.3)',
        }}>
          <h4 style={{ color: '#4ecdc4', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Signal Term</h4>
          <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            √ᾱₜ · x₀
          </code>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Original image, shrinking over time
          </p>
        </div>
        <div style={{
          padding: '1rem',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 107, 107, 0.3)',
        }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Noise Term</h4>
          <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            √(1-ᾱₜ) · ε
          </code>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Gaussian noise, growing over time
          </p>
        </div>
      </div>
    </div>
  );
}
