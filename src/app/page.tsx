import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className="container">
      <header className={styles.header}>
        <h1 className="title-gradient">Math Intuitions</h1>
        <p className={styles.subtitle}>Interactive explorations of Machine Learning concepts.</p>
      </header>

      <div className={styles.grid}>
        <Link href="/eigenvalues" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Eigenvalues & Neural Networks &rarr;</h2>
            <p>Understand why deep networks explode or vanish without proper initialization.</p>
            <span className={styles.tag}>Interactive POC</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/loss-landscapes" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Loss Landscapes & Forgetting &rarr;</h2>
            <p>Why fine-tuning breaks the geometry of neural networks.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Post</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/matrix-calculus" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Matrix Calculus &rarr;</h2>
            <p>Visualizing scalar derivatives, gradients, and why they matter.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Module</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/manifold-hypothesis" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>The Manifold Hypothesis &rarr;</h2>
            <p>Why high-dimensional data lives on low-dimensional structures.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Post</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/variational-autoencoders" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Variational Autoencoders &rarr;</h2>
            <p>The geometry of latent space and the gravity of uncertainty.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Post</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/probabilistic-generative-models" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Probabilistic Generative Models &rarr;</h2>
            <p>Understanding p(x), latent spaces, and how GANs, VAEs, and Diffusion models approach generation.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Post</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/diffusion-models" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Diffusion Models &rarr;</h2>
            <p>From Langevin dynamics to denoising: the complete mathematical derivation with intuitive explanations.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Post</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        <Link href="/odes-sdes" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>ODEs & SDEs in ML &rarr;</h2>
            <p>The mathematics of change: from Newton to Neural ODEs and Diffusion Models.</p>
            <span className={styles.tag} style={{ borderColor: 'var(--accent)' }}>New Post</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>

        {/* Placeholder for future posts */}
        <div className={`${styles.card} ${styles.disabled}`}>
          <div className={styles.cardContent}>
            <h2>Gradient Descent (Coming Soon)</h2>
            <p>Visualizing the optimization landscape.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
