'use client';

import vizStyles from './visualization.module.css';
import IntractabilityViz from '../../components/IntractabilityViz';
import LatentGeometryViz from '../../components/LatentGeometryViz';
import GeodesicInterpolationViz from '../../components/GeodesicInterpolationViz';
import ReparamTrickViz from '../../components/ReparamTrickViz';
import ELBOTugOfWarViz from '../../components/ELBOTugOfWarViz';
import PriorPullViz from '../../components/PriorPullViz';
import PriorExplainerViz from '../../components/PriorExplainerViz';
import EncoderOutputViz from '../../components/EncoderOutputViz';
import ELBOSectionWithModal from '../../components/ELBOSectionWithModal';
import VAETimelineLayout from '../../components/VAETimelineLayout';
import InterpolationComparisonViz from '../../components/InterpolationComparisonViz';
import GeodesicComputationViz from '../../components/GeodesicComputationViz';

export default function VAEContent() {
  const tabs = [
    {
      id: 'origin',
      label: 'The Origin',
      shortLabel: 'Origin',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Autoencoders and Representation Learning</h2>

          <p className={vizStyles.prose}>
            To understand VAEs, we must first look at their predecessor: the standard <strong>Autoencoder (AE)</strong>.
          </p>

          <p className={vizStyles.prose}>
            Originally, autoencoders were designed for <em>representation learning</em> and <em>dimensionality reduction</em>. The goal was simple: take a high-dimensional input x (like an image), compress it into a low-dimensional code z (the bottleneck), and then try to reconstruct the original image from that code.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00f3ff' }}>The Encoder</h4>
              <p>Compresses input to a specific point: <strong>x → z</strong></p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>The Decoder</h4>
              <p>Uncompresses the point back to data: <strong>z → x</strong></p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            In this setup, the latent space z is purely a <strong>compression artifact</strong>. The model is trained solely to minimize reconstruction error (Mean Squared Error).
          </p>
        </div>
      ),
    },
    {
      id: 'limitation',
      label: 'The Limitation',
      shortLabel: 'Limitation',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Why We Can&apos;t Just Sample</h2>

          <p className={vizStyles.prose}>
            While standard AEs are excellent at compressing data or removing noise, they fail as <strong>Generative Models</strong>. You cannot use them to create new data.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The &quot;Broken&quot; Latent Space</h3>

          <p className={vizStyles.prose}>
            In a standard AE, the latent space is <em>discrete and disorganized</em>. The model only learns to reconstruct specific data points it has seen.
          </p>

          <ul style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
            <li style={{ marginBottom: '0.5rem' }}>If you encode a cat, you get a point z<sub>cat</sub></li>
            <li style={{ marginBottom: '0.5rem' }}>If you encode a dog, you get a point z<sub>dog</sub></li>
          </ul>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Problem:</strong> If you pick a random point halfway between them, the decoder has no idea what to do. It will likely output static or garbage. That is because there is no well formed distribution we can sample from here.
            </p>
          </div>

          <p className={vizStyles.prose}>
            Because the latent space is full of &quot;holes&quot; (undefined regions), we cannot simply sample a random z and expect a valid image. We lack the ability to model the <strong>probability distribution</strong> of the data.
          </p>
        </div>
      ),
    },
    {
      id: 'goal',
      label: 'The Generative Goal',
      shortLabel: 'Goal',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Modeling p(x)</h2>

          <p className={vizStyles.prose}>
            To create new data, we need to move from <em>Discriminative</em> models to <em>Generative</em> models. We need to capture the probability distribution of the data, <strong>p(x)</strong>.
          </p>

          <p className={vizStyles.prose}>
            Ideally, we want to compute the <strong>posterior distribution</strong> p(z|x): given an image, what is the distribution of latent codes that could have generated it? If we have this, we can sample valid codes and generate new images.
          </p>

          <p className={vizStyles.prose}>
            Bayes&apos; Rule gives us the formula:
          </p>

          <div className={vizStyles.mathBlock}>
            p(z|x) = p(x|z) · p(z) / p(x)
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Intractable Integral</h3>

          <p className={vizStyles.prose}>
            The problem lies in the denominator, <strong>p(x)</strong> (the evidence). To calculate it, we must integrate over all possible latent codes:
          </p>

          <div className={vizStyles.mathBlock}>
            p(x) = ∫ p(x|z) · p(z) dz
          </div>

          <p className={vizStyles.prose}>
            In high-dimensional space, this integral is <strong>intractable</strong>.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>The Curse of Dimensionality</h3>
              <p>As dimensions increase, the volume of space explodes. Checking &quot;grid points&quot; to estimate this integral is impossible.</p>
            </div>
            <IntractabilityViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Grid Explosion:</strong> In 2D, checking 100 points per dimension requires 10,000 evaluations. In 100D (typical for VAEs), you would need 10<sup>100</sup> points—more than atoms in the observable universe.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'solution',
      label: 'Variational Inference',
      shortLabel: 'Solution',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Solution</h2>

          <p className={vizStyles.prose}>
            Since we cannot calculate the true posterior p(z|x), we use <strong>Variational Inference</strong>. We define a simpler distribution, q(z|x), and optimize it to approximate the true posterior.
          </p>

          <p className={vizStyles.prose}>
            This is the fundamental shift:
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Standard AE</h4>
              <p>The encoder maps input x to a <strong>single point</strong> z.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>VAE</h4>
              <p>The encoder maps input x to a <strong>probability distribution</strong> q(z|x).</p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            Instead of outputting a coordinate vector, the neural network outputs parameters for a Gaussian distribution:
          </p>

          <div className={vizStyles.mathBlock}>
            q(z|x) = N(μ(x), σ(x)²)
          </div>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00f3ff' }}>μ (Mean)</h4>
              <p>Where the code is located (the center).</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>σ (Variance)</h4>
              <p>The uncertainty or &quot;cloud size&quot; around that point.</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Each Image Gets Its Own Distribution</h3>
              <p>Select different images to see how the encoder outputs different μ (location) and σ (uncertainty) for each one.</p>
            </div>
            <EncoderOutputViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Key Insight:</strong> By mapping inputs to distributions (clouds) rather than points, we ensure that the latent space has <em>local continuity</em>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'kl',
      label: 'KL Divergence',
      shortLabel: 'KL',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Continuity and The Prior</h2>

          <p className={vizStyles.prose}>
            Simply predicting a distribution isn&apos;t enough. We need to ensure the distributions for different images <strong>overlap and fill the space smoothly</strong>, allowing us to sample from anywhere.
          </p>

          <p className={vizStyles.prose}>
            We enforce this using the <strong>KL Divergence</strong> term in the loss function (the ELBO). This acts as a regularizer that forces our learned distributions q(z|x) to stay close to a fixed <em>Prior</em>, usually a standard normal distribution:
          </p>

          <div className={vizStyles.mathBlock}>
            p(z) = N(0, 1)
          </div>

          <p className={vizStyles.prose}>
            The VAE objective function (ELBO) becomes a &quot;Tug-of-War&quot;:
          </p>

          <div className={vizStyles.mathBlock} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span>ELBO = E<sub>q(z|x)</sub>[log p(x|z)] − D<sub>KL</sub>(q(z|x) || p(z))</span>
            <ELBOSectionWithModal />
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Reconstruction (The Anchor)</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Wants the code to be precise (low variance, distinct peaks) so it can perfectly reconstruct the input.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '12px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '1rem' }}>KL Divergence (The Spring)</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Pulls all distributions toward the center (0, 0) and forces them to expand (unit variance).
              </p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>The Balance of Forces</h3>
              <p>Watch how the latent space changes as the balance shifts between reconstruction (memorization) and regularization (generalization).</p>
            </div>
            <ELBOTugOfWarViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Result:</strong> A continuous, smooth latent space where &quot;empty&quot; spots are filled by the overlapping probability clouds. This allows us to sample a random z from the Prior p(z) and generate a valid image.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'reparam',
      label: 'Reparameterization',
      shortLabel: 'Reparam',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Mechanism</h2>

          <p className={vizStyles.prose}>
            We now have a strategy: input image → predict distribution → sample z → decode.
          </p>

          <p className={vizStyles.prose}>
            However, there is a mechanical problem: <strong>Sampling is not differentiable</strong>. You cannot run backpropagation through a random number generator. If the randomness is internal to the network node, gradients cannot flow past it to update the encoder weights.
          </p>

          <p className={vizStyles.prose}>
            We solve this with the <strong>Reparameterization Trick</strong>. We externalize the randomness.
          </p>

          <p className={vizStyles.prose}>
            Instead of sampling z ∼ N(μ, σ²) directly, we write:
          </p>

          <div className={vizStyles.mathBlock}>
            z = μ + σ · ε
          </div>

          <p className={vizStyles.prose}>
            Where ε ∼ N(0, 1).
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00f3ff' }}>μ and σ</h4>
              <p>Deterministic outputs of the network (gradients flow).</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>ε</h4>
              <p>Random noise injected from the outside (no gradients needed).</p>
            </div>
          </div>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff4444' }}>Naive (Broken)</h4>
              <p>z ~ N(μ, σ²)</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Randomness is internal. ∂z/∂μ = undefined</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Reparameterized</h4>
              <p>z = μ + σ · ε, where ε ~ N(0,1)</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>ε is external input. ∂z/∂μ = 1, ∂z/∂σ = ε</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Computational Graph Comparison</h3>
              <p>In the naive approach, gradients die at the sampling node. Reparameterization allows gradients to flow through μ and σ by treating noise ε as an external input.</p>
            </div>
            <ReparamTrickViz />
          </div>

          <p className={vizStyles.prose}>
            This simple algebraic rewrite allows us to train end-to-end using standard gradient descent.
          </p>
        </div>
      ),
    },
    {
      id: 'stochasticity',
      label: 'The Source',
      shortLabel: 'Source',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Source of Stochasticity</h2>

          <p className={vizStyles.prose}>
            Finally, we can answer: <strong>Where does the generative power come from?</strong>
          </p>

          <p className={vizStyles.prose}>
            The stochasticity is derived from sampling our approximate posterior q(z|x). Because the VAE is an <em>explicit density model</em>, it behaves like a statistician rather than a painter (like a GAN).
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00f3ff' }}>The Input</h4>
              <p>A specific image x.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>The Encoder</h4>
              <p>Says, &quot;I am 90% sure this is a cat, represented by this mean μ, but I have some uncertainty σ.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>The Sample</h4>
              <p>We roll the dice (ε) based on that uncertainty.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>The Output</h4>
              <p>The decoder reconstructs an image based on that sample.</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Magic:</strong> Because we forced q(z|x) to align with p(z) (the standard normal) during training, during inference, we can simply sample ε from a standard normal distribution, pass it through the decoder, and generate entirely new data that follows the learned data manifold.
            </p>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 243, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Key Takeaways</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong style={{ color: '#00f3ff' }}>1.</strong> Autoencoders compress; VAEs generate by mapping to distributions instead of points.
              </p>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong style={{ color: '#00f3ff' }}>2.</strong> The ELBO balances reconstruction (precision) vs. regularization (smoothness).
              </p>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong style={{ color: '#00f3ff' }}>3.</strong> Reparameterization (z = μ + σε) enables gradient-based training.
              </p>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong style={{ color: '#00f3ff' }}>4.</strong> The prior enables generation by ensuring we can sample valid codes.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const deepDives = [
    {
      id: 'geometry',
      title: 'The Geometry of Latent Space: Why Paths Curve Toward the Center',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <p className={vizStyles.prose}>
            This is one of the most fascinating but counter-intuitive concepts in VAEs. Why do interpolation paths &quot;curve&quot; toward the center? Why does the prior act like a gravitational well?
          </p>

          <p className={vizStyles.prose}>
            It all boils down to <strong>how we measure distance</strong> in this space.
          </p>

          <h3 className={vizStyles.subsectionTitle}>Part 1: The &quot;Ruler&quot; Changes Size</h3>

          <p className={vizStyles.prose}>
            In normal (Euclidean) space, a ruler is always 1 meter long. Whether you are at the edge of the room or the center, distance is constant.
          </p>

          <p className={vizStyles.prose}>
            In a VAE&apos;s latent space, we are measuring <em>Information Distance</em> (specifically, Fisher Information). The &quot;length&quot; of a step depends on <strong>how certain the model is</strong> at that location.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Low Uncertainty (Sharp peaks)</h4>
              <p>The model is very sure. Moving just a tiny bit changes the distribution completely.</p>
              <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Result: Distance is HUGE. (Traversing a mountain)</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>High Uncertainty (Wide clouds)</h4>
              <p>The model is unsure. You can move a long way, and the distribution basically looks the same.</p>
              <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Result: Distance is TINY. (Traversing a flat valley)</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Variance as the Inverse Ruler</h3>
              <p>Click on points to see how variance determines the local &quot;cost&quot; of movement.</p>
            </div>
            <LatentGeometryViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>Part 2: The Prior is the Ultimate Shortcut</h3>

          <p className={vizStyles.prose}>
            The Prior (at the center, z=0) is defined as having unit variance (σ=1). In many trained VAEs, specific data points (like a sharp image of a dog) have much <em>smaller</em> variances (e.g., σ=0.1).
          </p>

          <p className={vizStyles.prose}>
            This creates a specific terrain:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>The Center (Prior)</h4>
              <p>A massive highway where movement is &quot;cheap.&quot; You can cover a lot of ground here with very little information cost.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>The Edges (Data Points)</h4>
              <p>Dense jungles or steep mountains. Every step is &quot;expensive&quot; (high information change).</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>The Prior Explained</h3>
              <p>Click through the steps to understand what the prior is and how it shapes the latent space.</p>
            </div>
            <PriorExplainerViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>Part 3: The Path of Least Resistance</h3>

          <p className={vizStyles.prose}>
            Imagine you want to travel from Point A (Cat) to Point B (Dog).
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Euclidean Path (Straight Line)</h4>
              <p>You walk directly from A to B. You might have to hack through the &quot;jungles&quot; of other concepts in between.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This is a &quot;short&quot; line on paper, but an &quot;expensive&quot; path in information terms.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Geodesic Path (Curved)</h4>
              <p>Instead of fighting through the jungle, you head toward the &quot;highway&quot; (the Prior). You slide down into the valley of uncertainty, travel quickly across the center, and then climb up to Point B.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>The path curves toward the center because it is the <em>fastest</em> route.</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Path Comparison on Latent Landscape</h3>
              <p>Dark regions have low variance (mountains). Light regions have high variance (valleys). Watch how the geodesic avoids expensive terrain.</p>
            </div>
            <GeodesicInterpolationViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>Part 4: The &quot;Fade to Gray&quot; Effect</h3>

          <p className={vizStyles.prose}>
            This geometric &quot;detour&quot; through the center has a visual consequence when you generate images along the path:
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
              <strong style={{ color: '#00f3ff' }}>Start (Cat):</strong> <span style={{ color: 'var(--text-secondary)' }}>Sharp image.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <strong style={{ color: '#a78bfa' }}>Middle (Near Prior):</strong> <span style={{ color: 'var(--text-secondary)' }}>The path dives into the high-uncertainty region (the center). The decoder sees z≈0. What does z=0 look like? It looks like the <em>average</em> of your entire dataset—usually a gray, blurry blob.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
              <strong style={{ color: '#4ecdc4' }}>End (Dog):</strong> <span style={{ color: 'var(--text-secondary)' }}>Sharp image.</span>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>The &quot;Fade to Gray&quot; Effect</h3>
              <p>When interpolating from Cat to Car, watch how the output briefly becomes a generic blob as the path passes through the prior.</p>
            </div>
            <PriorPullViz />
          </div>

          <p className={vizStyles.prose}>
            This is why VAE interpolations often look like the image <em>melts into a generic blur</em> and then reforms, rather than morphing perfectly feature-by-feature. The path is physically routing through the &quot;uncertainty hub&quot; to save cost.
          </p>

          <h3 className={vizStyles.subsectionTitle}>Why Does This Actually Matter?</h3>

          <p className={vizStyles.prose}>
            Here is the simple, practical reason: <strong>it determines whether your AI generates a smooth transformation or a scary mess.</strong>
          </p>

          <p className={vizStyles.prose}>
            Think of it like walking between two houses. The latent space is the land between them:
          </p>

          <ul style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>High Probability Regions (Valleys/Roads):</strong> Safe, paved ground. This is where the model knows what faces look like.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Low Probability Regions (Mountains/Swamps):</strong> This is where the model has never seen data. It&apos;s &quot;dead space.&quot; If you step here, you drown.</li>
          </ul>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Option A: The Straight Line (Ignoring the Terrain)</h4>
              <p>You draw a straight line between two points and walk it.</p>
              <p style={{ marginTop: '0.75rem' }}><strong>The Result:</strong> You walk straight into the &quot;swamp.&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}><strong>Visual Output:</strong> The face dissolves into static, noise, or a nightmare creature. You crossed a region where p(z) is near zero—the decoder has no idea what to do there.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Option B: The Curved Path (Following the Terrain)</h4>
              <p>You let the geometry guide you. You stick to the high-probability paths.</p>
              <p style={{ marginTop: '0.75rem' }}><strong>The Result:</strong> The path curves toward the center (the Prior).</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}><strong>Visual Output:</strong> The face stays a valid face the whole time. The trade-off is it might look a bit generic or blurry in the middle—but it never turns into garbage.</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Summary:</strong> The &quot;pull&quot; toward the center isn&apos;t gravity—it&apos;s the geometry telling you where the &quot;highway&quot; is. Euclidean distance assumes the ground is flat. Geodesic distance accounts for the terrain. The prior is an <em>information wormhole</em>—the cheapest path from any concept to another often goes through it.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Part 5: But Who is Actually Traversing This?</h3>

          <p className={vizStyles.prose}>
            <strong>You are!</strong> (Or rather, the few lines of code you write after the model is trained.)
          </p>

          <p className={vizStyles.prose}>
            The VAE doesn&apos;t &quot;move&quot; on its own. It just sits there, waiting for you to give it a coordinate (z) so it can paint a picture. Here is exactly how the traversal happens:
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Step 1: You Pick the Start and End</h4>

          <p className={vizStyles.prose}>
            You take two real images—let&apos;s say a Cat and a Dog—and run them through the Encoder.
          </p>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(0, 243, 255, 0.4)' }}>
            <p style={{ margin: '0.5rem 0' }}>Cat → Encoder → z_start (e.g., coordinate [10, 5])</p>
            <p style={{ margin: '0.5rem 0' }}>Dog → Encoder → z_end (e.g., coordinate [-10, -5])</p>
          </div>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Step 2: You Calculate the Steps (The &quot;Traversal&quot;)</h4>

          <p className={vizStyles.prose}>
            Now you want to see the transformation. You need to create a list of points between [10, 5] and [-10, -5]. This is where you make the choice that matters:
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Method A: The &quot;Naive&quot; Way (Linear)</h4>
              <p>You just draw a straight line. Take 10 steps, moving equal amounts each time.</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.75rem', color: 'var(--text-dim)' }}>
                Step 1: [10, 5]<br />
                Step 5: [0, 0] ← The Center<br />
                Step 10: [-10, -5]
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>If the space is curved, you might force the decoder to look at a point that &quot;doesn&apos;t exist&quot; (low probability). The decoder outputs garbage.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Method B: The &quot;Smart&quot; Way (Geodesic)</h4>
              <p>You use Riemannian geometry to look at the variance (σ) of the space before picking the points.</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.75rem', color: 'var(--text-dim)' }}>
                Step 1: [10, 5]<br />
                Step 2: [6, 2] ← Curving in<br />
                Step 5: [0, 0] ← The Center<br />
                Step 10: [-10, -5]
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>The algorithm says: &quot;Don&apos;t go straight. It&apos;s cheaper to curve through the center.&quot;</p>
            </div>
          </div>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Step 3: You Feed the Decoder</h4>

          <p className={vizStyles.prose}>
            Finally, you take that list of points and feed them to the Decoder one by one:
          </p>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(167, 139, 250, 0.4)' }}>
            <p style={{ margin: '0.5rem 0' }}>Decoder([10, 5]) → Image of Cat</p>
            <p style={{ margin: '0.5rem 0' }}>Decoder([0, 0]) → Image of Generic Blur</p>
            <p style={{ margin: '0.5rem 0' }}>Decoder([-10, -5]) → Image of Dog</p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Part 6: How Do You Actually Calculate a Geodesic?</h3>

          <p className={vizStyles.prose}>
            This is the tricky part. You don&apos;t calculate it using a simple formula like A+B=C. Calculating a geodesic is an <strong>optimization problem</strong>. You have to &quot;search&quot; for the path that minimizes the total cost.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Define the &quot;Cost&quot; of a Step</h4>

          <p className={vizStyles.prose}>
            First, you need a formula that tells you: &quot;If I move 1 millimeter at location z, how much did that cost in terms of information?&quot;
          </p>

          <p className={vizStyles.prose}>
            Using our &quot;Variance is the Inverse Ruler&quot; logic: if the encoder is uncertain (σ is high), moving z doesn&apos;t change the meaning much—cost is low. If the encoder is certain (σ is low), moving z changes everything—cost is high.
          </p>

          <div className={vizStyles.mathBlock}>
            Cost(z) ≈ 1 / σ(z)²
          </div>

          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <h4 style={{ color: '#ff6b6b', margin: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
              Wait—Why is the cost computationally expensive?
            </h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, marginBottom: '0.75rem', lineHeight: 1.7 }}>
              Here&apos;s the catch: the cost at each point z is defined by <em>how much the decoded output changes</em> when you wiggle z. There&apos;s no closed-form formula—it depends entirely on the learned weights of your model. That is why you need to make multiple decoder calls for it.
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: 0, marginBottom: '0.75rem', lineHeight: 1.7 }}>
              To measure the cost at any point, you have to:
            </p>
            <ol style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              <li><strong>Run the decoder</strong> multiple times with small perturbations around z</li>
              <li><strong>Measure output variance</strong>—how much did the generated image change?</li>
              <li><strong>Low variance</strong> (outputs barely change) = low cost = &quot;safe&quot; region near the prior</li>
              <li><strong>High variance</strong> (outputs change dramatically) = high cost = &quot;semantic cliff&quot;</li>
            </ol>
            <p style={{ color: 'var(--text-dim)', margin: 0, marginTop: '1rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
              The irony: we&apos;re trying to find the best path <em>before</em> decoding the final frames. But to find that path, we need to decode hundreds of times anyway.
            </p>
          </div>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>The &quot;Rubber Band&quot; Algorithm</h4>

          <p className={vizStyles.prose}>
            Since we can&apos;t solve this in one shot, we use an iterative process. Imagine stretching a rubber band between your Start (Cat) and End (Dog):
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <strong style={{ color: '#00f3ff' }}>1. Initialize with a Straight Line:</strong> <span style={{ color: 'var(--text-secondary)' }}>Create a path of 10 points connecting start to end directly.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <strong style={{ color: '#a78bfa' }}>2. Measure the Energy:</strong> <span style={{ color: 'var(--text-secondary)' }}>Calculate the &quot;cost&quot; of every segment using your metric. The straight line through a &quot;mountain&quot; has high energy.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <strong style={{ color: '#ffe66d' }}>3. Nudge the Points (Gradient Descent):</strong> <span style={{ color: 'var(--text-secondary)' }}>Treat the path coordinates as variables to optimize. Nudge points away from high-cost mountains, toward low-cost valleys. The middle points slide toward the Center (the Prior).</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <strong style={{ color: '#4ecdc4' }}>4. Repeat:</strong> <span style={{ color: 'var(--text-secondary)' }}>Keep nudging until the path settles into a stable curve. This final curve is your Geodesic.</span>
            </div>
          </div>

          <GeodesicComputationViz />

          <h3 className={vizStyles.subsectionTitle} style={{ marginTop: '2rem' }}>Part 7: The Reality—What We Actually Use in Production</h3>

          <p className={vizStyles.prose}>
            If this sounds computationally expensive, <strong>it is</strong>. To get the cost at every step, you might need to run the Decoder (or Encoder) hundreds of times just to find one path.
          </p>

          <p className={vizStyles.prose}>
            So here&apos;s the truth: <strong>in 99% of real-world applications</strong> (apps, filters, generative art tools), we just use Linear Interpolation. Geodesics are mathematically beautiful but computationally heavy.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>The &quot;Better&quot; Linear Trick: SLERP</h4>

          <p className={vizStyles.prose}>
            However, there is a middle ground that almost everyone uses instead of a boring straight line: <strong>SLERP (Spherical Linear Interpolation)</strong>.
          </p>

          <p className={vizStyles.prose}>
            Why? In high-dimensional space (like 512D), Gaussian distributions don&apos;t look like a solid ball—they look like a <em>hollow shell</em> (a soap bubble). Most of the probability mass lives on the surface of a hypersphere.
          </p>

          <InterpolationComparisonViz />

          <p className={vizStyles.prose} style={{ marginTop: '1.5rem' }}>
            If you look at the code for famous models (like StyleGAN or Stable Diffusion variants), you will almost always see SLERP.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>The Hierarchy of Interpolation</h4>

          <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Method</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Speed</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Quality</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: '#ff6b6b', fontWeight: 500 }}>LERP (Linear)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Instant</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Decent. Can get blurry in the middle.</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-dim)' }}>Simple debugging, low-compute apps</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: '#4ecdc4', fontWeight: 500 }}>SLERP (Spherical)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Instant</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Good. Stays on the high-probability &quot;shell.&quot;</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-dim)' }}>Standard for Production (GANs/VAEs)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: '#a78bfa', fontWeight: 500 }}>Geodesic (Riemannian)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Very Slow</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Perfect. Follows true semantic meaning.</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-dim)' }}>Scientific analysis, research papers</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Takeaway:</strong> We teach Geodesics to understand the geometry and <em>why</em> the model behaves the way it does. But when we build the app, we use SLERP. It&apos;s the pragmatic middle ground—fast enough for production, smart enough to avoid the worst artifacts.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'explicit',
      title: 'Why is p(x|z) "Explicit" in VAEs?',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <p className={vizStyles.prose}>
            VAEs are described as having an <strong>&quot;explicit&quot;</strong> density for p(x|z), while GANs have an <strong>&quot;implicit&quot;</strong> one. The VAE decoder outputs the <em>parameters of a probability distribution</em>, not just pixel values.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Output is Parameters, Not Pixels</h3>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>GAN Generator</h4>
              <p>&quot;This pixel is 0.75.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: 'var(--accent)' }}>VAE Decoder</h4>
              <p>&quot;This pixel follows N(0.75, 0.1).&quot;</p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            Because we have an explicit distribution, we can compute the likelihood: p(x|z) = (1 / σ√(2π)) · exp(-½ · ((x - μ) / σ)²)
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>Why VAEs are blurry:</strong> When we display the mean μ, sharp edges (which have high uncertainty σ) get averaged into gray. The model is being honest about its uncertainty!
            </p>
          </div>
        </div>
      ),
    },
  ];

  return <VAETimelineLayout sections={tabs} deepDives={deepDives} />;
}
