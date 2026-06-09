'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function InterpolationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interpolation, setInterpolation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [manifoldType, setManifoldType] = useState<'good' | 'bad'>('good');
  const animationRef = useRef<number>(0);

  const drawFace = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, params: {
    smile: number;
    eyeSize: number;
    eyebrowAngle: number;
    faceWidth: number;
  }) => {
    const { smile, eyeSize, eyebrowAngle, faceWidth } = params;

    ctx.beginPath();
    ctx.ellipse(x, y, size * faceWidth, size, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd93d';
    ctx.fill();
    ctx.strokeStyle = '#e6c235';
    ctx.lineWidth = 2;
    ctx.stroke();

    const eyeOffsetX = size * 0.35;
    const eyeOffsetY = size * 0.2;

    ctx.beginPath();
    ctx.ellipse(x - eyeOffsetX, y - eyeOffsetY, eyeSize * 8, eyeSize * 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - eyeOffsetX, y - eyeOffsetY, eyeSize * 4, eyeSize * 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + eyeOffsetX, y - eyeOffsetY, eyeSize * 8, eyeSize * 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + eyeOffsetX, y - eyeOffsetY, eyeSize * 4, eyeSize * 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - eyeOffsetX - 10, y - eyeOffsetY - 15 - eyebrowAngle * 5);
    ctx.lineTo(x - eyeOffsetX + 10, y - eyeOffsetY - 15 + eyebrowAngle * 5);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + eyeOffsetX - 10, y - eyeOffsetY - 15 + eyebrowAngle * 5);
    ctx.lineTo(x + eyeOffsetX + 10, y - eyeOffsetY - 15 - eyebrowAngle * 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y + size * 0.3);
    ctx.quadraticCurveTo(x, y + size * 0.3 + smile * 30, x + size * 0.4, y + size * 0.3);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);

  const drawNoise = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, intensity: number) => {
    const imageData = ctx.createImageData(size * 2, size * 2);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255 * intensity;
      data[i] = noise;
      data[i + 1] = noise * 0.8;
      data[i + 2] = noise * 0.3;
      data[i + 3] = 255 * intensity;
    }

    ctx.putImageData(imageData, x - size, y - size);
  }, []);

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

      const centerY = rect.height / 2;
      const faceSize = 50;
      const startX = 80;
      const endX = rect.width - 80;
      const currentX = startX + interpolation * (endX - startX);

      const happyParams = { smile: 1, eyeSize: 1, eyebrowAngle: 0.5, faceWidth: 1 };
      const sadParams = { smile: -0.8, eyeSize: 0.8, eyebrowAngle: -0.5, faceWidth: 0.95 };

      drawFace(ctx, startX, centerY, faceSize, happyParams);
      drawFace(ctx, endX, centerY, faceSize, sadParams);

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(startX + faceSize + 20, centerY);
      ctx.lineTo(endX - faceSize - 20, centerY);
      ctx.strokeStyle = 'var(--border-strong)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      if (manifoldType === 'good') {
        const t = interpolation;
        const currentParams = {
          smile: happyParams.smile * (1 - t) + sadParams.smile * t,
          eyeSize: happyParams.eyeSize * (1 - t) + sadParams.eyeSize * t,
          eyebrowAngle: happyParams.eyebrowAngle * (1 - t) + sadParams.eyebrowAngle * t,
          faceWidth: happyParams.faceWidth * (1 - t) + sadParams.faceWidth * t,
        };

        ctx.shadowColor = 'var(--accent)';
        ctx.shadowBlur = 20;
        drawFace(ctx, currentX, centerY - 80, faceSize * 1.2, currentParams);
        ctx.shadowBlur = 0;

        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = 'var(--accent)';
        ctx.textAlign = 'center';
        ctx.fillText('Smooth interpolation', currentX, centerY - 150);
      } else {
        const midPoint = 0.5;
        const noiseIntensity = 1 - Math.abs(interpolation - midPoint) * 2;

        if (noiseIntensity > 0.3) {
          drawNoise(ctx, currentX, centerY - 80, faceSize, noiseIntensity);

          ctx.font = '12px var(--font-mono)';
          ctx.fillStyle = '#ff4444';
          ctx.textAlign = 'center';
          ctx.fillText('Noise / Invalid data', currentX, centerY - 150);
        } else {
          const t = interpolation;
          const currentParams = {
            smile: happyParams.smile * (1 - t) + sadParams.smile * t,
            eyeSize: happyParams.eyeSize * (1 - t) + sadParams.eyeSize * t,
            eyebrowAngle: happyParams.eyebrowAngle * (1 - t) + sadParams.eyebrowAngle * t,
            faceWidth: happyParams.faceWidth * (1 - t) + sadParams.faceWidth * t,
          };

          ctx.globalAlpha = 1 - noiseIntensity;
          drawFace(ctx, currentX, centerY - 80, faceSize * 1.2, currentParams);
          ctx.globalAlpha = 1;
        }
      }

      ctx.beginPath();
      ctx.arc(currentX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = manifoldType === 'good' ? 'var(--accent)' : '#ff4444';
      ctx.fill();

      ctx.font = '11px var(--font-mono)';
      ctx.fillStyle = 'var(--text-dim)';
      ctx.textAlign = 'center';
      ctx.fillText('Happy', startX, centerY + faceSize + 30);
      ctx.fillText('Sad', endX, centerY + faceSize + 30);
      ctx.fillText(`t = ${interpolation.toFixed(2)}`, currentX, centerY + 25);
    };

    draw();
  }, [interpolation, manifoldType, drawFace, drawNoise]);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setInterpolation(prev => {
        const next = prev + 0.008;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlay = () => {
    if (interpolation >= 1) {
      setInterpolation(0);
    }
    setIsPlaying(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setManifoldType('good')}
          style={{
            background: manifoldType === 'good' ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
            border: `1px solid ${manifoldType === 'good' ? 'var(--accent)' : 'var(--border-strong)'}`,
            color: manifoldType === 'good' ? 'var(--accent)' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Good Manifold
        </button>
        <button
          onClick={() => setManifoldType('bad')}
          style={{
            background: manifoldType === 'bad' ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${manifoldType === 'bad' ? '#ff4444' : 'var(--border-strong)'}`,
            color: manifoldType === 'bad' ? '#ff4444' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Bad Manifold (Holes)
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '280px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          style={{
            background: 'var(--accent)',
            color: 'hsl(var(--bg-primary-hsl))',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600,
            opacity: isPlaying ? 0.7 : 1,
          }}
        >
          {isPlaying ? 'Playing...' : 'Play Interpolation'}
        </button>

        <button
          onClick={() => { setInterpolation(0); setIsPlaying(false); }}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          Reset
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={interpolation}
          onChange={(e) => { setInterpolation(parseFloat(e.target.value)); setIsPlaying(false); }}
          style={{ width: '150px', accentColor: 'var(--accent)' }}
        />
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '1rem' }}>
        {manifoldType === 'good'
          ? 'A well-learned manifold produces valid faces at every interpolation point.'
          : 'A manifold with holes produces noise/garbage when traversing between points.'}
      </p>
    </div>
  );
}
