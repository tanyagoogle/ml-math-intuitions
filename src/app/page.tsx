import Link from 'next/link';
import styles from './page.module.css';
import CardViz from '../components/CardViz';

export default function Home() {
  return (
    <div className="container">
      <header className={styles.hero}>
        <p className={styles.heroEyebrow}>ML Math Intuitions</p>
        <h1 className={styles.heroHeadline}>
          See the math behind<br />the machine.
        </h1>
        <p className={styles.heroSubtitle}>
          Interactive visual explorations of the core mathematical ideas
          powering modern machine learning.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Foundations</h2>
        <div className={styles.grid}>
          <Link href="/eigenvalues" className={styles.card}>
            <CardViz type="eigenvalues" />
            <div className={styles.cardContent}>
              <h3>Eigenvalues & Neural Networks &rarr;</h3>
              <p>Why do deep networks explode? The spectral story of stability.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>

          <Link href="/matrix-calculus" className={styles.card}>
            <CardViz type="matrix-calculus" />
            <div className={styles.cardContent}>
              <h3>Matrix Calculus Visualized &rarr;</h3>
              <p>Gradients, Jacobians, Hessians — see derivatives as geometry.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>

          <Link href="/loss-landscapes" className={styles.card}>
            <CardViz type="loss-landscape" />
            <div className={styles.cardContent}>
              <h3>Loss Landscapes & Forgetting &rarr;</h3>
              <p>Fine-tune a model and watch it forget. The geometry of catastrophic forgetting.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Generative Models</h2>
        <div className={styles.grid}>
          <Link href="/probabilistic-generative-models" className={styles.card}>
            <CardViz type="generative-models" />
            <div className={styles.cardContent}>
              <h3>Probabilistic Generative Models &rarr;</h3>
              <p>What does it mean to learn a distribution? The shared DNA of GANs, VAEs, and diffusion.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>

          <Link href="/variational-autoencoders" className={styles.card}>
            <CardViz type="vae" />
            <div className={styles.cardContent}>
              <h3>Variational Autoencoders &rarr;</h3>
              <p>Compress reality into a handful of dimensions, then reconstruct it.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>

          <Link href="/diffusion-models" className={styles.card}>
            <CardViz type="diffusion" />
            <div className={styles.cardContent}>
              <h3>Diffusion Models &rarr;</h3>
              <p>Destroy an image with noise, then learn to reverse time.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Geometry & Dynamics</h2>
        <div className={styles.grid}>
          <Link href="/manifold-hypothesis" className={styles.card}>
            <CardViz type="manifold" />
            <div className={styles.cardContent}>
              <h3>The Manifold Hypothesis &rarr;</h3>
              <p>Your data doesn&apos;t fill the space it lives in — and that changes everything.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>

          <Link href="/odes-sdes" className={styles.card}>
            <CardViz type="ode-sde" />
            <div className={styles.cardContent}>
              <h3>ODEs & SDEs in ML &rarr;</h3>
              <p>When neural networks become differential equations.</p>
            </div>
            <div className={styles.cardGlow} />
          </Link>
        </div>
      </section>
    </div>
  );
}
