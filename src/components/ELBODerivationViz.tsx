'use client';

import { useRef, useEffect, useState } from 'react';

export default function ELBODerivationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Goal: Maximize log p(x₀)',
      content: 'We want to maximize the probability of real data. But p(x₀) requires integrating over all latent trajectories.',
      equation: 'log p(x₀) = log ∫ p(x₀:T) dx₁:T'
    },
    {
      title: 'Introduce Helper q',
      content: 'Multiply by q/q = 1 and use Jensen\'s inequality to get a lower bound.',
      equation: 'log p(x₀) ≥ E_q[log p(x₀:T)/q(x₁:T|x₀)]'
    },
    {
      title: 'Expand Using Chain Rule',
      content: 'Both p and q are Markov chains. We can expand them as products of transitions.',
      equation: 'L = E_q[log p(xT) + Σ log p(xₜ₋₁|xₜ) - Σ log q(xₜ|xₜ₋₁)]'
    },
    {
      title: 'Apply Bayes Rule to q',
      content: 'Rewrite q(xₜ|xₜ₋₁) using Bayes rule to get the tractable posterior.',
      equation: 'q(xₜ|xₜ₋₁) = q(xₜ₋₁|xₜ,x₀) · q(xₜ|x₀) / q(xₜ₋₁|x₀)'
    },
    {
      title: 'Telescoping Sum',
      content: 'The q(xₜ|x₀) terms cancel! Only the endpoints and KL terms survive.',
      equation: 'L = L_T + Σ L_t + L_0'
    },
    {
      title: 'The Three Final Terms',
      content: 'The loss decomposes into interpretable pieces we can compute.',
      equation: 'L_t = KL(q(xₜ₋₁|xₜ,x₀) || p_θ(xₜ₋₁|xₜ))'
    },
  ];

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

    const centerX = rect.width / 2;

    if (step <= 1) {
      const boxWidth = 80;
      const boxHeight = 50;
      const spacing = 40;
      const totalWidth = 5 * boxWidth + 4 * spacing;
      const startX = (rect.width - totalWidth) / 2;
      const y = rect.height / 2 - 30;

      const labels = ['x₀', 'x₁', 'x₂', '...', 'xT'];
      const colors = ['#4ecdc4', '#4ecdc4AA', '#4ecdc4AA', '#4ecdc4AA', '#a78bfa'];

      labels.forEach((label, i) => {
        const x = startX + i * (boxWidth + spacing);

        ctx.fillStyle = `${colors[i]}20`;
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.font = 'bold 16px var(--font-mono)';
        ctx.fillStyle = colors[i];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + boxWidth / 2, y + boxHeight / 2);

        if (i < labels.length - 1) {
          ctx.beginPath();
          ctx.moveTo(x + boxWidth + 5, y + boxHeight / 2);
          ctx.lineTo(x + boxWidth + spacing - 5, y + boxHeight / 2);
          ctx.strokeStyle = step === 1 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x + boxWidth + spacing - 10, y + boxHeight / 2 - 5);
          ctx.lineTo(x + boxWidth + spacing - 5, y + boxHeight / 2);
          ctx.lineTo(x + boxWidth + spacing - 10, y + boxHeight / 2 + 5);
          ctx.stroke();
        }
      });

      if (step === 1) {
        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = '#ff6b6b';
        ctx.textAlign = 'center';
        ctx.fillText('q(x₁:T|x₀) - forward process (known)', centerX, y + boxHeight + 40);
      }

      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.textAlign = 'center';
      ctx.fillText('The diffusion trajectory: real image → pure noise', centerX, 40);
    } else if (step === 2 || step === 3) {
      const boxWidth = 60;
      const boxHeight = 40;
      const spacing = 30;
      const labels = ['x₀', 'x₁', 'x₂', 'xT'];
      const totalWidth = labels.length * boxWidth + (labels.length - 1) * spacing;
      const startX = (rect.width - totalWidth) / 2;

      const forwardY = 60;
      const reverseY = rect.height - 100;

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = '#ff6b6b';
      ctx.textAlign = 'left';
      ctx.fillText('Forward q(xₜ|xₜ₋₁)', 20, forwardY + boxHeight / 2);

      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('Reverse p_θ(xₜ₋₁|xₜ)', 20, reverseY + boxHeight / 2);

      labels.forEach((label, i) => {
        const x = startX + i * (boxWidth + spacing);

        ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
        ctx.fillRect(x, forwardY, boxWidth, boxHeight);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, forwardY, boxWidth, boxHeight);

        ctx.font = 'bold 14px var(--font-mono)';
        ctx.fillStyle = '#ff6b6b';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + boxWidth / 2, forwardY + boxHeight / 2 + 5);

        if (i < labels.length - 1) {
          ctx.beginPath();
          ctx.moveTo(x + boxWidth + 5, forwardY + boxHeight / 2);
          ctx.lineTo(x + boxWidth + spacing - 5, forwardY + boxHeight / 2);
          ctx.strokeStyle = '#ff6b6b';
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
        ctx.fillRect(x, reverseY, boxWidth, boxHeight);
        ctx.strokeStyle = '#4ecdc4';
        ctx.strokeRect(x, reverseY, boxWidth, boxHeight);

        ctx.fillStyle = '#4ecdc4';
        ctx.fillText(label, x + boxWidth / 2, reverseY + boxHeight / 2 + 5);

        if (i < labels.length - 1) {
          ctx.beginPath();
          ctx.moveTo(x + boxWidth + spacing - 5, reverseY + boxHeight / 2);
          ctx.lineTo(x + boxWidth + 5, reverseY + boxHeight / 2);
          ctx.strokeStyle = '#4ecdc4';
          ctx.stroke();
        }
      });

      if (step === 3) {
        ctx.font = '14px var(--font-mono)';
        ctx.fillStyle = '#ffe66d';
        ctx.textAlign = 'center';
        ctx.fillText('Bayes: q(xₜ|xₜ₋₁) = q(xₜ₋₁|xₜ,x₀) · q(xₜ|x₀) / q(xₜ₋₁|x₀)', centerX, rect.height / 2);
      }
    } else if (step === 4) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('Telescoping: Intermediate terms cancel!', centerX, 50);

      const terms = [
        { text: 'log q(x₀|x₀)', color: '#4ecdc4', y: 100, strike: false },
        { text: '- log q(x₁|x₀)', color: '#ff6b6b', y: 130, strike: true },
        { text: '+ log q(x₁|x₀)', color: '#4ecdc4', y: 160, strike: true },
        { text: '- log q(x₂|x₀)', color: '#ff6b6b', y: 190, strike: true },
        { text: '+ log q(x₂|x₀)', color: '#4ecdc4', y: 220, strike: true },
        { text: '...', color: 'var(--text-dim)', y: 250, strike: false },
        { text: '- log q(xT|x₀)', color: '#ff6b6b', y: 280, strike: false },
      ];

      terms.forEach(term => {
        ctx.fillStyle = term.color;
        ctx.fillText(term.text, centerX, term.y);
        if (term.strike) {
          ctx.beginPath();
          ctx.moveTo(centerX - 80, term.y);
          ctx.lineTo(centerX + 80, term.y);
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      ctx.font = 'bold 14px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('Only first and last survive!', centerX, 330);
    } else if (step === 5) {
      const terms = [
        { name: 'L_T', desc: 'Prior Matching', detail: 'KL(q(xT|x₀) || p(xT))', color: '#a78bfa', y: 80 },
        { name: 'L_{t-1}', desc: 'Denoising Match', detail: 'Σ KL(q(xₜ₋₁|xₜ,x₀) || p_θ(xₜ₋₁|xₜ))', color: '#ffe66d', y: 160 },
        { name: 'L_0', desc: 'Reconstruction', detail: '-log p_θ(x₀|x₁)', color: '#4ecdc4', y: 240 },
      ];

      terms.forEach(term => {
        ctx.fillStyle = `${term.color}20`;
        ctx.fillRect(50, term.y - 30, rect.width - 100, 70);
        ctx.strokeStyle = term.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, term.y - 30, rect.width - 100, 70);

        ctx.font = 'bold 18px var(--font-mono)';
        ctx.fillStyle = term.color;
        ctx.textAlign = 'left';
        ctx.fillText(term.name, 70, term.y);

        ctx.font = '14px var(--font-mono)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.fillText(term.desc, 150, term.y - 5);

        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText(term.detail, 150, term.y + 15);
      });

      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.fillText('The core term L_{t-1} simplifies to predicting noise!', centerX, 330);
    }

  }, [step]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: step === 0 ? 'var(--text-dim)' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          ← Previous
        </button>
        <span style={{ color: 'var(--text-secondary)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Step {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          style={{
            background: step === steps.length - 1 ? 'transparent' : 'var(--accent)',
            border: step === steps.length - 1 ? '1px solid var(--border-strong)' : 'none',
            color: step === steps.length - 1 ? 'var(--text-dim)' : 'hsl(var(--bg-primary-hsl))',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Next →
        </button>
      </div>

      <div style={{
        marginBottom: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(0, 243, 255, 0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        textAlign: 'center'
      }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{steps[step].title}</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{steps[step].content}</p>
        <code style={{
          display: 'block',
          padding: '0.75rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-primary)'
        }}>
          {steps[step].equation}
        </code>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '360px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />
    </div>
  );
}
