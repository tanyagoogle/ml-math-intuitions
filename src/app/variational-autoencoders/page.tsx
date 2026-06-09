import Link from 'next/link';
import homeStyles from '../page.module.css';
import VAEContent from './VAEContent';

export const metadata = {
  title: 'Variational Autoencoders - Math Intuitions',
  description: 'From Compression to Creation: Understanding VAEs through the journey from autoencoders to generative models',
};

export default function VAEPage() {
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
        zIndex: 50,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <Link href="/" style={{
          color: 'var(--text-dim)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          display: 'inline-block',
          marginBottom: '0.5rem',
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
          Variational Autoencoders
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          margin: 0,
        }}>
          From Compression to Creation
        </p>
      </header>
      <div style={{ height: '140px' }} />

      <VAEContent />
    </div>
  );
}
