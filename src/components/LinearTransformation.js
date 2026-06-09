'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../app/eigenvalues/visualization.module.css';

export default function LinearTransformation({ initialMatrix = [[2, 1], [1, 2]] }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const angleRef = useRef(0);
  const pausedRef = useRef(false);
  const lastLambdaRef = useRef(null);
  const [matrix] = useState(initialMatrix);
  const [eigenInfo, setEigenInfo] = useState(null);
  const [found, setFound] = useState([]);

  const handleFindNext = useCallback(() => {
    angleRef.current += 0.15;
    pausedRef.current = false;
    setEigenInfo(null);
  }, []);

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
      const cx = w / 2;
      const cy = h / 2;
      const unit = Math.min(w, h) * 0.09;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue;
        ctx.beginPath();
        ctx.moveTo(cx + i * unit, 0);
        ctx.lineTo(cx + i * unit, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, cy + i * unit);
        ctx.lineTo(w, cy + i * unit);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      if (!pausedRef.current) {
        angleRef.current += 0.008;
      }
      const angle = angleRef.current;

      const vx = Math.cos(angle);
      const vy = Math.sin(angle);

      const tx = matrix[0][0] * vx + matrix[0][1] * vy;
      const ty = matrix[1][0] * vx + matrix[1][1] * vy;

      const cross = vx * ty - vy * tx;
      const isEigen = Math.abs(cross) < 0.06;

      if (isEigen && !pausedRef.current) {
        const lambda = vx !== 0 ? tx / vx : ty / vy;
        const lambdaRounded = Math.round(lambda * 100) / 100;

        const isDuplicate = lastLambdaRef.current !== null &&
          Math.abs(lambdaRounded - lastLambdaRef.current) < 0.2;

        if (isDuplicate) {
          angleRef.current += 0.15;
        } else {
          pausedRef.current = true;
          lastLambdaRef.current = lambdaRounded;
          setEigenInfo({ lambda: lambdaRounded });
          setFound(prev => {
            const exists = prev.some(l => Math.abs(l - lambdaRounded) < 0.2);
            return exists ? prev : [...prev, lambdaRounded];
          });
        }
      }

      // Draw previously found eigenvector ghosts
      // (not drawing ghosts to keep it clean — the list below tracks them)

      // Faint sweep trail
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2 * unit, 0, Math.PI * 2);
      ctx.stroke();

      const drawArrow = (fromX, fromY, toX, toY, color, alpha) => {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return;

        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const headLen = 10;
        const a = Math.atan2(dy, dx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(a - 0.4), toY - headLen * Math.sin(a - 0.4));
        ctx.lineTo(toX - headLen * Math.cos(a + 0.4), toY - headLen * Math.sin(a + 0.4));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      };

      // Dashed connection line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + vx * 2.2 * unit, cy - vy * 2.2 * unit);
      ctx.lineTo(cx + tx * unit, cy - ty * unit);
      ctx.stroke();
      ctx.setLineDash([]);

      drawArrow(cx, cy, cx + vx * 2.2 * unit, cy - vy * 2.2 * unit, '#22d3ee', 1);
      drawArrow(cx, cy, cx + tx * unit, cy - ty * unit, '#f43f5e', 0.9);

      if (isEigen && pausedRef.current) {
        const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.006);
        ctx.beginPath();
        ctx.arc(cx + vx * 2.2 * unit, cy - vy * 2.2 * unit, 12, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${pulse})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + tx * unit, cy - ty * unit, 12, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 63, 94, ${pulse})`;
        ctx.fill();
      }

      ctx.font = '12px var(--font-mono, monospace)';
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('x', cx + vx * 2.2 * unit + 10, cy - vy * 2.2 * unit - 8);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('Ax', cx + tx * unit + 10, cy - ty * unit - 8);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [matrix]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h3>Explore Linear Transformations</h3>
        <p>Watch the <strong style={{ color: '#22d3ee' }}>input vector x</strong> sweep around a circle. When it aligns with the <strong style={{ color: '#f43f5e' }}>transformed vector Ax</strong>, you&apos;ve found an eigenvector.</p>

        {eigenInfo && (
          <div className={styles.eigenAlert}>
            <span>🎉 <strong>Eigenvector found!</strong></span>
            <span style={{ marginLeft: '1rem', borderLeft: '1px solid hsla(var(--accent-hsl), 0.3)', paddingLeft: '1rem' }}>
              λ ≈ <strong>{eigenInfo.lambda.toFixed(2)}</strong>
            </span>
          </div>
        )}

        {found.length > 0 && (
          <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Eigenvalues found: {found.map(l => `λ = ${l.toFixed(2)}`).join(', ')}
          </div>
        )}

        {eigenInfo && (
          <button className={styles.button} onClick={handleFindNext} style={{ marginTop: '1rem' }}>
            Find next eigenvalue →
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className={styles.svg}
        style={{ touchAction: 'none', cursor: 'default' }}
      />
    </div>
  );
}
