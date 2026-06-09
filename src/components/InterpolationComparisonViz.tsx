'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function InterpolationComparisonViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interpolation, setInterpolation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'all' | 'lerp' | 'slerp' | 'geodesic'>('all');
  const animationRef = useRef<number>(0);

  const animate = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setInterpolation(0);

    const startTime = performance.now();
    const duration = 3000;

    const loop = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setInterpolation(progress);

      if (progress < 1) {
        requestAnimationFrame(loop);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(loop);
  }, [isAnimating]);

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

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.35;

    for (let r = radius + 20; r > 0; r -= 8) {
      const alpha = (1 - r / (radius + 20)) * 0.1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#a78bfa';
    ctx.fill();

    ctx.font = '10px var(--font-mono)';
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';
    ctx.fillText('Prior (0,0)', centerX, centerY + 20);

    const angleA = Math.PI * 0.8;
    const angleB = Math.PI * 0.2;

    const pointA = {
      x: centerX + Math.cos(angleA) * radius,
      y: centerY - Math.sin(angleA) * radius,
    };
    const pointB = {
      x: centerX + Math.cos(angleB) * radius,
      y: centerY - Math.sin(angleB) * radius,
    };

    const getLerpPoint = (t: number) => ({
      x: pointA.x + (pointB.x - pointA.x) * t,
      y: pointA.y + (pointB.y - pointA.y) * t,
    });

    const getSlerpPoint = (t: number) => {
      const omega = angleA - angleB;
      const sinOmega = Math.sin(omega);
      if (Math.abs(sinOmega) < 0.001) return getLerpPoint(t);

      const angle = angleA - omega * t;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY - Math.sin(angle) * radius,
      };
    };

    const getGeodesicPoint = (t: number) => {
      const pullStrength = 0.5;
      const controlX = centerX;
      const controlY = centerY;

      const x = (1 - t) * (1 - t) * pointA.x + 2 * (1 - t) * t * (controlX + (pointA.x + pointB.x - 2 * centerX) * (1 - pullStrength) / 2) + t * t * pointB.x;
      const y = (1 - t) * (1 - t) * pointA.y + 2 * (1 - t) * t * (controlY + (pointA.y + pointB.y - 2 * centerY) * (1 - pullStrength) / 2) + t * t * pointB.y;

      return { x, y };
    };

    if (activeMethod === 'all' || activeMethod === 'lerp') {
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      const lerpMid = getLerpPoint(0.5);
      ctx.font = 'bold 11px var(--font-mono)';
      ctx.fillStyle = '#ff6b6b';
      ctx.textAlign = 'center';
      ctx.fillText('LERP', lerpMid.x, lerpMid.y - 15);
      ctx.font = '9px var(--font-mono)';
      ctx.fillStyle = 'rgba(255, 107, 107, 0.7)';
      ctx.fillText('(cuts through center)', lerpMid.x, lerpMid.y - 3);
    }

    if (activeMethod === 'all' || activeMethod === 'slerp') {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -angleA, -angleB, true);
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 4;
      ctx.stroke();

      const slerpMid = getSlerpPoint(0.5);
      ctx.font = 'bold 11px var(--font-mono)';
      ctx.fillStyle = '#4ecdc4';
      ctx.textAlign = 'center';
      const labelOffsetX = (slerpMid.x - centerX) * 0.3;
      const labelOffsetY = (slerpMid.y - centerY) * 0.3;
      ctx.fillText('SLERP', slerpMid.x + labelOffsetX, slerpMid.y + labelOffsetY - 10);
      ctx.font = '9px var(--font-mono)';
      ctx.fillStyle = 'rgba(78, 205, 196, 0.7)';
      ctx.fillText('(follows sphere surface)', slerpMid.x + labelOffsetX, slerpMid.y + labelOffsetY + 2);
    }

    if (activeMethod === 'all' || activeMethod === 'geodesic') {
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);

      for (let t = 0; t <= 1; t += 0.02) {
        const p = getGeodesicPoint(t);
        ctx.lineTo(p.x, p.y);
      }

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.stroke();

      const geoMid = getGeodesicPoint(0.5);
      ctx.font = 'bold 11px var(--font-mono)';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.fillText('GEODESIC', geoMid.x, geoMid.y + 25);
      ctx.font = '9px var(--font-mono)';
      ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
      ctx.fillText('(curves toward prior)', geoMid.x, geoMid.y + 37);
    }

    if (activeMethod === 'all' || activeMethod === 'lerp') {
      const lerpPos = getLerpPoint(interpolation);
      ctx.beginPath();
      ctx.arc(lerpPos.x, lerpPos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b6b';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (activeMethod === 'all' || activeMethod === 'slerp') {
      const slerpPos = getSlerpPoint(interpolation);
      ctx.beginPath();
      ctx.arc(slerpPos.x, slerpPos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#4ecdc4';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (activeMethod === 'all' || activeMethod === 'geodesic') {
      const geoPos = getGeodesicPoint(interpolation);
      ctx.beginPath();
      ctx.arc(geoPos.x, geoPos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(pointA.x, pointA.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe66d';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = 'bold 9px var(--font-sans)';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', pointA.x, pointA.y);

    ctx.beginPath();
    ctx.arc(pointB.x, pointB.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe66d';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fillText('B', pointB.x, pointB.y);

    ctx.font = '10px var(--font-mono)';
    ctx.fillStyle = 'var(--text-dim)';
    ctx.textAlign = 'left';
    ctx.fillText('High-probability shell', centerX + radius + 15, centerY - radius / 2);

  }, [interpolation, activeMethod]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveMethod('all')}
          style={{
            background: activeMethod === 'all' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: `1px solid ${activeMethod === 'all' ? 'var(--text-primary)' : 'var(--border-strong)'}`,
            color: activeMethod === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Show All
        </button>
        <button
          onClick={() => setActiveMethod('lerp')}
          style={{
            background: activeMethod === 'lerp' ? 'rgba(255, 107, 107, 0.2)' : 'transparent',
            border: `1px solid ${activeMethod === 'lerp' ? '#ff6b6b' : 'var(--border-strong)'}`,
            color: activeMethod === 'lerp' ? '#ff6b6b' : 'var(--text-secondary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          LERP Only
        </button>
        <button
          onClick={() => setActiveMethod('slerp')}
          style={{
            background: activeMethod === 'slerp' ? 'rgba(78, 205, 196, 0.2)' : 'transparent',
            border: `1px solid ${activeMethod === 'slerp' ? '#4ecdc4' : 'var(--border-strong)'}`,
            color: activeMethod === 'slerp' ? '#4ecdc4' : 'var(--text-secondary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          SLERP Only
        </button>
        <button
          onClick={() => setActiveMethod('geodesic')}
          style={{
            background: activeMethod === 'geodesic' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            border: `1px solid ${activeMethod === 'geodesic' ? '#00ff88' : 'var(--border-strong)'}`,
            color: activeMethod === 'geodesic' ? '#00ff88' : 'var(--text-secondary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Geodesic Only
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

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={interpolation}
            onChange={(e) => setInterpolation(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <button
            onClick={animate}
            disabled={isAnimating}
            style={{
              background: 'var(--accent)',
              color: 'hsl(var(--bg-primary-hsl))',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: isAnimating ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isAnimating ? 'Animating...' : 'Animate A → B'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#ffe66d', fontSize: '0.8rem' }}>Point A</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>t = {interpolation.toFixed(2)}</span>
          <span style={{ color: '#ffe66d', fontSize: '0.8rem' }}>Point B</span>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
          <h4 style={{ color: '#ff6b6b', margin: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>LERP (Linear Interpolation)</h4>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong>Formula:</strong> z(t) = A + t(B - A)<br/>
            <strong>Path:</strong> Straight line through the interior<br/>
            <strong>Problem:</strong> Passes through the origin (low probability region) → blurry/generic outputs
          </p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
          <h4 style={{ color: '#4ecdc4', margin: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>SLERP (Spherical Linear Interpolation)</h4>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong>Formula:</strong> z(t) = sin((1-t)Ω)/sin(Ω) · A + sin(tΩ)/sin(Ω) · B<br/>
            <strong>Path:</strong> Arc along the surface of the hypersphere<br/>
            <strong>Why it works:</strong> In high-D, most probability mass is on a spherical shell. SLERP stays on this shell.
          </p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
          <h4 style={{ color: '#00ff88', margin: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Geodesic (Riemannian)</h4>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong>Formula:</strong> Minimize ∫ √(dz<sup>T</sup> G(z) dz) along path<br/>
            <strong>Path:</strong> Curves toward low-cost regions (high variance = prior)<br/>
            <strong>Trade-off:</strong> Mathematically &quot;correct&quot; but computationally expensive
          </p>
        </div>
      </div>
    </div>
  );
}
