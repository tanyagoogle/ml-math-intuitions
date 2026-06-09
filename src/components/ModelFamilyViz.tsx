'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '../app/probabilistic-generative-models/visualization.module.css';

type ModelType = 'gan' | 'vae' | 'diffusion';

interface Point {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

const MODEL_COLORS = {
  gan: '#ffe66d',
  vae: '#00f3ff',
  diffusion: '#a78bfa',
};

const MODEL_NAMES = {
  gan: 'GAN',
  vae: 'VAE',
  diffusion: 'Diffusion',
};

export default function ModelFamilyViz() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('gan');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const drawGAN = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    const centerY = height / 2;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const noiseX = width * 0.15;
    const genX = width * 0.4;
    const discX = width * 0.65;
    const outputX = width * 0.85;

    ctx.fillStyle = 'rgba(167, 139, 250, 0.1)';
    ctx.beginPath();
    ctx.arc(noiseX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(noiseX, centerY, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#a78bfa';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('z ~ N(0,I)', noiseX, centerY + 70);
    ctx.fillText('Latent', noiseX, centerY + 88);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + progress * 0.02;
      const r = 20 + Math.random() * 20;
      const px = noiseX + Math.cos(angle) * r;
      const py = centerY + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 230, 109, 0.15)';
    ctx.fillRect(genX - 40, centerY - 50, 80, 100);
    ctx.strokeStyle = '#ffe66d';
    ctx.strokeRect(genX - 40, centerY - 50, 80, 100);
    ctx.fillStyle = '#ffe66d';
    ctx.fillText('Generator', genX, centerY + 5);
    ctx.fillText('G(z)', genX, centerY + 25);

    ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
    ctx.fillRect(discX - 40, centerY - 50, 80, 100);
    ctx.strokeStyle = '#ff6b6b';
    ctx.strokeRect(discX - 40, centerY - 50, 80, 100);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('Discriminator', discX, centerY + 5);
    ctx.fillText('D(x)', discX, centerY + 25);

    const arrowProgress = Math.min(1, progress / 50);

    ctx.strokeStyle = '#ffe66d';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(noiseX + 55, centerY);
    ctx.lineTo(noiseX + 55 + (genX - 45 - noiseX - 55) * arrowProgress, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (arrowProgress > 0.5) {
      ctx.strokeStyle = '#ffe66d';
      ctx.beginPath();
      ctx.moveTo(genX + 45, centerY);
      ctx.lineTo(genX + 45 + (discX - 45 - genX - 45) * ((arrowProgress - 0.5) * 2), centerY);
      ctx.stroke();
    }

    const realY = centerY - 80;
    ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.beginPath();
    ctx.arc(discX - 80, realY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('Real x', discX - 80, realY + 45);

    ctx.strokeStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.moveTo(discX - 55, realY);
    ctx.lineTo(discX - 45, centerY - 30);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.arc(outputX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(outputX, centerY, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00ff88';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('Real?', outputX, centerY - 10);
    ctx.fillText('Fake?', outputX, centerY + 15);

    ctx.strokeStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(discX + 45, centerY);
    ctx.lineTo(outputX - 45, centerY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('No explicit p(x) or p(z|x)', width / 2, height - 30);
  }, []);

  const drawVAE = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    const centerY = height / 2;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const inputX = width * 0.12;
    const encX = width * 0.3;
    const latentX = width * 0.5;
    const decX = width * 0.7;
    const outputX = width * 0.88;

    ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.beginPath();
    ctx.arc(inputX, centerY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(inputX, centerY, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', inputX, centerY + 5);
    ctx.fillText('Input', inputX, centerY + 55);

    ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.fillRect(encX - 35, centerY - 45, 70, 90);
    ctx.strokeStyle = '#00f3ff';
    ctx.strokeRect(encX - 35, centerY - 45, 70, 90);
    ctx.fillStyle = '#00f3ff';
    ctx.fillText('Encoder', encX, centerY);
    ctx.fillText('q(z|x)', encX, centerY + 20);

    ctx.fillStyle = 'rgba(167, 139, 250, 0.2)';
    ctx.beginPath();
    ctx.ellipse(latentX, centerY, 45, 35 + Math.sin(progress * 0.05) * 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.beginPath();
    ctx.ellipse(latentX, centerY, 45, 35 + Math.sin(progress * 0.05) * 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#a78bfa';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('μ, σ', latentX, centerY - 5);
    ctx.fillText('z = μ + σε', latentX, centerY + 12);
    ctx.fillText('Latent', latentX, centerY + 55);

    ctx.fillStyle = 'rgba(255, 230, 109, 0.15)';
    ctx.fillRect(decX - 35, centerY - 45, 70, 90);
    ctx.strokeStyle = '#ffe66d';
    ctx.strokeRect(decX - 35, centerY - 45, 70, 90);
    ctx.fillStyle = '#ffe66d';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Decoder', decX, centerY);
    ctx.fillText('p(x|z)', decX, centerY + 20);

    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.arc(outputX, centerY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(outputX, centerY, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#00ff88';
    ctx.fillText('x̂', outputX, centerY + 5);
    ctx.fillText('Reconstruction', outputX, centerY + 55);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(inputX + 40, centerY);
    ctx.lineTo(encX - 40, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(encX + 40, centerY);
    ctx.lineTo(latentX - 50, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(latentX + 50, centerY);
    ctx.lineTo(decX - 40, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(decX + 40, centerY);
    ctx.lineTo(outputX - 40, centerY);
    ctx.stroke();

    ctx.setLineDash([]);

    const klY = centerY + 100;
    ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
    ctx.fillRect(latentX - 60, klY - 20, 120, 40);
    ctx.strokeStyle = '#ff6b6b';
    ctx.strokeRect(latentX - 60, klY - 20, 120, 40);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('KL(q(z|x) || p(z))', latentX, klY + 5);

    ctx.strokeStyle = '#ff6b6b';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(latentX, centerY + 40);
    ctx.lineTo(latentX, klY - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('ELBO = Reconstruction - KL Divergence', width / 2, height - 30);
  }, []);

  const drawDiffusion = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    const centerY = height / 2;
    const numSteps = 5;
    const stepWidth = (width - 100) / numSteps;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(167, 139, 250, 0.1)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Forward Process (Fixed): Add Noise', width / 2, 30);

    for (let i = 0; i < numSteps; i++) {
      const x = 50 + i * stepWidth + stepWidth / 2;
      const noiseLevel = i / (numSteps - 1);

      const clarity = 1 - noiseLevel;
      ctx.fillStyle = `rgba(78, 205, 196, ${0.3 * clarity})`;
      ctx.beginPath();
      ctx.arc(x, centerY - 50, 30, 0, Math.PI * 2);
      ctx.fill();

      if (noiseLevel > 0) {
        ctx.fillStyle = `rgba(167, 139, 250, ${0.4 * noiseLevel})`;
        for (let j = 0; j < 10 * noiseLevel; j++) {
          const px = x + (Math.random() - 0.5) * 50;
          const py = centerY - 50 + (Math.random() - 0.5) * 50;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = i === 0 ? '#4ecdc4' : (i === numSteps - 1 ? '#a78bfa' : 'rgba(255,255,255,0.3)');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, centerY - 50, 30, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`x${i === 0 ? '₀' : i === numSteps - 1 ? 'ₜ' : ''}`, x, centerY - 45);

      if (i < numSteps - 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x + 35, centerY - 50);
        ctx.lineTo(x + stepWidth - 35, centerY - 50);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + stepWidth - 40, centerY - 55);
        ctx.lineTo(x + stepWidth - 35, centerY - 50);
        ctx.lineTo(x + stepWidth - 40, centerY - 45);
        ctx.stroke();
      }
    }

    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.fillText('Reverse Process (Learned): Denoise', width / 2, centerY + 20);

    for (let i = numSteps - 1; i >= 0; i--) {
      const x = 50 + i * stepWidth + stepWidth / 2;
      const noiseLevel = i / (numSteps - 1);
      const reverseProgress = Math.max(0, Math.min(1, (progress - (numSteps - 1 - i) * 20) / 30));

      const denoised = 1 - noiseLevel * (1 - reverseProgress);

      ctx.fillStyle = `rgba(0, 255, 136, ${0.3 * denoised})`;
      ctx.beginPath();
      ctx.arc(x, centerY + 80, 30, 0, Math.PI * 2);
      ctx.fill();

      if (noiseLevel > 0 && reverseProgress < 1) {
        ctx.fillStyle = `rgba(167, 139, 250, ${0.4 * noiseLevel * (1 - reverseProgress)})`;
        for (let j = 0; j < 10 * noiseLevel * (1 - reverseProgress); j++) {
          const px = x + (Math.random() - 0.5) * 50;
          const py = centerY + 80 + (Math.random() - 0.5) * 50;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = i === 0 ? '#00ff88' : (i === numSteps - 1 ? '#a78bfa' : 'rgba(255,255,255,0.3)');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, centerY + 80, 30, 0, Math.PI * 2);
      ctx.stroke();

      if (i > 0) {
        ctx.strokeStyle = '#00ff88';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x - 35, centerY + 80);
        ctx.lineTo(x - stepWidth + 35, centerY + 80);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const denoiserX = width / 2;
    const denoiserY = centerY + 150;
    ctx.fillStyle = 'rgba(255, 230, 109, 0.15)';
    ctx.fillRect(denoiserX - 50, denoiserY - 20, 100, 40);
    ctx.strokeStyle = '#ffe66d';
    ctx.strokeRect(denoiserX - 50, denoiserY - 20, 100, 40);
    ctx.fillStyle = '#ffe66d';
    ctx.fillText('εθ(xₜ, t)', denoiserX, denoiserY + 5);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Predict noise at each step → iterative refinement', width / 2, height - 30);
  }, []);

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

    switch (selectedModel) {
      case 'gan':
        drawGAN(ctx, width, height, progressRef.current);
        break;
      case 'vae':
        drawVAE(ctx, width, height, progressRef.current);
        break;
      case 'diffusion':
        drawDiffusion(ctx, width, height, progressRef.current);
        break;
    }
  }, [selectedModel, drawGAN, drawVAE, drawDiffusion]);

  const animate = useCallback(() => {
    progressRef.current += 1;
    draw();
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [draw, isAnimating]);

  useEffect(() => {
    draw();

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, animate, isAnimating, selectedModel]);

  useEffect(() => {
    progressRef.current = 0;
    draw();
  }, [selectedModel, draw]);

  return (
    <div>
      <div className={styles.buttonGroup}>
        {(['gan', 'vae', 'diffusion'] as ModelType[]).map((model) => (
          <button
            key={model}
            className={`${styles.buttonSecondary} ${selectedModel === model ? styles.active : ''}`}
            onClick={() => setSelectedModel(model)}
            style={{
              borderColor: selectedModel === model ? MODEL_COLORS[model] : undefined,
              color: selectedModel === model ? MODEL_COLORS[model] : undefined,
            }}
          >
            {MODEL_NAMES[model]}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsAnimating(!isAnimating)}
      />

      <div className={styles.sliderContainer}>
        <button
          className={styles.button}
          onClick={() => setIsAnimating(!isAnimating)}
        >
          {isAnimating ? 'Pause' : 'Animate'}
        </button>
        <button
          className={styles.buttonSecondary}
          onClick={() => {
            progressRef.current = 0;
            draw();
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        {selectedModel === 'gan' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            <strong style={{ color: '#ffe66d' }}>GAN Approach:</strong> The Generator maps noise z to data x. The Discriminator learns to distinguish real from fake. No explicit density p(x) is computed—quality is measured by fooling the Discriminator.
          </div>
        )}
        {selectedModel === 'vae' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            <strong style={{ color: '#00f3ff' }}>VAE Approach:</strong> The Encoder maps data x to a distribution q(z|x). The Decoder maps latent z back to data. The KL term regularizes the latent space to match the prior p(z). Both generation and inference are possible.
          </div>
        )}
        {selectedModel === 'diffusion' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            <strong style={{ color: '#a78bfa' }}>Diffusion Approach:</strong> The forward process gradually adds noise (fixed). The reverse process learns to denoise step-by-step. Generation requires T denoising steps, but produces high-quality, diverse samples.
          </div>
        )}
      </div>
    </div>
  );
}
