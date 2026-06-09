'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  t: number;
  u: number;
}

export default function SwissRollViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [showGeodesic, setShowGeodesic] = useState(true);
  const [showEuclidean, setShowEuclidean] = useState(true);
  const [viewMode, setViewMode] = useState<'rolled' | 'unfolded'>('rolled');
  const [unfoldProgress, setUnfoldProgress] = useState(0);
  const animationRef = useRef<number>(0);

  const gridResolution = { t: 40, y: 12 };

  const generateSwissRollGrid = useCallback((): Point3D[][] => {
    const grid: Point3D[][] = [];
    const tMin = 1.5 * Math.PI;
    const tMax = 4.5 * Math.PI;
    const yMin = -8;
    const yMax = 8;

    for (let i = 0; i <= gridResolution.t; i++) {
      const row: Point3D[] = [];
      const tFrac = i / gridResolution.t;
      const t = tMin + tFrac * (tMax - tMin);

      for (let j = 0; j <= gridResolution.y; j++) {
        const yFrac = j / gridResolution.y;
        const y = yMin + yFrac * (yMax - yMin);

        row.push({
          x: t * Math.cos(t),
          y: y,
          z: t * Math.sin(t),
          t: t,
          u: tFrac,
        });
      }
      grid.push(row);
    }
    return grid;
  }, []);

  const [grid] = useState<Point3D[][]>(generateSwissRollGrid);

  const pointA = { tIdx: 8, yIdx: 6 };
  const pointB = { tIdx: 32, yIdx: 6 };

  const getUnfoldedPosition = useCallback((point: Point3D, progress: number): Point3D => {
    const tMin = 1.5 * Math.PI;
    const tMax = 4.5 * Math.PI;
    const unfoldedX = ((point.t - tMin) / (tMax - tMin)) * 180 - 90;
    const unfoldedZ = 0;

    return {
      x: point.x * (1 - progress) + unfoldedX * progress,
      y: point.y,
      z: point.z * (1 - progress) + unfoldedZ * progress,
      t: point.t,
      u: point.u,
    };
  }, []);

  const project = useCallback((point: Point3D, rotX: number, rotY: number): { x: number; y: number; depth: number } => {
    let { x, y, z } = point;

    let cosY = Math.cos(rotY);
    let sinY = Math.sin(rotY);
    let newX = x * cosY + z * sinY;
    let newZ = -x * sinY + z * cosY;
    x = newX;
    z = newZ;

    let cosX = Math.cos(rotX);
    let sinX = Math.sin(rotX);
    let newY = y * cosX - z * sinX;
    newZ = y * sinX + z * cosX;
    y = newY;
    z = newZ;

    const scale = 5;
    const perspective = 300 / (300 + z);

    return {
      x: x * scale * perspective,
      y: y * scale * perspective,
      depth: z,
    };
  }, []);

  const getColor = (u: number): string => {
    const hue = 180 + u * 180;
    return `hsl(${hue}, 75%, 50%)`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetUnfold = viewMode === 'unfolded' ? 1 : 0;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setUnfoldProgress(prev => {
        const diff = targetUnfold - prev;
        return prev + diff * 0.08;
      });

      const rotY = isDragging ? rotation.y : rotation.y + 0.004;
      if (!isDragging) {
        setRotation(prev => ({ ...prev, y: rotY }));
      }

      const transformedGrid = grid.map(row =>
        row.map(p => getUnfoldedPosition(p, unfoldProgress))
      );

      const faces: { points: { x: number; y: number }[]; depth: number; u: number }[] = [];

      for (let i = 0; i < gridResolution.t; i++) {
        for (let j = 0; j < gridResolution.y; j++) {
          const p1 = project(transformedGrid[i][j], rotation.x, rotY);
          const p2 = project(transformedGrid[i + 1][j], rotation.x, rotY);
          const p3 = project(transformedGrid[i + 1][j + 1], rotation.x, rotY);
          const p4 = project(transformedGrid[i][j + 1], rotation.x, rotY);

          const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
          const u = i / gridResolution.t;

          faces.push({
            points: [
              { x: centerX + p1.x, y: centerY + p1.y },
              { x: centerX + p2.x, y: centerY + p2.y },
              { x: centerX + p3.x, y: centerY + p3.y },
              { x: centerX + p4.x, y: centerY + p4.y },
            ],
            depth: avgDepth,
            u: u,
          });
        }
      }

      faces.sort((a, b) => a.depth - b.depth);

      faces.forEach(face => {
        const alpha = 0.4 + (face.depth + 80) / 160 * 0.4;
        const baseColor = getColor(face.u);

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = baseColor.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.6})`);
        ctx.fill();

        ctx.strokeStyle = baseColor.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      const pA = transformedGrid[pointA.tIdx][pointA.yIdx];
      const pB = transformedGrid[pointB.tIdx][pointB.yIdx];
      const projA = project(pA, rotation.x, rotY);
      const projB = project(pB, rotation.x, rotY);

      if (showEuclidean) {
        ctx.beginPath();
        ctx.moveTo(centerX + projA.x, centerY + projA.y);
        ctx.lineTo(centerX + projB.x, centerY + projB.y);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        const midX = (projA.x + projB.x) / 2;
        const midY = (projA.y + projB.y) / 2;
        ctx.font = 'bold 11px var(--font-mono)';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('Euclidean', centerX + midX, centerY + midY - 8);
      }

      if (showGeodesic) {
        const pathPoints: Point3D[] = [];
        const steps = 60;

        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const tIdx = pointA.tIdx + frac * (pointB.tIdx - pointA.tIdx);
          const floorIdx = Math.floor(tIdx);
          const ceilIdx = Math.min(Math.ceil(tIdx), gridResolution.t);
          const localFrac = tIdx - floorIdx;

          const p1 = transformedGrid[floorIdx][pointA.yIdx];
          const p2 = transformedGrid[ceilIdx][pointA.yIdx];

          pathPoints.push({
            x: p1.x * (1 - localFrac) + p2.x * localFrac,
            y: p1.y * (1 - localFrac) + p2.y * localFrac,
            z: p1.z * (1 - localFrac) + p2.z * localFrac,
            t: p1.t * (1 - localFrac) + p2.t * localFrac,
            u: p1.u * (1 - localFrac) + p2.u * localFrac,
          });
        }

        ctx.beginPath();
        pathPoints.forEach((p, i) => {
          const proj = project(p, rotation.x, rotY);
          if (i === 0) {
            ctx.moveTo(centerX + proj.x, centerY + proj.y);
          } else {
            ctx.lineTo(centerX + proj.x, centerY + proj.y);
          }
        });
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.stroke();

        const geodesicMidPoint = pathPoints[Math.floor(steps / 2)];
        const geodesicMidProj = project(geodesicMidPoint, rotation.x, rotY);
        ctx.font = 'bold 11px var(--font-mono)';
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'center';
        ctx.fillText('Geodesic', centerX + geodesicMidProj.x, centerY + geodesicMidProj.y + 16);
      }

      ctx.beginPath();
      ctx.arc(centerX + projA.x, centerY + projA.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#00f3ff';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = 'bold 14px var(--font-sans)';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', centerX + projA.x, centerY + projA.y);

      ctx.beginPath();
      ctx.arc(centerX + projB.x, centerY + projB.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ff00ff';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText('B', centerX + projB.x, centerY + projB.y);

      if (viewMode === 'unfolded' && unfoldProgress > 0.8) {
        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.textAlign = 'center';
        ctx.fillText('Unfolded: Geodesic distance is now visible as straight-line distance', centerX, rect.height - 15);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [grid, rotation, isDragging, showGeodesic, showEuclidean, viewMode, unfoldProgress, project, getUnfoldedPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotation(prev => ({
      x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.x + dy * 0.005)),
      y: prev.y + dx * 0.005,
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const pA = grid[pointA.tIdx][pointA.yIdx];
  const pB = grid[pointB.tIdx][pointB.yIdx];
  const euclideanDist = Math.sqrt(
    Math.pow(pA.x - pB.x, 2) + Math.pow(pA.y - pB.y, 2) + Math.pow(pA.z - pB.z, 2)
  );
  const geodesicDist = Math.abs(pA.t - pB.t);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setViewMode(viewMode === 'rolled' ? 'unfolded' : 'rolled')}
          style={{
            background: 'var(--accent)',
            color: 'hsl(var(--bg-primary-hsl))',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {viewMode === 'rolled' ? 'Unfold Manifold' : 'Roll Up'}
        </button>
        <button
          onClick={() => setShowGeodesic(!showGeodesic)}
          style={{
            background: showGeodesic ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            border: `1px solid ${showGeodesic ? '#00ff88' : 'var(--border-strong)'}`,
            color: showGeodesic ? '#00ff88' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Geodesic
        </button>
        <button
          onClick={() => setShowEuclidean(!showEuclidean)}
          style={{
            background: showEuclidean ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${showEuclidean ? '#ff4444' : 'var(--border-strong)'}`,
            color: showEuclidean ? '#ff4444' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Euclidean
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '420px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
        <div style={{ padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Euclidean Distance</div>
          <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-mono)', color: '#ff4444' }}>{euclideanDist.toFixed(1)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Straight line through space</div>
        </div>

        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ fontSize: '2rem', color: 'var(--text-dim)' }}>→</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>UNFOLD</div>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Geodesic Distance</div>
          <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-mono)', color: '#00ff88' }}>{geodesicDist.toFixed(1)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Along the manifold surface</div>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '1rem' }}>
        Drag to rotate. Points A and B appear close in 3D but are far apart on the spiral surface.
      </p>
    </div>
  );
}
