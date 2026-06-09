'use client';

import { useRef, useState } from 'react';
import styles from '../app/eigenvalues/visualization.module.css';

export default function LinearTransformation({ initialMatrix = [[2, 1], [1, 2]] }) {
  const [vector, setVector] = useState({ x: 1, y: 0.5 });
  const [matrix] = useState(initialMatrix);
  const svgRef = useRef(null);

  // Calculate transformed vector Ax
  const transformed = {
    x: matrix[0][0] * vector.x + matrix[0][1] * vector.y,
    y: matrix[1][0] * vector.x + matrix[1][1] * vector.y
  };

  // Eigenvector check (collinearity)
  const crossProduct = vector.x * transformed.y - vector.y * transformed.x;
  const isEigen = Math.abs(crossProduct) < 0.1 && (vector.x !== 0 || vector.y !== 0);
  const eigenvalue = isEigen ? (vector.x !== 0 ? transformed.x / vector.x : transformed.y / vector.y) : null;

  const handleDrag = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 40; // Scale 40px = 1 unit
    const y = -(e.clientY - rect.top - rect.height / 2) / 40;
    setVector({ x, y });
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) handleDrag(e);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h3>Explore Linear Transformations</h3>
        <p>Drag the <strong>blue vector (x)</strong> to see how matrix A transforms it into the <strong>rose vector (Ax)</strong>.</p>

        {isEigen && (
          <div className={styles.eigenAlert}>
            <span>🎉 <strong>Eigenvector found!</strong></span>
            <span style={{ marginLeft: '1rem', borderLeft: '1px solid hsla(var(--accent-hsl), 0.3)', paddingLeft: '1rem' }}>
              λ ≈ <strong>{eigenvalue.toFixed(2)}</strong>
            </span>
          </div>
        )}
      </div>

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox="-200 -200 400 400"
        onMouseMove={handleMouseMove}
        onMouseDown={handleDrag}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <marker id="arrow-head-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
          </marker>
          <marker id="arrow-head-rose" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
          </marker>
        </defs>

        {/* Grid and Axes */}
        <line x1="-200" y1="0" x2="200" y2="0" stroke="var(--border-subtle)" strokeWidth="1" />
        <line x1="0" y1="-200" x2="0" y2="200" stroke="var(--border-subtle)" strokeWidth="1" />

        {/* Input Vector x */}
        <line
          x1="0" y1="0"
          x2={vector.x * 40}
          y2={-vector.y * 40}
          stroke="#22d3ee"
          strokeWidth="3"
          markerEnd="url(#arrow-head-blue)"
          style={{ cursor: 'pointer' }}
        />

        {/* Transformed Vector Ax */}
        <line
          x1="0" y1="0"
          x2={transformed.x * 40}
          y2={-transformed.y * 40}
          stroke="#f43f5e"
          strokeWidth="3"
          markerEnd="url(#arrow-head-rose)"
          opacity="0.9"
        />

        {/* Dashed line connecting tips to show relation */}
        <line
          x1={vector.x * 40} y1={-vector.y * 40}
          x2={transformed.x * 40} y2={-transformed.y * 40}
          stroke="var(--text-dim)"
          strokeWidth="1"
          strokeDasharray="4"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
