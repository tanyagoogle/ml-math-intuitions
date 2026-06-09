"use client";

import React, { useRef, useEffect, useState } from 'react';
import styles from '../app/loss-landscapes/loss.module.css';

// Noise function for chaos
function noise(x: number, y: number, seed: number) {
  return (
    Math.sin(x * 5 + seed) * 0.5 +
    Math.cos(y * 4 + seed) * 0.5 +
    Math.sin((x * y) * 2 + seed) * 0.3
  );
}

const LossLandscapeViz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [architecture, setArchitecture] = useState<'resnet' | 'plain'>('resnet');
  const [fineTuningStep, setFineTuningStep] = useState(0); // 0 to 100
  const [useSAM, setUseSAM] = useState(false);

  // Physics parameters derived from inputs
  // Paper 1: ResNets are convex (smooth). Plain deep nets are chaotic (sharp).
  const baseSharpness = architecture === 'resnet' ? 0.3 : 1.5;
  const baseChaos = architecture === 'resnet' ? 0.1 : 1.2;

  // Paper 2: Fine-tuning increases sharpness/chaos, SAM reduces it.
  const ftMultiplier = useSAM ? 0.2 : 1.5;
  const ftChaos = useSAM ? 0.1 : 0.8;

  const sharpness = baseSharpness + (fineTuningStep / 100) * ftMultiplier;
  const chaos = baseChaos + (fineTuningStep / 100) * ftChaos;

  const width = 450;
  const height = 350;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const scale = 40;
    const gridSize = 3; // Finer grid

    // Color Map (Turbo-ish)
    const getColor = (val: number) => {
      const n = Math.max(0, Math.min(1, val / 6));
      const r = Math.min(255, n * 2.5 * 255);
      const g = Math.min(255, (1 - Math.abs(n - 0.4) * 2) * 200 + 40);
      const b = Math.min(255, (1 - n) * 2 * 255);
      return `rgb(${r}, ${g}, ${b})`;
    };

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        const u = (x - width / 2) / scale;
        const v = (y - height / 2) / scale;

        // Loss Surface L(u,v)
        const distSq = u * u + v * v;
        const mainLoss = 0.5 * sharpness * distSq;
        const nVal = chaos * noise(u, v, 0);

        ctx.fillStyle = getColor(mainLoss + nVal);
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }, [sharpness, chaos]);

  // Hessian Spectrum Render
  useEffect(() => {
    const canvas = spectrumRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina scaling for clearer text? (Skipping for now to keep simple)
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const mean = sharpness * 15;
    const stdDev = 5 + chaos * 25;

    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let x = 0; x < w; x++) {
      const valX = (x / w) * 120; // range
      const diff = valX - mean;
      // Log-normalish skew to right? Just Gaussian is fine for intuition
      const pdf = Math.exp(-(diff * diff) / (2 * stdDev * stdDev));

      ctx.lineTo(x, h - (pdf * h * 0.9));
    }

    ctx.strokeStyle = useSAM || (architecture === 'resnet' && fineTuningStep < 50) ? "var(--accent)" : "#f87171";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo(w, h);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();

    // Text Labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter";
    ctx.fillText("0", 5, h - 5);
    ctx.fillText("Max Eigenvalue λ", w - 90, h - 5);

  }, [sharpness, chaos, useSAM, architecture]);

  return (
    <div className={styles.conceptCard}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative flex-1">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="rounded-xl w-full border border-[var(--border-subtle)] shadow-2xl"
          />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10">
            L(θ) Surface
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Landscape Sim</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Tune parameters to see how geometry evolves.
            </p>
          </div>

          <div className={styles.controls}>
            {/* Architecture Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">Architecture (Paper 1)</label>
              <div className={styles.toggleGroup}>
                <button
                  onClick={() => setArchitecture('resnet')}
                  className={`${styles.toggleButton} ${architecture === 'resnet' ? styles.toggleButtonActive : ''}`}
                >
                  ResNet (Skip) 🌉
                </button>
                <button
                  onClick={() => setArchitecture('plain')}
                  className={`${styles.toggleButton} ${architecture === 'plain' ? styles.toggleButtonActive : ''}`}
                >
                  No Skips (VGG) 🏔️
                </button>
              </div>
            </div>

            {/* Fine-Tuning Slider */}
            <div className={styles.sliderGroup}>
              <label>
                <span>Training Duration (Paper 2)</span>
                <span className="font-mono text-[var(--accent)]">{fineTuningStep}%</span>
              </label>
              <input
                type="range"
                min="0" max="100"
                value={fineTuningStep}
                onChange={(e) => setFineTuningStep(Number(e.target.value))}
              />
            </div>

            {/* SAM Toggle */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold">Optimizer</span>
              <button
                onClick={() => setUseSAM(!useSAM)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${useSAM
                    ? "bg-[var(--accent)] text-black shadow-[0_0_15px_hsla(191,85%,53%,0.4)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-dim)] border border-[var(--border-subtle)]"
                  }`}
              >
                {useSAM ? "SAM ON" : "SGD OFF"}
              </button>
            </div>
          </div>

          {/* Spectrum Mini-Viz */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-subtle)]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono uppercase text-[var(--text-dim)]">Hessian Spectrum</span>
              <span className={`text-xs font-bold ${sharpness > 1.0 ? 'text-red-400' : 'text-green-400'}`}>
                {sharpness > 1.0 ? "Unstable / Sharp" : "Stable / Flat"}
              </span>
            </div>
            <canvas ref={spectrumRef} width={250} height={60} className="w-full h-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LossLandscapeViz;
