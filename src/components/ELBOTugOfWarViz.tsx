'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ELBOTugOfWarViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [beta, setBeta] = useState(0.5);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const animateBeta = useCallback((target: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const start = beta;
    const startTime = performance.now();
    const duration = 1000;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setBeta(start + (target - start) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [beta, isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.03;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const ropeY = centerY - 30;
      const ropeWidth = rect.width * 0.7;
      const ropeLeft = (rect.width - ropeWidth) / 2;
      const ropeRight = ropeLeft + ropeWidth;

      const flagPosition = ropeLeft + ropeWidth * beta;

      ctx.beginPath();
      ctx.moveTo(ropeLeft, ropeY);
      ctx.lineTo(ropeRight, ropeY);
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      for (let x = ropeLeft; x <= ropeRight; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, ropeY - 2);
        ctx.lineTo(x + 10, ropeY + 2);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(centerX, ropeY - 10);
      ctx.lineTo(centerX, ropeY + 10);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(flagPosition, ropeY - 5);
      ctx.lineTo(flagPosition, ropeY - 35);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(flagPosition, ropeY - 35);
      ctx.lineTo(flagPosition + 25, ropeY - 28);
      ctx.lineTo(flagPosition, ropeY - 20);
      ctx.closePath();
      ctx.fillStyle = '#ffe66d';
      ctx.fill();

      const recoStrength = 1 - beta;
      const recoTeamX = ropeLeft - 50;
      const recoPull = Math.sin(timeRef.current * 4) * recoStrength * 5;

      ctx.beginPath();
      ctx.ellipse(recoTeamX + recoPull, ropeY, 30, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b6b';
      ctx.fill();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 20px var(--font-sans)';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', recoTeamX + recoPull, ropeY);

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('Reconstruction', recoTeamX, ropeY + 60);

      for (let i = 0; i < 3; i++) {
        const arrowX = recoTeamX + 45 + i * 15 + recoPull;
        ctx.beginPath();
        ctx.moveTo(arrowX, ropeY);
        ctx.lineTo(arrowX - 8, ropeY - 5);
        ctx.lineTo(arrowX - 8, ropeY + 5);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 107, 107, ${0.3 + recoStrength * 0.7})`;
        ctx.fill();
      }

      const klStrength = beta;
      const klTeamX = ropeRight + 50;
      const klPull = Math.sin(timeRef.current * 4 + Math.PI) * klStrength * 5;

      ctx.beginPath();
      ctx.ellipse(klTeamX + klPull, ropeY, 30, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4ecdc4';
      ctx.fill();
      ctx.strokeStyle = '#00bfb3';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 20px var(--font-sans)';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('KL', klTeamX + klPull, ropeY);

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('KL Divergence', klTeamX, ropeY + 60);

      for (let i = 0; i < 3; i++) {
        const arrowX = klTeamX - 45 - i * 15 + klPull;
        ctx.beginPath();
        ctx.moveTo(arrowX, ropeY);
        ctx.lineTo(arrowX + 8, ropeY - 5);
        ctx.lineTo(arrowX + 8, ropeY + 5);
        ctx.closePath();
        ctx.fillStyle = `rgba(78, 205, 196, ${0.3 + klStrength * 0.7})`;
        ctx.fill();
      }

      const latentY = ropeY + 130;
      const latentWidth = 200;
      const latentLeft = centerX - latentWidth / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(latentLeft, latentY - 50, latentWidth, 100);

      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Latent Space', centerX, latentY + 65);

      const numPoints = 20;
      const spreadFactor = 1 - beta;
      const clusterFactor = beta;

      for (let i = 0; i < numPoints; i++) {
        const baseAngle = (i / numPoints) * Math.PI * 2;
        const baseRadius = 30 + (i % 3) * 15;

        const spreadX = Math.cos(baseAngle) * baseRadius * spreadFactor;
        const spreadY = Math.sin(baseAngle) * baseRadius * 0.5 * spreadFactor;

        const clusterX = (Math.random() - 0.5) * 40 * clusterFactor;
        const clusterY = (Math.random() - 0.5) * 40 * clusterFactor;

        const px = centerX + spreadX * (1 - clusterFactor) + clusterX;
        const py = latentY + spreadY * (1 - clusterFactor) + clusterY;

        const pointSize = 3 + spreadFactor * 3;

        ctx.beginPath();
        ctx.arc(px, py, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = i < numPoints / 2 ? '#ff6b6b' : '#4ecdc4';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(centerX, latentY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      ctx.font = '9px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillText('prior', centerX, latentY + 15);

      if (beta > 0.7) {
        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('Posterior Collapse Risk!', centerX, latentY - 60);
      } else if (beta < 0.3) {
        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = '#ffe66d';
        ctx.textAlign = 'center';
        ctx.fillText('Sparse islands, poor generation', centerX, latentY - 60);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beta]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => animateBeta(0.1)}
          disabled={isAnimating}
          style={{
            background: beta < 0.3 ? 'rgba(255, 107, 107, 0.2)' : 'transparent',
            border: `1px solid ${beta < 0.3 ? '#ff6b6b' : 'var(--border-strong)'}`,
            color: beta < 0.3 ? '#ff6b6b' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          Reconstruction Wins
        </button>
        <button
          onClick={() => animateBeta(0.5)}
          disabled={isAnimating}
          style={{
            background: beta >= 0.3 && beta <= 0.7 ? 'rgba(255, 230, 109, 0.2)' : 'transparent',
            border: `1px solid ${beta >= 0.3 && beta <= 0.7 ? '#ffe66d' : 'var(--border-strong)'}`,
            color: beta >= 0.3 && beta <= 0.7 ? '#ffe66d' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          Balanced
        </button>
        <button
          onClick={() => animateBeta(0.9)}
          disabled={isAnimating}
          style={{
            background: beta > 0.7 ? 'rgba(78, 205, 196, 0.2)' : 'transparent',
            border: `1px solid ${beta > 0.7 ? '#4ecdc4' : 'var(--border-strong)'}`,
            color: beta > 0.7 ? '#4ecdc4' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          KL Wins (Collapse)
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '380px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>Reconstruction</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            style={{ width: '200px', accentColor: 'var(--accent)' }}
          />
          <span style={{ color: '#4ecdc4', fontSize: '0.85rem' }}>KL Divergence</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          β weight: <strong style={{ color: 'var(--accent)' }}>{beta.toFixed(2)}</strong>
          {' '}
          <span style={{ color: 'var(--text-dim)' }}>
            ({beta < 0.3 ? 'Memorization mode' : beta > 0.7 ? 'Collapse risk' : 'Balanced training'})
          </span>
        </p>
      </div>
    </div>
  );
}
