'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface PathPoint {
  x: number;
  y: number;
  cost: number;
}

export default function GeodesicComputationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [decoderCalls, setDecoderCalls] = useState(0);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'sampling' | 'optimizing' | 'done'>('idle');

  const maxIterations = 12;
  const pointsPerPath = 20;

  const centerX = 200;
  const centerY = 175;
  const radius = 120;

  const pointA = { x: centerX - 100, y: centerY + 60 };
  const pointB = { x: centerX + 100, y: centerY - 40 };

  const computeCost = useCallback((x: number, y: number) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return 1 / (1 + Math.exp(-(dist - 60) / 20));
  }, []);

  const initializePath = useCallback(() => {
    const path: PathPoint[] = [];
    for (let i = 0; i <= pointsPerPath; i++) {
      const t = i / pointsPerPath;
      const x = pointA.x + (pointB.x - pointA.x) * t;
      const y = pointA.y + (pointB.y - pointA.y) * t;
      path.push({ x, y, cost: computeCost(x, y) });
    }
    return path;
  }, [computeCost]);

  const optimizePath = useCallback((path: PathPoint[], iterNum: number): PathPoint[] => {
    const newPath = [...path];
    const pullStrength = Math.min(0.15, 0.05 + iterNum * 0.015);

    for (let i = 1; i < newPath.length - 1; i++) {
      const toCenterX = centerX - newPath[i].x;
      const toCenterY = centerY - newPath[i].y;
      const dist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);

      if (dist > 30) {
        newPath[i] = {
          x: newPath[i].x + toCenterX * pullStrength,
          y: newPath[i].y + toCenterY * pullStrength,
          cost: 0,
        };
        newPath[i].cost = computeCost(newPath[i].x, newPath[i].y);
      }
    }

    return newPath;
  }, [computeCost]);

  const startComputation = useCallback(() => {
    if (isComputing) return;

    setIsComputing(true);
    setIteration(0);
    setDecoderCalls(0);
    setShowComparison(false);
    setPhase('sampling');

    const initialPath = initializePath();
    setCurrentPath(initialPath);
    setDecoderCalls(pointsPerPath * 4);

    setTimeout(() => {
      setPhase('optimizing');
      let currentIter = 0;
      let path = initialPath;

      const iterate = () => {
        if (currentIter >= maxIterations) {
          setPhase('done');
          setIsComputing(false);
          setShowComparison(true);
          return;
        }

        path = optimizePath(path, currentIter);
        setCurrentPath([...path]);
        currentIter++;
        setIteration(currentIter);
        setDecoderCalls(prev => prev + pointsPerPath * 2);

        setTimeout(iterate, 300);
      };

      setTimeout(iterate, 500);
    }, 800);
  }, [isComputing, initializePath, optimizePath]);

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

    for (let r = radius + 30; r > 0; r -= 6) {
      const alpha = (1 - r / (radius + 30)) * 0.12;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#a78bfa';
    ctx.fill();

    ctx.font = '9px var(--font-mono)';
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';
    ctx.fillText('Low Cost', centerX, centerY + 18);
    ctx.fillText('(High Variance)', centerX, centerY + 30);

    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (phase === 'optimizing' || phase === 'sampling') {
        for (let i = 1; i < currentPath.length - 1; i++) {
          const point = currentPath[i];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 136, ${0.5 + point.cost * 0.5})`;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    ctx.beginPath();
    ctx.arc(pointA.x, pointA.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe66d';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 9px var(--font-sans)';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', pointA.x, pointA.y);

    ctx.beginPath();
    ctx.arc(pointB.x, pointB.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe66d';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fillText('B', pointB.x, pointB.y);

    if (showComparison) {
      ctx.font = '10px var(--font-mono)';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 107, 107, 0.8)';
      ctx.fillText('LERP (instant)', pointA.x + 30, pointA.y + 45);
      ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.fillText('Geodesic (' + decoderCalls + ' decoder calls)', pointA.x + 30, pointA.y + 60);
    }

  }, [currentPath, phase, showComparison, decoderCalls]);

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <button
          onClick={startComputation}
          disabled={isComputing}
          style={{
            background: isComputing ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.3)',
            border: '1px solid #00ff88',
            color: '#00ff88',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: isComputing ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {isComputing ? 'Computing...' : 'Compute Geodesic'}
        </button>

        {phase !== 'idle' && (
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}>
            <span>
              Iteration: <strong style={{ color: '#00ff88' }}>{iteration}</strong>/{maxIterations}
            </span>
            <span>
              Decoder Calls: <strong style={{ color: '#ff6b6b' }}>{decoderCalls}</strong>
            </span>
          </div>
        )}
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

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: phase === 'idle' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            color: phase === 'idle' ? 'var(--text-primary)' : 'var(--text-dim)',
          }}>
            1. Initialize
          </span>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: phase === 'sampling' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: phase === 'sampling' ? '#00ff88' : 'var(--text-dim)',
          }}>
            2. Sample Costs
          </span>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: phase === 'optimizing' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: phase === 'optimizing' ? '#00ff88' : 'var(--text-dim)',
          }}>
            3. Optimize Path
          </span>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: phase === 'done' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: phase === 'done' ? '#a78bfa' : 'var(--text-dim)',
          }}>
            4. Done
          </span>
        </div>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          margin: 0,
          lineHeight: 1.6,
        }}>
          {phase === 'idle' && 'Click "Compute Geodesic" to watch the iterative optimization process.'}
          {phase === 'sampling' && 'Sampling the cost (Fisher Information) at each point along the initial path... This requires running the decoder at each point!'}
          {phase === 'optimizing' && `Iteration ${iteration}: Moving path points toward lower-cost regions. Each step requires re-evaluating the decoder...`}
          {phase === 'done' && (
            <>
              <strong style={{ color: '#ff6b6b' }}>Total: {decoderCalls} decoder forward passes</strong> just to find one path between two points.
              Compare this to LERP (0 decoder calls) or SLERP (0 decoder calls).
              <em style={{ color: 'var(--text-dim)' }}> This is why geodesics are rarely used in production.</em>
            </>
          )}
        </p>
      </div>

      {showComparison && (
        <div style={{
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#ff6b6b', fontWeight: 700, fontSize: '1.5rem' }}>0</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>LERP decoder calls</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Instant ⚡</div>
          </div>
          <div style={{
            padding: '1rem',
            background: 'rgba(78, 205, 196, 0.1)',
            border: '1px solid rgba(78, 205, 196, 0.3)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#4ecdc4', fontWeight: 700, fontSize: '1.5rem' }}>0</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>SLERP decoder calls</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Instant ⚡</div>
          </div>
          <div style={{
            padding: '1rem',
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#00ff88', fontWeight: 700, fontSize: '1.5rem' }}>{decoderCalls}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Geodesic decoder calls</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>~{(decoderCalls * 0.05).toFixed(1)}s on GPU</div>
          </div>
        </div>
      )}
    </div>
  );
}
