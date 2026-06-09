'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

type ModelType = 'autoencoder' | 'vae' | 'gan';

interface DataPoint {
  x: number;
  y: number;
  label: number;
}

export default function TopologyComparisonViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelType, setModelType] = useState<ModelType>('autoencoder');
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number>(0);

  const generateClusters = useCallback((): DataPoint[] => {
    const points: DataPoint[] = [];
    const clusters = [
      { cx: -120, cy: -80, label: 0 },
      { cx: 120, cy: -80, label: 1 },
      { cx: -120, cy: 80, label: 2 },
      { cx: 120, cy: 80, label: 3 },
    ];

    clusters.forEach(cluster => {
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 30 + 5;
        points.push({
          x: cluster.cx + Math.cos(angle) * r,
          y: cluster.cy + Math.sin(angle) * r,
          label: cluster.label,
        });
      }
    });

    return points;
  }, []);

  const [dataPoints] = useState<DataPoint[]>(generateClusters);

  const getClusterColor = (label: number): string => {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'];
    return colors[label % colors.length];
  };

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

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setAnimationProgress(prev => Math.min(prev + 0.01, 1));
      const t = animationProgress;

      if (modelType === 'autoencoder') {
        dataPoints.forEach(p => {
          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = getClusterColor(p.label);
          ctx.fill();
        });

        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('Empty void (noise)', centerX, centerY);
        ctx.fillText('between clusters', centerX, centerY + 16);

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 80);
        ctx.lineTo(centerX + 120, centerY - 80);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY + 80);
        ctx.lineTo(centerX + 120, centerY + 80);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (modelType === 'vae') {
        const smearRadius = 40 + t * 60;

        dataPoints.forEach(p => {
          const gradient = ctx.createRadialGradient(
            centerX + p.x, centerY + p.y, 0,
            centerX + p.x, centerY + p.y, smearRadius * t
          );
          gradient.addColorStop(0, getClusterColor(p.label).replace(')', ', 0.6)').replace('rgb', 'rgba'));
          gradient.addColorStop(0.5, getClusterColor(p.label).replace(')', ', 0.2)').replace('rgb', 'rgba'));
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, smearRadius * t, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        });

        dataPoints.forEach(p => {
          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = getClusterColor(p.label);
          ctx.fill();
        });

        if (t > 0.5) {
          ctx.font = '11px var(--font-mono)';
          ctx.fillStyle = 'var(--accent)';
          ctx.textAlign = 'center';
          ctx.globalAlpha = (t - 0.5) * 2;
          ctx.fillText('Distributions overlap', centerX, centerY - 10);
          ctx.fillText('filling the void', centerX, centerY + 6);
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, 180 * t, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 * t})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (modelType === 'gan') {
        const gridSize = 12;
        const spacing = 25;
        const startX = centerX - (gridSize * spacing) / 2;
        const startY = centerY - (gridSize * spacing) / 2;

        for (let i = 0; i <= gridSize; i++) {
          for (let j = 0; j <= gridSize; j++) {
            const u = i / gridSize;
            const v = j / gridSize;

            let targetX = startX + i * spacing;
            let targetY = startY + j * spacing;

            const clusterIdx = (u < 0.5 ? 0 : 1) + (v < 0.5 ? 0 : 2);
            const cluster = [
              { cx: -120, cy: -80 },
              { cx: 120, cy: -80 },
              { cx: -120, cy: 80 },
              { cx: 120, cy: 80 },
            ][clusterIdx];

            const localU = (u < 0.5 ? u * 2 : (u - 0.5) * 2) - 0.5;
            const localV = (v < 0.5 ? v * 2 : (v - 0.5) * 2) - 0.5;

            const stretchedX = centerX + cluster.cx + localU * 60;
            const stretchedY = centerY + cluster.cy + localV * 60;

            const finalX = targetX * (1 - t) + stretchedX * t;
            const finalY = targetY * (1 - t) + stretchedY * t;

            ctx.beginPath();
            ctx.arc(finalX, finalY, 3, 0, Math.PI * 2);

            const hue = 200 + u * 60 + v * 40;
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.fill();
          }
        }

        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            const u1 = i / gridSize, v1 = j / gridSize;
            const u2 = (i + 1) / gridSize, v2 = j / gridSize;
            const u3 = i / gridSize, v3 = (j + 1) / gridSize;

            const getPos = (u: number, v: number) => {
              let targetX = startX + u * gridSize * spacing;
              let targetY = startY + v * gridSize * spacing;

              const clusterIdx = (u < 0.5 ? 0 : 1) + (v < 0.5 ? 0 : 2);
              const cluster = [
                { cx: -120, cy: -80 },
                { cx: 120, cy: -80 },
                { cx: -120, cy: 80 },
                { cx: 120, cy: 80 },
              ][clusterIdx];

              const localU = (u < 0.5 ? u * 2 : (u - 0.5) * 2) - 0.5;
              const localV = (v < 0.5 ? v * 2 : (v - 0.5) * 2) - 0.5;

              const stretchedX = centerX + cluster.cx + localU * 60;
              const stretchedY = centerY + cluster.cy + localV * 60;

              return {
                x: targetX * (1 - t) + stretchedX * t,
                y: targetY * (1 - t) + stretchedY * t,
              };
            };

            const p1 = getPos(u1, v1);
            const p2 = getPos(u2, v2);
            const p3 = getPos(u1, v3);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
          }
        }

        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = 'var(--text-dim)';
        ctx.textAlign = 'left';
        ctx.fillText(t < 0.5 ? 'Uniform noise grid' : 'Stretched to fit data', 10, 20);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dataPoints, modelType, animationProgress]);

  const handleModelChange = (type: ModelType) => {
    setAnimationProgress(0);
    setModelType(type);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { type: 'autoencoder' as ModelType, label: 'Standard AE', color: '#ff4444' },
          { type: 'vae' as ModelType, label: 'VAE (Smearing)', color: 'var(--accent)' },
          { type: 'gan' as ModelType, label: 'GAN (Stretching)', color: '#ffe66d' },
        ].map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => handleModelChange(type)}
            style={{
              background: modelType === type ? `${color}22` : 'transparent',
              border: `1px solid ${modelType === type ? color : 'var(--border-strong)'}`,
              color: modelType === type ? color : 'var(--text-primary)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {label}
          </button>
        ))}
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
          {modelType === 'autoencoder' && (
            <>
              <strong style={{ color: '#ff4444' }}>Standard Autoencoder:</strong> Maps each input to a single point. The space between clusters is empty—decoding from there produces noise. Like memorizing GPS coordinates but not knowing the roads.
            </>
          )}
          {modelType === 'vae' && (
            <>
              <strong style={{ color: 'var(--accent)' }}>VAE (Smearing):</strong> Maps each input to a probability distribution. KL divergence forces these &quot;clouds&quot; to overlap, filling the void. Like shining wide spotlights that illuminate the dark spaces between.
            </>
          )}
          {modelType === 'gan' && (
            <>
              <strong style={{ color: '#ffe66d' }}>GAN (Stretching):</strong> Starts with continuous noise and learns to stretch it onto data. The grid stays connected as it deforms. Like stretching a rubber sheet over rocky terrain—it conforms but stays intact.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
