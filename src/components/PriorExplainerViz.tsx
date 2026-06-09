'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

type Step = 1 | 2 | 3 | 4 | 5;

export default function PriorExplainerViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [showPriorForce, setShowPriorForce] = useState(false);
  const [klWeight, setKlWeight] = useState(0);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 5) as Step);
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1) as Step);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.02;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'hsl(240, 10%, 4%)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (step === 1) {
        ctx.font = 'bold 16px var(--font-sans)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.textAlign = 'center';
        ctx.fillText('Step 1: What is a Prior?', centerX, 40);

        ctx.font = '13px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('A prior is your "default belief" before seeing any data.', centerX, 70);

        const boxY = 120;
        ctx.strokeStyle = 'var(--border-subtle)';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 150, boxY, 300, 200);

        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = 'var(--text-dim)';
        ctx.fillText('Latent Space (where z lives)', centerX, boxY + 220);

        for (let r = 100; r > 0; r -= 8) {
          const alpha = (1 - r / 100) * 0.25;
          ctx.beginPath();
          ctx.arc(centerX, boxY + 100, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX, boxY + 100, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();

        ctx.font = 'bold 12px var(--font-mono)';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('Prior: N(0, 1)', centerX, boxY + 100 + 120);

        ctx.font = '12px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        const explanation = [
          '"Before I see any image, I believe the latent code z',
          'is probably near (0,0) with some spread."',
          '',
          'This is like saying: "Most things are average."',
        ];
        explanation.forEach((line, i) => {
          ctx.fillText(line, centerX, boxY + 250 + i * 22);
        });
      }

      if (step === 2) {
        ctx.font = 'bold 16px var(--font-sans)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.textAlign = 'center';
        ctx.fillText('Step 2: Without the Prior (Just Reconstruction)', centerX, 40);

        ctx.font = '13px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('If we only care about reconstruction, each image gets its own isolated point.', centerX, 70);

        const boxY = 110;
        ctx.strokeStyle = 'var(--border-subtle)';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 180, boxY, 360, 200);

        const points = [
          { x: -120, y: -60, label: '🐱', color: '#ff6b6b' },
          { x: 80, y: -40, label: '🐕', color: '#4ecdc4' },
          { x: -60, y: 70, label: '🚗', color: '#ffe66d' },
          { x: 130, y: 50, label: '🏠', color: '#ff9ff3' },
          { x: 20, y: -80, label: '🌸', color: '#54a0ff' },
        ];

        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(centerX + point.x, boxY + 100 + point.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = point.color;
          ctx.fill();

          ctx.font = '16px sans-serif';
          ctx.fillText(point.label, centerX + point.x - 8, boxY + 100 + point.y - 12);
        });

        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = '#ff4444';
        ctx.fillText('Problem: Huge empty gaps between points!', centerX, boxY + 220);

        ctx.font = '12px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        const explanation = [
          'If you sample z from one of these gaps, the decoder',
          'has never seen anything like it → outputs garbage.',
        ];
        explanation.forEach((line, i) => {
          ctx.fillText(line, centerX, boxY + 260 + i * 22);
        });

        ctx.beginPath();
        ctx.arc(centerX, boxY + 100, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
        ctx.fill();
        ctx.font = '10px var(--font-mono)';
        ctx.fillStyle = '#ff4444';
        ctx.fillText('← sample here = ???', centerX + 10, boxY + 100);
      }

      if (step === 3) {
        ctx.font = 'bold 16px var(--font-sans)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.textAlign = 'center';
        ctx.fillText('Step 3: The Prior as a "Spring" Pulling to Center', centerX, 40);

        ctx.font = '13px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('The KL divergence term acts like springs pulling all encodings toward the prior.', centerX, 70);

        const boxY = 110;
        ctx.strokeStyle = 'var(--border-subtle)';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 180, boxY, 360, 200);

        for (let r = 80; r > 0; r -= 10) {
          const alpha = (1 - r / 80) * 0.15;
          ctx.beginPath();
          ctx.arc(centerX, boxY + 100, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX, boxY + 100, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();

        const springPull = klWeight;
        const points = [
          { x: -120, y: -60, label: '🐱', color: '#ff6b6b' },
          { x: 80, y: -40, label: '🐕', color: '#4ecdc4' },
          { x: -60, y: 70, label: '🚗', color: '#ffe66d' },
          { x: 130, y: 50, label: '🏠', color: '#ff9ff3' },
          { x: 20, y: -80, label: '🌸', color: '#54a0ff' },
        ];

        points.forEach(point => {
          const pulledX = point.x * (1 - springPull * 0.7);
          const pulledY = point.y * (1 - springPull * 0.7);

          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(centerX + pulledX, boxY + 100 + pulledY);
          ctx.lineTo(centerX, boxY + 100);
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 + springPull * 0.4})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);

          const cloudRadius = 8 + springPull * 25;
          ctx.beginPath();
          ctx.arc(centerX + pulledX, boxY + 100 + pulledY, cloudRadius, 0, Math.PI * 2);
          ctx.fillStyle = point.color + '40';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(centerX + pulledX, boxY + 100 + pulledY, 5, 0, Math.PI * 2);
          ctx.fillStyle = point.color;
          ctx.fill();

          ctx.font = '14px sans-serif';
          ctx.fillText(point.label, centerX + pulledX - 7, boxY + 100 + pulledY - cloudRadius - 5);
        });

        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('Prior (the "anchor")', centerX, boxY + 100 + 95);

        ctx.font = '12px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('Drag the slider to see the prior pulling points closer and spreading them into clouds.', centerX, boxY + 240);
      }

      if (step === 4) {
        ctx.font = 'bold 16px var(--font-sans)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.textAlign = 'center';
        ctx.fillText('Step 4: Why "Valley" and "Mountain"?', centerX, 30);

        ctx.font = '12px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('Think of it as a COST MAP for traveling through latent space.', centerX, 55);

        const mapY = 75;
        const mapWidth = 280;
        const mapHeight = 150;

        for (let x = 0; x < mapWidth; x += 4) {
          for (let y = 0; y < mapHeight; y += 4) {
            const nx = (x - mapWidth / 2) / (mapWidth / 2);
            const ny = (y - mapHeight / 2) / (mapHeight / 2);
            const distFromCenter = Math.sqrt(nx * nx + ny * ny);

            const catX = -0.5, catY = -0.3;
            const dogX = 0.5, dogY = 0.3;
            const distFromCat = Math.sqrt((nx - catX) ** 2 + (ny - catY) ** 2);
            const distFromDog = Math.sqrt((nx - dogX) ** 2 + (ny - dogY) ** 2);

            let cost = 1 - distFromCenter * 0.5;
            cost += Math.exp(-distFromCat * 5) * 0.8;
            cost += Math.exp(-distFromDog * 5) * 0.8;
            cost = Math.max(0.2, Math.min(1, cost));

            const r = Math.floor(50 + (1 - cost) * 100);
            const g = Math.floor(100 + cost * 100);
            const b = Math.floor(150 + cost * 50);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(centerX - mapWidth / 2 + x, mapY + y, 4, 4);
          }
        }

        ctx.beginPath();
        ctx.arc(centerX - mapWidth / 2 + mapWidth * 0.25, mapY + mapHeight * 0.35, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = '18px sans-serif';
        ctx.fillText('🐱', centerX - mapWidth / 2 + mapWidth * 0.25 - 9, mapY + mapHeight * 0.35 + 6);

        ctx.beginPath();
        ctx.arc(centerX - mapWidth / 2 + mapWidth * 0.75, mapY + mapHeight * 0.65, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = '18px sans-serif';
        ctx.fillText('🐕', centerX - mapWidth / 2 + mapWidth * 0.75 - 9, mapY + mapHeight * 0.65 + 6);

        ctx.beginPath();
        ctx.arc(centerX, mapY + mapHeight / 2, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();

        const legendY = mapY + mapHeight + 20;
        ctx.font = '10px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('🔺 MOUNTAIN = specific concept (high cost)', centerX, legendY);

        ctx.fillStyle = '#00ff88';
        ctx.fillText('🟢 VALLEY = uncertain/generic (low cost)', centerX, legendY + 18);

        ctx.font = '11px var(--font-sans)';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('The prior (center) is the deepest valley: maximum uncertainty, minimum cost.', centerX, legendY + 45);
      }

      if (step === 5) {
        ctx.font = 'bold 16px var(--font-sans)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.textAlign = 'center';
        ctx.fillText('Step 5: Why Interpolations "Fade to Gray"', centerX, 30);

        ctx.font = '12px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('The cheapest path between two concepts often goes through the prior.', centerX, 52);

        const mapY = 70;
        const mapWidth = 300;
        const mapHeight = 130;

        for (let x = 0; x < mapWidth; x += 5) {
          for (let y = 0; y < mapHeight; y += 5) {
            const nx = (x - mapWidth / 2) / (mapWidth / 2);
            const ny = (y - mapHeight / 2) / (mapHeight / 2);
            const distFromCenter = Math.sqrt(nx * nx + ny * ny);

            let cost = 1 - distFromCenter * 0.6;
            cost = Math.max(0.3, Math.min(1, cost));

            const hue = 260 - cost * 60;
            const lightness = 20 + cost * 30;
            ctx.fillStyle = `hsl(${hue}, 50%, ${lightness}%)`;
            ctx.fillRect(centerX - mapWidth / 2 + x, mapY + y, 5, 5);
          }
        }

        const catX = centerX - 110;
        const catY = mapY + 40;
        const dogX = centerX + 110;
        const dogY = mapY + 90;

        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.moveTo(catX, catY);
        ctx.lineTo(dogX, dogY);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(catX, catY);
        ctx.quadraticCurveTo(centerX, mapY + mapHeight / 2 - 15, dogX, dogY);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = '20px sans-serif';
        ctx.fillText('🐱', catX - 10, catY + 7);
        ctx.fillText('🐕', dogX - 10, dogY + 7);

        ctx.beginPath();
        ctx.arc(centerX, mapY + mapHeight / 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();
        ctx.font = '9px var(--font-mono)';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('prior', centerX, mapY + mapHeight / 2 + 20);

        const outputY = mapY + mapHeight + 30;
        ctx.font = '10px var(--font-mono)';
        ctx.fillStyle = 'var(--text-dim)';
        ctx.fillText('Decoded output along green path:', centerX, outputY);

        const stages = ['🐱', '🐱?', '???', '🐕?', '🐕'];
        const stageLabels = ['Cat', 'Fading', 'Blur', 'Emerging', 'Dog'];
        stages.forEach((emoji, i) => {
          const x = centerX - 100 + i * 50;
          ctx.font = '20px sans-serif';
          ctx.fillText(emoji, x - 10, outputY + 28);
          ctx.font = '8px var(--font-mono)';
          ctx.fillStyle = i === 2 ? '#a78bfa' : 'var(--text-dim)';
          ctx.fillText(stageLabels[i], x, outputY + 45);
        });

        ctx.font = '10px var(--font-sans)';
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('Path curves through prior → decoder outputs "average/generic" in the middle.', centerX, outputY + 65);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [step, klWeight, showPriorForce]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => setStep(s as Step)}
            style={{
              background: step === s ? 'var(--accent)' : 'transparent',
              border: `1px solid ${step === s ? 'var(--accent)' : 'var(--border-strong)'}`,
              color: step === s ? 'hsl(var(--bg-primary-hsl))' : 'var(--text-primary)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              minWidth: '40px',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '420px',
          background: 'hsl(240, 10%, 4%)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      />

      {step === 3 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'hsla(0, 0%, 100%, 0.03)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No KL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={klWeight}
              onChange={(e) => setKlWeight(parseFloat(e.target.value))}
              style={{ width: '200px', accentColor: 'var(--accent)' }}
            />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Full KL</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0 0 0' }}>
            KL Weight: <strong style={{ color: '#a78bfa' }}>{klWeight.toFixed(2)}</strong> — Watch points get pulled toward center and expand into clouds
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button
          onClick={prevStep}
          disabled={step === 1}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: step === 1 ? 'var(--text-dim)' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: step === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: step === 1 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={nextStep}
          disabled={step === 5}
          style={{
            background: step === 5 ? 'transparent' : 'var(--accent)',
            border: step === 5 ? '1px solid var(--border-strong)' : 'none',
            color: step === 5 ? 'var(--text-dim)' : 'hsl(var(--bg-primary-hsl))',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: step === 5 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: step === 5 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
