"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import vizStyles from './visualization.module.css';
import ModelFamilyViz from '../../components/ModelFamilyViz';

const SECTIONS = [
  { id: 'what-is-px', shortLabel: 'What is p(x)?' },
  { id: 'latent-space', shortLabel: 'Latent Space' },
  { id: 'two-distributions', shortLabel: 'Two Distributions' },
  { id: 'four-families', shortLabel: 'Four Families' },
  { id: 'gans', shortLabel: 'GANs' },
  { id: 'vaes', shortLabel: 'VAEs' },
  { id: 'diffusion', shortLabel: 'Diffusion' },
  { id: 'autoregressive', shortLabel: 'Autoregressive' },
  { id: 'summary', shortLabel: 'Summary' },
  { id: 'takeaways', shortLabel: 'Takeaways' },
  { id: 'frontiers', shortLabel: 'Frontiers' },
];

export default function ProbabilisticGenerativeModelsPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      let currentSection = SECTIONS[0].id;
      sectionRefs.current.forEach((element, id) => {
        if (element && scrollPosition >= element.offsetTop) {
          currentSection = id;
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = sectionRefs.current.get(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  }, []);

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
          Probabilistic Generative Models
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          margin: 0,
        }}>
          The art of learning to sample from reality
        </p>
      </header>
      <div style={{ height: '140px' }} />

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
            {SECTIONS.map((section, index) => {
              const isActive = activeSection === section.id;
              const isPast = SECTIONS.findIndex(s => s.id === activeSection) > index;
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

        <main style={{ flex: 1, minWidth: 0, maxWidth: '800px' }}>

        <div id="what-is-px" ref={setSectionRef('what-is-px')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Central Question: What is p(x)?</h2>

          <p className={vizStyles.prose}>
            Every generative model attempts to answer a deceptively simple question: <strong>what is the probability distribution over real data?</strong> We call this distribution p(x).
          </p>

          <p className={vizStyles.prose}>
            Consider all possible 256x256 RGB images. This is a space of 256 &times; 256 &times; 3 = 196,608 dimensions, where each dimension can take 256 values. The total number of possible images is 256<sup>196,608</sup>—a number so large it dwarfs the number of atoms in the observable universe.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Key Insight:</strong> Of this incomprehensibly vast space, only an infinitesimally small fraction contains &quot;real&quot; images—photos of cats, landscapes, faces. The rest is noise. p(x) assigns high probability to real images and near-zero probability to noise.
            </p>
          </div>

          <p className={vizStyles.prose}>
            The goal of a generative model is to learn p(x) well enough that we can <em>sample</em> from it—draw new images that look like they came from the real world.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Discriminative Models</h4>
              <p>Learn p(y|x): &quot;Given this image, what label does it have?&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Classification, regression, prediction</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Generative Models</h4>
              <p>Learn p(x): &quot;What does the space of real data look like?&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Sampling, synthesis, density estimation</p>
            </div>
          </div>
        </div>

        <div id="latent-space" ref={setSectionRef('latent-space')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Why Latent Space? The Curse of Dimensionality</h2>

          <p className={vizStyles.prose}>
            Directly modeling p(x) in high-dimensional space is intractable. The probability density becomes so diluted that estimation becomes impossible. This is where <strong>latent variables</strong> come to the rescue.
          </p>

          <p className={vizStyles.prose}>
            The core idea is to introduce a simpler, lower-dimensional space z—the <em>latent space</em>—and factor the problem:
          </p>

          <div className={vizStyles.mathBlock}>
            p(x) = ∫ p(x|z) p(z) dz
          </div>

          <p className={vizStyles.prose}>
            This decomposition says: to generate a sample x, first draw a latent code z from a simple prior p(z) (usually a Gaussian), then transform it into data space via p(x|z).
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Manifold Perspective</h3>

          <p className={vizStyles.prose}>
            Why does this work? Because real data lies on a low-dimensional <strong>manifold</strong> embedded in high-dimensional space. A 256x256 image of a face can be described by just a few factors: age, pose, lighting, expression. The latent space captures these intrinsic coordinates.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: 'var(--accent)' }}>z — The Latent Code</h4>
              <p>A compact representation capturing the &quot;essence&quot; of the data. Typically 64-512 dimensions.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>p(z) — The Prior</h4>
              <p>Our default belief about latent codes before seeing data. Usually N(0, I)—a simple Gaussian at the origin.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>p(x|z) — The Decoder/Generator</h4>
              <p>The mapping from latent space to data space. &quot;Given this code, generate the corresponding image.&quot;</p>
            </div>
          </div>
        </div>

        <div id="two-distributions" ref={setSectionRef('two-distributions')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Two Fundamental Distributions</h2>

          <p className={vizStyles.prose}>
            At the heart of probabilistic generative models lie two distributions that serve opposite purposes:
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>p(x|z) — The Generative Distribution</h4>
              <p><strong>Direction:</strong> Latent → Data</p>
              <p style={{ marginTop: '0.5rem' }}>&quot;Given a latent code z, what image x would it produce?&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>This is the decoder or generator network.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00f3ff' }}>p(z|x) — The Inference Distribution</h4>
              <p><strong>Direction:</strong> Data → Latent</p>
              <p style={{ marginTop: '0.5rem' }}>&quot;Given an image x, what latent codes z could have generated it?&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>This is the encoder or inference network.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Intractability Problem</h3>

          <p className={vizStyles.prose}>
            Computing p(z|x) exactly requires Bayes&apos; Rule:
          </p>

          <div className={vizStyles.mathBlock}>
            p(z|x) = p(x|z) p(z) / p(x)
          </div>

          <p className={vizStyles.prose}>
            But p(x) = ∫ p(x|z) p(z) dz requires integrating over all possible latent codes—intractable in high dimensions. Different model families handle this differently.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Core Tradeoff:</strong> We can&apos;t compute both p(x|z) and p(z|x) exactly. Different generative model families choose which to model explicitly and which to approximate or avoid entirely.
            </p>
          </div>
        </div>

        <div id="four-families" ref={setSectionRef('four-families')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Four Model Families, Four Philosophies</h2>

          <p className={vizStyles.prose}>
            GANs, VAEs, Diffusion models, and Autoregressive models represent four fundamentally different approaches to the same problem. Each makes different tradeoffs about what to model explicitly.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Comparing Model Approaches</h3>
              <p>Explore how each model family approaches generation, what they model explicitly, and their characteristic tradeoffs.</p>
            </div>
            <ModelFamilyViz />
          </div>
        </div>

        <div id="gans" ref={setSectionRef('gans')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>GANs: Implicit Density via Adversarial Training</h2>

          <p className={vizStyles.prose}>
            Generative Adversarial Networks take a radical approach: <strong>don&apos;t model the density at all</strong>. Instead, learn a transformation that maps simple noise to realistic samples.
          </p>

          <div className={vizStyles.mathBlock}>
            G: z → x where z ~ N(0, I)
          </div>

          <h3 className={vizStyles.subsectionTitle}>What GANs Model</h3>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>p(x|z) — Implicit</h4>
              <p>The Generator G(z) defines an implicit conditional distribution. Given z, it deterministically outputs x. The distribution over x arises from the distribution over z.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff4444' }}>p(z|x) — Not Modeled</h4>
              <p>GANs have no encoder. Given an image, there&apos;s no principled way to find its latent code. This is the &quot;inversion problem.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff4444' }}>p(x) — Not Computable</h4>
              <p>The probability of any specific image cannot be computed. We can only sample, not evaluate density.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Adversarial Game</h3>

          <p className={vizStyles.prose}>
            Instead of maximizing likelihood, GANs use a <strong>discriminator</strong> D(x) to distinguish real from fake:
          </p>

          <div className={vizStyles.mathBlock}>
            min<sub>G</sub> max<sub>D</sub> E[log D(x<sub>real</sub>)] + E[log(1 - D(G(z)))]
          </div>

          <p className={vizStyles.prose}>
            At equilibrium, G produces samples indistinguishable from real data, and D outputs 0.5 everywhere—maximum uncertainty.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>GAN Philosophy:</strong> &quot;I don&apos;t need to know the probability of an image. I just need to generate images that fool an expert.&quot;
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Mode Collapse Problem</h3>

          <p className={vizStyles.prose}>
            Because the generator only needs to &quot;fool&quot; the discriminator, it can exploit a critical shortcut: finding a single &quot;safe&quot; image that consistently fools D and repeating it. This is <strong>mode collapse</strong>—the generator ignores the diversity of real data and produces limited variation.
          </p>

          <p className={vizStyles.prose}>
            The discriminator only checks &quot;is this real or fake?&quot;—not &quot;have I seen this before?&quot; So if G finds one convincing face, it can output slight variations of that face forever, achieving low loss while failing to capture the true data distribution.
          </p>
        </div>

        <div id="vaes" ref={setSectionRef('vaes')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>VAEs: Approximate Inference via Variational Bound</h2>

          <p className={vizStyles.prose}>
            Variational Autoencoders take a principled probabilistic approach: <strong>model both directions</strong>, but approximate the intractable posterior.
          </p>

          <h3 className={vizStyles.subsectionTitle}>What VAEs Model</h3>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>p(x|z) — Explicit (Decoder)</h4>
              <p>A neural network that outputs <em>parameters</em> of p(x|z), usually a Gaussian (μ and σ for each pixel). We can compute the exact probability of x given z. <Link href="/variational-autoencoders#why-explicit" style={{ color: 'var(--accent)' }}>See why this matters →</Link></p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>q(z|x) ≈ p(z|x) — Approximate (Encoder)</h4>
              <p>Since true p(z|x) is intractable, we learn an approximate posterior q(z|x). The encoder outputs μ(x) and σ(x) of a Gaussian.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>p(x) — Lower Bounded (ELBO)</h4>
              <p>We can&apos;t compute p(x) exactly, but we can compute a lower bound (ELBO) and maximize it.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The ELBO Objective</h3>

          <div className={vizStyles.mathBlock}>
            log p(x) ≥ E<sub>q(z|x)</sub>[log p(x|z)] − D<sub>KL</sub>(q(z|x) || p(z))
          </div>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Reconstruction Term</h4>
              <p>E[log p(x|z)]: Encode x to z, decode z back, measure how well we reconstruct x.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Regularization Term</h4>
              <p>KL(q||p): Keep the encoder&apos;s output distribution close to the prior. Prevents memorization.</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>VAE Philosophy:</strong> &quot;I&apos;ll model the full joint distribution p(x,z) = p(x|z)p(z) and approximate what I can&apos;t compute exactly. I get both generation AND inference.&quot;
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Blurriness Problem</h3>

          <p className={vizStyles.prose}>
            VAEs model p(x|z) as a Gaussian distribution, which assumes reconstruction error is uniform across the image. This leads to <strong>blurry samples</strong>—the model hedges its bets by outputting the mean of possible images rather than committing to sharp details.
          </p>

          <p className={vizStyles.prose}>
            When the decoder is uncertain whether a pixel should be bright or dark, the Gaussian assumption causes it to output something in between, resulting in soft, averaged-looking images compared to GANs.
          </p>
        </div>

        <div id="diffusion" ref={setSectionRef('diffusion')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Diffusion Models: Iterative Denoising</h2>

          <p className={vizStyles.prose}>
            Diffusion models take a completely different approach: <strong>model the reverse of a corruption process</strong>. Instead of one-shot generation, they iteratively refine noise into data.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Forward Process</h3>

          <p className={vizStyles.prose}>
            Start with real data x<sub>0</sub> and gradually add Gaussian noise over T steps:
          </p>

          <div className={vizStyles.mathBlock}>
            q(x<sub>t</sub>|x<sub>t-1</sub>) = N(x<sub>t</sub>; √(1-β<sub>t</sub>) x<sub>t-1</sub>, β<sub>t</sub>I)
          </div>

          <p className={vizStyles.prose}>
            After enough steps, x<sub>T</sub> becomes pure Gaussian noise. This forward process is <strong>fixed</strong>, not learned.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Reverse Process</h3>

          <p className={vizStyles.prose}>
            The model learns to reverse this corruption:
          </p>

          <div className={vizStyles.mathBlock}>
            p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>) = N(x<sub>t-1</sub>; μ<sub>θ</sub>(x<sub>t</sub>, t), Σ<sub>θ</sub>(x<sub>t</sub>, t))
          </div>

          <h3 className={vizStyles.subsectionTitle}>What Diffusion Models Model</h3>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>p(x<sub>t-1</sub>|x<sub>t</sub>) — Explicit (Denoiser)</h4>
              <p>Each denoising step is modeled explicitly. The network predicts the noise to remove at each step.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>p(x) — Tractable</h4>
              <p>Unlike GANs, we can compute (an ELBO on) the likelihood of any image by running the forward process.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Latent Space — Distributed</h4>
              <p>Instead of one latent code z, diffusion has T intermediate representations x<sub>1</sub>, ..., x<sub>T</sub>. The &quot;latent space&quot; is the full trajectory.</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Diffusion Philosophy:</strong> &quot;I&apos;ll break the hard problem of one-shot generation into T easy problems of removing a little noise. Each step is simple; the composition is powerful.&quot;
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Speed Problem & Modern Solutions</h3>

          <p className={vizStyles.prose}>
            Generation requires running the neural network 10–1000 times (one per denoising step), making diffusion models historically slow compared to single-pass GANs or VAEs.
          </p>

          <p className={vizStyles.prose}>
            <strong>Latent Diffusion</strong> (used in Stable Diffusion) solves this by running the diffusion process in a compressed latent space rather than pixel space. First, a VAE-like encoder compresses the image; then diffusion operates on the smaller latent tensor. This makes modern diffusion models much faster and more memory-efficient.
          </p>
        </div>

        <div id="autoregressive" ref={setSectionRef('autoregressive')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Autoregressive Models: Sequential Prediction</h2>

          <p className={vizStyles.prose}>
            Autoregressive models take yet another approach: <strong>decompose the joint distribution using the chain rule</strong>. Instead of using a global latent code, they predict each piece of data conditioned on everything that came before.
          </p>

          <div className={vizStyles.mathBlock}>
            p(x) = p(x₁) · p(x₂|x₁) · p(x₃|x₁,x₂) · ... · p(xₙ|x₁,...,xₙ₋₁)
          </div>

          <p className={vizStyles.prose}>
            This is the architecture behind LLMs like GPT (predicting the next token) and pixel-by-pixel image generators like PixelCNN.
          </p>

          <h3 className={vizStyles.subsectionTitle}>What Autoregressive Models Model</h3>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>p(x) — Exact</h4>
              <p>Unlike all other families, autoregressive models can compute the exact probability of any sample. Just multiply the conditional probabilities of each element.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Training — Stable</h4>
              <p>Training is simply &quot;predict the next token/pixel.&quot; No adversarial dynamics, no approximate inference, no ELBO—just supervised learning.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff4444' }}>Latent Space — None</h4>
              <p>There&apos;s no global latent code z. The model views data as a sequence to predict, not a compressed representation to decode.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Sequential Bottleneck</h3>

          <p className={vizStyles.prose}>
            Sampling is inherently slow: O(N) where N is the sequence length. To generate a 256×256 image pixel-by-pixel requires 65,536 sequential predictions. For text, generating 1000 tokens requires 1000 forward passes.
          </p>

          <p className={vizStyles.prose}>
            Additionally, lacking a global latent code makes it harder to manipulate whole-image properties. You can&apos;t easily &quot;add a smile&quot; the way you can with VAE latent arithmetic.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>Autoregressive Philosophy:</strong> &quot;I will simply predict the next piece of data based on what I&apos;ve seen so far. No latent codes, no approximations—just exact sequential prediction.&quot;
            </p>
          </div>
        </div>

        <div id="summary" ref={setSectionRef('summary')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Summary: The Modeling Tradeoffs</h2>

          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Aspect</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ffe66d' }}>GAN</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--accent)' }}>VAE</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#a78bfa' }}>Diffusion</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ff6b6b' }}>Autoregressive</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Density p(x)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Implicit (can&apos;t compute)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Lower bound (ELBO)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Lower bound (ELBO)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Exact</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Generator</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Deterministic G(z)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Probabilistic decoder</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Iterative denoising</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Sequential prediction</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Latent Space</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>z (unstructured)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>z (structured/smooth)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Trajectory / Latent tensor</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>None (usually)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Sampling Speed</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fast (1 pass)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fast (1 pass)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Slow/Moderate (multiple steps)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Slow (sequential steps)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Main Risk</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Mode collapse</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Blurry samples</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Computational cost</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Slow generation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div id="takeaways" ref={setSectionRef('takeaways')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Key Takeaways</h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4>1. p(x) is the Holy Grail</h4>
              <p>All generative models seek to capture the true data distribution. The differences lie in whether they approximate the density (VAE), discard it (GAN), learn the gradient of the density (Diffusion), or break it into a sequence (Autoregressive).</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>2. The Triangle of Tradeoffs</h4>
              <p>Generative modeling is often a &quot;pick two&quot; scenario: <strong>High Quality</strong> (GANs, Diffusion), <strong>Fast Sampling</strong> (GANs, VAEs), <strong>Mode Coverage / Diversity</strong> (Diffusion, Autoregressive).</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>3. Latent Spaces vs. Sequences</h4>
              <p>Most image models (GAN/VAE/Diffusion) capture the &quot;concept&quot; of an image in a compressed code z. Autoregressive models view reality as a stream of information to be predicted piece-by-piece.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>4. Each Approach Has Its Place</h4>
              <p>Choose GANs for fast, sharp samples. VAEs for interpretable latent spaces. Diffusion for quality and diversity. Autoregressive for exact likelihood and text generation.</p>
            </div>
          </div>
        </div>

        <div id="frontiers" ref={setSectionRef('frontiers')} className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Current Frontiers &amp; Challenges</h2>

          <p className={vizStyles.prose}>
            While the core families (GANs, VAEs, Diffusion, Autoregressive) provide the foundation, generative modeling is an active research field. The focus has shifted from &quot;how to generate&quot; to &quot;how to generate efficiently and geometrically.&quot;
          </p>

          <h3 className={vizStyles.subsectionTitle}>1. The Likelihood Gap</h3>

          <p className={vizStyles.prose}>
            We generally face a frustrating tradeoff between <strong>exact mathematical precision</strong> and <strong>global structural coherence</strong>.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>The Conflict</h4>
              <p>Autoregressive models (like GPT) allow for exact likelihood computation—we know the precise probability of every sample. However, because they generate data sequentially, they often lack the global &quot;big picture&quot; coherence of Diffusion models.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>The Frontier</h4>
              <p><strong>Visual Autoregressive Models (VAR)</strong> and next-scale prediction are attempting to make Autoregressive models &quot;think globally&quot; like diffusion models while keeping their scaling laws.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Reference: Tian, K., et al. (2024). &quot;Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction.&quot;</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>2. Inference Speed: Distillation &amp; Consistency</h3>

          <p className={vizStyles.prose}>
            Diffusion models are the current quality kings, but they are computationally expensive (50+ steps).
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Distillation</h4>
              <p>Compressing a &quot;teacher&quot; model (standard diffusion) into a &quot;student&quot; that can jump from noise to data in fewer steps.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>Consistency Models</h4>
              <p>A newer paradigm that maps any point on the noise trajectory directly to the final clean image in a <strong>single step</strong>, maintaining the geometric properties of diffusion without the iterative cost.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>References: Song, Y., et al. (2023). &quot;Consistency Models.&quot; / Lu, C., et al. (2024). &quot;Consistency Trajectory Models.&quot;</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>3. Beyond Diffusion: Flow Matching &amp; Rectified Flows</h3>

          <p className={vizStyles.prose}>
            This is the immediate successor to standard Diffusion. The 2020-era &quot;Score-Based&quot; models assumed the path from noise to data was a random, curved &quot;stochastic&quot; walk.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Insight:</strong> Why walk a curved, random path when you can walk a straight line?
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: 'var(--accent)' }}>Flow Matching</h4>
              <p>Instead of learning to &quot;denoise&quot; (remove noise), we learn a <strong>Velocity Field</strong> that transports probability mass along the straightest possible path from noise to data.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Why It Matters</h4>
              <p>Straight paths are much easier to simulate numerically. This allows models like <strong>Stable Diffusion 3</strong> and <strong>Flux</strong> to generate higher quality images in fewer steps than older diffusion models.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>References: Lipman, Y., et al. (2023). &quot;Flow Matching for Generative Modeling.&quot; / Liu, X., et al. (2023). &quot;Flow Straight and Fast: Learning to Generate with Rectified Flow.&quot;</p>
            </div>
          </div>
        </div>

        </main>
      </div>
    </div>
  );
}
