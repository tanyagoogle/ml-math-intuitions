'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import vizStyles from './visualization.module.css';
import LinearTransformation from '../../components/LinearTransformation';
import MatrixTransformationViz from '../../components/MatrixTransformationViz';
import NetworkSimulation from '../../components/NetworkSimulation';
import NormVsRadiusViz from '../../components/NormVsRadiusViz';

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  content: ReactNode;
}

export default function EigenvaluesContent() {
  const sections: Section[] = [
    {
      id: 'eigenvectors',
      label: 'Eigenvectors',
      shortLabel: 'Eigenvectors',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Eigenvectors: The Special Directions</h2>
          <p className={vizStyles.prose}>
            In Machine Learning, we often talk about matrices as <strong>transformations</strong> of space.
            Most vectors change direction when transformed by a matrix A.
            However, there are special vectors that <em>only scale</em>. These are <strong>Eigenvectors</strong>.
          </p>

          <div className={vizStyles.container}>
            <LinearTransformation />
          </div>
        </div>
      ),
    },
    {
      id: 'microphone',
      label: 'The Microphone Analogy',
      shortLabel: 'Analogy',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Intuition: The &quot;Microphone Feedback&quot; Loop</h2>
          <p className={vizStyles.prose}>
            Imagine a Deep Neural Network as a line of 100 speakers and microphones.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4>Input</h4>
              <p>You whisper into the first microphone.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Layer</h4>
              <p>It amplifies the sound and passes it to the next speaker.</p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            Each layer is a matrix multiplication. The <strong>Eigenvalue (λ)</strong> is simply the &quot;Volume Knob&quot; setting of that matrix.
          </p>

          <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(245, 163, 163, 0.06)',
              border: '1px solid rgba(245, 163, 163, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              borderLeft: '4px solid var(--color-red)',
            }}>
              <h4 style={{ color: 'var(--color-red)', margin: 0, marginBottom: '0.75rem' }}>λ &gt; 1 (Explosion)</h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
                If every layer amplifies the signal by just 10% (1.1x), after 100 layers, the signal isn&apos;t 1.1x louder.
                It is 1.1¹⁰⁰ ≈ 13,780x louder! The network crashes (NaN).
              </p>
            </div>

            <div style={{
              background: 'rgba(245, 163, 163, 0.06)',
              border: '1px solid rgba(245, 163, 163, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              borderLeft: '4px solid var(--color-red)',
            }}>
              <h4 style={{ color: 'var(--color-red)', margin: 0, marginBottom: '0.75rem' }}>λ &lt; 1 (Vanishing)</h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
                If every layer dampens the signal by 10% (0.9x), after 100 layers: 0.9¹⁰⁰ ≈ 0.00002. The signal dies.
              </p>
            </div>

            <div style={{
              background: 'rgba(110, 231, 168, 0.06)',
              border: '1px solid rgba(110, 231, 168, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              borderLeft: '4px solid var(--color-green)',
            }}>
              <h4 style={{ color: 'var(--color-green)', margin: 0, marginBottom: '0.75rem' }}>λ = 1 (The Sweet Spot)</h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
                The signal passes through unchanged. This is &quot;Stability.&quot;
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'transient',
      label: 'Transient Growth',
      shortLabel: 'Transient',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Scale, Rotate, and &quot;Transient Growth&quot;</h2>
          <p className={vizStyles.prose}>
            But matrices don&apos;t just have one volume knob. They stretch space in different directions.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4>Spectral Radius ρ(A)</h4>
              <p>The long-term speed limit. It predicts if the signal will explode or vanish <em>eventually</em> (after many layers).</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Spectral Norm ‖A‖₂</h4>
              <p>The single-step stretch. It tells us the <em>maximum</em> possible amplification in just one layer.</p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            Even if a matrix is &quot;stable&quot; in the long run (ρ(A) &lt; 1), it might have a huge Norm, causing a signal to explode <em>temporarily</em>.
            We call this <strong>Transient Growth</strong>.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>Try it:</strong> Select the <strong>&quot;Scaling + Shear&quot;</strong> preset below to see transient growth in action.
            </p>
          </div>

          <div className={vizStyles.container}>
            <MatrixTransformationViz />
            <NormVsRadiusViz />
          </div>
        </div>
      ),
    },
    {
      id: 'resnet',
      label: 'ResNets',
      shortLabel: 'ResNets',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Fix: Why ResNets Changed the World</h2>
          <p className={vizStyles.prose}>
            Before 2015, we couldn&apos;t train networks deeper than ~20 layers because of this stability problem. Then <strong>ResNet</strong> (Residual Networks) arrived.
          </p>

          <p className={vizStyles.prose}>
            They changed the equation from:
          </p>

          <div className={vizStyles.mathBlock}>
            y = f(x)
          </div>

          <p className={vizStyles.prose}>
            To:
          </p>

          <div className={vizStyles.mathBlock}>
            y = f(x) + x
          </div>

          <p className={vizStyles.prose}>
            Why does adding &quot;+ x&quot; fix the Eigenvalues?
          </p>

          <p className={vizStyles.prose}>
            Intuitively, even if the network layer f(x) is terrible and crushes the signal to zero (Vanishing Gradient), that + x (identity) is a &quot;Superhighway&quot; that lets the gradient flow backward safely.
            It defaults the effective Eigenvalue to 1 + ε (a small change).
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Skip Connection Simulation</h3>
              <p>Watch how skip connections maintain signal flow even when layers have problematic eigenvalues.</p>
            </div>
            <NetworkSimulation />
          </div>
        </div>
      ),
    },
    {
      id: 'stabilizers',
      label: 'Stabilization Tools',
      shortLabel: 'Stabilizers',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>3 Tools to Fix Stability</h2>
          <p className={vizStyles.prose}>
            We can have eigenvalues ≠ 1 and still maintain a stable network thanks to three main &quot;stabilizers&quot;:
          </p>

          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4>1. The &quot;Safety Valve&quot;: Activations</h4>
              <p>
                If we only had linear layers, the eigenvalues would multiply together (1.1¹⁰⁰).
                Non-linear functions like <strong>ReLU</strong> or <strong>Tanh</strong> chop off or squash signals.
                ReLU zeros out negative values, effectively &quot;killing&quot; signal paths before they explode.
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4>2. The &quot;Thermostat&quot;: Normalization</h4>
              <p>
                Techniques like <strong>LayerNorm</strong> act like a thermostat.
                Even if a large eigenvalue blows up the signal, the normalization layer steps in:
                &quot;Wait, let&apos;s rescale these values back to mean 0 and variance 1.&quot;
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4>3. The &quot;Expressway&quot;: Skip Connections</h4>
              <p>
                In <strong>ResNets</strong>, we add the input back to the output: y = f(x) + x.
                This creates a &quot;Superhighway&quot; that lets the signal flow backward safely even if f(x) vanishes.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'boring',
      label: 'Stability vs Boring',
      shortLabel: 'Balance',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Stability vs. &quot;Boring&quot;</h2>
          <p className={vizStyles.prose}>
            You might ask: <em>&quot;If we want stability, why not just make every eigenvalue exactly 1?&quot;</em>
          </p>

          <div className={vizStyles.callout}>
            <p>
              &quot;A network where every eigenvalue is exactly 1 would be incredibly &apos;boring&apos;&mdash;it would essentially just be a long chain of Identity matrices that doesn&apos;t transform the data at all!&quot;
            </p>
          </div>

          <p className={vizStyles.prose}>
            <strong>Stability is a &quot;Bound,&quot; not a &quot;Target.&quot;</strong>
          </p>
          <p className={vizStyles.prose}>
            We want different dimensions to scale differently (some shrink noise, some amplify features).
            We just need to keep the <strong>Spectral Radius</strong> near 1 so the whole system doesn&apos;t crash.
            Non-linear activations (like ReLU) also act as a &quot;Safety Valve,&quot; resetting the signal energy if it gets too loud.
          </p>
        </div>
      ),
    },
    {
      id: 'initialization',
      label: 'Modern Initialization',
      shortLabel: 'Init',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Modern Initialization Techniques</h2>
          <p className={vizStyles.prose}>
            Now that you know Stability is about keeping Eigenvalues near 1, these techniques make sense:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4>Xavier / Kaiming Initialization</h4>
              <p>&quot;Initialize random weights with specific variance so the average Eigenvalue (Radius) is exactly 1 at the start.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Spectral Normalization</h4>
              <p>&quot;Divide the matrix by its Spectral Norm, forcing the maximum stretch to be exactly 1.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Orthogonal Initialization</h4>
              <p>&quot;Use a matrix that only <em>rotates</em> data (Norm = 1, Radius = 1) but never stretches it.&quot;</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      let currentSection = sections[0]?.id || '';

      sectionRefs.current.forEach((element, id) => {
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            currentSection = id;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current.get(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="timeline-main" style={{
      display: 'flex',
      gap: '2.5rem',
      position: 'relative',
      marginLeft: '220px',
    }}>
      <nav style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        width: '200px',
        background: 'hsla(240, 10%, 6%, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.25rem 1rem 1.25rem 1.5rem',
        zIndex: 100,
      }} className="timeline-nav">
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-dim)',
          marginBottom: '1rem',
          paddingLeft: '1.5rem',
        }}>
          On this page
        </div>
        <div style={{
          position: 'relative',
          paddingLeft: '1.5rem',
        }}>
          <div style={{
            position: 'absolute',
            left: '5px',
            top: '4px',
            bottom: '4px',
            width: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
          }} />

          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isPast = sections.findIndex(s => s.id === activeSection) > index;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.6rem 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  background: isActive
                    ? 'var(--text-primary)'
                    : isPast
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
                }} />
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--text-primary)'
                    : isPast
                      ? 'var(--text-secondary)'
                      : 'var(--text-dim)',
                  lineHeight: 1.4,
                  transition: 'all 0.2s ease',
                }}>
                  {section.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main style={{ flex: 1, minWidth: 0 }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
            }}
            style={{
              marginBottom: '4rem',
              paddingBottom: '3rem',
              borderBottom: index < sections.length - 1
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : 'none',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {index + 1}
              </span>
              <h2 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}>
                {section.label}
              </h2>
            </div>
            {section.content}
          </section>
        ))}
      </main>

      <style jsx>{`
        @media (max-width: 1100px) {
          .timeline-nav {
            display: none !important;
          }
          .timeline-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
