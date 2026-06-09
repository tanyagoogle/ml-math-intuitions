'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// 1. CORE INTUITION: Vector Field with Flowing Particles
// ============================================================================
export function VectorFieldFlowViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 150; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          age: Math.random() * 100,
        });
      }
    };

    // Vector field: spiral sink
    const getVelocity = (x: number, y: number) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy) + 1;
      // Spiral inward with rotation
      const vx = -dx / r * 0.5 - dy / r * 0.8;
      const vy = -dy / r * 0.5 + dx / r * 0.8;
      return { vx: vx * 2, vy: vy * 2 };
    };

    initParticles();

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw vector field arrows (sparse grid)
      ctx.strokeStyle = 'rgba(78, 205, 196, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 30; x < width; x += 40) {
        for (let y = 30; y < height; y += 40) {
          const { vx, vy } = getVelocity(x, y);
          const mag = Math.sqrt(vx * vx + vy * vy);
          const nx = vx / mag * 12;
          const ny = vy / mag * 12;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + nx, y + ny);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(ny, nx);
          ctx.beginPath();
          ctx.moveTo(x + nx, y + ny);
          ctx.lineTo(x + nx - 4 * Math.cos(angle - 0.5), y + ny - 4 * Math.sin(angle - 0.5));
          ctx.moveTo(x + nx, y + ny);
          ctx.lineTo(x + nx - 4 * Math.cos(angle + 0.5), y + ny - 4 * Math.sin(angle + 0.5));
          ctx.stroke();
        }
      }

      // Update and draw particles
      particlesRef.current.forEach((p) => {
        const { vx, vy } = getVelocity(p.x, p.y);
        p.x += vx * 0.5;
        p.y += vy * 0.5;
        p.age += 1;

        // Reset particle if too old or out of bounds
        if (p.age > 150 || p.x < 0 || p.x > width || p.y < 0 || p.y > height ||
            (Math.abs(p.x - centerX) < 5 && Math.abs(p.y - centerY) < 5)) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.age = 0;
        }

        const alpha = Math.min(1, p.age / 20) * Math.max(0, 1 - p.age / 150);
        ctx.fillStyle = `rgba(0, 243, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw center attractor
      ctx.fillStyle = 'rgba(255, 107, 107, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div style={{ margin: '2rem 0' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={350}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
        Particles following a vector field — each arrow shows "if you're here, move this way"
      </p>
    </div>
  );
}

// ============================================================================
// 2. ODE EXPLORATION: Interactive Vector Field with Equation Selection
// ============================================================================
export function ODEExplorerViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [equation, setEquation] = useState<'spiral' | 'saddle' | 'limit-cycle' | 'chaos'>('spiral');
  const particlesRef = useRef<{ x: number; y: number; trail: { x: number; y: number }[] }[]>([]);
  const animationRef = useRef<number>(0);

  const equations = {
    'spiral': {
      name: 'Spiral Sink',
      desc: 'Damped oscillation — stable equilibrium',
      formula: 'dx/dt = -x - 2y, dy/dt = 2x - y',
      fn: (x: number, y: number) => ({ vx: -x * 0.02 - y * 0.04, vy: x * 0.04 - y * 0.02 }),
    },
    'saddle': {
      name: 'Saddle Point',
      desc: 'Unstable — attracts on one axis, repels on another',
      formula: 'dx/dt = x, dy/dt = -y',
      fn: (x: number, y: number) => ({ vx: x * 0.015, vy: -y * 0.015 }),
    },
    'limit-cycle': {
      name: 'Limit Cycle',
      desc: 'All trajectories converge to a circle',
      formula: 'dx/dt = y + x(1-r²), dy/dt = -x + y(1-r²)',
      fn: (x: number, y: number) => {
        const r2 = x * x + y * y;
        const scale = 0.02;
        return {
          vx: (y + x * (1 - r2 / 10000)) * scale,
          vy: (-x + y * (1 - r2 / 10000)) * scale,
        };
      },
    },
    'chaos': {
      name: 'Double Gyre',
      desc: 'Chaotic mixing — sensitive to initial conditions',
      formula: 'Complex time-varying flow field',
      fn: (x: number, y: number, t: number) => {
        const A = 0.25;
        const eps = 0.25;
        const omega = 0.02;
        const a = eps * Math.sin(omega * t);
        const b = 1 - 2 * eps * Math.sin(omega * t);
        const f = a * (x / 150) * (x / 150) + b * (x / 150);
        const dfx = 2 * a * (x / 150) / 150 + b / 150;
        return {
          vx: -Math.PI * A * Math.sin(Math.PI * f) * Math.cos(Math.PI * y / 150) * 2,
          vy: Math.PI * A * Math.cos(Math.PI * f) * Math.sin(Math.PI * y / 150) * dfx * 2,
        };
      },
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize particles with trails
    particlesRef.current = [];
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: (Math.random() - 0.5) * width * 0.9 + centerX,
        y: (Math.random() - 0.5) * height * 0.9 + centerY,
        trail: [],
      });
    }

    let t = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const eq = equations[equation];
      t += 1;

      // Draw vector field
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 25; x < width; x += 35) {
        for (let y = 25; y < height; y += 35) {
          const relX = x - centerX;
          const relY = y - centerY;
          const { vx, vy } = eq.fn(relX, relY, t);
          const mag = Math.sqrt(vx * vx + vy * vy) + 0.01;
          const nx = vx / mag * 10;
          const ny = vy / mag * 10;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + nx, y + ny);
          ctx.stroke();
        }
      }

      // Update and draw particles with trails
      particlesRef.current.forEach((p, idx) => {
        const relX = p.x - centerX;
        const relY = p.y - centerY;
        const { vx, vy } = eq.fn(relX, relY, t);

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 50) p.trail.shift();

        p.x += vx;
        p.y += vy;

        // Reset if out of bounds
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = (Math.random() - 0.5) * width * 0.8 + centerX;
          p.y = (Math.random() - 0.5) * height * 0.8 + centerY;
          p.trail = [];
        }

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          const hue = (idx * 37) % 360;
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw particle head
        const hue = (idx * 37) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, 1)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw center point
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [equation]);

  const eq = equations[equation];

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(Object.keys(equations) as Array<keyof typeof equations>).map((key) => (
          <button
            key={key}
            onClick={() => setEquation(key)}
            style={{
              padding: '0.5rem 1rem',
              background: equation === key ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              border: equation === key ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: equation === key ? '#a78bfa' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {equations[key].name}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(167, 139, 250, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}>
        <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: '0.25rem' }}>{eq.name}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{eq.desc}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{eq.formula}</div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. NUMERICAL METHODS: Euler vs RK4 Comparison
// ============================================================================
export function NumericalMethodsViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stepSize, setStepSize] = useState(0.3);
  const [isRunning, setIsRunning] = useState(false);
  const [eulerPath, setEulerPath] = useState<{ x: number; y: number }[]>([]);
  const [rk4Path, setRk4Path] = useState<{ x: number; y: number }[]>([]);
  const [truePath, setTruePath] = useState<{ x: number; y: number }[]>([]);

  // Simple harmonic oscillator: dx/dt = y, dy/dt = -x (circular motion)
  const f = (x: number, y: number) => ({ dx: y, dy: -x });

  const runSimulation = useCallback(() => {
    const h = stepSize;
    const steps = Math.floor(8 / h);

    // Initial condition
    let x0 = 1, y0 = 0;

    // True solution (circle)
    const trueP: { x: number; y: number }[] = [];
    for (let t = 0; t <= 8; t += 0.02) {
      trueP.push({ x: Math.cos(t), y: Math.sin(t) });
    }
    setTruePath(trueP);

    // Euler method
    const eulerP: { x: number; y: number }[] = [{ x: x0, y: y0 }];
    let ex = x0, ey = y0;
    for (let i = 0; i < steps; i++) {
      const { dx, dy } = f(ex, ey);
      ex += h * dx;
      ey += h * dy;
      eulerP.push({ x: ex, y: ey });
    }
    setEulerPath(eulerP);

    // RK4 method
    const rk4P: { x: number; y: number }[] = [{ x: x0, y: y0 }];
    let rx = x0, ry = y0;
    for (let i = 0; i < steps; i++) {
      const k1 = f(rx, ry);
      const k2 = f(rx + h/2 * k1.dx, ry + h/2 * k1.dy);
      const k3 = f(rx + h/2 * k2.dx, ry + h/2 * k2.dy);
      const k4 = f(rx + h * k3.dx, ry + h * k3.dy);

      rx += h/6 * (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx);
      ry += h/6 * (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy);
      rk4P.push({ x: rx, y: ry });
    }
    setRk4Path(rk4P);

    setIsRunning(true);
  }, [stepSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 120;

    ctx.fillStyle = 'rgba(10, 10, 20, 1)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale, 0);
      ctx.lineTo(centerX + i * scale, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale);
      ctx.lineTo(width, centerY + i * scale);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw true solution
    if (truePath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX + truePath[0].x * scale, centerY - truePath[0].y * scale);
      for (const p of truePath) {
        ctx.lineTo(centerX + p.x * scale, centerY - p.y * scale);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Euler path
    if (eulerPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX + eulerPath[0].x * scale, centerY - eulerPath[0].y * scale);
      for (const p of eulerPath) {
        ctx.lineTo(centerX + p.x * scale, centerY - p.y * scale);
      }
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw points
      for (const p of eulerPath) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(centerX + p.x * scale, centerY - p.y * scale, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw RK4 path
    if (rk4Path.length > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX + rk4Path[0].x * scale, centerY - rk4Path[0].y * scale);
      for (const p of rk4Path) {
        ctx.lineTo(centerX + p.x * scale, centerY - p.y * scale);
      }
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw points
      for (const p of rk4Path) {
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(centerX + p.x * scale, centerY - p.y * scale, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw starting point
    ctx.fillStyle = '#ffe66d';
    ctx.beginPath();
    ctx.arc(centerX + 1 * scale, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

  }, [truePath, eulerPath, rk4Path]);

  // Calculate errors
  const eulerError = eulerPath.length > 0
    ? Math.sqrt(Math.pow(eulerPath[eulerPath.length-1].x - truePath[truePath.length-1]?.x || 0, 2) +
                Math.pow(eulerPath[eulerPath.length-1].y - truePath[truePath.length-1]?.y || 0, 2))
    : 0;
  const rk4Error = rk4Path.length > 0
    ? Math.sqrt(Math.pow(rk4Path[rk4Path.length-1].x - truePath[truePath.length-1]?.x || 0, 2) +
                Math.pow(rk4Path[rk4Path.length-1].y - truePath[truePath.length-1]?.y || 0, 2))
    : 0;

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Step size h:</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={stepSize}
            onChange={(e) => { setStepSize(parseFloat(e.target.value)); setIsRunning(false); }}
            style={{ width: '120px' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', color: '#ffe66d', minWidth: '40px' }}>{stepSize.toFixed(2)}</span>
        </div>
        <button
          onClick={runSimulation}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'rgba(78, 205, 196, 0.2)',
            border: '1px solid rgba(78, 205, 196, 0.4)',
            borderRadius: '6px',
            color: '#4ecdc4',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Run Simulation
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>True solution (circle)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ff6b6b', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: '#ff6b6b' }}>Euler {isRunning && `(error: ${eulerError.toFixed(3)})`}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#4ecdc4', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: '#4ecdc4' }}>RK4 {isRunning && `(error: ${rk4Error.toFixed(5)})`}</span>
        </div>
      </div>

      {isRunning && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: eulerError > 0.5 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(78, 205, 196, 0.1)',
          borderRadius: '8px',
          border: `1px solid ${eulerError > 0.5 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)'}`,
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {eulerError > 0.5
              ? `Euler spirals outward! After one full rotation, it's ${(eulerError * 100).toFixed(0)}% off. RK4 stays accurate (${(rk4Error * 100).toFixed(2)}% error).`
              : `Both methods work well at this step size. Try increasing h to see Euler break down!`
            }
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. BROWNIAN MOTION: Multiple Paths with Statistics
// ============================================================================
export function BrownianMotionViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPaths, setNumPaths] = useState(20);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const pathsRef = useRef<{ points: number[] }[]>([]);
  const animationRef = useRef<number>(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dt = 0.01;
    const scale = 60;

    // Generate paths
    pathsRef.current = [];
    for (let p = 0; p < numPaths; p++) {
      const points: number[] = [0];
      let x = 0;
      for (let t = 0; t < 500; t++) {
        const dW = Math.sqrt(dt) * (Math.random() * 2 - 1 + Math.random() * 2 - 1) / 1.41; // Approx normal
        x += dW;
        points.push(x);
      }
      pathsRef.current.push({ points });
    }

    let frame = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 1)';
      ctx.fillRect(0, 0, width, height);

      const maxT = Math.min(frame, 500);
      const xScale = (width - 60) / 500;
      const yOffset = height / 2;

      // Draw time axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(30, yOffset);
      ctx.lineTo(width - 30, yOffset);
      ctx.stroke();

      // Draw √t envelope
      if (showEnvelope && maxT > 0) {
        ctx.beginPath();
        for (let t = 0; t <= maxT; t++) {
          const x = 30 + t * xScale;
          const envelope = Math.sqrt(t * dt) * scale * 2;
          if (t === 0) ctx.moveTo(x, yOffset - envelope);
          else ctx.lineTo(x, yOffset - envelope);
        }
        ctx.strokeStyle = 'rgba(255, 230, 109, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        ctx.beginPath();
        for (let t = 0; t <= maxT; t++) {
          const x = 30 + t * xScale;
          const envelope = Math.sqrt(t * dt) * scale * 2;
          if (t === 0) ctx.moveTo(x, yOffset + envelope);
          else ctx.lineTo(x, yOffset + envelope);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw paths
      pathsRef.current.forEach((path, idx) => {
        ctx.beginPath();
        for (let t = 0; t <= maxT; t++) {
          const x = 30 + t * xScale;
          const y = yOffset - path.points[t] * scale;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const hue = (idx * 17) % 360;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw endpoint
        if (maxT > 0) {
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, 1)`;
          ctx.beginPath();
          ctx.arc(30 + maxT * xScale, yOffset - path.points[maxT] * scale, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw starting point
      ctx.fillStyle = '#ffe66d';
      ctx.beginPath();
      ctx.arc(30, yOffset, 5, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = 'var(--text-dim)';
      ctx.font = '12px system-ui';
      ctx.fillText('t = 0', 20, yOffset + 20);
      ctx.fillText(`t = ${(maxT * dt).toFixed(1)}`, width - 50, yOffset + 20);

      if (showEnvelope) {
        ctx.fillStyle = '#ffe66d';
        ctx.fillText('±√t envelope', width - 100, 25);
      }

      setTime(maxT * dt);

      if (frame < 500) {
        frame += 2;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    frame = 0;
    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [numPaths, showEnvelope]);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Paths:</label>
          <input
            type="range"
            min="5"
            max="50"
            value={numPaths}
            onChange={(e) => setNumPaths(parseInt(e.target.value))}
            style={{ width: '100px' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', minWidth: '30px' }}>{numPaths}</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showEnvelope}
            onChange={(e) => setShowEnvelope(e.target.checked)}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Show √t envelope</span>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={350}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(167, 139, 250, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Each path starts at 0 but wanders randomly. The <span style={{ color: '#ffe66d' }}>yellow envelope</span> shows ±√t —
          the standard deviation grows with the square root of time, not linearly. This is Brownian motion&apos;s signature.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 5. NEURAL ODE: Satellite Imagery with Cloud Cover
// ============================================================================
export function SatelliteNeuralODEViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInterpolation, setShowInterpolation] = useState(true);

  // Simulated NDVI (vegetation index) data
  const observations = [
    { day: 0, value: 0.3, cloudy: false },
    { day: 15, value: 0.35, cloudy: false },
    { day: 30, value: null, cloudy: true },
    { day: 45, value: null, cloudy: true },
    { day: 60, value: 0.55, cloudy: false },
    { day: 75, value: null, cloudy: true },
    { day: 90, value: 0.7, cloudy: false },
    { day: 105, value: 0.72, cloudy: false },
    { day: 120, value: null, cloudy: true },
    { day: 135, value: 0.65, cloudy: false },
    { day: 150, value: 0.5, cloudy: false },
    { day: 165, value: null, cloudy: true },
    { day: 180, value: 0.35, cloudy: false },
  ];

  // True underlying signal (seasonal vegetation)
  const trueSignal = (day: number) => {
    return 0.3 + 0.4 * Math.sin((day / 180) * Math.PI);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const margin = { left: 50, right: 30, top: 40, bottom: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    ctx.fillStyle = 'rgba(10, 10, 20, 1)';
    ctx.fillRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = 'var(--text-dim)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    for (let v = 0; v <= 1; v += 0.2) {
      const y = height - margin.bottom - v * plotHeight;
      ctx.fillText(v.toFixed(1), margin.left - 8, y + 4);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
    }
    ctx.fillText('NDVI', margin.left - 8, margin.top - 10);

    // X-axis labels
    ctx.textAlign = 'center';
    for (let d = 0; d <= 180; d += 30) {
      const x = margin.left + (d / 180) * plotWidth;
      ctx.fillText(`Day ${d}`, x, height - margin.bottom + 20);
    }

    // Draw true signal
    ctx.beginPath();
    for (let d = 0; d <= 180; d++) {
      const x = margin.left + (d / 180) * plotWidth;
      const y = height - margin.bottom - trueSignal(d) * plotHeight;
      if (d === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Neural ODE interpolation
    if (showInterpolation) {
      ctx.beginPath();
      const validObs = observations.filter(o => o.value !== null);
      for (let d = 0; d <= 180; d++) {
        const x = margin.left + (d / 180) * plotWidth;
        // Simple spline-like interpolation (simulating Neural ODE output)
        let y_val = trueSignal(d) + (Math.random() - 0.5) * 0.02;
        const y = height - margin.bottom - y_val * plotHeight;
        if (d === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Draw observations
    observations.forEach((obs) => {
      const x = margin.left + (obs.day / 180) * plotWidth;

      if (obs.cloudy) {
        // Cloud cover - show as gray with cloud icon
        ctx.fillStyle = 'rgba(100, 100, 120, 0.6)';
        ctx.beginPath();
        ctx.arc(x, height - margin.bottom - 0.5 * plotHeight, 12, 0, Math.PI * 2);
        ctx.fill();

        // Cloud symbol
        ctx.fillStyle = 'rgba(200, 200, 220, 0.8)';
        ctx.beginPath();
        ctx.arc(x - 4, height - margin.bottom - 0.5 * plotHeight, 5, 0, Math.PI * 2);
        ctx.arc(x + 2, height - margin.bottom - 0.5 * plotHeight - 2, 6, 0, Math.PI * 2);
        ctx.arc(x + 6, height - margin.bottom - 0.5 * plotHeight + 1, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Valid observation
        const y = height - margin.bottom - (obs.value || 0) * plotHeight;
        ctx.fillStyle = '#ffe66d';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    // Legend
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#ffe66d';
    ctx.beginPath();
    ctx.arc(margin.left + 10, margin.top - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.fillText('Observations', margin.left + 22, margin.top - 16);

    ctx.fillStyle = 'rgba(100, 100, 120, 0.8)';
    ctx.beginPath();
    ctx.arc(margin.left + 110, margin.top - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.fillText('Cloud cover', margin.left + 122, margin.top - 16);

    if (showInterpolation) {
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(margin.left + 200, margin.top - 20);
      ctx.lineTo(margin.left + 230, margin.top - 20);
      ctx.stroke();
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('Neural ODE', margin.left + 238, margin.top - 16);
    }

  }, [showInterpolation]);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showInterpolation}
            onChange={(e) => setShowInterpolation(e.target.checked)}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Show Neural ODE interpolation</span>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={350}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(78, 205, 196, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(78, 205, 196, 0.2)',
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: '#4ecdc4' }}>Real-world application:</strong> Satellite images are often blocked by clouds.
          Traditional methods require evenly-spaced data. A Neural ODE learns the <em>dynamics</em> of vegetation change,
          then integrates from any observation to any future time — naturally handling gaps.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 6. GRADIENT FLOW: Particle on Loss Landscape
// ============================================================================
export function GradientFlowViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useNoise, setUseNoise] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const animationRef = useRef<number>(0);
  const particleRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  // 2D loss landscape with local and global minimum
  const loss = (x: number, y: number) => {
    const global = 0.5 * ((x - 2) ** 2 + (y - 2) ** 2);
    const local = 3 * Math.exp(-((x + 1) ** 2 + (y + 1) ** 2) / 0.8);
    const barrier = 2 * Math.exp(-((x - 0.5) ** 2 + y ** 2) / 1.5);
    return global - local + barrier + 2;
  };

  const gradient = (x: number, y: number) => {
    const h = 0.01;
    const dx = (loss(x + h, y) - loss(x - h, y)) / (2 * h);
    const dy = (loss(x, y + h) - loss(x, y - h)) / (2 * h);
    return { dx, dy };
  };

  const startSimulation = () => {
    particleRef.current = { x: -2.5, y: 2.5 };
    trailRef.current = [{ ...particleRef.current }];
    setIsRunning(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 60;
    const centerX = width / 2;
    const centerY = height / 2;

    const toScreen = (x: number, y: number) => ({
      sx: centerX + x * scale,
      sy: centerY - y * scale,
    });

    const draw = () => {
      // Draw loss landscape as contours
      ctx.fillStyle = 'rgba(10, 10, 20, 1)';
      ctx.fillRect(0, 0, width, height);

      // Draw filled contours
      const imageData = ctx.createImageData(width, height);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const x = (px - centerX) / scale;
          const y = (centerY - py) / scale;
          const z = loss(x, y);
          const normalized = Math.min(1, Math.max(0, (z - 0) / 6));
          const idx = (py * width + px) * 4;
          // Purple to blue gradient
          imageData.data[idx] = Math.floor(30 + normalized * 60);
          imageData.data[idx + 1] = Math.floor(20 + (1 - normalized) * 80);
          imageData.data[idx + 2] = Math.floor(80 + (1 - normalized) * 120);
          imageData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Draw contour lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let level = 0.5; level < 6; level += 0.5) {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
          // This is a simplified contour - in reality you'd use marching squares
        }
      }

      // Draw gradient field
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      for (let x = -3; x <= 3; x += 0.5) {
        for (let y = -3; y <= 3; y += 0.5) {
          const { dx, dy } = gradient(x, y);
          const mag = Math.sqrt(dx * dx + dy * dy) + 0.1;
          const { sx, sy } = toScreen(x, y);
          const len = Math.min(15, 8 / mag * 5);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - dx / mag * len, sy + dy / mag * len);
          ctx.stroke();
        }
      }

      // Draw trail
      if (trailRef.current.length > 1) {
        ctx.beginPath();
        const first = toScreen(trailRef.current[0].x, trailRef.current[0].y);
        ctx.moveTo(first.sx, first.sy);
        for (const p of trailRef.current) {
          const { sx, sy } = toScreen(p.x, p.y);
          ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = useNoise ? '#ff6b6b' : '#ffe66d';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Draw particle
      if (trailRef.current.length > 0) {
        const curr = trailRef.current[trailRef.current.length - 1];
        const { sx, sy } = toScreen(curr.x, curr.y);
        ctx.fillStyle = useNoise ? '#ff6b6b' : '#ffe66d';
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mark minima
      const globalMin = toScreen(2, 2);
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(globalMin.sx, globalMin.sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('global', globalMin.sx, globalMin.sy + 18);

      const localMin = toScreen(-1, -1);
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(localMin.sx, localMin.sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('local', localMin.sx, localMin.sy + 18);
    };

    if (!isRunning) {
      draw();
      return;
    }

    const animate = () => {
      const p = particleRef.current;
      const { dx, dy } = gradient(p.x, p.y);

      const lr = 0.02;
      let nx = p.x - lr * dx;
      let ny = p.y - lr * dy;

      if (useNoise) {
        nx += (Math.random() - 0.5) * 0.15;
        ny += (Math.random() - 0.5) * 0.15;
      }

      p.x = nx;
      p.y = ny;
      trailRef.current.push({ x: nx, y: ny });
      if (trailRef.current.length > 200) trailRef.current.shift();

      draw();

      // Stop if converged
      if (Math.sqrt(dx * dx + dy * dy) > 0.01 && trailRef.current.length < 500) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning, useNoise]);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={startSimulation}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'rgba(255, 230, 109, 0.2)',
            border: '1px solid rgba(255, 230, 109, 0.4)',
            borderRadius: '6px',
            color: '#ffe66d',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Start Gradient Descent
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useNoise}
            onChange={(e) => { setUseNoise(e.target.checked); setIsRunning(false); }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Add SGD noise (Langevin)</span>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: 'auto',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#4ecdc4', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Global minimum</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#a78bfa', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Local minimum (trap!)</span>
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: useNoise ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 230, 109, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${useNoise ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 230, 109, 0.3)'}`,
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {useNoise
            ? 'With noise (SGD/Langevin): The jittering can help escape local minima! The noise acts like thermal energy, kicking the particle over barriers.'
            : 'Pure gradient descent (ODE): Follows the steepest path down. Can get trapped in local minima depending on the starting point.'
          }
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 7. DIFFUSION: Forward and Reverse Process
// ============================================================================
export function DiffusionProcessViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const animationRef = useRef<number>(0);
  const pointsRef = useRef<{ x: number; y: number; origX: number; origY: number }[]>([]);

  useEffect(() => {
    // Initialize points in a pattern (two clusters)
    pointsRef.current = [];
    // Cluster 1 - circle
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const r = 60 + Math.random() * 15;
      pointsRef.current.push({
        x: 150 + Math.cos(angle) * r,
        y: 175 + Math.sin(angle) * r,
        origX: 150 + Math.cos(angle) * r,
        origY: 175 + Math.sin(angle) * r,
      });
    }
    // Cluster 2 - star
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const r = 40 + ((i % 5 < 2) ? 30 : 0) + Math.random() * 10;
      pointsRef.current.push({
        x: 400 + Math.cos(angle) * r,
        y: 175 + Math.sin(angle) * r,
        origX: 400 + Math.cos(angle) * r,
        origY: 175 + Math.sin(angle) * r,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 1)';
      ctx.fillRect(0, 0, width, height);

      // Interpolate points based on time
      const t = time / 100;
      pointsRef.current.forEach((p, idx) => {
        // Target for forward: spread to noise
        const noiseX = 275 + (Math.random() - 0.5) * 400;
        const noiseY = 175 + (Math.random() - 0.5) * 250;

        // Use deterministic noise based on index
        const seed = idx * 12345.6789;
        const deterministicNoiseX = 275 + ((Math.sin(seed) + Math.sin(seed * 1.1)) / 2) * 200;
        const deterministicNoiseY = 175 + ((Math.cos(seed) + Math.cos(seed * 1.3)) / 2) * 150;

        const effectiveT = direction === 'forward' ? t : 1 - t;

        // Add some Brownian jitter during transition
        const jitter = effectiveT * (1 - effectiveT) * 4;
        const jx = (Math.sin(Date.now() / 100 + idx) * jitter * 5);
        const jy = (Math.cos(Date.now() / 100 + idx * 1.5) * jitter * 5);

        const x = p.origX * (1 - effectiveT) + deterministicNoiseX * effectiveT + jx;
        const y = p.origY * (1 - effectiveT) + deterministicNoiseY * effectiveT + jy;

        // Color based on original cluster
        const isCircle = idx < 100;
        const alpha = 0.7;
        ctx.fillStyle = isCircle
          ? `rgba(78, 205, 196, ${alpha})`
          : `rgba(167, 139, 250, ${alpha})`;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw time indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(50, height - 40, width - 100, 8);
      ctx.fillStyle = direction === 'forward' ? '#ff6b6b' : '#4ecdc4';
      ctx.fillRect(50, height - 40, (width - 100) * (time / 100), 8);

      // Labels
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';

      if (direction === 'forward') {
        ctx.fillText('Data', 50, height - 50);
        ctx.fillText('Pure Noise', width - 50, height - 50);
        ctx.fillText(`t = ${(time / 100).toFixed(2)} — Adding noise (forward SDE)`, width / 2, 25);
      } else {
        ctx.fillText('Noise', 50, height - 50);
        ctx.fillText('Generated Data', width - 50, height - 50);
        ctx.fillText(`t = ${(1 - time / 100).toFixed(2)} — Denoising (reverse SDE)`, width / 2, 25);
      }
    };

    draw();

    if (isPlaying) {
      const animate = () => {
        setTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [time, isPlaying, direction]);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setDirection('forward'); setTime(0); setIsPlaying(true); }}
          style={{
            padding: '0.5rem 1rem',
            background: direction === 'forward' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: direction === 'forward' ? '1px solid rgba(255, 107, 107, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: direction === 'forward' ? '#ff6b6b' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Forward (Add Noise)
        </button>
        <button
          onClick={() => { setDirection('reverse'); setTime(0); setIsPlaying(true); }}
          style={{
            padding: '0.5rem 1rem',
            background: direction === 'reverse' ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: direction === 'reverse' ? '1px solid rgba(78, 205, 196, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: direction === 'reverse' ? '#4ecdc4' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Reverse (Denoise)
        </button>
        <button
          onClick={() => { setTime(0); setIsPlaying(false); }}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Reset
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={550}
        height={350}
        style={{
          width: '100%',
          maxWidth: '550px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(167, 139, 250, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: '#ff6b6b' }}>Forward:</strong> Gradually add noise until structure is destroyed (easy — no learning).
          <br/>
          <strong style={{ color: '#4ecdc4' }}>Reverse:</strong> Learn to remove noise and recover structure (hard — requires learning the score).
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// BONUS: Spiral Neural ODE Animation
// ============================================================================
export function SpiralNeuralODEViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTransformed, setShowTransformed] = useState(false);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 25;

    // Generate two interleaved spirals
    const spiral1: { x: number; y: number }[] = [];
    const spiral2: { x: number; y: number }[] = [];

    for (let t = 0.5; t < 4; t += 0.15) {
      spiral1.push({ x: t * Math.cos(t * 1.5), y: t * Math.sin(t * 1.5) });
      spiral2.push({ x: -t * Math.cos(t * 1.5), y: -t * Math.sin(t * 1.5) });
    }

    // Simulated Neural ODE transformation (rotation + scaling to separate)
    const transform = (p: { x: number; y: number }, tFactor: number, isSpiral1: boolean) => {
      const angle = tFactor * Math.PI * 0.5;
      const separation = tFactor * (isSpiral1 ? 3 : -3);
      const x = p.x * Math.cos(angle) - p.y * Math.sin(angle) + separation;
      const y = p.x * Math.sin(angle) + p.y * Math.cos(angle);
      return { x, y };
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const t = showTransformed ? Math.min(1, timeRef.current / 60) : 0;

      // Draw decision boundary
      if (t > 0.5) {
        ctx.strokeStyle = `rgba(255, 230, 109, ${(t - 0.5) * 0.6})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw spirals
      spiral1.forEach((p, idx) => {
        const tp = transform(p, t, true);
        const x = centerX + tp.x * scale;
        const y = centerY - tp.y * scale;

        ctx.fillStyle = `rgba(78, 205, 196, ${0.8 + idx * 0.01})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      spiral2.forEach((p, idx) => {
        const tp = transform(p, t, false);
        const x = centerX + tp.x * scale;
        const y = centerY - tp.y * scale;

        ctx.fillStyle = `rgba(255, 107, 107, ${0.8 + idx * 0.01})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Labels
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(t < 0.5 ? 't = 0 (input)' : `t = ${t.toFixed(2)}`, centerX, height - 15);

      if (showTransformed && timeRef.current < 60) {
        timeRef.current += 1;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    timeRef.current = 0;
    ctx.fillStyle = 'rgba(10, 10, 20, 1)';
    ctx.fillRect(0, 0, width, height);
    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [showTransformed]);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowTransformed(!showTransformed)}
          style={{
            padding: '0.5rem 1.5rem',
            background: showTransformed ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: showTransformed ? '1px solid rgba(78, 205, 196, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: showTransformed ? '#4ecdc4' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {showTransformed ? 'Reset' : 'Run Neural ODE (t: 0 → 1)'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={350}
        style={{
          width: '100%',
          maxWidth: '400px',
          height: 'auto',
          background: 'rgba(10, 10, 20, 1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#4ecdc4', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Class A</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ff6b6b', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Class B</span>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>
        The Neural ODE learns a vector field that &quot;untangles&quot; the spirals. At t=1, a simple vertical line separates the classes.
      </p>
    </div>
  );
}
