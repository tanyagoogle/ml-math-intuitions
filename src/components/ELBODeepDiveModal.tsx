'use client';

import { useState, useEffect } from 'react';

interface ELBODeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ELBODeepDiveModal({ isOpen, onClose }: ELBODeepDiveModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsVisible(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isOpen ? 'blur(12px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={onClose}
      onTransitionEnd={handleAnimationEnd}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, hsl(240, 10%, 10%) 0%, hsl(240, 10%, 6%) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '0',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 80px -12px rgba(0, 0, 0, 0.8)',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(167, 139, 250, 0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(0, 243, 255, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              📐
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                The ELBO
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Evidence Lower Bound
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '2rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
            The <strong style={{ color: '#a78bfa' }}>Evidence Lower Bound</strong> is the foundation of VAE training.
            It provides a tractable objective when the true posterior p(z|x) is intractable.
          </p>

          <div style={{
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(0, 243, 255, 0.08) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-primary)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            ELBO = E<sub>q(z|x)</sub>[log p(x|z)] − D<sub>KL</sub>(q(z|x) || p(z))
          </div>

          <div style={{
            background: 'rgba(167, 139, 250, 0.06)',
            border: '1px solid rgba(167, 139, 250, 0.15)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{
              color: '#a78bfa',
              fontSize: '0.9rem',
              fontWeight: 600,
              margin: 0,
              marginBottom: '1rem'
            }}>
              Mathematical Meaning
            </h3>
            <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.95rem' }}>
              The ELBO can be written as an expectation over the approximate posterior:
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              ELBO = E<sub>z∼q(z|x)</sub>[log p(x|z) + log p(z) − log q(z|x)]
            </div>
            <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
              Equivalently, using the joint distribution:
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              ELBO = E<sub>z∼q(z|x)</sub>[log p(x,z) − log q(z|x)]
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Intuition:</strong> We sample z from our encoder q(z|x), then compute the average of:
              (1) how well the decoder reconstructs x,
              (2) how likely z is under the prior, minus
              (3) how &quot;surprised&quot; the encoder was to produce z.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(255, 107, 107, 0.08)',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: '#ff6b6b',
              }} />
              <h3 style={{
                color: '#ff6b6b',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: 0,
                marginBottom: '0.75rem'
              }}>
                Term 1 — Reconstruction
              </h3>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                display: 'inline-block',
              }}>
                E<sub>q(z|x)</sub>[log p(x|z)]
              </div>
              <p style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                Sample z from the encoder, then measure how likely the original image is under the decoder.
              </p>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
                background: 'rgba(0,0,0,0.15)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginTop: '0.75rem',
              }}>
                <strong style={{ color: 'var(--text-secondary)' }}>In practice:</strong> Negative reconstruction loss (-MSE or -BCE). Maximizing = minimizing reconstruction error.
              </div>
            </div>

            <div style={{
              background: 'rgba(78, 205, 196, 0.08)',
              border: '1px solid rgba(78, 205, 196, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: '#4ecdc4',
              }} />
              <h3 style={{
                color: '#4ecdc4',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: 0,
                marginBottom: '0.75rem'
              }}>
                Term 2 — Regularization
              </h3>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                display: 'inline-block',
              }}>
                D<sub>KL</sub>(q(z|x) || p(z))
              </div>
              <p style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                How different is the encoder&apos;s output from the prior? KL divergence measures this &quot;distance&quot;.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginTop: '1rem',
                fontSize: '0.85rem',
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px'
                }}>
                  <span style={{ color: '#4ecdc4' }}>q(z|x)</span>
                  <span style={{ color: 'var(--text-dim)' }}> = N(μ, σ²)</span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px'
                }}>
                  <span style={{ color: '#4ecdc4' }}>p(z)</span>
                  <span style={{ color: 'var(--text-dim)' }}> = N(0, 1)</span>
                </div>
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
                background: 'rgba(0,0,0,0.15)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginTop: '0.75rem',
              }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Closed form:</strong>{' '}
                <span style={{ fontFamily: 'var(--font-mono)' }}>½ Σ(1 + log(σ²) − μ² − σ²)</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 243, 255, 0.06)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{
              color: '#00f3ff',
              fontSize: '0.9rem',
              fontWeight: 600,
              margin: 0,
              marginBottom: '1rem'
            }}>
              Why &quot;Lower Bound&quot;?
            </h3>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              log p(x) = ELBO + D<sub>KL</sub>(q(z|x) || p(z|x))
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Since KL ≥ 0, we have <strong style={{ color: '#00f3ff' }}>log p(x) ≥ ELBO</strong>.
              The gap measures how well q(z|x) approximates the true posterior.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 230, 109, 0.1) 0%, rgba(255, 200, 50, 0.05) 100%)',
            border: '1px solid rgba(255, 230, 109, 0.25)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 230, 109, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}>
              📚
            </div>
            <div>
              <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Full Mathematical Derivation
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                Matthew Bernstein&apos;s step-by-step proof with all the details.
              </p>
              <a
                href="https://mbernste.github.io/posts/elbo/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  background: 'rgba(255, 230, 109, 0.15)',
                  border: '1px solid rgba(255, 230, 109, 0.35)',
                  borderRadius: '8px',
                  color: '#ffe66d',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 230, 109, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 230, 109, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Read the Derivation
                <span style={{ fontSize: '1rem' }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ELBODeepDiveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Mathematical Deep Dive: The ELBO"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        marginLeft: '0.5rem',
        background: 'rgba(255, 230, 109, 0.15)',
        border: '1px solid rgba(255, 230, 109, 0.4)',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        verticalAlign: 'middle',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 230, 109, 0.3)';
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 230, 109, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 230, 109, 0.15)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      💡
    </button>
  );
}
