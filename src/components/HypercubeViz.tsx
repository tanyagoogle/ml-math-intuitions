'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Vertex {
  coords: number[];
}

export default function HypercubeViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimension, setDimension] = useState(3);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>(0);

  const generateHypercube = useCallback((dim: number): Vertex[] => {
    const vertices: Vertex[] = [];
    const numVertices = Math.pow(2, dim);

    for (let i = 0; i < numVertices; i++) {
      const coords: number[] = [];
      for (let d = 0; d < dim; d++) {
        coords.push((i >> d) & 1 ? 1 : -1);
      }
      vertices.push({ coords });
    }
    return vertices;
  }, []);

  const generateEdges = useCallback((dim: number): [number, number][] => {
    const edges: [number, number][] = [];
    const numVertices = Math.pow(2, dim);

    for (let i = 0; i < numVertices; i++) {
      for (let d = 0; d < dim; d++) {
        const neighbor = i ^ (1 << d);
        if (neighbor > i) {
          edges.push([i, neighbor]);
        }
      }
    }
    return edges;
  }, []);

  const project = useCallback((vertex: Vertex, rot: number, dim: number): { x: number; y: number; depth: number } => {
    let coords = [...vertex.coords];

    while (coords.length < 4) {
      coords.push(0);
    }

    for (let d = coords.length - 1; d >= 2; d--) {
      const angle = rot * (1 + d * 0.3);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const x = coords[0];
      const w = coords[d];
      coords[0] = x * cos - w * sin;
      coords[d] = x * sin + w * cos;

      const y = coords[1];
      coords[1] = y * cos - w * sin * 0.5;
    }

    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const x = coords[0];
    const y = coords[1];
    coords[0] = x * cos - y * sin;
    coords[1] = x * sin + y * cos;

    const cos2 = Math.cos(rot * 0.7);
    const sin2 = Math.sin(rot * 0.7);
    const yy = coords[1];
    const zz = coords.length > 2 ? coords[2] : 0;
    coords[1] = yy * cos2 - zz * sin2;
    if (coords.length > 2) coords[2] = yy * sin2 + zz * cos2;

    const scale = 80;
    const z = coords.length > 2 ? coords[2] : 0;
    const perspective = dim > 2 ? 300 / (300 + z * 30) : 1;

    return {
      x: coords[0] * scale * perspective,
      y: coords[1] * scale * perspective,
      depth: z,
    };
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

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      rotationRef.current += 0.008;

      const vertices = generateHypercube(dimension);
      const edges = generateEdges(dimension);

      const projected = vertices.map(v => project(v, rotationRef.current, dimension));

      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        const avgDepth = (p1.depth + p2.depth) / 2;
        const alpha = 0.3 + (avgDepth + 2) / 4 * 0.5;

        const gradient = ctx.createLinearGradient(
          centerX + p1.x, centerY + p1.y,
          centerX + p2.x, centerY + p2.y
        );
        gradient.addColorStop(0, `hsla(${200 + dimension * 20}, 70%, 60%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${260 + dimension * 20}, 70%, 60%, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(centerX + p1.x, centerY + p1.y);
        ctx.lineTo(centerX + p2.x, centerY + p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      projected.forEach((p, i) => {
        const alpha = 0.5 + (p.depth + 2) / 4 * 0.5;
        const size = 4 + (p.depth + 2) / 4 * 3;

        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${180 + dimension * 30}, 80%, 65%, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${180 + dimension * 30}, 80%, 65%, ${alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimension, generateHypercube, generateEdges, project]);

  const numVertices = Math.pow(2, dimension);
  const numEdges = dimension * Math.pow(2, dimension - 1);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[2, 3, 4, 5].map(d => (
          <button
            key={d}
            onClick={() => setDimension(d)}
            style={{
              background: dimension === d ? 'var(--accent)' : 'transparent',
              color: dimension === d ? 'hsl(var(--bg-primary-hsl))' : 'var(--text-primary)',
              border: `1px solid ${dimension === d ? 'var(--accent)' : 'var(--border-strong)'}`,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              minWidth: '80px',
            }}
          >
            {d}D
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Dimensions</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{dimension}</div>
        </div>
        <div style={{ padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Vertices</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{numVertices}</div>
        </div>
        <div style={{ padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Edges</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{numEdges}</div>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '1rem' }}>
        {dimension === 4 && 'The tesseract (4D hypercube) has 16 vertices and 32 edges.'}
        {dimension === 5 && 'A 5D hypercube has 32 vertices in a space impossible to directly visualize.'}
        {dimension === 3 && 'A familiar 3D cube with 8 vertices and 12 edges.'}
        {dimension === 2 && 'A 2D square with 4 vertices and 4 edges.'}
      </p>
    </div>
  );
}
