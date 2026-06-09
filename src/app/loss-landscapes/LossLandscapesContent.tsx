'use client';

import React from 'react';
import LossLandscapeViz from '../../components/LossLandscapeViz';
import styles from './loss.module.css';
import ManifoldTimelineLayout from '../../components/ManifoldTimelineLayout';

export default function LossLandscapesContent() {
  const sections = [
    {
      id: 'intro',
      label: 'Introduction',
      shortLabel: 'Intro',
      content: (
        <div className={styles.prose}>
          <p>
            <strong>The Problem:</strong> In traditional deep learning, we often struggle to visualize what's actually happening inside the "Black Box."
            Neural networks live in million-dimensional spaces, yet we are stuck looking at 2D screens.
          </p>
          <p>
            To convey the mathematical changes in the loss landscape during fine-tuning (specifically the transition from
            <em> smooth/flat</em> to <em>sharp/chaotic</em>), researchers use several specific types of visualizations.
          </p>
          <p>
            Based on the 2018 NeurIPS paper <em>"Visualizing the Loss Landscape of Neural Nets"</em> (Li et al.)
            and the newer 2024 findings on <em>Catastrophic Forgetting</em>, here are the key visualizations and the mathematical forms they take.
          </p>
        </div>
      ),
    },
    {
      id: 'contour',
      label: '2D Loss Contour Plots',
      shortLabel: 'Contours',
      content: (
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>2D Loss Contour Plots</h3>
          <div className={styles.prose}>
            <p>
              This is the primary visualization used to show "sharpness" vs. "flatness."
              To verify this mathematically, researchers plot a slice of the high-dimensional loss function <code className={styles.math}>L(θ)</code> on a 2D plane defined by two random direction vectors, <code className={styles.math}>δ</code> and <code className={styles.math}>η</code>.
            </p>

            <div className={styles.mathBlock}>
              f(α, β) = L(θ* + α·δ + β·η)
            </div>

            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: 1.8 }}>
              <li><code className={styles.math}>θ*</code>: The weights of your fine-tuned model (the center of the plot).</li>
              <li><code className={styles.math}>α, β</code>: Scalar coefficients (the x and y axes of the plot).</li>
              <li><code className={styles.math}>δ, η</code>: Random direction vectors (filter-normalized).</li>
            </ul>

            <p>
              <strong>What it conveys:</strong>
              <br />
              For <strong>Standard Fine-Tuning</strong>, the contours look jagged, narrow, or chaotic (like a steep ravine).
              This mathematically indicates high local curvature and instability (susceptibility to catastrophic forgetting).
              <br /><br />
              For <strong>Robust Fine-Tuning</strong> (e.g., with SAM), the contours look like wide, smooth, convex bowls.
              This indicates a "flat minimum" where the loss doesn't change much if weights are perturbed.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'hessian',
      label: 'Hessian Eigenspectrum',
      shortLabel: 'Hessian',
      content: (
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>Hessian Eigenspectrum</h3>
          <div className={styles.prose}>
            <p>
              This is the most rigorous "mathematical form" of visualization because it directly measures convexity.
              You calculate the eigenvalues (<code className={styles.math}>λ</code>) of the Hessian matrix (<code className={styles.math}>H = ∇²L</code>).
            </p>

            <p>
              Since you can't plot a million eigenvalues, you create a density plot (histogram) of the eigenvalue distribution:
              <br />
              <strong>x-axis:</strong> The value of the eigenvalue <code className={styles.math}>λ</code>.
              <br />
              <strong>y-axis:</strong> The density (frequency).
            </p>

            <p>
              <strong>What it conveys:</strong>
              <br />
              <strong>Sharp/Chaotic:</strong> The plot will have a long "tail" extending far to the right (large positive eigenvalues, indicating steep walls) and potentially a significant spread into negative values (indicating saddle points/instability).
              <br />
              <strong>Flat/Convex:</strong> The eigenvalues are clustered tightly around zero. This mathematically proves the "flatness" seen in the 2D plots.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'findings',
      label: 'The Findings',
      shortLabel: 'Findings',
      content: (
        <div>
          <div className={styles.prose}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Fine-Tuning Leads to Sharper, More "Disturbed" Landscapes</h3>
            <p>
              The authors of the 2024 EMNLP paper found that as you fine-tune an LLM on new tasks—especially when those tasks differ significantly from the model's prior training (creating a "Task Gap")—the loss landscape transitions from being relatively flat/smooth to becoming sharper and more disturbed.
            </p>
            <p>
              <strong>Sharpness Correlates with Catastrophic Forgetting.</strong> The core finding is a direct link between this geometry and forgetting.
              Models that maintain a flatter loss landscape during fine-tuning (e.g., via SAM) are more robust and retain previous capabilities better.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '0.5rem' }}>
              <LossLandscapeViz />
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
              Interactive: Drag "Training Duration" to see the landscape transition from Flat (Pre-trained) to Sharp (Fine-tuned).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'appendix',
      label: 'Appendix: Advanced Visualizations',
      shortLabel: 'Appendix',
      content: (
        <div>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.95rem', fontStyle: 'italic' }}>
            These are additional visualization techniques used in research papers to analyze loss landscapes.
          </p>

          <div className={styles.conceptCard}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>1D Linear Interpolation</h3>

          <div style={{ background: 'var(--bg-primary)', height: '160px', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
              <line x1="20" y1="80" x2="180" y2="80" stroke="var(--text-dim)" strokeWidth="1" />
              <line x1="20" y1="80" x2="20" y2="20" stroke="var(--text-dim)" strokeWidth="1" />
              <path d="M 20 60 Q 60 70, 100 30 Q 140 70, 180 50" fill="none" stroke="var(--accent)" strokeWidth="2" />
              <circle cx="20" cy="60" r="3" fill="var(--text-primary)" />
              <text x="25" y="55" fontSize="8" fill="var(--text-primary)">θ_pre</text>
              <circle cx="180" cy="50" r="3" fill="var(--text-primary)" />
              <text x="160" y="45" fontSize="8" fill="var(--text-primary)">θ_fine</text>
              <text x="90" y="25" fontSize="8" fill="var(--accent)">Barrier</text>
            </svg>
          </div>

          <div className={styles.prose} style={{ fontSize: '0.95rem' }}>
            <p>
              This visualizes the geometry of the path between the pre-trained model and the fine-tuned model.
              You plot the loss along a straight line connecting the pre-trained weights (<code className={styles.math}>θ_pre</code>) and the fine-tuned weights (<code className={styles.math}>θ_fine</code>).
            </p>
            <div className={styles.mathBlock} style={{ padding: '1rem', fontSize: '0.9rem', margin: '1rem 0' }}>
              f(α) = L((1-α)θ_pre + α·θ_fine)
            </div>
            <p>
              <strong>Barrier Height:</strong> Often, there is a "bump" or barrier in loss between the two models.
              A lower barrier suggests the models remain in the same "basin" of the landscape, which mathematically correlates with less forgetting.
            </p>
            <p>
              <strong>Basin Width:</strong> It shows how "wide" the low-loss region is around the fine-tuned solution.
            </p>
          </div>
          </div>

          <div className={styles.conceptCard} style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Trajectory PCA</h3>

            <div style={{ background: 'var(--bg-primary)', height: '160px', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                <ellipse cx="100" cy="50" rx="80" ry="40" stroke="var(--border-subtle)" fill="none" opacity="0.5" />
                <ellipse cx="100" cy="50" rx="60" ry="30" stroke="var(--border-subtle)" fill="none" opacity="0.5" />
                <ellipse cx="100" cy="50" rx="40" ry="20" stroke="var(--border-subtle)" fill="none" opacity="0.5" />
                <path d="M 100 50 C 110 40, 130 60, 150 40" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="100" cy="50" r="3" fill="var(--text-primary)" />
                <text x="80" y="50" fontSize="8" fill="var(--text-primary)">Start</text>
                <circle cx="150" cy="40" r="3" fill="#ef4444" />
                <text x="155" y="40" fontSize="8" fill="#ef4444">End</text>
              </svg>
            </div>

            <div className={styles.prose} style={{ fontSize: '0.95rem' }}>
              <p>
                This visualizes the path the model took during fine-tuning, projected onto its most significant dimensions rather than random ones.
              </p>
              <div className={styles.mathBlock} style={{ padding: '1rem', fontSize: '0.9rem', margin: '1rem 0' }}>
                Mathematical Form: You collect the weight vectors at every step of training:
                <br />
                <code className={styles.math} style={{ fontSize: '0.9em' }}>M = [θ_0, θ_1, ..., θ_n]</code>.
                <br />
                You run PCA on M to find the top 2 principal directions (PC1, PC2) and project the trajectory onto them.
              </div>
              <p>
                <strong>What it conveys:</strong>
                <br />
                It typically reveals that fine-tuning happens in an extremely low-dimensional subspace.
                It can visually show if the model "escaped" the pre-trained basin (drastic movement away from the start) or "orbited" within it (retaining knowledge).
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <ManifoldTimelineLayout sections={sections} />;
}
