'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ReverseSamplingViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestep, setTimestep] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const noiseRef = useRef<number[][]>([]);

  useEffect(() => {
    const size = 64;
    const noise: number[][] = [];
    for (let y = 0; y < size; y++) {
      const row: number[] = [];
      for (let x = 0; x < size; x++) {
        row.push((Math.random() - 0.5) * 2);
      }
      noise.push(row);
    }
    noiseRef.current = noise;
  }, []);

  const getAlphaBar = useCallback((t: number) => {
    const beta = 0.02;
    let alphaBar = 1;
    for (let i = 0; i <= t; i++) {
      alphaBar *= (1 - beta * (1 + i * 0.02));
    }
    return Math.max(0.01, alphaBar);
  }, []);

  const getTargetImage = useCallback((x: number, y: number, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist < 20) {
      return 0.9;
    } else if (dist < 25) {
      return 0.6;
    } else {
      return 0.2;
    }
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
    const cellSize = Math.min(rect.width, rect.height - 120) / size;
    const offsetX = (rect.width - size * cellSize) / 2;
    const offsetY = 20;

    const alphaBar = getAlphaBar(timestep);
    const noiseLevel = Math.sqrt(1 - alphaBar);
    const signalLevel = Math.sqrt(alphaBar);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const targetValue = getTargetImage(x, y, size);
        const noise = noiseRef.current[y]?.[x] || 0;

        const value = signalLevel * targetValue + noiseLevel * noise * 0.5 + 0.5 * noiseLevel;
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
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'center';
    ctx.fillText(`t = ${timestep} → ${timestep > 0 ? timestep - 1 : 0}  (Reverse Process)`, rect.width / 2, infoY);

    ctx.font = '12px var(--font-mono)';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.fillText(`Signal emerging: ${(signalLevel * 100).toFixed(1)}%  |  Noise remaining: ${(noiseLevel * 100).toFixed(1)}%`, rect.width / 2, infoY + 25);

    const barWidth = 200;
    const barHeight = 8;
    const barX = rect.width / 2 - barWidth / 2;
    const barY = infoY + 45;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(barX, barY, barWidth * signalLevel, barHeight);

    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00ff88';
    ctx.fillText('Denoised', barX, barY + 22);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'var(--text-dim)';
    ctx.fillText('Remaining Noise', barX + barWidth, barY + 22);

  }, [timestep, getAlphaBar, getTargetImage]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimestep(t => {
        if (t <= 0) {
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 50);

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
          {isPlaying ? 'Pause' : 'Play Reverse Process'}
        </button>
        <button
          onClick={() => { setTimestep(100); setIsPlaying(false); }}
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
          Reset to Noise
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
            direction: 'rtl',
          }}
        />
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(0, 243, 255, 0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 243, 255, 0.2)',
      }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem', fontSize: '1rem' }}>The Sampling Algorithm</h4>
        <code style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          for t = T, T-1, ..., 1:<br/>
          &nbsp;&nbsp;ε̂ = neural_network(xₜ, t)<br/>
          &nbsp;&nbsp;xₜ₋₁ = (1/√αₜ)(xₜ - (βₜ/√(1-ᾱₜ))·ε̂) + σₜ·z
        </code>
      </div>
    </div>
  );
}
