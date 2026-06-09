"use client";

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ScalarDerivativeViz from '../../components/ScalarDerivativeViz';
import VectorGradientViz from '../../components/VectorGradientViz';
import JacobianViz from '../../components/JacobianViz';
import HessianViz from '../../components/HessianViz';

export default function MatrixCalculusPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
            <nav className="p-6 flex justify-between items-center glass-panel m-4 mb-12">
                <Link href="/" className="text-xl font-bold title-gradient hover:opacity-80 transition-opacity">
                    Math Intuitions
                </Link>
                <div className="flex gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                        Home
                    </Link>
                    <Link href="/loss-landscapes" className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                        Loss Landscapes
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto px-4 max-w-3xl">
                <header className={styles.header}>
                    <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight title-gradient">
                        Matrix Calculus Visualized
                    </h1>
                    <p className={styles.introText}>
                        The mathematics of change in high dimensions. Understanding gradients, Jacobians, and Hessians is essential for deep learning—these are the tools that let neural networks learn from data.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <span className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">Backpropagation</span>
                        <span className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">Optimization</span>
                        <span className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">Neural Networks</span>
                    </div>
                </header>

                {/* SECTION 1: NOTATION */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>1. The Building Blocks</h2>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            Neural networks operate in spaces with thousands or millions of dimensions. Each weight is a coordinate, and training means navigating this vast landscape.
                        </p>
                    </div>

                    <div className={styles.notationGrid}>
                        <div className={styles.notationCard}>
                            <h3 className="font-semibold mb-1 text-lg">Scalar</h3>
                            <div className={styles.mathDisplay}>x ∈ ℝ</div>
                            <p className="text-xs text-[var(--text-dim)]">A single number</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-70">loss, learning rate</p>
                        </div>

                        <div className={styles.notationCard}>
                            <h3 className="font-semibold mb-1 text-lg">Vector</h3>
                            <div className={styles.mathDisplay}>x ∈ ℝ<sup>n</sup></div>
                            <p className="text-xs text-[var(--text-dim)]">A list of n numbers</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-70">gradients, activations</p>
                        </div>

                        <div className={styles.notationCard}>
                            <h3 className="font-semibold mb-1 text-lg">Matrix</h3>
                            <div className={styles.mathDisplay}>A ∈ ℝ<sup>m×n</sup></div>
                            <p className="text-xs text-[var(--text-dim)]">m×n array of numbers</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-70">weights, Jacobians</p>
                        </div>
                    </div>

                    <div className={styles.tipBox}>
                        <h3>Key insight</h3>
                        <p>
                            Derivatives come in different "shapes" depending on what you differentiate. A scalar function of a vector gives a gradient (vector). A vector function of a vector gives a Jacobian (matrix). Understanding these shapes is half the battle.
                        </p>
                    </div>
                </section>

                {/* SECTION 2: SCALAR DERIVATIVE */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>2. The Scalar Derivative</h2>
                        <p className="text-sm text-[var(--text-dim)] mt-2">f: ℝ → ℝ</p>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            The derivative <span className={styles.math}>df/dx</span> answers a simple question: <em>if I nudge x by a tiny amount, how much does f change?</em> This ratio is the slope of the tangent line.
                        </p>
                    </div>

                    <div className={styles.mathBlock}>
                        df/dx = lim<sub>h→0</sub> [f(x+h) - f(x)] / h
                    </div>

                    <div className={styles.vizWrapper}>
                        <div className={styles.vizInner}>
                            <ScalarDerivativeViz className="w-full" />
                        </div>
                    </div>

                    <div className={`${styles.featureGrid} ${styles.featureGrid3}`}>
                        <div className={styles.featureCard} style={{ textAlign: 'center' }}>
                            <div className="text-[var(--accent)] text-2xl font-bold mb-2">+</div>
                            <p>Function increasing</p>
                        </div>
                        <div className={styles.featureCard} style={{ textAlign: 'center' }}>
                            <div className="text-red-400 text-2xl font-bold mb-2">−</div>
                            <p>Function decreasing</p>
                        </div>
                        <div className={styles.featureCard} style={{ textAlign: 'center' }}>
                            <div className="text-[var(--text-primary)] text-2xl font-bold mb-2">0</div>
                            <p>Critical point</p>
                        </div>
                    </div>

                    <div className={styles.tipBox}>
                        <h3>The Hierarchy of Derivatives</h3>
                        <p style={{ marginBottom: '1rem' }}>
                            Everything that follows—gradients, Jacobians, Hessians—is built from this simple idea of "sensitivity to change."
                        </p>
                        <div className={styles.hierarchyRow}>
                            <span className={styles.hierarchyLabel}>Derivative</span>
                            <span className={styles.hierarchyArrow}>→</span>
                            <span className={styles.hierarchyDesc}>scalar → scalar</span>
                        </div>
                        <div className={styles.hierarchyRow}>
                            <span className={styles.hierarchyLabel}>Gradient</span>
                            <span className={styles.hierarchyArrow}>→</span>
                            <span className={styles.hierarchyDesc}>vector → scalar (many inputs, one output)</span>
                        </div>
                        <div className={styles.hierarchyRow}>
                            <span className={styles.hierarchyLabel}>Jacobian</span>
                            <span className={styles.hierarchyArrow}>→</span>
                            <span className={styles.hierarchyDesc}>vector → vector (many inputs, many outputs)</span>
                        </div>
                        <div className={styles.hierarchyRow}>
                            <span className={styles.hierarchyLabel}>Hessian</span>
                            <span className={styles.hierarchyArrow}>→</span>
                            <span className={styles.hierarchyDesc}>second derivatives (curvature)</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: THE GRADIENT */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>3. The Gradient</h2>
                        <p className="text-sm text-[var(--text-dim)] mt-2">f: ℝ<sup>n</sup> → ℝ</p>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            When your function has multiple inputs but produces a single number (like a loss function), the gradient collects all partial derivatives into one vector. Each component tells you: <em>how sensitive is the output to this particular input?</em>
                        </p>
                    </div>

                    <div className={styles.mathBlock}>
                        ∇f = [ ∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ ]ᵀ
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>The Mountain Compass</h3>
                        <p>
                            Imagine standing blindfolded on a foggy mountain. You can only feel the ground beneath your feet. The gradient tells you: <em>which direction goes uphill fastest, and how steep is it?</em>
                        </p>

                        <div className={`${styles.featureGrid} ${styles.featureGrid2}`}>
                            <div className={styles.featureCard}>
                                <h4>Direction</h4>
                                <p>Points toward steepest ascent. A ball would roll the opposite way.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <h4>Magnitude</h4>
                                <p>How steep the slope is. Large = cliff, small = gentle, zero = flat.</p>
                            </div>
                        </div>

                        <div className={styles.callout}>
                            <h4>Gradient Descent</h4>
                            <p>
                                Training means minimizing loss. Compute the gradient, step in the <em>opposite</em> direction (downhill). This is backpropagation: compute gradients, update weights, repeat.
                            </p>
                            <div className={styles.math} style={{ display: 'inline-block', marginTop: '0.75rem' }}>
                                w ← w − η∇L(w)
                            </div>
                        </div>
                    </div>

                    <div className={styles.vizWrapper}>
                        <div className={styles.vizInner}>
                            <VectorGradientViz className="w-full" />
                        </div>
                    </div>
                </section>

                {/* SECTION 4: THE JACOBIAN */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>4. The Jacobian</h2>
                        <p className="text-sm text-[var(--text-dim)] mt-2">F: ℝ<sup>n</sup> → ℝ<sup>m</sup></p>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            When your function has multiple inputs <em>and</em> multiple outputs (like a neural network layer), you need a matrix to capture all sensitivities. Entry (i,j) tells you how output i changes when you nudge input j.
                        </p>
                    </div>

                    <div className={styles.mathBlock}>
                        J<sub>ij</sub> = ∂f<sub>i</sub> / ∂x<sub>j</sub>
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>The Sensitivity Matrix</h3>
                        <p>
                            Think of a mixing board with many input channels and output speakers. The Jacobian is the complete sensitivity map: wiggle any dial, and it tells you exactly how each speaker responds.
                        </p>

                        <div className={styles.matrixTable}>
                            <div className="text-[var(--text-dim)] mb-3 text-xs">n inputs → m outputs:</div>
                            <table style={{ borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td className="pr-3 text-[var(--accent)]">J =</td>
                                        <td style={{ borderLeft: '2px solid var(--text-dim)', borderTop: '2px solid var(--text-dim)', padding: '0.5rem' }}>∂f₁/∂x₁</td>
                                        <td style={{ borderTop: '2px solid var(--text-dim)', padding: '0.5rem' }}>⋯</td>
                                        <td style={{ borderRight: '2px solid var(--text-dim)', borderTop: '2px solid var(--text-dim)', padding: '0.5rem' }}>∂f₁/∂xₙ</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td style={{ borderLeft: '2px solid var(--text-dim)', padding: '0.5rem' }}>⋮</td>
                                        <td style={{ padding: '0.5rem' }}>⋱</td>
                                        <td style={{ borderRight: '2px solid var(--text-dim)', padding: '0.5rem' }}>⋮</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td style={{ borderLeft: '2px solid var(--text-dim)', borderBottom: '2px solid var(--text-dim)', padding: '0.5rem' }}>∂fₘ/∂x₁</td>
                                        <td style={{ borderBottom: '2px solid var(--text-dim)', padding: '0.5rem' }}>⋯</td>
                                        <td style={{ borderRight: '2px solid var(--text-dim)', borderBottom: '2px solid var(--text-dim)', padding: '0.5rem' }}>∂fₘ/∂xₙ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className={`${styles.featureGrid} ${styles.featureGrid2}`}>
                            <div className={styles.featureCard}>
                                <h4>Each row</h4>
                                <p>Gradient of one output with respect to all inputs</p>
                            </div>
                            <div className={styles.featureCard}>
                                <h4>Each column</h4>
                                <p>How one input affects all outputs</p>
                            </div>
                        </div>

                        <div className={styles.callout}>
                            <h4>The Chain Rule in Matrix Form</h4>
                            <p>
                                Backpropagation chains Jacobians. For composed layers g(f(x)), the overall Jacobian is <span className={styles.math}>J<sub>g</sub> · J<sub>f</sub></span>. This matrix multiplication is how gradients flow backward.
                            </p>
                        </div>
                    </div>

                    <div className={`${styles.featureGrid} ${styles.featureGrid2}`} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.infoBox}>
                            <h4>When m = 1</h4>
                            <p>The Jacobian collapses to a row vector—the gradient transpose.</p>
                        </div>
                        <div className={styles.infoBox}>
                            <h4>Geometric view</h4>
                            <p>The Jacobian describes how the function locally stretches, rotates, and shears space.</p>
                        </div>
                    </div>

                    <div className={styles.vizWrapper}>
                        <div className={styles.vizInner}>
                            <JacobianViz className="w-full" />
                        </div>
                    </div>
                    <p className={styles.vizCaption}>
                        How the Jacobian transforms a unit square into a parallelogram
                    </p>
                </section>

                {/* SECTION 5: THE HESSIAN */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>5. The Hessian</h2>
                        <p className="text-sm text-[var(--text-dim)] mt-2">Second-order derivatives of f: ℝ<sup>n</sup> → ℝ</p>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            The gradient tells you which way is downhill, but not how the terrain <em>curves</em>. Is the slope getting steeper or flatter? The Hessian answers this—it's the matrix of all second partial derivatives.
                        </p>
                    </div>

                    <div className={styles.mathBlock}>
                        H<sub>ij</sub> = ∂²f / ∂x<sub>i</sub>∂x<sub>j</sub>
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>Reading the Terrain</h3>
                        <p>
                            Back to the mountain. You know you're on a slope, but what kind of terrain surrounds you? The Hessian tells you the <em>shape</em> of the ground:
                        </p>

                        <div className={`${styles.featureGrid} ${styles.featureGrid3}`} style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className={styles.shapeCard} style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                                <div className={styles.icon}>∪</div>
                                <h4 style={{ color: 'rgb(74, 222, 128)' }}>Bowl</h4>
                                <p>Curves up everywhere. A minimum.</p>
                            </div>
                            <div className={styles.shapeCard} style={{ borderColor: 'rgba(248, 113, 113, 0.2)' }}>
                                <div className={styles.icon}>∩</div>
                                <h4 style={{ color: 'rgb(248, 113, 113)' }}>Peak</h4>
                                <p>Curves down everywhere. A maximum.</p>
                            </div>
                            <div className={styles.shapeCard} style={{ borderColor: 'rgba(251, 146, 60, 0.2)' }}>
                                <div className={styles.icon}>〰</div>
                                <h4 style={{ color: 'rgb(251, 146, 60)' }}>Saddle</h4>
                                <p>Up in some directions, down in others.</p>
                            </div>
                        </div>

                        <div className={styles.infoBox}>
                            <h4>Eigenvalues Classify the Shape</h4>
                            <p style={{ marginBottom: '0.75rem' }}>The Hessian's eigenvalues tell you the curvature in each principal direction:</p>
                            <ul className={styles.indicatorList}>
                                <li>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(74, 222, 128)', flexShrink: 0 }}></span>
                                    <span><strong>All positive:</strong> Bowl (local minimum)</span>
                                </li>
                                <li>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(248, 113, 113)', flexShrink: 0 }}></span>
                                    <span><strong>All negative:</strong> Peak (local maximum)</span>
                                </li>
                                <li>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(251, 146, 60)', flexShrink: 0 }}></span>
                                    <span><strong>Mixed signs:</strong> Saddle point</span>
                                </li>
                                <li>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-dim)', flexShrink: 0 }}></span>
                                    <span><strong>Some zeros:</strong> Flat direction (degenerate)</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.callout}>
                            <h4>Why This Matters for Optimization</h4>
                            <p>
                                High curvature (large eigenvalues) means loss changes rapidly—use small learning rates. Low curvature means you can take bigger steps. The <em>condition number</em> (ratio of largest to smallest eigenvalue) determines how "stretched" the landscape is—stretched landscapes are harder to optimize.
                            </p>
                        </div>
                    </div>

                    <div className={styles.infoBox} style={{ marginTop: '1.5rem' }}>
                        <h4>Newton's Method: Using Curvature</h4>
                        <p>
                            While gradient descent uses only first-order info, Newton's method uses the Hessian for smarter steps:
                        </p>
                        <div className={styles.math} style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                            x ← x − H⁻¹∇f
                        </div>
                        <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Computing and inverting the Hessian is expensive for large networks—hence approximations like Adam.
                        </p>
                    </div>

                    <div className={styles.vizWrapper}>
                        <div className={styles.vizInner}>
                            <HessianViz className="w-full" />
                        </div>
                    </div>
                </section>

                {/* SECTION 6: CHAIN RULE */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>6. The Chain Rule</h2>
                        <p className="text-sm text-[var(--text-dim)] mt-2">The backbone of backpropagation</p>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            Neural networks are compositions of functions: layer after layer, activation after activation. The chain rule tells us how to differentiate through this composition.
                        </p>
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>From Scalars to Matrices</h3>

                        <div className={styles.infoBox}>
                            <h4>Scalar version</h4>
                            <p>If y = g(x) and z = f(y), then:</p>
                            <div className={styles.math} style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                                dz/dx = (dz/dy) · (dy/dx)
                            </div>
                        </div>

                        <div className={styles.infoBox}>
                            <h4>Vector version</h4>
                            <p>For composed functions, the Jacobian of the composition is:</p>
                            <div className={styles.math} style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                                J<sub>f∘g</sub> = J<sub>f</sub> · J<sub>g</sub>
                            </div>
                        </div>

                        <div className={styles.callout}>
                            <h4>Backpropagation in Action</h4>
                            <p>
                                We start with the gradient of loss w.r.t. final output, then multiply by each layer's Jacobian going backward. The "vector-Jacobian product" (VJP) computes this efficiently without forming the full Jacobian.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION 7: FROM MATH TO CODE */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>7. From Math to Code</h2>
                        <p className="text-sm text-[var(--text-dim)] mt-2">How autodiff actually works</p>
                    </div>
                    <div className={styles.prose}>
                        <p>
                            This is the critical question when moving from theory to implementation: <em>where do Jacobians actually appear in PyTorch and TensorFlow?</em>
                        </p>
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>Gradient vs. Jacobian</h3>
                        <p>
                            Think of the Jacobian as the general rule, and the Gradient as a special case.
                        </p>

                        <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
                            <table className={styles.summaryTable}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Gradient ∇f</th>
                                        <th>Jacobian J</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Output</td>
                                        <td>Scalar (one number)</td>
                                        <td>Vector (many numbers)</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Shape</td>
                                        <td>Vector</td>
                                        <td>Matrix</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Example</td>
                                        <td>Loss function → one error score</td>
                                        <td>Hidden layer → many activations</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.callout}>
                            <h4>The Connection</h4>
                            <p>
                                If a function has scalar output (like Loss), its Jacobian has only one row. That single row <em>is</em> the gradient (transposed).
                            </p>
                        </div>
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>Where Jacobians Appear in AutoDiff</h3>
                        <p>
                            Automatic differentiation is just the chain rule applied repeatedly. For vectors, this means multiplying Jacobians.
                        </p>

                        <div className={styles.infoBox} style={{ marginTop: '1rem' }}>
                            <h4>A Simple Network</h4>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>x</span>
                                <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>→</span>
                                <span style={{ color: 'var(--accent)' }}>Layer 1</span>
                                <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>→</span>
                                <span style={{ color: 'var(--text-secondary)' }}>h</span>
                                <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>→</span>
                                <span style={{ color: 'var(--accent)' }}>Layer 2</span>
                                <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>→</span>
                                <span style={{ color: 'var(--text-secondary)' }}>y</span>
                                <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>→</span>
                                <span style={{ color: 'var(--accent)' }}>Loss</span>
                                <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>→</span>
                                <span style={{ color: 'var(--text-secondary)' }}>L</span>
                            </div>
                        </div>

                        <p style={{ marginTop: '1rem' }}>
                            To find the gradient of Loss w.r.t. input x, we chain the derivatives backward:
                        </p>

                        <div className={styles.mathBlock}>
                            ∂L/∂x = <span style={{ color: 'var(--text-secondary)' }}>(∂L/∂y)</span> · <span style={{ color: 'var(--accent)' }}>J₂</span> · <span style={{ color: 'var(--accent)' }}>J₁</span>
                        </div>

                        <ul className={styles.bulletList}>
                            <li><strong>Layer 1</strong> transforms vector x to vector h. Its derivative is Jacobian J₁.</li>
                            <li><strong>Layer 2</strong> transforms vector h to vector y. Its derivative is Jacobian J₂.</li>
                            <li><strong>Loss</strong> outputs a scalar, so ∂L/∂y is a gradient (row vector).</li>
                        </ul>
                    </div>

                    <div className={styles.contentPanel}>
                        <h3>The Secret: Vector-Jacobian Products</h3>
                        <p>
                            You might wonder: if networks have millions of neurons, wouldn't Jacobians be massive (1M × 1M)? That would crash any GPU.
                        </p>
                        <p>
                            <strong>We never actually build the full Jacobian.</strong> Instead, we compute Vector-Jacobian Products (VJPs).
                        </p>

                        <div className={styles.infoBox}>
                            <h4>How Backprop Actually Works</h4>
                            <ol style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0' }}>
                                <li style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>1.</span>
                                    <span>Start with gradient of Loss (∂L/∂y). This is a <strong style={{ color: 'var(--text-primary)' }}>vector</strong>.</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>2.</span>
                                    <span>Multiply that vector by J₂. Don't build J₂—just compute the product. Result: another <strong style={{ color: 'var(--text-primary)' }}>vector</strong>.</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>3.</span>
                                    <span>Multiply that vector by J₁. Result: the gradient we wanted.</span>
                                </li>
                            </ol>
                        </div>

                        <div className={styles.callout}>
                            <h4>Why This Matters</h4>
                            <p>
                                We use Jacobians to <em>define</em> the chain rule conceptually. But in practice, autodiff only computes vector-Jacobian products—never storing the full matrix. This is what makes training million-parameter networks possible.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SUMMARY TABLE */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Summary</h2>
                    </div>

                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <table className={styles.summaryTable}>
                            <thead>
                                <tr>
                                    <th>Object</th>
                                    <th>Shape</th>
                                    <th>Function Type</th>
                                    <th>What It Tells You</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>Derivative</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>scalar</td>
                                    <td>ℝ → ℝ</td>
                                    <td>Slope of tangent line</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>Gradient</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>n × 1</td>
                                    <td>ℝ<sup>n</sup> → ℝ</td>
                                    <td>Direction of steepest ascent</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>Jacobian</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>m × n</td>
                                    <td>ℝ<sup>n</sup> → ℝ<sup>m</sup></td>
                                    <td>All input-output sensitivities</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>Hessian</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>n × n</td>
                                    <td>ℝ<sup>n</sup> → ℝ</td>
                                    <td>Local curvature</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.tipBox} style={{ marginTop: '2rem' }}>
                        <h3>The Big Picture</h3>
                        <p>
                            All these objects answer the same question: <em>how does output change when I change input?</em> The gradient gives direction for minimizing loss. The Jacobian chains derivatives through layers. The Hessian reveals curvature for smarter optimization. Together, they form the mathematical foundation of deep learning.
                        </p>
                    </div>
                </section>

                {/* REFERENCES */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>References</h2>
                    </div>
                    <ul className={styles.bulletList}>
                        <li>Strang, G. (2016). <em>Introduction to Linear Algebra</em>. Wellesley-Cambridge Press.</li>
                        <li>Stewart, J. (2015). <em>Calculus: Early Transcendentals</em>. Cengage Learning.</li>
                        <li>Goodfellow, I., Bengio, Y., & Courville, A. (2016). <em>Deep Learning</em>. MIT Press.</li>
                    </ul>
                </section>
            </main>

            <footer className="text-center text-[var(--text-dim)] py-16 border-t border-[var(--border-subtle)]">
                <p className="text-sm">Designed to help visualize the math behind the code.</p>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                    <a href="https://explained.ai/matrix-calculus/" target="_blank" className="hover:text-[var(--accent)] transition-colors">Explained.ai</a>
                    <span>•</span>
                    <Link href="/" className="hover:text-[var(--accent)] transition-colors">Back Home</Link>
                </div>
            </footer>
        </div>
    );
}
