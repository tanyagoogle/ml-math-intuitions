import Link from 'next/link';
import ManifoldContent from './ManifoldContent';

export const metadata = {
  title: 'The Manifold Hypothesis - Math Intuitions',
  description: 'Understanding why deep learning works through the geometry of data manifolds',
};

export default function ManifoldHypothesisPage() {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 3rem 4rem 3rem',
    }}>
      <header style={{
        position: 'fixed',
        top: 0,
        left: '240px',
        right: 0,
        background: 'hsla(240, 10%, 4%, 0.95)',
        backdropFilter: 'blur(12px)',
        padding: '1rem 3rem',
        zIndex: 200,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <Link href="/" style={{
          color: 'var(--text-dim)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          display: 'inline-block',
          marginBottom: '0.5rem',
          position: 'relative',
          zIndex: 51,
        }}>
          &larr; Back to Concepts
        </Link>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #00f3ff 0%, #a78bfa 50%, #ff6b6b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
          marginBottom: '0.25rem',
        }}>
          The Manifold Hypothesis
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          margin: 0,
        }}>
          Why high-dimensional data lives on low-dimensional structures
        </p>
      </header>
      <div style={{ height: '140px' }} />

      <ManifoldContent />
    </div>
  );
}
