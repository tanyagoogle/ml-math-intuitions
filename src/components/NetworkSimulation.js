'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../app/eigenvalues/visualization.module.css'; // Reuse container styles

export default function NetworkSimulation() {
  const [layers, setLayers] = useState(10);
  const [spectrum, setSpectrum] = useState(1.1); // Spectral radius
  const [useResNet, setUseResNet] = useState(false); // Skip connection toggle
  const [activation, setActivation] = useState('linear'); // 'linear', 'relu', 'tanh'
  const [useNorm, setUseNorm] = useState(false); // Normalization toggle
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Simulation params
    const layerWidth = width / (layers + 1);
    const signalStart = 10; // Initial signal magnitude

    let signals = [signalStart];
    for (let i = 0; i < layers; i++) {
      // 1. F(x) Calculation (The Transformation)
      // Add 'noise' (sign flip) to odd layers to simulate real weights mixing +/-
      let fx = signals[i] * spectrum;
      if (i % 2 !== 0) fx = -fx;

      // 2. Normalization (Thermostat) - Applies to F(x) usually (Batch Norm)
      if (useNorm) {
        // Reset magnitude to signalStart (Standardize)
        // Bidirectional: Boost small, Clamp large
        const mag = Math.abs(fx);
        if (mag > 1e-5) { // Avoid div by zero
          fx = (fx / mag) * signalStart;
        }
      }

      // 3. Activation (Safety Valve) - Applies to F(x)
      if (activation === 'relu') {
        fx = Math.max(0, fx);
      } else if (activation === 'tanh') {
        fx = Math.tanh(fx / 20) * 20;
      }

      // 4. Skip Connection (ResNet) - The Expressway
      let next;
      if (useResNet) {
        // Identity (x) + Transformation (F(x))
        // Even if F(x) is 0 (killed by ReLU) or small, x preserves signal!
        next = signals[i] + fx;
      } else {
        next = fx;
      }

      // Clamp for visualization safety
      if (next > 10000) next = 10000;
      if (next < -10000) next = -10000;

      signals.push(next);
    }

    // Auto-scale Y axis
    const maxAbs = Math.max(...signals.map(Math.abs), 20);
    const yScale = (height / 2 - 40) / maxAbs;

    // Draw
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Status Color
      let statusColor = '#ffffff';
      const last = Math.abs(signals[signals.length - 1]);
      if (last > 1000) statusColor = '#f43f5e'; // Rose
      else if (last < 0.1) statusColor = '#22d3ee'; // Cyan
      else statusColor = '#10b981'; // Emerald

      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2 - signals[0] * yScale);

      signals.forEach((sig, i) => {
        const x = (i) * layerWidth + layerWidth / 2;
        const y = height / 2 - sig * yScale;

        // Draw nodes
        ctx.fillStyle = statusColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Connect lines
        if (i > 0) {
          const prevX = (i - 1) * layerWidth + layerWidth / 2;
          const prevY = height / 2 - signals[i - 1] * yScale;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      // Draw baseline
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Activation/Norm Bounds
      if (activation === 'tanh' || useNorm) {
        const boundY = height / 2 - signalStart * yScale;
        ctx.strokeStyle = 'rgba(255,255,0,0.3)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, boundY);
        ctx.lineTo(width, boundY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    requestAnimationFrame(draw);

  }, [layers, spectrum, useResNet, activation, useNorm]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h3>Deep Network Signal Propagation</h3>
        <p>Observe how signals grow or vanish through layers. Toggle architecture fixes to stabilize the flow.</p>

        <div className={styles.sliderContainer}>
          <label className={styles.sliderLabel}>
            Depth <strong>{layers}</strong>
            <input
              type="range" min="5" max="50" className={styles.slider} value={layers}
              onChange={e => setLayers(Number(e.target.value))}
            />
          </label>
          <label className={styles.sliderLabel}>
            Radius λ <strong>{spectrum.toFixed(2)}</strong>
            <input
              type="range" min="0.5" max="1.5" step="0.01" className={styles.slider} value={spectrum}
              onChange={e => setSpectrum(Number(e.target.value))}
            />
          </label>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Activation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Safety Valve
            </span>
            <select
              value={activation}
              onChange={(e) => setActivation(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', background: 'hsla(0, 0%, 100%, 0.05)', color: '#fff', border: '1px solid var(--border-subtle)', cursor: 'pointer', outline: 'none' }}
            >
              <option value="linear">Linear (None)</option>
              <option value="relu">ReLU (Non-linear)</option>
              <option value="tanh">Tanh (Saturating)</option>
            </select>
          </div>

          {/* Normalization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Thermostat
            </span>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: useNorm ? 'hsla(187, 100%, 50%, 0.1)' : 'hsla(0, 0%, 100%, 0.03)', borderRadius: '8px', border: useNorm ? '1px solid hsla(187, 100%, 50%, 0.3)' : '1px solid var(--border-subtle)', transition: 'all 0.2s' }}>
              <input
                type="checkbox"
                checked={useNorm}
                onChange={e => setUseNorm(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: '500', color: useNorm ? 'var(--accent)' : 'var(--text-primary)' }}>
                LayerNorm
              </span>
            </label>
          </div>

          {/* ResNet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Expressway
            </span>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: useResNet ? 'hsla(145, 100%, 50%, 0.1)' : 'hsla(0, 0%, 100%, 0.03)', borderRadius: '8px', border: useResNet ? '1px solid hsla(145, 100%, 50%, 0.3)' : '1px solid var(--border-subtle)', transition: 'all 0.2s' }}>
              <input
                type="checkbox"
                checked={useResNet}
                onChange={e => setUseResNet(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00ff88' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: '500', color: useResNet ? '#00ff88' : 'var(--text-primary)' }}>
                ResNet (Skip)
              </span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', height: '3.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Status Messages */}
          <div className={styles.eigenAlert} style={{ marginTop: 0, opacity: (activation === 'tanh' || useNorm || (useResNet && spectrum < 0.9) || (spectrum > 1.05 && !useNorm) || (spectrum < 0.95 && !useNorm)) ? 1 : 0 }}>
            {activation === 'tanh' && <span>🛑 <strong>Tanh</strong> squashes signals to prevent explosion but can saturation.</span>}
            {activation !== 'tanh' && useNorm && <span>🌡️ <strong>Norm</strong> resets signal energy at every layer. Total stability!</span>}
            {!useNorm && activation !== 'tanh' && useResNet && spectrum < 0.9 && <span>🛣️ <strong>ResNet</strong> &quot;superhighway&quot; lets signal bypass vanishing weights.</span>}

            {/* Fallback standard messages */}
            {!useNorm && activation === 'linear' && !useResNet && spectrum > 1.05 && <span style={{ color: '#ff0055' }}>⚠️ Explosion! Signal grows exponentially (λ<sup>L</sup>)</span>}
            {!useNorm && activation === 'linear' && !useResNet && spectrum < 0.95 && <span style={{ color: 'var(--accent)' }}>⚠️ Vanishing! Signal dies to zero (λ<sup>L</sup>)</span>}
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className={styles.svg} // Reusing SVG class for canvas dimensions
        style={{ cursor: 'default' }}
      />
    </div>
  );
}
