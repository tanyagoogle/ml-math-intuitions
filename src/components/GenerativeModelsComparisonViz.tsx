'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type ModelType = 'vae' | 'gan' | 'diffusion';

interface ModelInfo {
  name: string;
  color: string;
  models: string;
  learns: string;
  samples: string;
  objective: string;
}

const MODEL_INFO: Record<ModelType, ModelInfo> = {
  vae: {
    name: 'VAE',
    color: '#a78bfa',
    models: 'p(x|z) decoder + q(z|x) encoder',
    learns: 'Approximate posterior q(z|x) ≈ p(z|x)',
    samples: 'z ~ p(z), then x ~ p(x|z)',
    objective: 'Maximize ELBO = E[log p(x|z)] - KL(q||p)',
  },
  gan: {
    name: 'GAN',
    color: '#f472b6',
    models: 'G(z) generator (implicit p(x|z))',
    learns: 'Implicit distribution via adversarial game',
    samples: 'z ~ p(z), then x = G(z)',
    objective: 'min_G max_D V(D,G) (minimax game)',
  },
  diffusion: {
    name: 'Diffusion',
    color: '#34d399',
    models: 'p(x_{t-1}|x_t) denoising steps',
    learns: 'Score function ∇log p(x_t)',
    samples: 'x_T ~ N(0,I), iterate x_{t-1} ~ p(x_{t-1}|x_t)',
    objective: 'E[||ε - ε_θ(x_t, t)||²] (predict noise)',
  },
};

export default function GenerativeModelsComparisonViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [selectedModel, setSelectedModel] = useState<ModelType>('vae');
  const [time, setTime] = useState(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = 'hsl(240, 10%, 4%)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    if (selectedModel === 'vae') {
      drawVAE(ctx, centerX, centerY, time);
    } else if (selectedModel === 'gan') {
      drawGAN(ctx, centerX, centerY, time);
    } else {
      drawDiffusion(ctx, centerX, centerY, time);
    }

    setTime(t => t + 0.02);
    animationRef.current = requestAnimationFrame(draw);
  }, [selectedModel, time]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(Object.keys(MODEL_INFO) as ModelType[]).map(model => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: selectedModel === model ? `2px solid ${MODEL_INFO[model].color}` : '1px solid rgba(255,255,255,0.15)',
              background: selectedModel === model ? `${MODEL_INFO[model].color}20` : 'transparent',
              color: selectedModel === model ? MODEL_INFO[model].color : '#94a3b8',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {MODEL_INFO[model].name}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '350px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'hsl(240, 10%, 4%)',
        }}
      />

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: `1px solid ${MODEL_INFO[selectedModel].color}40`,
      }}>
        <h4 style={{ color: MODEL_INFO[selectedModel].color, marginBottom: '1rem', fontSize: '1.1rem' }}>
          {MODEL_INFO[selectedModel].name} Architecture
        </h4>
        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          <div><strong style={{ color: '#f8fafc' }}>Models:</strong> {MODEL_INFO[selectedModel].models}</div>
          <div><strong style={{ color: '#f8fafc' }}>Learns:</strong> {MODEL_INFO[selectedModel].learns}</div>
          <div><strong style={{ color: '#f8fafc' }}>Sampling:</strong> {MODEL_INFO[selectedModel].samples}</div>
          <div><strong style={{ color: '#f8fafc' }}>Objective:</strong> {MODEL_INFO[selectedModel].objective}</div>
        </div>
      </div>
    </div>
  );
}

function drawVAE(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  ctx.font = '14px Inter, system-ui';
  ctx.textAlign = 'center';

  ctx.fillStyle = '#a78bfa30';
  ctx.fillRect(cx - 200, cy - 80, 100, 100);
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 200, cy - 80, 100, 100);
  ctx.fillStyle = '#a78bfa';
  ctx.fillText('x (data)', cx - 150, cy + 50);

  drawArrow(ctx, cx - 90, cy - 30, cx - 40, cy - 30, '#00f3ff');
  ctx.fillStyle = '#00f3ff';
  ctx.fillText('q(z|x)', cx - 65, cy - 45);
  ctx.fillText('Encoder', cx - 65, cy - 5);

  ctx.beginPath();
  ctx.arc(cx + 20, cy - 30, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#00f3ff20';
  ctx.fill();
  ctx.strokeStyle = '#00f3ff';
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + t;
    const r = 20 + Math.sin(t * 2 + i) * 8;
    ctx.beginPath();
    ctx.arc(cx + 20 + Math.cos(angle) * r, cy - 30 + Math.sin(angle) * r, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00f3ff';
    ctx.fill();
  }
  ctx.fillStyle = '#00f3ff';
  ctx.fillText('z ~ q(z|x)', cx + 20, cy + 50);

  drawArrow(ctx, cx + 70, cy - 30, cx + 120, cy - 30, '#ff6b6b');
  ctx.fillStyle = '#ff6b6b';
  ctx.fillText('p(x|z)', cx + 95, cy - 45);
  ctx.fillText('Decoder', cx + 95, cy - 5);

  ctx.fillStyle = '#ff6b6b30';
  ctx.fillRect(cx + 130, cy - 80, 100, 100);
  ctx.strokeStyle = '#ff6b6b';
  ctx.strokeRect(cx + 130, cy - 80, 100, 100);
  ctx.fillStyle = '#ff6b6b';
  ctx.fillText('x̂ (recon)', cx + 180, cy + 50);

  ctx.fillStyle = '#4ecdc4';
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText('KL(q(z|x) || p(z)) → regularization', cx, cy + 90);
}

function drawGAN(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  ctx.font = '14px Inter, system-ui';
  ctx.textAlign = 'center';

  ctx.beginPath();
  ctx.arc(cx - 180, cy - 30, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#f472b620';
  ctx.fill();
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f472b6';
  ctx.fillText('z ~ p(z)', cx - 180, cy + 50);

  drawArrow(ctx, cx - 130, cy - 30, cx - 70, cy - 30, '#f472b6');

  ctx.fillStyle = '#f472b630';
  ctx.fillRect(cx - 70, cy - 70, 80, 80);
  ctx.strokeStyle = '#f472b6';
  ctx.strokeRect(cx - 70, cy - 70, 80, 80);
  ctx.fillStyle = '#f472b6';
  ctx.fillText('G(z)', cx - 30, cy + 50);
  ctx.font = '12px Inter';
  ctx.fillText('Generator', cx - 30, cy - 30);

  drawArrow(ctx, cx + 20, cy - 30, cx + 80, cy - 30, '#ffe66d');
  ctx.fillStyle = '#ffe66d';
  ctx.font = '14px Inter';
  ctx.fillText('fake x', cx + 50, cy - 45);

  ctx.fillStyle = '#ffe66d30';
  ctx.fillRect(cx + 80, cy - 70, 80, 80);
  ctx.strokeStyle = '#ffe66d';
  ctx.strokeRect(cx + 80, cy - 70, 80, 80);
  ctx.fillStyle = '#ffe66d';
  ctx.fillText('D(x)', cx + 120, cy + 50);
  ctx.font = '12px Inter';
  ctx.fillText('Discriminator', cx + 120, cy - 30);

  const pulse = Math.sin(t * 3) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(255, 230, 109, ${pulse})`;
  ctx.beginPath();
  ctx.arc(cx + 120, cy - 30, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 120, cy + 70);
  ctx.quadraticCurveTo(cx + 120, cy + 120, cx - 30, cy + 120);
  ctx.quadraticCurveTo(cx - 100, cy + 120, cx - 100, cy + 20);
  ctx.strokeStyle = '#ff6b6b60';
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ff6b6b';
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText('adversarial loss → G', cx + 10, cy + 110);
}

function drawDiffusion(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  ctx.font = '14px Inter, system-ui';
  ctx.textAlign = 'center';

  const steps = 5;
  const stepWidth = 80;
  const startX = cx - (steps * stepWidth) / 2;

  for (let i = 0; i < steps; i++) {
    const x = startX + i * stepWidth + 40;
    const noise = 1 - i / (steps - 1);

    ctx.beginPath();
    ctx.arc(x, cy - 20, 30, 0, Math.PI * 2);
    const alpha = 0.2 + (1 - noise) * 0.3;
    ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();

    const numDots = Math.floor(8 * noise) + 3;
    for (let j = 0; j < numDots; j++) {
      const angle = (j / numDots) * Math.PI * 2 + t + i;
      const r = 15 * noise + 5;
      const dotX = x + Math.cos(angle) * r * (0.5 + Math.random() * 0.5 * noise);
      const dotY = cy - 20 + Math.sin(angle) * r * (0.5 + Math.random() * 0.5 * noise);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fillStyle = noise > 0.5 ? '#94a3b8' : '#34d399';
      ctx.fill();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText(`t=${steps - 1 - i}`, x, cy + 25);

    if (i < steps - 1) {
      drawArrow(ctx, x + 35, cy - 20, x + stepWidth - 5, cy - 20, '#34d39980');
    }
  }

  ctx.fillStyle = '#34d399';
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText('x_T ~ N(0,I)  →  iterative denoising  →  x_0 (clean data)', cx, cy + 70);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px Inter';
  ctx.fillText('p(x_{t-1}|x_t): learned reverse process', cx, cy + 95);
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  const headLen = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
