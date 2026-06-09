'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function GeodesicTrickViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interpolationT, setInterpolationT] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMethod, setShowMethod] = useState<'input' | 'latent'>('latent');
  const animationRef = useRef<number>(0);

  const generateCurve = useCallback((numPoints: number): { x: number; y: number; t: number }[] => {
    const points: { x: number; y: number; t: number }[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 1.5 + Math.PI * 0.5;
      const radius = 60 + t * 80;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        t: t,
      });
    }
    return points;
  }, []);

  const [curvePoints] = useState(() => generateCurve(50));

  const pointAIdx = 5;
  const pointBIdx = 45;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const leftCenterX = rect.width * 0.28;
      const rightCenterX = rect.width * 0.72;
      const centerY = rect.height * 0.5;

      ctx.strokeStyle = 'var(--border-subtle)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(rect.width / 2, 40);
      ctx.lineTo(rect.width / 2, rect.height - 40);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 13px var(--font-mono)';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Input Space (X)', leftCenterX, 30);
      ctx.fillText('Latent Space (Z)', rightCenterX, 30);

      ctx.beginPath();
      curvePoints.forEach((p, i) => {
        const x = leftCenterX + p.x * 0.9;
        const y = centerY + p.y * 0.9;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      curvePoints.forEach((p, i) => {
        const x = leftCenterX + p.x * 0.9;
        const y = centerY + p.y * 0.9;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      const pA = curvePoints[pointAIdx];
      const pB = curvePoints[pointBIdx];
      const inputA = { x: leftCenterX + pA.x * 0.9, y: centerY + pA.y * 0.9 };
      const inputB = { x: leftCenterX + pB.x * 0.9, y: centerY + pB.y * 0.9 };

      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.moveTo(inputA.x, inputA.y);
      ctx.lineTo(inputB.x, inputB.y);
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      for (let i = pointAIdx; i <= pointBIdx; i++) {
        const p = curvePoints[i];
        const x = leftCenterX + p.x * 0.9;
        const y = centerY + p.y * 0.9;
        if (i === pointAIdx) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.stroke();

      const latentWidth = 180;
      const latentHeight = 100;
      const latentLeft = rightCenterX - latentWidth / 2;
      const latentTop = centerY - latentHeight / 2;

      ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(latentLeft, latentTop, latentWidth, latentHeight);

      ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
      ctx.fillRect(latentLeft, latentTop, latentWidth, latentHeight);

      const latentA = { x: latentLeft + 25, y: centerY };
      const latentB = { x: latentLeft + latentWidth - 25, y: centerY };

      ctx.beginPath();
      ctx.moveTo(latentA.x, latentA.y);
      ctx.lineTo(latentB.x, latentB.y);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.stroke();

      [{ pos: inputA, label: 'A' }, { pos: inputB, label: 'B' }].forEach(({ pos, label }) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = label === 'A' ? '#00f3ff' : '#ff00ff';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 12px var(--font-sans)';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pos.x, pos.y);
      });

      [{ pos: latentA, label: 'z₁' }, { pos: latentB, label: 'z₂' }].forEach(({ pos, label }) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = label === 'z₁' ? '#00f3ff' : '#ff00ff';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 10px var(--font-mono)';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pos.x, pos.y);
      });

      let interpPoint: { x: number; y: number };
      let interpLatent: { x: number; y: number };

      if (showMethod === 'latent') {
        interpLatent = {
          x: latentA.x + interpolationT * (latentB.x - latentA.x),
          y: latentA.y + interpolationT * (latentB.y - latentA.y),
        };

        const interpIdx = Math.floor(pointAIdx + interpolationT * (pointBIdx - pointAIdx));
        const p = curvePoints[Math.min(interpIdx, curvePoints.length - 1)];
        interpPoint = { x: leftCenterX + p.x * 0.9, y: centerY + p.y * 0.9 };
      } else {
        interpPoint = {
          x: inputA.x + interpolationT * (inputB.x - inputA.x),
          y: inputA.y + interpolationT * (inputB.y - inputA.y),
        };
        interpLatent = {
          x: latentA.x + interpolationT * (latentB.x - latentA.x),
          y: latentA.y,
        };
      }

      ctx.beginPath();
      ctx.arc(interpPoint.x, interpPoint.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = showMethod === 'latent' ? '#00ff88' : '#ff4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(interpLatent.x, interpLatent.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const arrowY = centerY - 30;
      ctx.beginPath();
      ctx.moveTo(rect.width / 2 - 40, arrowY);
      ctx.lineTo(rect.width / 2 + 40, arrowY);
      ctx.lineTo(rect.width / 2 + 30, arrowY - 8);
      ctx.moveTo(rect.width / 2 + 40, arrowY);
      ctx.lineTo(rect.width / 2 + 30, arrowY + 8);
      ctx.strokeStyle = 'var(--accent)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '10px var(--font-mono)';
      ctx.fillStyle = 'var(--accent)';
      ctx.textAlign = 'center';
      ctx.fillText('Encoder', rect.width / 2, arrowY - 15);
      ctx.fillText('z = E(x)', rect.width / 2, arrowY + 20);

      ctx.font = '11px var(--font-mono)';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ff4444';
      ctx.fillText('Euclidean: WRONG', leftCenterX - 80, rect.height - 60);
      ctx.fillStyle = '#00ff88';
      ctx.fillText('Geodesic: CORRECT', leftCenterX - 80, rect.height - 42);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('||z₁ - z₂||₂', rightCenterX, rect.height - 50);
      ctx.fillStyle = 'var(--text-dim)';
      ctx.font = '10px var(--font-mono)';
      ctx.fillText('Simple Euclidean = True Distance', rightCenterX, rect.height - 35);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [curvePoints, interpolationT, showMethod]);

  useEffect(() => {
    if (!isAnimating) return;

    let startTime: number | null = null;
    const duration = 2000;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      setInterpolationT(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating]);

  const startAnimation = () => {
    setInterpolationT(0);
    setIsAnimating(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          style={{
            background: 'var(--accent)',
            color: 'hsl(var(--bg-primary-hsl))',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          Interpolate A → B
        </button>
        <button
          onClick={() => setShowMethod('latent')}
          style={{
            background: showMethod === 'latent' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            border: `1px solid ${showMethod === 'latent' ? '#00ff88' : 'var(--border-strong)'}`,
            color: showMethod === 'latent' ? '#00ff88' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Latent Space (Correct)
        </button>
        <button
          onClick={() => setShowMethod('input')}
          style={{
            background: showMethod === 'input' ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${showMethod === 'input' ? '#ff4444' : 'var(--border-strong)'}`,
            color: showMethod === 'input' ? '#ff4444' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Input Space (Wrong)
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '350px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>A</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={interpolationT}
            onChange={(e) => { setInterpolationT(parseFloat(e.target.value)); setIsAnimating(false); }}
            style={{ width: '200px', accentColor: 'var(--accent)' }}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>B</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            t = {interpolationT.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
