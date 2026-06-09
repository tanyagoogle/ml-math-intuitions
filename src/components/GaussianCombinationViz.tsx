'use client';

import { useRef, useEffect, useState } from 'react';

export default function GaussianCombinationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Step 1: The Goal — Find the Posterior',
      description: 'We want q(xₜ₋₁ | xₜ, x₀): "Given the noisy image xₜ AND the original x₀, where was xₜ₋₁?"',
      detail: 'This is tractable because we condition on x₀. Without x₀, we\'d need to integrate over all possible originals.'
    },
    {
      title: 'Step 2: Apply Bayes\' Rule',
      description: 'q(xₜ₋₁ | xₜ, x₀) ∝ q(xₜ | xₜ₋₁) × q(xₜ₋₁ | x₀)',
      detail: 'The posterior is proportional to the product of two things we already know: the forward step and the "jump" from x₀.'
    },
    {
      title: 'Step 3: Both Terms are Gaussians',
      description: 'Each term is a bell curve. We\'re multiplying two bell curves together.',
      detail: 'q(xₜ|xₜ₋₁) = N(√αₜ·xₜ₋₁, βₜ) and q(xₜ₋₁|x₀) = N(√ᾱₜ₋₁·x₀, 1-ᾱₜ₋₁)'
    },
    {
      title: 'Step 4: Multiply Gaussians = Add Exponents',
      description: 'Gaussian PDFs are exponentials. Multiplying them adds the stuff inside exp().',
      detail: 'exp(-A) × exp(-B) = exp(-(A+B)). Both A and B are quadratic in xₜ₋₁.'
    },
    {
      title: 'Step 5: Collect Terms by Power of xₜ₋₁',
      description: 'After expanding, group terms: coefficient of x²ₜ₋₁ (called A) and coefficient of xₜ₋₁ (called B).',
      detail: 'The exponent becomes: -½(A·x²ₜ₋₁ - B·xₜ₋₁ + constant)'
    },
    {
      title: 'Step 6: Complete the Square',
      description: 'Any quadratic Ax² - Bx can be rewritten as A(x - B/2A)² + constant.',
      detail: 'This is the standard form of a Gaussian! The new variance is 1/A, and the new mean is B/(2A).'
    },
    {
      title: 'Step 7: The Result — A New Gaussian!',
      description: 'The posterior q(xₜ₋₁ | xₜ, x₀) is a Gaussian with computable mean and variance.',
      detail: 'The mean μ̃ₜ is a weighted average of x₀ and xₜ. The weights depend on how much noise we\'ve added.'
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
    const baseY = 200;

    const gaussian = (x: number, mu: number, sigma: number) => {
      return Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
    };

    const drawGaussian = (mu: number, sigma: number, color: string, label: string, labelY: number, scale = 150, yScale = 120) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      for (let px = 0; px < rect.width; px++) {
        const x = (px - centerX) / scale;
        const y = gaussian(x, mu, sigma) * yScale;
        if (px === 0) {
          ctx.moveTo(px, baseY - y);
        } else {
          ctx.lineTo(px, baseY - y);
        }
      }
      ctx.stroke();

      if (label) {
        ctx.font = 'bold 12px var(--font-mono)';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(label, centerX + mu * scale, labelY);
      }
    };

    const drawAxis = () => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.moveTo(30, baseY);
      ctx.lineTo(rect.width - 30, baseY);
      ctx.stroke();

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('xₜ₋₁', rect.width - 50, baseY + 15);
    };

    drawAxis();

    if (step === 0) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('We want to find: q(xₜ₋₁ | xₜ, x₀)', centerX, 40);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('"Given both the noisy image AND the original,', centerX, 70);
      ctx.fillText('what is the distribution over the previous step?"', centerX, 90);

      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00ff88';
      ctx.fillText('← This is what we want to find', centerX + 100, baseY - 55);

    } else if (step === 1) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('Bayes\' Rule:', centerX, 35);

      ctx.font = '16px var(--font-mono)';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('q(xₜ₋₁ | xₜ, x₀) ∝ q(xₜ | xₜ₋₁) × q(xₜ₋₁ | x₀)', centerX, 65);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('Forward step', centerX - 80, 95);
      ctx.fillStyle = '#ffe66d';
      ctx.fillText('Jump from x₀', centerX + 80, 95);

      drawGaussian(-0.5, 0.35, '#4ecdc4', 'q(xₜ | xₜ₋₁)', baseY + 35);
      drawGaussian(0.6, 0.5, '#ffe66d', 'q(xₜ₋₁ | x₀)', baseY + 55);

    } else if (step === 2) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('Both terms are Gaussians (bell curves):', centerX, 35);

      drawGaussian(-0.5, 0.35, '#4ecdc4', '', baseY + 35);
      drawGaussian(0.6, 0.5, '#ffe66d', '', baseY + 35);

      ctx.font = '11px var(--font-mono)';
      ctx.textAlign = 'left';

      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('q(xₜ | xₜ₋₁) = N(√αₜ · xₜ₋₁, βₜ)', 40, baseY + 60);
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('Mean depends on xₜ₋₁, variance is βₜ', 40, baseY + 78);

      ctx.fillStyle = '#ffe66d';
      ctx.textAlign = 'right';
      ctx.fillText('q(xₜ₋₁ | x₀) = N(√ᾱₜ₋₁ · x₀, 1-ᾱₜ₋₁)', rect.width - 40, baseY + 60);
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('Mean depends on x₀, variance is 1-ᾱₜ₋₁', rect.width - 40, baseY + 78);

    } else if (step === 3) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('Gaussian PDF: exp(-½ · (x-μ)²/σ²)', centerX, 35);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Multiplying two Gaussians:', centerX, 65);

      ctx.font = '13px var(--font-mono)';
      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('exp(-A)', centerX - 80, 95);
      ctx.fillStyle = 'var(--text-primary)';
      ctx.fillText('×', centerX, 95);
      ctx.fillStyle = '#ffe66d';
      ctx.fillText('exp(-B)', centerX + 80, 95);

      ctx.fillStyle = 'var(--text-primary)';
      ctx.fillText('=', centerX, 125);

      ctx.fillStyle = '#a78bfa';
      ctx.fillText('exp(-(A + B))', centerX, 155);

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('The exponents ADD together!', centerX, 180);

    } else if (step === 4) {
      ctx.font = '13px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('After adding exponents and expanding (x-μ)² terms:', centerX, 35);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Combined exponent = -½ × (', centerX - 100, 70);

      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 12px var(--font-mono)';
      ctx.fillText('A', centerX + 20, 70);
      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('·x²ₜ₋₁  -  ', centerX + 55, 70);

      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 12px var(--font-mono)';
      ctx.fillText('B', centerX + 105, 70);
      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('·xₜ₋₁  +  C )', centerX + 160, 70);

      const boxY = 100;
      ctx.fillStyle = 'rgba(78, 205, 196, 0.15)';
      ctx.fillRect(40, boxY, rect.width / 2 - 60, 80);
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, boxY, rect.width / 2 - 60, 80);

      ctx.font = 'bold 12px var(--font-mono)';
      ctx.fillStyle = '#4ecdc4';
      ctx.textAlign = 'left';
      ctx.fillText('A = coefficient of x²ₜ₋₁', 55, boxY + 25);
      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('A = αₜ/βₜ + 1/(1-ᾱₜ₋₁)', 55, boxY + 50);
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('(controls new variance)', 55, boxY + 70);

      ctx.fillStyle = 'rgba(255, 230, 109, 0.15)';
      ctx.fillRect(rect.width / 2 + 20, boxY, rect.width / 2 - 60, 80);
      ctx.strokeStyle = '#ffe66d';
      ctx.strokeRect(rect.width / 2 + 20, boxY, rect.width / 2 - 60, 80);

      ctx.font = 'bold 12px var(--font-mono)';
      ctx.fillStyle = '#ffe66d';
      ctx.fillText('B = coefficient of xₜ₋₁', rect.width / 2 + 35, boxY + 25);
      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('B = 2√αₜ·xₜ/βₜ + 2√ᾱₜ₋₁·x₀/(1-ᾱₜ₋₁)', rect.width / 2 + 35, boxY + 50);
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('(controls new mean)', rect.width / 2 + 35, boxY + 70);

    } else if (step === 5) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.fillText('"Completing the Square" — a standard algebra trick', centerX, 35);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Any quadratic  Ax² - Bx  can be rewritten as:', centerX, 70);

      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('A·(x - B/2A)²  +  constant', centerX, 100);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Compare to standard Gaussian form: (x - μ)²/σ²', centerX, 140);

      const boxY = 165;
      ctx.fillStyle = 'rgba(78, 205, 196, 0.15)';
      ctx.fillRect(centerX - 180, boxY, 160, 50);
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - 180, boxY, 160, 50);

      ctx.font = 'bold 13px var(--font-mono)';
      ctx.fillStyle = '#4ecdc4';
      ctx.textAlign = 'center';
      ctx.fillText('New Variance', centerX - 100, boxY + 22);
      ctx.font = '14px var(--font-mono)';
      ctx.fillText('σ² = 1/A', centerX - 100, boxY + 42);

      ctx.fillStyle = 'rgba(255, 230, 109, 0.15)';
      ctx.fillRect(centerX + 20, boxY, 160, 50);
      ctx.strokeStyle = '#ffe66d';
      ctx.strokeRect(centerX + 20, boxY, 160, 50);

      ctx.font = 'bold 13px var(--font-mono)';
      ctx.fillStyle = '#ffe66d';
      ctx.fillText('New Mean', centerX + 100, boxY + 22);
      ctx.font = '14px var(--font-mono)';
      ctx.fillText('μ = B/(2A)', centerX + 100, boxY + 42);

    } else if (step === 6) {
      ctx.font = '14px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.fillText('Result: q(xₜ₋₁ | xₜ, x₀) = N(μ̃ₜ, β̃ₜ)', centerX, 35);

      drawGaussian(0, 0.4, '#00ff88', '', 0);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('The posterior is a Gaussian centered at μ̃ₜ:', centerX, baseY + 45);

      ctx.font = '13px var(--font-mono)';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.fillText('μ̃ₜ = (√ᾱₜ₋₁·βₜ / (1-ᾱₜ))·x₀  +  (√αₜ·(1-ᾱₜ₋₁) / (1-ᾱₜ))·xₜ', centerX, baseY + 75);

      ctx.font = '12px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('↑ Weighted average of x₀ (original) and xₜ (current noisy image)!', centerX, baseY + 100);
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
          ← Prev
        </button>
        <span style={{
          padding: '0.5rem 1rem',
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem'
        }}>
          {step + 1} / {steps.length}
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

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '320px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(167, 139, 250, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(167, 139, 250, 0.3)',
      }}>
        <h4 style={{ color: '#a78bfa', marginBottom: '0.5rem', fontSize: '1rem' }}>{steps[step].title}</h4>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{steps[step].description}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>{steps[step].detail}</p>
      </div>
    </div>
  );
}
