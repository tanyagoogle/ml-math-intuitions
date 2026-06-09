'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function NoisePredictionViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestep, setTimestep] = useState(50);
  const [showPrediction, setShowPrediction] = useState(false);
  const noiseRef = useRef<number[][]>([]);
  const imageRef = useRef<number[][]>([]);

  useEffect(() => {
    const size = 32;
    const noise: number[][] = [];
    const image: number[][] = [];

    for (let y = 0; y < size; y++) {
      const noiseRow: number[] = [];
      const imageRow: number[] = [];
      for (let x = 0; x < size; x++) {
        noiseRow.push((Math.random() - 0.5) * 2);

        const cx = size / 2;
        const cy = size / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < 10) {
          imageRow.push(0.9);
        } else if (dist < 13) {
          imageRow.push(0.6);
        } else {
          imageRow.push(0.2);
        }
      }
      noise.push(noiseRow);
      image.push(imageRow);
    }
    noiseRef.current = noise;
    imageRef.current = image;
  }, []);

  const getAlphaBar = useCallback((t: number) => {
    const beta = 0.02;
    let alphaBar = 1;
    for (let i = 0; i <= t; i++) {
      alphaBar *= (1 - beta * (1 + i * 0.015));
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

    const size = 32;
    const cellSize = 6;
    const alphaBar = getAlphaBar(timestep);
    const noiseLevel = Math.sqrt(1 - alphaBar);
    const signalLevel = Math.sqrt(alphaBar);

    const drawImage = (data: number[][], offsetX: number, offsetY: number, label: string, color: string) => {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const value = Math.max(0, Math.min(1, (data[y]?.[x] || 0) * 0.5 + 0.5));
          const intensity = Math.floor(value * 255);
          ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }
      }

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(label, offsetX + size * cellSize / 2, offsetY - 10);
    };

    const noisyImage: number[][] = [];
    for (let y = 0; y < size; y++) {
      const row: number[] = [];
      for (let x = 0; x < size; x++) {
        const original = imageRef.current[y]?.[x] || 0.5;
        const noise = noiseRef.current[y]?.[x] || 0;
        row.push(signalLevel * original + noiseLevel * noise);
      }
      noisyImage.push(row);
    }

    const startX = 30;
    const startY = 60;
    const gap = 60;

    drawImage(imageRef.current, startX, startY, 'x₀ (Original)', '#4ecdc4');

    ctx.font = 'bold 24px var(--font-mono)';
    ctx.fillStyle = 'var(--text-dim)';
    ctx.textAlign = 'center';
    ctx.fillText('+', startX + size * cellSize + gap / 2, startY + size * cellSize / 2);

    const noiseDisplayX = startX + size * cellSize + gap;
    drawImage(noiseRef.current, noiseDisplayX, startY, 'ε (True Noise)', '#ff6b6b');

    ctx.font = 'bold 24px var(--font-mono)';
    ctx.fillStyle = 'var(--text-dim)';
    ctx.fillText('=', noiseDisplayX + size * cellSize + gap / 2, startY + size * cellSize / 2);

    const noisyX = noiseDisplayX + size * cellSize + gap;
    drawImage(noisyImage, noisyX, startY, 'xₜ (Noisy)', '#ffe66d');

    const formulaY = startY + size * cellSize + 35;
    ctx.font = '13px var(--font-mono)';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.textAlign = 'center';
    ctx.fillText(`xₜ = √ᾱₜ · x₀ + √(1-ᾱₜ) · ε`, rect.width / 2, formulaY);
    ctx.fillText(`   = ${signalLevel.toFixed(2)} · x₀ + ${noiseLevel.toFixed(2)} · ε`, rect.width / 2, formulaY + 20);

    const nnY = formulaY + 60;
    ctx.fillStyle = 'rgba(167, 139, 250, 0.2)';
    ctx.fillRect(rect.width / 2 - 120, nnY, 240, 50);
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.width / 2 - 120, nnY, 240, 50);

    ctx.font = 'bold 14px var(--font-mono)';
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';
    ctx.fillText('Neural Network εθ(xₜ, t)', rect.width / 2, nnY + 30);

    ctx.beginPath();
    ctx.moveTo(noisyX + size * cellSize / 2, startY + size * cellSize + 5);
    ctx.lineTo(noisyX + size * cellSize / 2, nnY - 30);
    ctx.lineTo(rect.width / 2, nnY - 10);
    ctx.lineTo(rect.width / 2, nnY);
    ctx.strokeStyle = '#ffe66d';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (showPrediction) {
      const predNoise: number[][] = [];
      for (let y = 0; y < size; y++) {
        const row: number[] = [];
        for (let x = 0; x < size; x++) {
          row.push(noiseRef.current[y]?.[x] * 0.85 + (Math.random() - 0.5) * 0.3 || 0);
        }
        predNoise.push(row);
      }

      const predX = rect.width / 2 + 140;
      const predY = nnY - 30;
      drawImage(predNoise, predX, predY, 'ε̂θ (Predicted)', '#00ff88');

      ctx.beginPath();
      ctx.moveTo(rect.width / 2 + 120, nnY + 25);
      ctx.lineTo(predX, nnY + 25);
      ctx.lineTo(predX, predY + size * cellSize);
      ctx.strokeStyle = '#00ff88';
      ctx.stroke();

      const lossY = predY + size * cellSize + 50;
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.fillText('L = ||ε - ε̂θ||²', rect.width / 2, lossY);
      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Train network to predict the noise!', rect.width / 2, lossY + 25);
    }

  }, [timestep, showPrediction, getAlphaBar]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowPrediction(!showPrediction)}
          style={{
            background: showPrediction ? 'rgba(0, 255, 136, 0.2)' : 'var(--accent)',
            border: showPrediction ? '1px solid #00ff88' : 'none',
            color: showPrediction ? '#00ff88' : 'hsl(var(--bg-primary-hsl))',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {showPrediction ? 'Hide Prediction' : 'Show Neural Net Prediction'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Timestep t = {timestep}
          <input
            type="range"
            min="10"
            max="90"
            value={timestep}
            onChange={(e) => setTimestep(parseInt(e.target.value))}
            style={{
              width: '200px',
              height: '6px',
              background: 'var(--border-strong)',
              borderRadius: '10px',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
          />
        </label>
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

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(0, 255, 136, 0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 136, 0.2)',
      }}>
        <h4 style={{ color: '#00ff88', marginBottom: '0.75rem', fontSize: '1rem' }}>The Key Insight</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          Instead of predicting the clean image directly, the network learns to predict the <strong style={{ color: '#ff6b6b' }}>noise ε</strong> that was added.
          Once we know the noise, we can subtract it: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>x₀ = (xₜ - √(1-ᾱₜ)·ε̂) / √ᾱₜ</code>
        </p>
      </div>
    </div>
  );
}
