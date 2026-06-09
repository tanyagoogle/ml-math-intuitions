'use client';

import { useRef, useEffect } from 'react';

type VizType =
  | 'eigenvalues'
  | 'matrix-calculus'
  | 'loss-landscape'
  | 'generative-models'
  | 'vae'
  | 'diffusion'
  | 'manifold'
  | 'ode-sde';

export default function CardViz({ type }: { type: VizType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      timeRef.current += 0.015;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      switch (type) {
        case 'eigenvalues':
          drawEigenvalues(ctx, w, h, t);
          break;
        case 'matrix-calculus':
          drawGradientField(ctx, w, h, t);
          break;
        case 'loss-landscape':
          drawContours(ctx, w, h, t);
          break;
        case 'generative-models':
          drawDistribution(ctx, w, h, t);
          break;
        case 'vae':
          drawEncodeDecode(ctx, w, h, t);
          break;
        case 'diffusion':
          drawDiffusion(ctx, w, h, t);
          break;
        case 'manifold':
          drawManifold(ctx, w, h, t);
          break;
        case 'ode-sde':
          drawFlowTrajectories(ctx, w, h, t);
          break;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '120px',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    />
  );
}

function drawEigenvalues(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cx = w / 2;
  const cy = h / 2;

  const scale1 = 1 + 0.5 * Math.sin(t * 1.2);
  const scale2 = 1 + 0.3 * Math.sin(t * 1.2 + Math.PI);

  const angle1 = Math.PI / 6;
  const angle2 = angle1 + Math.PI / 2;

  const len = Math.min(w, h) * 0.35;

  // Eigenvector 1
  const x1 = Math.cos(angle1) * len * scale1;
  const y1 = Math.sin(angle1) * len * scale1;
  ctx.beginPath();
  ctx.moveTo(cx - x1, cy + y1);
  ctx.lineTo(cx + x1, cy - y1);
  ctx.strokeStyle = `rgba(0, 243, 255, ${0.4 + 0.2 * Math.sin(t)})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.arc(cx + x1, cy - y1, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 243, 255, 0.8)';
  ctx.fill();

  // Eigenvector 2
  const x2 = Math.cos(angle2) * len * scale2;
  const y2 = Math.sin(angle2) * len * scale2;
  ctx.beginPath();
  ctx.moveTo(cx - x2, cy + y2);
  ctx.lineTo(cx + x2, cy - y2);
  ctx.strokeStyle = `rgba(167, 139, 250, ${0.4 + 0.2 * Math.sin(t + 1)})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + x2, cy - y2, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
  ctx.fill();

  // Unit circle (faint)
  ctx.beginPath();
  ctx.ellipse(cx, cy, len * scale1, len * scale2, angle1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawGradientField(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cols = 8;
  const rows = 4;
  const spacingX = w / (cols + 1);
  const spacingY = h / (rows + 1);
  const arrowLen = Math.min(spacingX, spacingY) * 0.35;

  for (let i = 1; i <= cols; i++) {
    for (let j = 1; j <= rows; j++) {
      const x = i * spacingX;
      const y = j * spacingY;

      const nx = (x / w - 0.5) * 2;
      const ny = (y / h - 0.5) * 2;

      const angle = Math.atan2(ny, nx) + Math.PI + 0.3 * Math.sin(t + nx * 2 + ny);
      const mag = Math.sqrt(nx * nx + ny * ny);

      const dx = Math.cos(angle) * arrowLen * Math.min(mag, 1);
      const dy = Math.sin(angle) * arrowLen * Math.min(mag, 1);

      const alpha = 0.15 + mag * 0.25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 243, 255, ${alpha + 0.1})`;
      ctx.fill();
    }
  }
}

function drawContours(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const maxR = Math.min(w, h) * 0.4;

  for (let i = 5; i >= 1; i--) {
    const r = maxR * (i / 5);
    const pulse = 1 + 0.03 * Math.sin(t * 2 + i * 0.8);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * pulse * 1.3, r * pulse * 0.8, 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 243, 255, ${0.08 + (5 - i) * 0.04})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Descending dot
  const dotProgress = (t * 0.3) % 1;
  const dotR = maxR * (1 - dotProgress) * 1.0;
  const dotAngle = t * 1.5;
  const dotX = cx + Math.cos(dotAngle) * dotR * 1.3;
  const dotY = cy + Math.sin(dotAngle) * dotR * 0.8;

  ctx.beginPath();
  ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
  ctx.fill();
}

function drawDistribution(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const baseline = h * 0.85;
  const amplitude = h * 0.6;

  const curves = [
    { mu: -0.3 + 0.2 * Math.sin(t * 0.7), sigma: 0.15, color: '0, 243, 255' },
    { mu: 0.3 + 0.15 * Math.sin(t * 0.5 + 1), sigma: 0.2, color: '167, 139, 250' },
  ];

  for (const curve of curves) {
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
      const x = (px / w - 0.5) * 2;
      const gauss = Math.exp(-((x - curve.mu) ** 2) / (2 * curve.sigma ** 2));
      const y = baseline - gauss * amplitude;
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.strokeStyle = `rgba(${curve.color}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(w, baseline);
    ctx.lineTo(0, baseline);
    ctx.closePath();
    ctx.fillStyle = `rgba(${curve.color}, 0.05)`;
    ctx.fill();
  }
}

function drawEncodeDecode(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const numPoints = 12;
  const cycle = (t * 0.4) % (Math.PI * 2);
  const phase = (Math.sin(cycle) + 1) / 2; // 0 = spread, 1 = compressed

  const cx = w / 2;
  const cy = h / 2;
  const spreadR = Math.min(w, h) * 0.38;
  const clusterR = Math.min(w, h) * 0.08;

  for (let i = 0; i < numPoints; i++) {
    const baseAngle = (i / numPoints) * Math.PI * 2;
    const spreadX = cx + Math.cos(baseAngle) * spreadR * (0.5 + 0.5 * Math.sin(baseAngle * 2 + 0.5));
    const spreadY = cy + Math.sin(baseAngle) * spreadR * 0.6;
    const clusterX = cx + Math.cos(baseAngle * 3 + t) * clusterR;
    const clusterY = cy + Math.sin(baseAngle * 3 + t) * clusterR;

    const x = spreadX + (clusterX - spreadX) * phase;
    const y = spreadY + (clusterY - spreadY) * phase;

    const hue = 191 + (i / numPoints) * 70;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.1)`;
    ctx.fill();
  }

  // Labels
  ctx.font = '10px var(--font-mono, monospace)';
  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + 0.15 * (1 - phase)})`;
  ctx.fillText('data', 12, h - 8);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + 0.15 * phase})`;
  ctx.fillText('latent', w - 42, h - 8);
}

function drawDiffusion(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const numDots = 30;
  const cycle = (t * 0.3) % (Math.PI * 2);
  const order = (Math.sin(cycle) + 1) / 2; // 0 = noise, 1 = ordered

  const cols = 6;
  const rows = 5;
  const spacingX = w / (cols + 1);
  const spacingY = h / (rows + 1);

  for (let i = 0; i < numDots; i++) {
    const gridCol = (i % cols) + 1;
    const gridRow = Math.floor(i / cols) + 1;

    const orderedX = gridCol * spacingX;
    const orderedY = gridRow * spacingY;

    // Seeded pseudo-random offsets
    const noiseX = Math.sin(i * 7.31 + 2.1) * w * 0.4;
    const noiseY = Math.cos(i * 4.67 + 5.3) * h * 0.35;

    const x = orderedX + noiseX * (1 - order);
    const y = orderedY + noiseY * (1 - order);

    const alpha = 0.3 + order * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 243, 255, ${alpha})`;
    ctx.fill();
  }
}

function drawManifold(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const numPoints = 40;
  const cx = w / 2;
  const cy = h / 2;
  const scaleX = w * 0.4;
  const scaleY = h * 0.3;

  ctx.beginPath();
  for (let i = 0; i <= numPoints; i++) {
    const param = (i / numPoints) * Math.PI * 2;
    const x = cx + Math.cos(param) * scaleX * (0.5 + 0.5 * Math.cos(param * 2 + t * 0.5));
    const y = cy + Math.sin(param) * scaleY + Math.sin(param * 3 + t * 0.8) * 15;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dots along manifold
  for (let i = 0; i < 12; i++) {
    const param = (i / 12) * Math.PI * 2 + t * 0.2;
    const x = cx + Math.cos(param) * scaleX * (0.5 + 0.5 * Math.cos(param * 2 + t * 0.5));
    const y = cy + Math.sin(param) * scaleY + Math.sin(param * 3 + t * 0.8) * 15;

    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
    ctx.fill();
  }
}

function drawFlowTrajectories(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const numTrails = 6;
  const trailLen = 25;

  for (let trail = 0; trail < numTrails; trail++) {
    const startX = w * (0.15 + (trail / numTrails) * 0.7);
    const startY = h * 0.1 + Math.sin(trail * 2.3) * h * 0.15;

    ctx.beginPath();

    let px = startX;
    let py = startY;

    for (let step = 0; step < trailLen; step++) {
      const progress = step / trailLen;
      const timeOffset = t * 0.8 + trail * 1.5;

      // Flowing vector field
      const vx = 0.3 + 0.2 * Math.sin(py / h * 3 + timeOffset);
      const vy = 0.5 + 0.3 * Math.cos(px / w * 2 + timeOffset);

      px += vx * (w / trailLen) * 0.3;
      py += vy * (h / trailLen) * 0.5;

      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    const hue = 191 + trail * 12;
    ctx.strokeStyle = `hsla(${hue}, 60%, 55%, 0.3)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Head dot
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 65%, 0.6)`;
    ctx.fill();
  }
}
