'use client';

import vizStyles from './visualization.module.css';
import ForwardDiffusionViz from '../../components/ForwardDiffusionViz';
import GaussianCombinationViz from '../../components/GaussianCombinationViz';
import LangevinDynamicsViz from '../../components/LangevinDynamicsViz';
import ELBODerivationViz from '../../components/ELBODerivationViz';
import NoisePredictionViz from '../../components/NoisePredictionViz';
import ReverseSamplingViz from '../../components/ReverseSamplingViz';
import VAETimelineLayout from '../../components/VAETimelineLayout';

export default function DiffusionContent() {
  const tabs = [
    {
      id: 'intuition',
      label: 'The Core Intuition',
      shortLabel: 'Intuition',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Core Intuition</h2>

          <p className={vizStyles.prose}>
            Imagine you have a crisp photograph. Now, imagine slowly adding a layer of static (noise) to it. You do this again, and again, thousands of times. Eventually, the photo is gone — you&apos;re left with a screen of pure, random static.
          </p>

          <p className={vizStyles.prose}>
            That process — <em>destroying</em> the image — is easy. Gravity does it to ink in water; entropy does it to the universe.
          </p>

          <p className={vizStyles.prose}>
            <strong>Diffusion Models are about learning to run that movie in reverse.</strong> They start with pure static and learn to slowly, carefully &quot;un-fog&quot; it until a brand-new, crystal-clear image emerges.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Forward Process: &quot;The Shredder&quot;</h4>
              <p>Gradually add noise to an image until it becomes pure static. We know exactly how to destroy information.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This is easy — we don&apos;t need a neural network, just a mathematical formula to add randomness.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Reverse Process: &quot;The Artist&quot;</h4>
              <p>Start from noise and gradually &quot;un-noise&quot; it to create a realistic image.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This is hard — if I show you static, there are infinite images that could be hidden inside. We train a neural network to solve this.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Two Key Distributions: q and p</h3>

          <p className={vizStyles.prose}>
            Throughout this page, you&apos;ll see two probability distributions denoted by <strong>q</strong> and <strong>p</strong>. Understanding what each represents is essential:
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>q — The Forward Process (Fixed, Known)</h4>
              <p><strong>q(x<sub>t</sub> | x<sub>t-1</sub>)</strong> describes how we add noise to go from a cleaner image to a noisier one.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This is <em>not</em> learned—it&apos;s a fixed mathematical formula. We choose q by defining a noise schedule. Think of q as &quot;the corruption process&quot; or &quot;how we destroy data.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>p<sub>θ</sub> — The Reverse Process (Learned)</h4>
              <p><strong>p<sub>θ</sub>(x<sub>t-1</sub> | x<sub>t</sub>)</strong> describes how we remove noise to go from a noisier image to a cleaner one.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This is what the neural network learns. The subscript θ indicates it depends on the network&apos;s parameters. Think of p as &quot;the generation process&quot; or &quot;how we create data.&quot;</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Memory Aid:</strong> <strong>q</strong> = &quot;the <strong>q</strong>uestion we can answer&quot; (how to add noise—we know this exactly). <strong>p</strong> = &quot;the <strong>p</strong>roblem we need to solve&quot; (how to remove noise—we learn this with a neural network).
            </p>
          </div>

          <p className={vizStyles.prose}>
            The key insight is that if we add noise in <em>tiny steps</em>, each reverse step becomes a simple problem: &quot;remove a little bit of noise.&quot; A neural network can learn to do this at each step.
          </p>
        </div>
      ),
    },
    {
      id: 'aha-moments',
      label: 'The Big Picture',
      shortLabel: 'Big Picture',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Mathematical &quot;Aha!&quot; Moments</h2>

          <p className={vizStyles.prose}>
            Before we dive into the math, here are the three key tricks that make diffusion models work. Understanding these upfront will help you see <em>why</em> the equations are the way they are.
          </p>

          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00f3ff' }}>Trick 1: The Reparameterization Trick</h4>
              <p><strong>The Problem:</strong> Computers can&apos;t easily take the derivative of &quot;randomness.&quot; It breaks the chain needed for learning.</p>
              <p style={{ marginTop: '0.5rem' }}><strong>The Fix:</strong> Instead of saying &quot;sample x from a random cloud,&quot; we say &quot;x is the center of the cloud (μ) plus a fixed random nudge (ε) times the spread (σ).&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This lets us treat the random noise as just another input, allowing the neural network to learn.</p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>Trick 2: The &quot;Jump&quot; Shortcut</h4>
              <p><strong>The Problem:</strong> Simulating 1000 noise steps for every training example would be painfully slow.</p>
              <p style={{ marginTop: '0.5rem' }}><strong>The Fix:</strong> Because adding Gaussian noises together just creates a new, larger Gaussian, we can jump straight from the clean image (x<sub>0</sub>) to any noisy step (x<sub>t</sub>) instantly.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Just pick a random time t, calculate exactly how noisy the image should be, and train. No simulation needed.</p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Trick 3: The ELBO (Evidence Lower Bound)</h4>
              <p><strong>The Problem:</strong> We want to maximize the probability that our model generates real-looking images. But calculating the exact probability of every possible pixel arrangement is impossible.</p>
              <p style={{ marginTop: '0.5rem' }}><strong>The Analogy:</strong> Imagine trying to measure the height of a ceiling you can&apos;t reach. If you stand on a box and still don&apos;t touch it, you know the ceiling is <em>at least</em> as high as your head.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>The ELBO is that box — a guaranteed minimum score. If we push the ELBO up, we push the true probability up with it.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Physics Connection: Langevin Dynamics</h3>

          <p className={vizStyles.prose}>
            There&apos;s a beautiful connection to physics that explains <em>why</em> diffusion models work so well:
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>The Energy Landscape</h4>
              <p>Imagine a landscape where &quot;deep valleys&quot; are real images and &quot;high peaks&quot; are random noise. We want our generated image to roll downhill into a valley.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>The Score is Gravity</h4>
              <p>The &quot;score function&quot; tells us which way is downhill. Our model learns this gravity — by predicting noise, it learns which direction leads toward realistic images.</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Punchline:</strong> Diffusion models learn to be gravity in image space. They learn which direction points &quot;downhill&quot; toward real images, then use that to guide random noise into beautiful pictures.
            </p>
          </div>

          <p className={vizStyles.prose}>
            With these intuitions in mind, let&apos;s dive into the details. The following sections will make these tricks precise.
          </p>
        </div>
      ),
    },
    {
      id: 'prerequisites',
      label: 'Math Foundations',
      shortLabel: 'Math',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Math You Need</h2>

          <p className={vizStyles.prose}>
            Now that you have the big picture, let&apos;s build fluency with the mathematical tools we&apos;ll use. You don&apos;t need to be an expert—just understand what these tools <em>do</em>.
          </p>

          <h3 className={vizStyles.subsectionTitle}>1. Gaussian (Normal) Distributions</h3>

          <p className={vizStyles.prose}>
            A Gaussian distribution is a &quot;bell curve&quot; centered at some mean μ with spread σ. The key insight: <strong>adding Gaussian noise to a value creates a new Gaussian centered at that value</strong>.
          </p>

          <div className={vizStyles.mathBlock}>
            x ~ N(μ, σ²) means x is drawn from a bell curve centered at μ with variance σ²
          </div>

          <h3 className={vizStyles.subsectionTitle}>2. The Reparameterization Trick</h3>

          <p className={vizStyles.prose}>
            Instead of sampling directly from N(μ, σ²), we can write:
          </p>

          <div className={vizStyles.mathBlock}>
            x = μ + σ · ε, where ε ~ N(0, 1)
          </div>

          <p className={vizStyles.prose}>
            This separates the <em>randomness</em> (ε) from the <em>parameters</em> (μ, σ), allowing gradients to flow through μ and σ during backpropagation.
          </p>

          <h3 className={vizStyles.subsectionTitle}>3. KL Divergence</h3>

          <p className={vizStyles.prose}>
            KL divergence measures how &quot;different&quot; two probability distributions are. For two Gaussians with the same variance, it&apos;s proportional to the squared distance between their means:
          </p>

          <div className={vizStyles.mathBlock}>
            D<sub>KL</sub>(N(μ₁, σ²) || N(μ₂, σ²)) ∝ (μ₁ - μ₂)²
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Key Insight:</strong> Minimizing KL divergence between two Gaussians with equal variance is the same as minimizing Mean Squared Error between their means!
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>4. Multiplying Gaussians</h3>

          <p className={vizStyles.prose}>
            When you multiply two Gaussian probability density functions, you get another Gaussian. This is crucial for deriving the reverse process.
          </p>

          <div className={vizStyles.mathBlock}>
            N(μ₁, σ₁²) × N(μ₂, σ₂²) ∝ N(μ_new, σ_new²)
          </div>

          <p className={vizStyles.prose}>
            The new mean is a <em>weighted average</em> of the original means, weighted by inverse variances (more confident = more weight).
          </p>
        </div>
      ),
    },
    {
      id: 'forward',
      label: 'The Forward Process',
      shortLabel: 'Forward',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Forward Process (Destroying Data)</h2>

          <p className={vizStyles.prose}>
            We define a Markov chain that gradually adds Gaussian noise to the data over T timesteps (typically 1000). At each step t, we slightly shrink the image and add a bit of noise:
          </p>

          <div className={vizStyles.mathBlock}>
            q(x<sub>t</sub> | x<sub>t-1</sub>) = N(x<sub>t</sub>; √(1-β<sub>t</sub>) · x<sub>t-1</sub>, β<sub>t</sub> · I)
          </div>

          <p className={vizStyles.prose}>
            Where β<sub>t</sub> is a small &quot;noise schedule&quot; (around 0.0001 to 0.02). After enough steps, the image becomes indistinguishable from pure Gaussian noise.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Watch the Forward Process</h3>
              <p>See how an image gradually dissolves into noise as we apply the forward diffusion process.</p>
            </div>
            <ForwardDiffusionViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Magic Shortcut: Direct Sampling</h3>

          <p className={vizStyles.prose}>
            In the forward process, we usually add noise step-by-step (t=1, then t=2, etc.). But math gives us a shortcut: because adding two Gaussian noises together just creates a new, larger Gaussian noise, we can <strong>jump directly</strong> to any timestep t without computing all intermediate steps:
          </p>

          <div className={vizStyles.mathBlock}>
            q(x<sub>t</sub> | x<sub>0</sub>) = N(x<sub>t</sub>; √ᾱ<sub>t</sub> · x<sub>0</sub>, (1 - ᾱ<sub>t</sub>) · I)
          </div>

          <p className={vizStyles.prose}>
            Where ᾱ<sub>t</sub> = α₁ · α₂ · ... · α<sub>t</sub> and α<sub>t</sub> = 1 - β<sub>t</sub>. This is the product of all the &quot;shrinkage factors.&quot;
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>Intuition:</strong> ᾱ<sub>t</sub> represents the &quot;signal remaining&quot; at time t. As t increases, ᾱ<sub>t</sub> approaches 0 (no signal left, pure noise).
            </p>
          </div>

          <p className={vizStyles.prose}>
            Using the reparameterization trick, we can write any noisy image at time t as:
          </p>

          <div className={vizStyles.mathBlock}>
            x<sub>t</sub> = √ᾱ<sub>t</sub> · x<sub>0</sub> + √(1 - ᾱ<sub>t</sub>) · ε, where ε ~ N(0, I)
          </div>

          <p className={vizStyles.prose}>
            This allows super-fast training: grab an image, sample a random t, compute x<sub>t</sub> directly, and train the network to predict the noise ε.
          </p>
        </div>
      ),
    },
    {
      id: 'reverse',
      label: 'The Reverse Process',
      shortLabel: 'Reverse',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Reverse Process (Genesis)</h2>

          <p className={vizStyles.prose}>
            Now the hard part: we want to reverse the diffusion. Given a noisy image x<sub>t</sub>, what was the slightly-less-noisy image x<sub>t-1</sub>?
          </p>

          <p className={vizStyles.prose}>
            We model this as a Gaussian:
          </p>

          <div className={vizStyles.mathBlock}>
            p<sub>θ</sub>(x<sub>t-1</sub> | x<sub>t</sub>) = N(x<sub>t-1</sub>; μ<sub>θ</sub>(x<sub>t</sub>, t), σ<sub>t</sub>² · I)
          </div>

          <p className={vizStyles.prose}>
            The notation N(x; μ, σ²) means x is drawn from a Gaussian with mean μ (center) and variance σ² (spread). So this equation says: &quot;Given the current noisy image x<sub>t</sub>, the previous (slightly cleaner) image x<sub>t-1</sub> follows a Gaussian distribution centered at μ<sub>θ</sub>.&quot;
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>μ<sub>θ</sub>(x<sub>t</sub>, t) — The Neural Network&apos;s Prediction</h4>
              <p><strong>μ</strong> = the mean (center) of the Gaussian — our &quot;best guess&quot; for what x<sub>t-1</sub> should be.</p>
              <p style={{ marginTop: '0.5rem' }}><strong>θ</strong> (subscript) = this mean is computed by a neural network with learnable parameters θ.</p>
              <p style={{ marginTop: '0.5rem' }}>The network takes two inputs: <strong>x<sub>t</sub></strong> (the current noisy image) and <strong>t</strong> (the timestep), and outputs the predicted center of where x<sub>t-1</sub> should be.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>σ<sub>t</sub>² · I — The Fixed Variance</h4>
              <p>The variance is typically <strong>not learned</strong> — it&apos;s fixed to β<sub>t</sub> based on the noise schedule.</p>
              <p style={{ marginTop: '0.5rem' }}>So the only thing the network needs to learn is <em>where to center its guess</em> (μ<sub>θ</sub>).</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>In Plain English:</strong> We train a neural network to look at a noisy image and predict the center of a probability cloud for what the slightly-less-noisy version should look like.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Tractable Posterior</h3>

          <p className={vizStyles.prose}>
            We&apos;ve defined what our network will output (μ<sub>θ</sub>), but <strong>what should it be trying to match?</strong> We need a training target — some &quot;ground truth&quot; for what the ideal reverse step looks like.
          </p>

          <p className={vizStyles.prose}>
            This is where <strong>q</strong> comes back in. Remember: q is our forward process (how we add noise). If we could somehow &quot;reverse&quot; q, we&apos;d have the perfect target for p<sub>θ</sub> to learn. The ideal reverse step would be q(x<sub>t-1</sub> | x<sub>t</sub>) — &quot;given a noisy image, what was the previous less-noisy version?&quot;
          </p>

          <p className={vizStyles.prose}>
            Here&apos;s the problem: we <em>can&apos;t</em> compute q(x<sub>t-1</sub> | x<sub>t</sub>) directly — it depends on the entire data distribution (all possible images that could have led to x<sub>t</sub>).
          </p>

          <p className={vizStyles.prose}>
            But here&apos;s the key insight: <strong>during training, we know x<sub>0</sub></strong> (it&apos;s our training data!). This changes everything.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Without x<sub>0</sub>: Intractable</h4>
              <p>q(x<sub>t-1</sub> | x<sub>t</sub>) asks: &quot;Given this noisy image, what are ALL the possible slightly-less-noisy versions?&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>This requires integrating over every possible original image that could have led here — impossible.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>With x<sub>0</sub>: Tractable</h4>
              <p>q(x<sub>t-1</sub> | x<sub>t</sub>, x<sub>0</sub>) asks: &quot;Given I started at x<sub>0</sub> and I&apos;m now at x<sub>t</sub>, where was I at step t-1?&quot;</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>We know both endpoints! The intermediate point x<sub>t-1</sub> is constrained by Gaussian math.</p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            Think of it like this: if someone tells you &quot;I walked from my house and ended up somewhere noisy,&quot; there are infinite paths they could have taken. But if they say &quot;I started at 123 Main St and I&apos;m now at the park,&quot; you can make a very good guess about where they were one step ago.
          </p>

          <p className={vizStyles.prose}>
            Mathematically, since our forward process is Gaussian at every step, and we know both x<sub>0</sub> and x<sub>t</sub>, we can use Bayes&apos; rule to find the distribution of x<sub>t-1</sub>. It turns out to be another Gaussian:
          </p>

          <div className={vizStyles.mathBlock}>
            q(x<sub>t-1</sub> | x<sub>t</sub>, x<sub>0</sub>) = N(x<sub>t-1</sub>; μ̃<sub>t</sub>(x<sub>t</sub>, x<sub>0</sub>), β̃<sub>t</sub> · I)
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Combining Gaussians to Find the Posterior</h3>
              <p>Step through the derivation of how two Gaussian distributions combine to give us the tractable posterior.</p>
            </div>
            <GaussianCombinationViz />
          </div>

          <p className={vizStyles.prose}>
            The derived mean μ̃<sub>t</sub> is a weighted combination of x<sub>0</sub> and x<sub>t</sub>:
          </p>

          <div className={vizStyles.mathBlock}>
            μ̃<sub>t</sub> = (√ᾱ<sub>t-1</sub> · β<sub>t</sub> / (1 - ᾱ<sub>t</sub>)) · x<sub>0</sub> + (√α<sub>t</sub> · (1 - ᾱ<sub>t-1</sub>) / (1 - ᾱ<sub>t</sub>)) · x<sub>t</sub>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Deep Dive: Why Does Multiplying Gaussians Work?</h3>

          <p className={vizStyles.prose}>
            This is worth understanding in detail because it&apos;s the mathematical heart of diffusion models. Here&apos;s the complete derivation:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>Step 1: Start with Bayes&apos; Rule</h4>
              <p>We want q(x<sub>t-1</sub> | x<sub>t</sub>, x<sub>0</sub>). By Bayes&apos; rule:</p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                q(x<sub>t-1</sub> | x<sub>t</sub>, x<sub>0</sub>) ∝ q(x<sub>t</sub> | x<sub>t-1</sub>) × q(x<sub>t-1</sub> | x<sub>0</sub>)
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                The ∝ means &quot;proportional to&quot;—we ignore normalizing constants that don&apos;t depend on x<sub>t-1</sub>.
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Step 2: Write Out Both Gaussians</h4>
              <p>Both terms on the right are Gaussians. Their PDFs are exponentials of quadratics:</p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                q(x<sub>t</sub> | x<sub>t-1</sub>) ∝ exp(-½ · (x<sub>t</sub> - √α<sub>t</sub>·x<sub>t-1</sub>)² / β<sub>t</sub>)
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                q(x<sub>t-1</sub> | x<sub>0</sub>) ∝ exp(-½ · (x<sub>t-1</sub> - √ᾱ<sub>t-1</sub>·x<sub>0</sub>)² / (1-ᾱ<sub>t-1</sub>))
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Step 3: Multiply = Add Exponents</h4>
              <p>When you multiply exponentials, the exponents add:</p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                exp(-A) × exp(-B) = exp(-(A + B))
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                So we add the two quadratic expressions in the exponents.
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Step 4: Expand (x - μ)² and Collect Terms</h4>
              <p>Expand both (x - μ)² expressions. You get terms with x<sub>t-1</sub>², x<sub>t-1</sub>, and constants.</p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                Combined exponent = -½ · (A·x<sub>t-1</sub>² - B·x<sub>t-1</sub> + C)
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                where A = (α<sub>t</sub>/β<sub>t</sub> + 1/(1-ᾱ<sub>t-1</sub>)) and B contains terms with x<sub>t</sub> and x<sub>0</sub>.
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Step 5: Complete the Square</h4>
              <p>Any quadratic Ax² - Bx equals A(x - B/2A)² + constant. This is the &quot;completing the square&quot; trick.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                Comparing to the standard Gaussian form (x - μ)²/σ², we get: <strong>New variance = 1/A</strong> and <strong>New mean = B/(2A)</strong>.
              </p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Result:</strong> The posterior q(x<sub>t-1</sub> | x<sub>t</sub>, x<sub>0</sub>) is a Gaussian whose mean is a <em>weighted average</em> of where x<sub>0</sub> says x<sub>t-1</sub> should be and where x<sub>t</sub> says x<sub>t-1</sub> should be. The weights depend on how much we trust each source (inverse variance).
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Why Did We Derive This? The Training Target</h3>

          <p className={vizStyles.prose}>
            This formula for μ̃<sub>t</sub> is not just a mathematical curiosity—<strong>it is the training target for our neural network</strong>. Here&apos;s the logical chain:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>1. We Want to Reverse Diffusion</h4>
              <p>To generate images, we need p<sub>θ</sub>(x<sub>t-1</sub> | x<sub>t</sub>)—the probability of the previous (cleaner) image given the current (noisier) one.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>2. We Model It as a Gaussian</h4>
              <p>We assume p<sub>θ</sub>(x<sub>t-1</sub> | x<sub>t</sub>) = N(μ<sub>θ</sub>(x<sub>t</sub>, t), σ<sub>t</sub>²). The neural network outputs the mean μ<sub>θ</sub>.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>3. We Need a Target to Train Against</h4>
              <p>What should μ<sub>θ</sub> try to predict? We need a &quot;ground truth&quot; mean to compare against.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>4. The Posterior IS That Target!</h4>
              <p>During training, we know x<sub>0</sub> (it&apos;s our training data). So we can compute q(x<sub>t-1</sub> | x<sub>t</sub>, x<sub>0</sub>) exactly—and its mean μ̃<sub>t</sub> is what we want μ<sub>θ</sub> to learn!</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Key Insight:</strong> The formula μ̃<sub>t</sub> = f(x<sub>0</sub>, x<sub>t</sub>) tells us the <em>mathematically optimal</em> reverse step. Our neural network&apos;s job is to learn to approximate this—but without access to x<sub>0</sub> at test time! The network must learn to &quot;guess&quot; what μ̃<sub>t</sub> would be, given only x<sub>t</sub>.
            </p>
          </div>

          <p className={vizStyles.prose}>
            But wait—we still need to answer: <strong>why is matching these distributions the right thing to do?</strong> This is where the ELBO comes in. It provides the mathematical justification that training our network to match the posterior is equivalent to maximizing the likelihood of our data.
          </p>
        </div>
      ),
    },
    {
      id: 'elbo',
      label: 'The ELBO',
      shortLabel: 'ELBO',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The ELBO — Mathematical Justification</h2>

          <p className={vizStyles.prose}>
            We&apos;ve established that we want our network&apos;s output p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>) to match the true posterior q(x<sub>t-1</sub>|x<sub>t</sub>,x<sub>0</sub>). But <em>why</em> is this the right objective? The <strong>Evidence Lower Bound (ELBO)</strong> proves that minimizing the mismatch between these distributions is equivalent to maximizing the probability of real data.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Problem: Intractable Likelihood</h3>

          <p className={vizStyles.prose}>
            We want to maximize the probability of our data: log p(x<sub>0</sub>). But computing this requires integrating over all possible noise trajectories:
          </p>

          <div className={vizStyles.mathBlock}>
            log p(x<sub>0</sub>) = log ∫ p(x<sub>0:T</sub>) dx<sub>1:T</sub>
          </div>

          <p className={vizStyles.prose}>
            This integral is impossible to compute—we&apos;d need to sum over every possible path from noise to data.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Solution: Importance Sampling + Jensen&apos;s Inequality</h3>

          <p className={vizStyles.prose}>
            We introduce our forward process q(x<sub>1:T</sub> | x<sub>0</sub>) as a &quot;helper&quot; distribution. Multiplying and dividing by it (which equals 1) and using Jensen&apos;s inequality:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>Step 1: Multiply by q/q = 1</h4>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                log p(x₀) = log ∫ [p(x<sub>0:T</sub>) / q(x<sub>1:T</sub>|x₀)] · q(x<sub>1:T</sub>|x₀) dx<sub>1:T</sub>
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                = log E<sub>q</sub>[ p(x<sub>0:T</sub>) / q(x<sub>1:T</sub>|x₀) ]
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Step 2: Apply Jensen&apos;s Inequality</h4>
              <p>For concave functions like log: log(E[X]) ≥ E[log(X)]</p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                log p(x₀) ≥ E<sub>q</sub>[ log(p(x<sub>0:T</sub>) / q(x<sub>1:T</sub>|x₀)) ]
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                This right-hand side is the <strong>ELBO</strong> (Evidence Lower Bound).
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Step 3: Maximize ELBO = Maximize Likelihood</h4>
              <p>Since the ELBO is a lower bound on log p(x₀), pushing the ELBO up also pushes the true likelihood up.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                The paper minimizes the <em>negative</em> ELBO as a loss: L = -ELBO
              </p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Breaking Down the ELBO: The Telescoping Trick</h3>

          <p className={vizStyles.prose}>
            The ELBO is one big expression, but it can be decomposed into individual time steps. This is the &quot;magic&quot; from Appendix A of the DDPM paper.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>The Problem: Mismatched Directions</h4>
              <p>When we expand the ELBO, we get terms like log[ p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>) / q(x<sub>t</sub>|x<sub>t-1</sub>) ]</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                The numerator points backward (generation), the denominator points forward (diffusion). We can&apos;t compare them directly.
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>The Fix: Use Bayes&apos; Rule to Flip q</h4>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                q(x<sub>t</sub>|x<sub>t-1</sub>) = q(x<sub>t-1</sub>|x<sub>t</sub>,x₀) · q(x<sub>t</sub>|x₀) / q(x<sub>t-1</sub>|x₀)
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                Now q(x<sub>t-1</sub>|x<sub>t</sub>,x₀) points backward—same direction as our model!
              </p>
            </div>

            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>The Magic: Telescoping Cancellation</h4>
              <p>The q(x<sub>t</sub>|x₀) and q(x<sub>t-1</sub>|x₀) terms form a telescoping sum:</p>
              <p style={{ fontFamily: 'var(--font-mono)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                Σ[ log q(x<sub>t-1</sub>|x₀) - log q(x<sub>t</sub>|x₀) ] = log q(x₀|x₀) - log q(x<sub>T</sub>|x₀)
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                All intermediate terms cancel! Only the first and last survive.
              </p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>The ELBO Derivation Visualized</h3>
              <p>Follow the step-by-step breakdown of how the ELBO decomposes into interpretable loss terms.</p>
            </div>
            <ELBODerivationViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Three Final Loss Terms</h3>

          <p className={vizStyles.prose}>
            After the telescoping cancellation, we&apos;re left with three clean terms:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>L<sub>T</sub> — Prior Matching (Ignored)</h4>
              <p>D<sub>KL</sub>(q(x<sub>T</sub>|x<sub>0</sub>) || p(x<sub>T</sub>)): Does our forward process end at pure noise?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                This is constant (no learnable parameters), so we ignore it during training.
              </p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>L<sub>t-1</sub> — Denoising Match (The Core Loss)</h4>
              <p>Σ D<sub>KL</sub>(q(x<sub>t-1</sub>|x<sub>t</sub>,x<sub>0</sub>) || p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>))</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                Match our model&apos;s reverse step to the true posterior. <strong>This is what we actually train!</strong>
              </p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>L<sub>0</sub> — Reconstruction</h4>
              <p>-log p<sub>θ</sub>(x<sub>0</sub>|x<sub>1</sub>): Decode the final clean image from x<sub>1</sub>.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                Handled by a discrete decoder or absorbed into L<sub>1</sub>.
              </p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            Now we have a clear objective: minimize the KL divergence D<sub>KL</sub>(q(x<sub>t-1</sub>|x<sub>t</sub>,x<sub>0</sub>) || p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>)) at each timestep. But this still looks complicated. The next section shows how this simplifies dramatically.
          </p>
        </div>
      ),
    },
    {
      id: 'training',
      label: 'Training Objective',
      shortLabel: 'Training',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>From KL to MSE to Noise Prediction</h2>

          <p className={vizStyles.prose}>
            Let&apos;s trace the chain of simplifications that turns the abstract ELBO into a simple training objective:
          </p>

          <h3 className={vizStyles.subsectionTitle}>Step 1: KL Between Same-Variance Gaussians = MSE</h3>

          <p className={vizStyles.prose}>
            The core loss L<sub>t-1</sub> is D<sub>KL</sub>(q || p<sub>θ</sub>) where both are Gaussians. We fixed the variance σ<sub>t</sub>² to be the same for both (the paper sets it to β<sub>t</sub>). For Gaussians with equal variance:
          </p>

          <div className={vizStyles.mathBlock}>
            D<sub>KL</sub>(N(μ̃, σ²) || N(μ<sub>θ</sub>, σ²)) ∝ ||μ̃ - μ<sub>θ</sub>||²
          </div>

          <p className={vizStyles.prose}>
            The KL divergence is just the <strong>squared distance between the means</strong>! So our training objective is: make μ<sub>θ</sub> (network output) match μ̃<sub>t</sub> (the target from the posterior).
          </p>

          <h3 className={vizStyles.subsectionTitle}>Step 2: Rewrite μ̃<sub>t</sub> in Terms of Noise</h3>

          <p className={vizStyles.prose}>
            Remember the posterior mean formula depends on x<sub>0</sub>. But from our forward process, we can express x<sub>0</sub> in terms of x<sub>t</sub> and the noise ε that was added:
          </p>

          <div className={vizStyles.mathBlock}>
            x<sub>0</sub> = (x<sub>t</sub> - √(1-ᾱ<sub>t</sub>)·ε) / √ᾱ<sub>t</sub>
          </div>

          <p className={vizStyles.prose}>
            Substituting this into the formula for μ̃<sub>t</sub>, massive cancellation occurs, and we get:
          </p>

          <div className={vizStyles.mathBlock}>
            μ̃<sub>t</sub> = (1/√α<sub>t</sub>) · (x<sub>t</sub> - (β<sub>t</sub>/√(1-ᾱ<sub>t</sub>)) · ε)
          </div>

          <p className={vizStyles.prose}>
            The target mean depends on x<sub>t</sub> (known) and ε (the noise we added). So instead of predicting the mean directly, we <strong>parameterize the network to predict the noise</strong>:
          </p>

          <div className={vizStyles.mathBlock}>
            μ<sub>θ</sub> = (1/√α<sub>t</sub>) · (x<sub>t</sub> - (β<sub>t</sub>/√(1-ᾱ<sub>t</sub>)) · ε<sub>θ</sub>(x<sub>t</sub>, t))
          </div>

          <p className={vizStyles.prose}>
            When we compute the loss ||μ̃ - μ<sub>θ</sub>||², everything cancels except the noise terms:
          </p>

          <div className={vizStyles.mathBlock}>
            L<sub>simple</sub> = E<sub>t,x₀,ε</sub>[ ||ε - ε<sub>θ</sub>(x<sub>t</sub>, t)||² ]
          </div>

          <p className={vizStyles.prose}>
            In plain English: the loss is just &quot;How different was your guess from the real noise?&quot;
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Training Loop: Teaching a Noise Expert</h3>

          <p className={vizStyles.prose}>
            We don&apos;t actually teach the model to &quot;draw a cat.&quot; We teach it to be a <strong>Noise Expert</strong>. Here&apos;s exactly what happens in each training step:
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
              <strong style={{ color: '#00f3ff' }}>1. Pick an image:</strong> <span style={{ color: 'var(--text-secondary)' }}>Take a photo of a cat (x<sub>0</sub>) from your training set.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <strong style={{ color: '#a78bfa' }}>2. Pick a random time:</strong> <span style={{ color: 'var(--text-secondary)' }}>Choose a random timestep, say t=500.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 230, 109, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 230, 109, 0.3)' }}>
              <strong style={{ color: '#ffe66d' }}>3. Add noise:</strong> <span style={{ color: 'var(--text-secondary)' }}>Fog up the image until it looks like step 500 (x<sub>500</sub>). Crucially, we know exactly what noise (ε) we added.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
              <strong style={{ color: '#4ecdc4' }}>4. The test:</strong> <span style={{ color: 'var(--text-secondary)' }}>Show the foggy image (x<sub>500</sub>) to the neural network and ask: &quot;What noise do you think was added to this?&quot;</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
              <strong style={{ color: '#ff6b6b' }}>5. The correction:</strong> <span style={{ color: 'var(--text-secondary)' }}>The network guesses a noise map (ε<sub>θ</sub>). We compare it to the actual noise (ε) using Mean Squared Error.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
              <strong style={{ color: '#00ff88' }}>6. Update:</strong> <span style={{ color: 'var(--text-secondary)' }}>Adjust the network weights so it guesses better next time. Repeat millions of times.</span>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Noise Prediction in Action</h3>
              <p>See how the training objective works: given a noisy image, the network learns to predict the noise that was added.</p>
            </div>
            <NoisePredictionViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Elegant Result:</strong> Training a diffusion model is just regression! Add noise to images, ask a U-Net to predict what noise was added, minimize MSE. That&apos;s it.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sampling',
      label: 'Sampling',
      shortLabel: 'Sampling',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Sampling (Generating New Images)</h2>

          <p className={vizStyles.prose}>
            Once trained, generating new images is straightforward: start with pure noise x<sub>T</sub> ~ N(0, I), and iteratively apply the reverse process:
          </p>

          <div className={vizStyles.mathBlock}>
            x<sub>t-1</sub> = (1/√α<sub>t</sub>) · (x<sub>t</sub> - (β<sub>t</sub>/√(1-ᾱ<sub>t</sub>)) · ε<sub>θ</sub>(x<sub>t</sub>, t)) + σ<sub>t</sub> · z
          </div>

          <p className={vizStyles.prose}>
            Where z ~ N(0, I) is fresh noise added at each step. This noise term is crucial—it&apos;s what allows the model to sample from the distribution rather than collapse to a single point.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Watch the Reverse Process</h3>
              <p>See how an image emerges from pure noise through iterative denoising.</p>
            </div>
            <ReverseSamplingViz />
          </div>
        </div>
      ),
    },
    {
      id: 'langevin',
      label: 'Langevin Dynamics',
      shortLabel: 'Langevin',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Connection to Langevin Dynamics</h2>

          <p className={vizStyles.prose}>
            Once the model is trained, how do we actually make art? We start with pure noise, ask the model &quot;what part of this is static?&quot;, subtract a little bit of it, and repeat. This connects deeply to physics.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Marble in a Landscape</h3>

          <p className={vizStyles.prose}>
            Imagine a landscape where <strong>&quot;deep valleys&quot; are real images</strong> and <strong>&quot;high peaks&quot; are random noise</strong>. We want a marble (our image) to roll down into a valley.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>The Score Function is Gravity</h4>
              <p>The &quot;score function&quot; (∇<sub>x</sub> log p(x)) tells us which way is &quot;down&quot; — it points toward regions where real images live.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>Our Model Learns This Gravity</h4>
              <p>By subtracting the predicted noise, our trained network pushes the marble slightly closer to the valley of realistic images with each step.</p>
            </div>
          </div>

          <p className={vizStyles.prose}>
            This is formalized in <strong>Langevin dynamics</strong> from physics. Particles move according to:
          </p>

          <div className={vizStyles.mathBlock}>
            x<sub>t+1</sub> = x<sub>t</sub> + (ε/2) · ∇<sub>x</sub> log p(x<sub>t</sub>) + √ε · z<sub>t</sub>
          </div>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Gradient Term (The Push)</h4>
              <p>∇<sub>x</sub> log p(x) is the &quot;score function&quot;—a vector pointing toward higher probability regions (downhill toward real images).</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>Noise Term (The Jiggle)</h4>
              <p>Random noise z ensures we explore and sample the full distribution rather than just collapsing to a single point.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Wait — How Does Predicting Noise Learn the Score?</h3>

          <p className={vizStyles.prose}>
            This is the key connection. We trained our model to predict noise (ε), but now we&apos;re saying it learned the score function (∇ log p). How?
          </p>

          <p className={vizStyles.prose}>
            <strong>The answer: predicting noise IS learning the score.</strong> They&apos;re mathematically equivalent (up to scaling):
          </p>

          <div className={vizStyles.mathBlock}>
            ∇<sub>x</sub> log p(x<sub>t</sub>) ≈ -ε<sub>θ</sub>(x<sub>t</sub>, t) / √(1 - ᾱ<sub>t</sub>)
          </div>

          <p className={vizStyles.prose}>
            Here&apos;s the intuition:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>The Noise Points Away From Data</h4>
              <p>When we add noise to an image, we&apos;re pushing it <em>away</em> from the &quot;valley&quot; of real images and <em>toward</em> the &quot;peaks&quot; of random static.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>The Negative Noise Points Toward Data</h4>
              <p>So the <em>negative</em> of that noise (with some scaling) points back toward real images — which is exactly what the score function does!</p>
            </div>
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Beautiful Result:</strong> By training a simple noise predictor, we&apos;ve implicitly learned &quot;gravity&quot; in image space. The model now knows which direction leads toward realistic images from any point in noise-space.
            </p>
          </div>

          <p className={vizStyles.prose}>
            This means the reverse diffusion process is essentially running Langevin dynamics with a learned score function — rolling the marble downhill toward the valleys of real images!
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Langevin Dynamics Visualization</h3>
              <p>Watch particles move toward high-probability regions (bright areas) using gradient steps plus random noise.</p>
            </div>
            <LangevinDynamicsViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Unifying View:</strong> Diffusion models learn the &quot;score&quot; (gradient of log-probability) at every noise level. Sampling runs Langevin dynamics, following these learned gradients from noise toward data.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const deepDives = [
    {
      id: 'ebm',
      title: 'Connecting to Energy-Based Models',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <p className={vizStyles.prose}>
            In Energy-Based Models (EBMs), we define probability through an energy function:
          </p>

          <div className={vizStyles.mathBlock}>
            p(x) = e<sup>-E(x)</sup> / Z
          </div>

          <p className={vizStyles.prose}>
            Low energy = high probability. The normalization constant Z is intractable, but the <em>score</em> doesn&apos;t need it:
          </p>

          <div className={vizStyles.mathBlock}>
            ∇<sub>x</sub> log p(x) = -∇<sub>x</sub> E(x)
          </div>

          <p className={vizStyles.prose}>
            The score points &quot;downhill&quot; in the energy landscape—toward the valleys where real data lives. Diffusion models learn this score function at multiple noise levels, then use Langevin dynamics to &quot;roll downhill&quot; from noise into these data valleys.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Why Multiple Noise Levels?</h4>
              <p>At high noise levels, the energy landscape is smooth and gradients point toward the general data region. At low noise levels, gradients are sharp and point toward specific data points. The multi-scale approach guides samples from &quot;vaguely data-like&quot; to &quot;specifically realistic.&quot;</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'Summary: The Complete Picture',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <p className={vizStyles.prose}>
            Here&apos;s everything in one place — both the textbook definition and the human translation:
          </p>

          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Concept</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--accent)' }}>Textbook Definition</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ffe66d' }}>Human Translation</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Forward Process (q)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Markov chain adding Gaussian noise over T steps</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}><strong>&quot;The Shredder&quot;</strong> — slowly turning a photo into static</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Reverse Process (p)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Learned Gaussian transitions p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}><strong>&quot;The Artist&quot;</strong> — guessing the static to reveal the photo</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Noise Schedule (β)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Variance parameters β<sub>1</sub>...β<sub>T</sub></td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>The speed at which the fog thickens at each step</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>ELBO</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Variational lower bound on log-likelihood</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>A mathematical &quot;floor&quot; we raise to improve quality</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Score Function</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>∇<sub>x</sub> log p(x) — gradient of log probability</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>&quot;Gravity&quot; pointing toward real images</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Training Loss</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>L = ||ε - ε<sub>θ</sub>(x<sub>t</sub>, t)||²</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>&quot;How wrong was your noise guess?&quot;</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>U-Net</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Neural architecture estimating ε<sub>θ</sub></td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>The brain that looks at fog and predicts the static pattern</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'takeaways',
      title: 'Key Takeaways',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4>1. Destruction is Easy, Creation is Hard</h4>
              <p>Adding noise step-by-step is trivial. Learning to reverse it requires a neural network, but each step is a simple denoising problem.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>2. The ELBO Gives Us a Tractable Objective</h4>
              <p>We can&apos;t compute log p(x) directly, but the ELBO gives us a lower bound that decomposes into KL divergences between Gaussians.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>3. Predicting Noise is Equivalent to Predicting the Mean</h4>
              <p>By clever reparameterization, the complex-looking objective simplifies to &quot;predict what noise was added.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>4. It&apos;s All Langevin Dynamics</h4>
              <p>The reverse process is essentially running Langevin dynamics with a learned score function at each noise level.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>5. Training is Simple: Just MSE</h4>
              <p>Despite the complex theory, training amounts to: add noise to images, predict the noise, minimize squared error. Repeat.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'connections',
      title: 'Further Connections',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <p className={vizStyles.prose}>
            Diffusion models connect to many other areas:
          </p>

          <ul style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Score Matching:</strong> Training the network to predict noise is equivalent to denoising score matching.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>SDEs:</strong> The forward/reverse processes can be viewed as stochastic differential equations.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Flow Matching:</strong> Modern variants learn &quot;straight paths&quot; from noise to data, enabling fewer sampling steps.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Consistency Models:</strong> Distill the full trajectory into a single-step generator.</li>
          </ul>

          <p className={vizStyles.prose}>
            The math of diffusion models reveals a deep connection between physics (thermodynamics, Langevin dynamics), probability theory (KL divergence, ELBO), and deep learning (U-Nets, score matching). Understanding these connections unlocks intuition for why these models work so remarkably well.
          </p>
        </div>
      ),
    },
  ];

  return <VAETimelineLayout sections={tabs} deepDives={deepDives} />;
}
