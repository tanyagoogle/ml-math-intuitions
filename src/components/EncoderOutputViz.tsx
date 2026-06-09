'use client';

import { useRef, useEffect, useState } from 'react';

interface ImageData {
  id: string;
  emoji: string;
  label: string;
  color: string;
  mu: { x: number; y: number };
  sigma: number;
}

const images: ImageData[] = [
  { id: 'cat', emoji: '🐱', label: 'Cat', color: '#ff6b6b', mu: { x: -50, y: -35 }, sigma: 0.3 },
  { id: 'dog', emoji: '🐕', label: 'Dog', color: '#4ecdc4', mu: { x: 40, y: -20 }, sigma: 0.4 },
  { id: 'car', emoji: '🚗', label: 'Car', color: '#ffe66d', mu: { x: 30, y: 45 }, sigma: 0.25 },
  { id: 'blur', emoji: '🌫️', label: 'Blurry', color: '#a78bfa', mu: { x: -10, y: 10 }, sigma: 0.75 },
];

export default function EncoderOutputViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<number>(1);
  const [showAllDistributions, setShowAllDistributions] = useState(false);

  const selected = images[selectedImage];

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

      ctx.fillStyle = 'hsl(220, 20%, 10%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const size = Math.min(rect.width, rect.height) - 40;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);

      for (let r = size * 0.4; r > 0; r -= 6) {
        const alpha = (1 - r / (size * 0.4)) * 0.12;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.fill();

      const drawDistribution = (img: ImageData, isSelected: boolean, alpha: number = 1) => {
        const scale = size / 160;
        const px = centerX + img.mu.x * scale;
        const py = centerY + img.mu.y * scale;
        const radius = (12 + img.sigma * 40) * (size / 200);

        for (let r = radius; r > 0; r -= 2) {
          const a = (1 - r / radius) * 0.6 * alpha;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = img.color + Math.floor(a * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = img.color;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '10px monospace';
          ctx.fillStyle = img.color;
          ctx.textAlign = 'center';
          ctx.fillText(`σ=${img.sigma}`, px + radius + 25, py + 4);
        }

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(img.emoji, px, py - radius - 8);
      };

      if (showAllDistributions) {
        images.forEach((img, idx) => {
          drawDistribution(img, idx === selectedImage, idx === selectedImage ? 1 : 0.5);
        });
      } else {
        drawDistribution(selected, true, 1);
      }

      ctx.font = '11px monospace';
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.fillText('p(z)=N(0,1)', centerX, centerY + size / 2 + 18);
      ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
      ctx.fillText('(prior)', centerX, centerY + size / 2 + 32);
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [selectedImage, showAllDistributions, selected]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(idx)}
            style={{
              background: selectedImage === idx ? `${img.color}30` : 'transparent',
              border: `2px solid ${selectedImage === idx ? img.color : 'rgba(255,255,255,0.2)'}`,
              color: selectedImage === idx ? img.color : 'rgba(255,255,255,0.8)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{img.emoji}</span>
            {img.label}
          </button>
        ))}
        <button
          onClick={() => setShowAllDistributions(!showAllDistributions)}
          style={{
            background: showAllDistributions ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
            border: `1px solid ${showAllDistributions ? '#a78bfa' : 'rgba(255,255,255,0.2)'}`,
            color: showAllDistributions ? '#a78bfa' : 'rgba(255,255,255,0.8)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          Show All
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        background: 'hsl(220, 20%, 8%)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{selected.emoji}</span>
            <span style={{ color: selected.color, fontSize: '1.25rem', fontWeight: 600 }}>{selected.label}</span>
          </div>

          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
              ENCODER NEURAL NETWORK OUTPUTS:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ color: '#ff6b6b', fontFamily: 'monospace', fontWeight: 600, fontSize: '1rem' }}>
                  μ = ({selected.mu.x}, {selected.mu.y})
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>mean (location)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ color: '#4ecdc4', fontFamily: 'monospace', fontWeight: 600, fontSize: '1rem' }}>
                  σ = {selected.sigma}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  {selected.sigma > 0.5 ? '← high (uncertain)' : '← low (confident)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
              THIS CREATES DISTRIBUTION:
            </div>
            <div style={{
              color: selected.color,
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: '1rem',
              paddingLeft: '0.5rem',
            }}>
              q(z|x) = N(μ, σ²)
              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: '0.75rem' }}>Gaussian</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem',
            marginBottom: '0.5rem',
            fontFamily: 'monospace',
            textAlign: 'center',
          }}>
            LATENT SPACE
          </div>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '220px',
              borderRadius: '8px',
            }}
          />
        </div>
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(167, 139, 250, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.3)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: '#a78bfa' }}>Key:</strong> Each image gets its <em>own</em> μ and σ from the encoder.
          Compare: Cat (σ=0.3, tight cloud) vs Blurry (σ=0.75, wide cloud).
        </p>
      </div>
    </div>
  );
}
