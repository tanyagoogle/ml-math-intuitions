'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../app/eigenvalues/visualization.module.css';



export default function MatrixTransformationViz() {
  // Mode: 'scale', 'rotate', 'shear', 'custom'
  const [preset, setPreset] = useState<'scale' | 'rotate' | 'shear'>('scale');

  // Params
  const [param1, setParam1] = useState(1.0); // Scale: lambda, Rotate: theta, Shear: k
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0); // 0 to 1 for lerp
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define Matrix based on preset
  let a11 = 1, a12 = 0, a21 = 0, a22 = 1;
  let description = "";

  if (preset === 'scale') {
    // Uniform Scaling: [[L, 0], [0, L]]
    a11 = param1; a22 = param1;
    description = "Uniform Scaling (Eigenvalues = λ)";
  } else if (preset === 'rotate') {
    // Rotation: [[cos, -sin], [sin, cos]]
    const rad = param1 * Math.PI / 180;
    a11 = Math.cos(rad); a12 = -Math.sin(rad);
    a21 = Math.sin(rad); a22 = Math.cos(rad);
    description = "Rotation (Complex Eigenvalues, Norm = 1)";
  } else if (preset === 'shear') {
    // Non-Normal / Transient: [[0.9, k], [0, 0.9]]
    // Eigenvalues are 0.9 (stable), but shear 'k' adds norm
    const base = 0.9;
    a11 = base; a12 = param1; // param1 is shear amount
    a21 = 0; a22 = base;
    description = "Non-Normal Matrix (Stable Eigenvalues, Unstable Norm?)";
  }

  // --- Spectral Calculations ---
  // Trace and Determinant
  const tr = a11 + a22;
  const det = a11 * a22 - a12 * a21;

  // Eigenvalues: lambda^2 - tr*lambda + det = 0
  const discriminant = tr * tr - 4 * det;
  let rho = 0;

  if (discriminant >= 0) {
    const l1 = (tr + Math.sqrt(discriminant)) / 2;
    const l2 = (tr - Math.sqrt(discriminant)) / 2;
    rho = Math.max(Math.abs(l1), Math.abs(l2));
  } else {
    // Complex: real part = tr/2, imag = sqrt(-disc)/2
    // Modulus = sqrt(real^2 + imag^2) = sqrt( (tr^2 - (tr^2 - 4det))/4 ) = sqrt(det)
    rho = Math.sqrt(det);
  }

  // Spectral Norm (sigma_max)
  // Largest eigenvalue of A^T A
  // A^T A = [[a, c], [b, d]] * [[a, b], [c, d]]
  // = [[a^2+c^2, ab+cd], [ab+cd, b^2+d^2]]
  const ata11 = a11 * a11 + a21 * a21;
  const ata12 = a11 * a12 + a21 * a22; // Symmetric
  const ata22 = a12 * a12 + a22 * a22;

  const trATA = ata11 + ata22;
  const detATA = ata11 * ata22 - ata12 * ata12; // ata12 = ata21
  // ATA Eigenvalues are always real >= 0
  const discATA = trATA * trATA - 4 * detATA;
  // Use max eigenvalue
  const lambdaMaxATA = (trATA + Math.sqrt(Math.max(0, discATA))) / 2;
  const norm = Math.sqrt(lambdaMaxATA);

  // Grid config
  const GRID_SIZE = 10;
  const SPACING = 20;

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    let frameId: number;
    const animate = () => {
      setAnimationStep(prev => {
        const next = prev + 0.05;
        if (next >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return next;
      });
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isAnimating]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Center origin
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(1, -1); // Flip Y

    // Interpolate from Identity to Current Matrix
    // M(t) = I + (A - I) * t
    const curA11 = 1 + (a11 - 1) * animationStep;
    const curA12 = 0 + (a12 - 0) * animationStep;
    const curA21 = 0 + (a21 - 0) * animationStep;
    const curA22 = 1 + (a22 - 1) * animationStep;

    const transform = (x: number, y: number) => {
      return {
        x: curA11 * x + curA12 * y,
        y: curA21 * x + curA22 * y
      };
    };

    // Draw Transformed Grid
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
      ctx.strokeStyle = i === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      // Start/End in original space
      const x = i * SPACING;
      // Transform top/bottom points
      const start = transform(x, -GRID_SIZE * SPACING);
      const end = transform(x, GRID_SIZE * SPACING);

      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Horizontal lines
    for (let j = -GRID_SIZE; j <= GRID_SIZE; j++) {
      ctx.strokeStyle = j === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      // Transform left/right points
      const y = j * SPACING;
      const start = transform(-GRID_SIZE * SPACING, y);
      const end = transform(GRID_SIZE * SPACING, y);

      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Draw Basis Vectors
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
      const headLen = 10;
      const angle = Math.atan2(toY - fromY, toX - fromX);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
      ctx.fill();
    };

    const VECTOR_SCALE = 40;
    const iHat = transform(VECTOR_SCALE, 0);
    const jHat = transform(0, VECTOR_SCALE);

    drawArrow(0, 0, iHat.x, iHat.y, '#f43f5e'); // Rose (Column 1)
    drawArrow(0, 0, jHat.x, jHat.y, '#22d3ee'); // Cyan (Column 2)

    ctx.restore();
  }, [a11, a12, a21, a22, animationStep]);

  const handleApply = () => {
    setAnimationStep(0);
    setIsAnimating(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h3>Visualizing Matrix Multiplication</h3>
        <p>
          Select a preset to see how matrices transform space. Higher shear leads to more extreme singular values.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <button
            className={styles.button}
            style={{ background: preset === 'scale' ? 'var(--accent)' : 'hsla(0, 0%, 100%, 0.05)', color: preset === 'scale' ? 'black' : 'var(--text-primary)', border: preset === 'scale' ? 'none' : '1px solid var(--border-subtle)' }}
            onClick={() => { setPreset('scale'); setParam1(1.1); setAnimationStep(1); }}
          >
            Scaling
          </button>
          <button
            className={styles.button}
            style={{ background: preset === 'rotate' ? 'var(--accent)' : 'hsla(0, 0%, 100%, 0.05)', color: preset === 'rotate' ? 'black' : 'var(--text-primary)', border: preset === 'rotate' ? 'none' : '1px solid var(--border-subtle)' }}
            onClick={() => { setPreset('rotate'); setParam1(45); setAnimationStep(1); }}
          >
            Rotation
          </button>
          <button
            className={styles.button}
            style={{ background: preset === 'shear' ? 'var(--accent)' : 'hsla(0, 0%, 100%, 0.05)', color: preset === 'shear' ? 'black' : 'var(--text-primary)', border: preset === 'shear' ? 'none' : '1px solid var(--border-subtle)' }}
            onClick={() => { setPreset('shear'); setParam1(1.0); setAnimationStep(1); }}
          >
            Scaling + Shear
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div className={styles.matrixDisplay} style={{ marginBottom: 0 }}>
            <div className={styles.matrixLabel}>A = </div>
            <div className={styles.matrixBrackets}>
              <div className={styles.matrixRow}>
                <span style={{ color: '#f43f5e' }}>{a11.toFixed(2)}</span>
                <span style={{ color: '#22d3ee', marginLeft: '1rem' }}>{a12.toFixed(2)}</span>
              </div>
              <div className={styles.matrixRow}>
                <span style={{ color: '#f43f5e' }}>{a21.toFixed(2)}</span>
                <span style={{ color: '#22d3ee', marginLeft: '1rem' }}>{a22.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left', minWidth: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Spectral Radius $\rho(A)$</span>
              <strong style={{ color: rho > 1 ? '#f43f5e' : '#10b981' }}>{rho.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Spectral Norm $|A|_2$</span>
              <strong style={{ color: norm > 1 ? '#fbbf24' : 'var(--accent)' }}>{norm.toFixed(2)}</strong>
            </div>
            {norm > 1 && rho <= 1 && (
              <div className={styles.eigenAlert} style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                ⚠️ Transient Growth
              </div>
            )}
          </div>
        </div>

        <div className={styles.sliderContainer} style={{ flexDirection: 'column', gap: '1.5rem', background: 'transparent', padding: 0 }}>
          <div className={styles.sliderLabel}>
            {preset === 'scale' && <span>Factor $\lambda$ = <strong>{param1.toFixed(2)}</strong></span>}
            {preset === 'rotate' && <span>Angle $\theta$ = <strong>{param1}°</strong></span>}
            {preset === 'shear' && <span>Shear $k$ = <strong>{param1.toFixed(2)}</strong></span>}

            <input
              type="range"
              min={preset === 'rotate' ? "0" : (preset === 'shear' ? "0" : "0.5")}
              max={preset === 'rotate' ? "360" : "5"}
              step={preset === 'rotate' ? "5" : "0.1"}
              className={styles.slider}
              value={param1}
              style={{ width: '250px' }}
              onChange={(e) => {
                setParam1(parseFloat(e.target.value));
                setAnimationStep(1);
              }}
            />
          </div>
          <button className={styles.button} onClick={handleApply} style={{ padding: '0.5rem 2rem' }}>
            Replay
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className={styles.svg}
      />
    </div>
  );
}
