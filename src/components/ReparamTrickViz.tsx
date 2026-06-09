'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

type ViewMode = 'naive' | 'reparameterized';

interface NodeData {
  x: number;
  y: number;
  label: string;
  sublabel: string;
  color: string;
  isStochastic?: boolean;
  isExternal?: boolean;
}

export default function ReparamTrickViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('naive');
  const [isAnimating, setIsAnimating] = useState(false);
  const [gradientFlow, setGradientFlow] = useState(0);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const animateGradient = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setGradientFlow(0);

    const startTime = performance.now();
    const duration = 2000;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setGradientFlow(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.03;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerY = rect.height / 2;
      const nodeRadius = 35;
      const spacing = rect.width / 5;

      const nodes: NodeData[] = viewMode === 'naive' ? [
        { x: spacing * 0.8, y: centerY, label: 'x', sublabel: 'Input', color: '#4ecdc4' },
        { x: spacing * 1.8, y: centerY, label: 'μ, σ', sublabel: 'Encoder', color: '#ffe66d' },
        { x: spacing * 2.8, y: centerY, label: 'z~N', sublabel: 'Sample', color: '#ff6b6b', isStochastic: true },
        { x: spacing * 3.8, y: centerY, label: 'x̂', sublabel: 'Decoder', color: '#4ecdc4' },
      ] : [
        { x: spacing * 0.6, y: centerY, label: 'x', sublabel: 'Input', color: '#4ecdc4' },
        { x: spacing * 1.5, y: centerY, label: 'μ, σ', sublabel: 'Encoder', color: '#ffe66d' },
        { x: spacing * 2.4, y: centerY - 60, label: 'ε', sublabel: 'N(0,1)', color: '#a78bfa', isExternal: true },
        { x: spacing * 2.9, y: centerY, label: 'z=μ+σε', sublabel: 'Transform', color: '#00ff88' },
        { x: spacing * 4, y: centerY, label: 'x̂', sublabel: 'Decoder', color: '#4ecdc4' },
      ];

      const edges = viewMode === 'naive' ? [
        { from: 0, to: 1 },
        { from: 1, to: 2, blocked: true },
        { from: 2, to: 3 },
      ] : [
        { from: 0, to: 1 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ];

      edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];

        ctx.beginPath();
        ctx.moveTo(fromNode.x + nodeRadius, fromNode.y);

        if (edge.from === 2 && viewMode === 'reparameterized') {
          ctx.quadraticCurveTo(
            (fromNode.x + toNode.x) / 2,
            fromNode.y + 30,
            toNode.x - nodeRadius,
            toNode.y
          );
        } else {
          ctx.lineTo(toNode.x - nodeRadius, toNode.y);
        }

        if (edge.blocked) {
          ctx.strokeStyle = '#ff4444';
          ctx.setLineDash([8, 8]);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.setLineDash([]);
        }
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        if (edge.blocked) {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          ctx.beginPath();
          ctx.arc(midX, midY, 15, 0, Math.PI * 2);
          ctx.fillStyle = '#ff4444';
          ctx.fill();
          ctx.font = 'bold 16px var(--font-mono)';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', midX, midY);

          ctx.font = '10px var(--font-mono)';
          ctx.fillStyle = '#ff4444';
          ctx.fillText('BLOCKED', midX, midY + 25);
        }
      });

      if (gradientFlow > 0 && viewMode === 'reparameterized') {
        const gradientPath = [4, 3, 1, 0];
        for (let i = 0; i < gradientPath.length - 1; i++) {
          const progress = Math.max(0, Math.min(1, gradientFlow * gradientPath.length - i));
          if (progress <= 0) continue;

          const fromNode = nodes[gradientPath[i]];
          const toNode = nodes[gradientPath[i + 1]];

          const startX = fromNode.x - nodeRadius;
          const endX = toNode.x + nodeRadius;
          const currentX = startX + (endX - startX) * progress;

          const gradient = ctx.createLinearGradient(fromNode.x, 0, currentX, 0);
          gradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
          gradient.addColorStop(0.5, '#00ff88');
          gradient.addColorStop(1, '#00ff88');

          ctx.beginPath();
          ctx.moveTo(fromNode.x - nodeRadius, fromNode.y);
          ctx.lineTo(currentX, toNode.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 5;
          ctx.stroke();

          if (progress > 0.5) {
            ctx.beginPath();
            ctx.moveTo(currentX, toNode.y - 8);
            ctx.lineTo(currentX - 12, toNode.y);
            ctx.lineTo(currentX, toNode.y + 8);
            ctx.fillStyle = '#00ff88';
            ctx.fill();
          }
        }
      }

      nodes.forEach((node, idx) => {
        const pulse = node.isStochastic ? Math.sin(timeRef.current * 3) * 5 : 0;

        if (node.isStochastic) {
          for (let i = 0; i < 8; i++) {
            const angle = (timeRef.current * 2 + i * Math.PI / 4) % (Math.PI * 2);
            const dist = 50 + Math.sin(timeRef.current * 4 + i) * 10;
            const particleX = node.x + Math.cos(angle) * dist;
            const particleY = node.y + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 107, ${0.5 + Math.sin(timeRef.current + i) * 0.3})`;
            ctx.fill();
          }
        }

        if (node.isExternal) {
          ctx.setLineDash([4, 4]);
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = node.isExternal ? 'transparent' : `${node.color}30`;
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 16px var(--font-mono)';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);

        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = 'var(--text-dim)';
        ctx.fillText(node.sublabel, node.x, node.y + nodeRadius + 18);
      });

      ctx.font = 'bold 14px var(--font-mono)';
      ctx.textAlign = 'left';
      if (viewMode === 'naive') {
        ctx.fillStyle = '#ff4444';
        ctx.fillText('Gradient cannot flow through random sampling!', 20, 30);
        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('The encoder parameters μ, σ never receive updates.', 20, 50);
      } else {
        ctx.fillStyle = '#00ff88';
        ctx.fillText('Gradient flows through deterministic operations!', 20, 30);
        ctx.font = '12px var(--font-mono)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('ε is external input. z = μ + σ·ε is differentiable.', 20, 50);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode, gradientFlow]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setViewMode('naive'); setGradientFlow(0); }}
          style={{
            background: viewMode === 'naive' ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${viewMode === 'naive' ? '#ff4444' : 'var(--border-strong)'}`,
            color: viewMode === 'naive' ? '#ff4444' : 'var(--text-primary)',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Naive (Broken)
        </button>
        <button
          onClick={() => { setViewMode('reparameterized'); setGradientFlow(0); }}
          style={{
            background: viewMode === 'reparameterized' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            border: `1px solid ${viewMode === 'reparameterized' ? '#00ff88' : 'var(--border-strong)'}`,
            color: viewMode === 'reparameterized' ? '#00ff88' : 'var(--text-primary)',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Reparameterized
        </button>
        {viewMode === 'reparameterized' && (
          <button
            onClick={animateGradient}
            disabled={isAnimating}
            style={{
              background: 'var(--accent)',
              color: 'hsl(var(--bg-primary-hsl))',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              opacity: isAnimating ? 0.7 : 1,
            }}
          >
            Backpropagate
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '320px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(255, 68, 68, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 68, 68, 0.3)',
        }}>
          <h4 style={{ color: '#ff4444', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Naive Sampling</h4>
          <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            z ~ N(μ, σ²)
          </code>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Randomness is internal. ∂z/∂μ = ???
          </p>
        </div>
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 136, 0.3)',
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Reparameterization</h4>
          <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            z = μ + σ · ε, ε ~ N(0,1)
          </code>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            ∂z/∂μ = 1, ∂z/∂σ = ε
          </p>
        </div>
      </div>
    </div>
  );
}
