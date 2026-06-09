'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import styles from '../app/eigenvalues/visualization.module.css';

export default function NormVsRadiusViz() {
    const [rho, setRho] = useState(0.9);
    const [shear, setShear] = useState(5.0);
    const steps = 30;

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 1. Calculate Matrix Math
    // Matrix A = [[rho, shear], [0, rho]] (Jordan Block)
    // Spectral Radius = |rho|
    // Spectral Norm = Largest Singular Value
    const stats = useMemo(() => {
        // Formula for sigma_max of [[a, b], [0, a]]:
        // S = 2*a^2 + b^2
        // D = a^4
        // sigma = sqrt( (S + sqrt(S^2 - 4D)) / 2 )

        const a = rho;
        const b = shear;
        const S = 2 * a * a + b * b;
        const inner = Math.sqrt(S * S - 4 * a * a * a * a);
        const sigma2 = (S + inner) / 2;
        const norm = Math.sqrt(sigma2);

        return {
            radius: Math.abs(rho),
            norm: norm,
            isTransient: Math.abs(rho) < 1 && norm > 1
        };
    }, [rho, shear]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        ctx.clearRect(0, 0, width, height);

        // Simulation: Magnitude |x_k| vs k
        // x_{k+1} = A x_k
        const simulate = (r: number, k: number) => {
            let x = 0;
            let y = 1; // Start with unit vector pointing up (usually hits shear hard)
            // Ideally we search for the maximizing vector, but [0,1] is usually good for upper-triangular shear
            // Actually, let's start with a normalized random vector or just [1/sqrt2, 1/sqrt2]?
            // For [[r, k], [0, r]], eigenvectors are [1, 0].
            // [0, 1] gets transformed to [k, r]. Expansion is huge!

            const mags = [Math.sqrt(x * x + y * y)];
            for (let i = 0; i < steps; i++) {
                const nx = r * x + k * y;
                const ny = 0 * x + r * y;
                x = nx; y = ny;
                mags.push(Math.sqrt(x * x + y * y));
            }
            return mags;
        };

        const data = simulate(rho, shear);
        const baseline = simulate(rho, 0); // Normal matrix (no shear)

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Scale
        const maxVal = Math.max(...data, ...baseline, 2);
        const xScale = (width - 2 * padding) / steps;
        const yScale = (height - 2 * padding) / maxVal;

        // Draw Helper
        const plot = (vals: number[], color: string, widthPx: number) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = widthPx;
            vals.forEach((v, i) => {
                const px = padding + i * xScale;
                const py = height - padding - v * yScale;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();
        };

        // Plot Baseline (Normal)
        plot(baseline, '#22d3ee', 2);

        // Plot Current (Shear)
        plot(data, '#ffcc00', 3);

        // Peak Marker
        if (stats.isTransient) {
            const maxM = Math.max(...data);
            const idx = data.indexOf(maxM);
            const px = padding + idx * xScale;
            const py = height - padding - maxM * yScale;

            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(`Peak: ${maxM.toFixed(1)}`, px + 10, py);
        }

        // Grid at y=1 (Stability Line)
        const y1 = height - padding - 1 * yScale;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, y1);
        ctx.lineTo(width - padding, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#aaa';
        ctx.fillText("Initial Magnitude (1.0)", width - padding - 120, y1 - 5);

    }, [rho, shear, stats]);

    return (
        <div className={styles.container} style={{ marginTop: '3rem' }}>
            <div className={styles.controls}>
                <h3>Interactive: Radius vs Norm</h3>
                <p className={styles.prose} style={{ fontSize: '1rem', marginBottom: '2.5rem' }}>
                    Adjust the <strong>Shear</strong> to see how <strong>Non-Normal</strong> matrices behave.
                    Notice how the signal can explode (Transient Growth) even if the Radius is stable!
                </p>

                <div className={styles.sliderContainer} style={{ background: 'transparent', padding: 0, marginBottom: '3rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <label className={styles.sliderLabel}>
                            Spectral Radius $\rho$ <strong>{rho.toFixed(2)}</strong>
                        </label>
                        <input
                            type="range" min="0.5" max="1.1" step="0.01"
                            value={rho} onChange={e => setRho(parseFloat(e.target.value))}
                            className={styles.slider}
                        />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <label className={styles.sliderLabel}>
                            Shear $k$ (Normality) <strong>{shear.toFixed(1)}</strong>
                        </label>
                        <input
                            type="range" min="0" max="10" step="0.1"
                            value={shear} onChange={e => setShear(parseFloat(e.target.value))}
                            className={styles.slider}
                        />
                    </div>
                </div>

                <div style={{ background: 'hsla(0,0%,100%,0.03)', border: '1px solid var(--border-subtle)', padding: '1.5rem 2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Matrix Display */}
                    <div className={styles.matrixDisplay} style={{ marginBottom: 0 }}>
                        <div className={styles.matrixLabel}>A = </div>
                        <div className={styles.matrixBrackets}>
                            <div className={styles.matrixRow}>
                                <span style={{ color: 'var(--text-primary)' }}>{rho.toFixed(2)}</span>
                                <span style={{ color: '#22d3ee', marginLeft: '1rem' }}>{shear.toFixed(1)}</span>
                            </div>
                            <div className={styles.matrixRow}>
                                <span style={{ color: 'var(--text-primary)' }}>0.00</span>
                                <span style={{ color: 'var(--text-primary)', marginLeft: '1rem' }}>{rho.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '2.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Spectral Radius</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: stats.radius > 1 ? '#f43f5e' : '#10b981' }}>
                                {stats.radius.toFixed(3)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Spectral Norm</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: stats.norm > 1 ? '#fbbf24' : '#22d3ee' }}>
                                {stats.norm.toFixed(3)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Alert Area */}
                <div style={{ marginTop: '2.5rem', height: '3.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className={styles.eigenAlert} style={{ opacity: (stats.isTransient || stats.radius >= 1 || (stats.radius < 1 && !stats.isTransient)) ? 1 : 0 }}>
                        {stats.isTransient && (
                            <span>⚠️ <strong>Transient Growth!</strong> Stable long-term, but explodes initially.</span>
                        )}
                        {stats.radius >= 1 && (
                            <span style={{ color: '#f43f5e' }}>❌ <strong>Unstable!</strong> Signal will explode forever.</span>
                        )}
                        {!stats.isTransient && stats.radius < 1 && (
                            <span style={{ color: '#10b981' }}>✅ <strong>Stable Decay.</strong></span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <canvas ref={canvasRef} width={800} height={400} className={styles.svg} style={{ marginTop: '1rem' }} />

                <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#22d3ee', borderRadius: '2px' }}></div>
                        <span style={{ color: 'var(--text-secondary)' }}>Normal Matrix</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#fbbf24', borderRadius: '2px' }}></div>
                        <span style={{ color: 'var(--text-secondary)' }}>Current Matrix</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
