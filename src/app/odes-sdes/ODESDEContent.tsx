'use client';

import VAETimelineLayout from '../../components/VAETimelineLayout';
import {
  VectorFieldFlowViz,
  ODEExplorerViz,
  NumericalMethodsViz,
  BrownianMotionViz,
  SatelliteNeuralODEViz,
  GradientFlowViz,
  DiffusionProcessViz,
  SpiralNeuralODEViz,
} from './ODEVisualizations';

// Reuse the visualization styles
const vizStyles = {
  section: 'section',
  sectionTitle: 'sectionTitle',
  subsectionTitle: 'subsectionTitle',
  prose: 'prose',
  mathBlock: 'mathBlock',
  callout: 'callout',
  distanceComparison: 'distanceComparison',
  distanceCard: 'distanceCard',
};

// Inline styles to match other pages
const styles = {
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    marginBottom: '1.5rem',
    color: 'var(--text-primary)',
    fontWeight: 700,
  },
  subsectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    marginTop: '2rem',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  prose: {
    fontSize: '1.125rem',
    lineHeight: 1.8,
    color: 'var(--text-secondary)',
    marginBottom: '1.75rem',
  },
  mathBlock: {
    background: 'hsla(0, 0%, 0%, 0.3)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '1.5rem',
    margin: '1.5rem 0',
    fontFamily: 'var(--font-mono)',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    textAlign: 'center' as const,
    overflowX: 'auto' as const,
  },
  callout: {
    margin: '2rem 0',
    padding: '1.5rem',
    background: 'hsla(var(--accent-hsl), 0.08)',
    border: '1px solid hsla(var(--accent-hsl), 0.2)',
    borderRadius: '12px',
    borderLeft: '4px solid var(--accent)',
  },
  distanceComparison: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    margin: '2rem 0',
  },
  distanceCard: {
    padding: '1.5rem',
    background: 'hsla(0, 0%, 100%, 0.03)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
  },
};

export default function ODESDEContent() {
  const tabs = [
    {
      id: 'intuition',
      label: 'The Core Intuition',
      shortLabel: 'Intuition',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>The Mathematics of Change</h2>

          <p style={styles.prose}>
            The physical universe is not static — it&apos;s <strong>dynamic</strong>. Planets orbit, heat diffuses, populations grow, stock prices fluctuate. For 300 years, mathematicians have used one tool to describe all of this: <strong>Differential Equations</strong>.
          </p>

          <p style={styles.prose}>
            A differential equation doesn&apos;t tell you <em>where</em> something is. It tells you <em>how it changes</em>. It&apos;s the difference between a snapshot and a movie.
          </p>

          <VectorFieldFlowViz />

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>The Core Idea:</strong> Machine learning has discovered that neural networks aren&apos;t just static functions — they&apos;re <em>dynamical systems</em>. Training is a flow. Inference is a trajectory. The &quot;language of nature&quot; is becoming the language of AI.
            </p>
          </div>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '0.75rem' }}>ODE — Ordinary Differential Equation</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong>Deterministic.</strong> Given the current state, the future is fixed. A ball rolling down a smooth hill follows one exact path.
              </p>
              <p style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                dx/dt = f(x, t)
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#a78bfa', marginBottom: '0.75rem' }}>SDE — Stochastic Differential Equation</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong>Probabilistic.</strong> The future is a distribution of possibilities. A ball rolling down a shaky, vibrating hill takes a different path each time.
              </p>
              <p style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                dx = f(x,t)dt + g(x,t)dW
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>Why Does This Matter for ML?</h3>

          <p style={styles.prose}>
            Modern ML has discovered that many core algorithms are secretly differential equations in disguise:
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ ...styles.distanceCard, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>1</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>ResNets are Euler&apos;s method</strong>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.25rem' }}>A deep residual network is just a discretized ODE solver.</p>
              </div>
            </div>
            <div style={{ ...styles.distanceCard, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>2</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Gradient Descent is Gradient Flow</strong>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Training follows a continuous trajectory down the loss landscape (ODE).</p>
              </div>
            </div>
            <div style={{ ...styles.distanceCard, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>3</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>SGD is Langevin Dynamics</strong>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Mini-batch noise turns the ODE into an SDE — and that&apos;s actually helpful.</p>
              </div>
            </div>
            <div style={{ ...styles.distanceCard, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>4</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Diffusion Models are SDEs</strong>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.25rem' }}>DALL-E, Midjourney, Sora — all powered by stochastic differential equations.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'odes',
      label: 'ODEs Explained',
      shortLabel: 'ODEs',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Ordinary Differential Equations</h2>

          <p style={styles.prose}>
            An ODE describes how something changes based on its current state. It&apos;s a <strong>rule for change</strong>, not a description of the path itself.
          </p>

          <div style={styles.mathBlock}>
            dx/dt = f(x, t)
          </div>

          <p style={styles.prose}>
            This says: &quot;The rate of change of x (how fast it&apos;s moving) is some function of where it currently is (x) and what time it is (t).&quot;
          </p>

          <h3 style={styles.subsectionTitle}>The Vector Field Intuition</h3>

          <p style={styles.prose}>
            Imagine a river viewed from above. At every point in the water, there&apos;s a little arrow showing which way the current flows and how fast. This field of arrows is the <strong>vector field</strong> — it&apos;s what the ODE defines.
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ffe66d', marginBottom: '0.75rem' }}>The Equation (f)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tells you the arrows — the velocity at each point. &quot;If you&apos;re here, move this way.&quot;</p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88', marginBottom: '0.75rem' }}>The Solution (x(t))</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Is the path a leaf traces when dropped in the river — following all those arrows.</p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>Explore Different Vector Fields</h3>

          <p style={styles.prose}>
            Different equations create dramatically different flows. Click each type to see how the vector field changes — and watch particles trace their paths through it.
          </p>

          <ODEExplorerViz />

          <h3 style={styles.subsectionTitle}>Classic Examples</h3>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>Exponential Growth/Decay: dx/dt = ax</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                &quot;The rate of change is proportional to the current value.&quot;
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                If a &gt; 0: exponential growth (populations, compound interest)<br/>
                If a &lt; 0: exponential decay (radioactive decay, cooling)
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Solution: x(t) = x₀ · e^(at)
              </p>
            </div>

            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Newton&apos;s Law: d²x/dt² = F/m</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                &quot;Acceleration equals force divided by mass.&quot;
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                This is a second-order ODE — it involves the second derivative (acceleration).
                All of classical mechanics reduces to solving these.
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>Why Most ODEs Can&apos;t Be &quot;Solved&quot;</h3>

          <p style={styles.prose}>
            For simple ODEs, we can find a formula for x(t). But for complex ODEs — especially when f is a neural network with millions of parameters — no formula exists. We must <strong>simulate</strong> the path step by step. This is called <strong>numerical integration</strong>.
          </p>
        </div>
      ),
    },
    {
      id: 'numerical',
      label: 'Numerical Methods',
      shortLabel: 'Solvers',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Simulating ODEs: Numerical Methods</h2>

          <p style={styles.prose}>
            Since we can&apos;t solve most ODEs analytically, we <strong>approximate</strong> them. We take discrete steps through the vector field, following the arrows.
          </p>

          <h3 style={styles.subsectionTitle}>Euler&apos;s Method (1768)</h3>

          <p style={styles.prose}>
            The simplest approach: assume the velocity is constant over a small time step h, then move straight in that direction.
          </p>

          <div style={styles.mathBlock}>
            x(t + h) = x(t) + h · f(x(t), t)
          </div>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>The Key Insight:</strong> This equation is <em>identical</em> to a ResNet layer! A ResNet block does: x<sub>t+1</sub> = x<sub>t</sub> + f(x<sub>t</sub>). A deep ResNet is just Euler&apos;s method with h=1.
            </p>
          </div>

          <h3 style={styles.subsectionTitle}>Runge-Kutta (RK4)</h3>

          <p style={styles.prose}>
            Euler&apos;s method is crude — it overshoots on curves. RK4 is smarter: it samples the slope at <strong>four points</strong> (start, two midpoints, end) and averages them.
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
              <strong style={{ color: '#4ecdc4' }}>k₁:</strong> <span style={{ color: 'var(--text-secondary)' }}>Slope at the start</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <strong style={{ color: '#a78bfa' }}>k₂:</strong> <span style={{ color: 'var(--text-secondary)' }}>Slope at the midpoint (using k₁ to get there)</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 230, 109, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 230, 109, 0.3)' }}>
              <strong style={{ color: '#ffe66d' }}>k₃:</strong> <span style={{ color: 'var(--text-secondary)' }}>Another midpoint slope (using k₂)</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
              <strong style={{ color: '#ff6b6b' }}>k₄:</strong> <span style={{ color: 'var(--text-secondary)' }}>Slope at the end (using k₃)</span>
            </div>
          </div>

          <div style={styles.mathBlock}>
            x(t + h) = x(t) + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)
          </div>

          <p style={styles.prose}>
            RK4 is a <strong>fourth-order method</strong>: halving the step size reduces error by 16×. This is why it&apos;s the workhorse of scientific computing.
          </p>

          <h3 style={styles.subsectionTitle}>See It In Action</h3>

          <p style={styles.prose}>
            Try simulating a simple circular motion (simple harmonic oscillator). Euler overshoots and spirals outward. RK4 stays on the circle. Adjust the step size to see how accuracy changes.
          </p>

          <NumericalMethodsViz />

          <h3 style={styles.subsectionTitle}>Adaptive Solvers</h3>

          <p style={styles.prose}>
            Modern solvers are <strong>adaptive</strong>. They estimate error at each step and automatically adjust the step size — taking big leaps on straight sections and tiny steps on sharp curves.
          </p>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>For Neural ODEs:</strong> This adaptivity is a superpower. The network spends compute where it&apos;s needed. A fixed-layer ResNet can&apos;t do this — it always uses exactly 50 layers worth of compute.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sdes',
      label: 'SDEs Explained',
      shortLabel: 'SDEs',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Stochastic Differential Equations</h2>

          <p style={styles.prose}>
            ODEs assume the world is deterministic — no surprises. But reality has <strong>noise</strong>. Stock prices jitter. Sensors have errors. Mini-batches give noisy gradients. SDEs add randomness to the equation.
          </p>

          <div style={styles.mathBlock}>
            dx = f(x, t) dt + g(x, t) dW
          </div>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '0.75rem' }}>Drift: f(x, t) dt</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                The deterministic part — the general trend. Like gravity pulling a ball down a hill.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#a78bfa', marginBottom: '0.75rem' }}>Diffusion: g(x, t) dW</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                The random part — the shaking. dW is &quot;Brownian motion&quot; (random jitter).
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>Brownian Motion (The Wiener Process)</h3>

          <p style={styles.prose}>
            Brownian motion is the mathematical model of randomness. Think of pollen grains jittering in water, buffeted by invisible molecular collisions.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>Key Property 1: Independent Increments</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Future randomness doesn&apos;t depend on the past. The particle has no &quot;momentum&quot; — it forgets its history.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>Key Property 2: Variance ∝ Time</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                After time t, the variance is t (not t²). The standard deviation grows with √t.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>Key Property 3: Continuous but Non-Differentiable</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                The path is jagged at every scale — zoom in and it&apos;s still jagged. There is no &quot;velocity&quot; at any instant.
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>Visualizing Brownian Motion</h3>

          <p style={styles.prose}>
            Watch multiple particles start from the same point and wander randomly. Notice how the ±√t envelope captures where most particles end up — the spread grows, but more slowly than you might expect.
          </p>

          <BrownianMotionViz />

          <h3 style={styles.subsectionTitle}>Simulating SDEs: Euler-Maruyama</h3>

          <p style={styles.prose}>
            We simulate SDEs like ODEs, but add a random kick at each step:
          </p>

          <div style={styles.mathBlock}>
            x(t + h) = x(t) + f(x, t)·h + g(x, t)·√h·z, where z ~ N(0, 1)
          </div>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>Critical Detail:</strong> The noise scales with <strong>√h</strong>, not h. This ensures variance grows linearly with time (as Brownian motion requires). Using h instead would incorrectly make noise vanish at small time scales.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'neural-odes',
      label: 'Neural ODEs',
      shortLabel: 'Neural ODEs',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Neural ODEs: Networks as Flows</h2>

          <p style={styles.prose}>
            In 2018, researchers realized something profound: a deep ResNet is just a crude ODE solver. What if we took this seriously and made it <em>continuous</em>?
          </p>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>The Paper Airplane Analogy:</strong> Imagine throwing a paper airplane. A normal ResNet is like giving it <em>discrete shoves</em> — push at layer 1, push at layer 2, etc. A Neural ODE defines the <em>wind pattern</em> (vector field) and lets the airplane glide smoothly through it. Same destination, but continuous flight instead of discrete jumps.
            </p>
          </div>

          <h3 style={styles.subsectionTitle}>From Steps to Flow</h3>

          <p style={styles.prose}>
            The key insight is that <strong>layers are just discrete steps through a continuous transformation</strong>. What if we removed the discrete steps entirely and let data flow smoothly from input to output?
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>ResNet (Discrete)</h4>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                x<sub>t+1</sub> = x<sub>t</sub> + f(x<sub>t</sub>, θ<sub>t</sub>)
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                50 layers means 50 discrete jumps, 50 sets of weights.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88', marginBottom: '0.75rem' }}>Neural ODE (Continuous)</h4>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                dx/dt = f(x(t), t, θ)
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Smooth flow from t=0 to t=1, <strong>one</strong> set of weights.
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>How It Actually Works</h3>

          <p style={styles.prose}>
            A Neural ODE has two key components that work together:
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '0.75rem' }}>The Dynamics Network f(x, t)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                A small neural network that answers: &quot;If I&apos;m at position x at time t, which direction should I move and how fast?&quot;
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                This defines the <strong>vector field</strong> — arrows everywhere in space telling you where to go.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#a78bfa', marginBottom: '0.75rem' }}>The ODE Solver</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Takes your input, drops it into the vector field at t=0, and follows the arrows until t=1.
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Uses RK4 or adaptive methods to trace the path accurately.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
              <strong style={{ color: '#00f3ff' }}>Step 1:</strong> <span style={{ color: 'var(--text-secondary)' }}>Input your data x₀ (image, embedding, etc.) — this is x(0).</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <strong style={{ color: '#a78bfa' }}>Step 2:</strong> <span style={{ color: 'var(--text-secondary)' }}>Ask the dynamics network: &quot;At this position, where should I go?&quot; Get velocity v = f(x, t).</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 230, 109, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 230, 109, 0.3)' }}>
              <strong style={{ color: '#ffe66d' }}>Step 3:</strong> <span style={{ color: 'var(--text-secondary)' }}>Take a small step in that direction. Repeat, asking the network at each new position.</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
              <strong style={{ color: '#00ff88' }}>Step 4:</strong> <span style={{ color: 'var(--text-secondary)' }}>When you reach t=1, wherever you are is your output.</span>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>The Critical Insight: One Set of Weights</h3>

          <p style={styles.prose}>
            Here&apos;s what makes Neural ODEs elegant: <strong>there&apos;s only one set of weights</strong>. The same dynamics network f(x, t) is queried at every time step. It uses time t as an input to know &quot;how far along&quot; we are, but the weights θ are shared across the entire trajectory.
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>ResNet: Many Weight Sets</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Layer 1 has weights θ₁<br/>
                Layer 2 has weights θ₂<br/>
                ...<br/>
                Layer 50 has weights θ₅₀
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Total: 50 × layer_size parameters
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88', marginBottom: '0.75rem' }}>Neural ODE: One Weight Set</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Dynamics network has weights θ<br/>
                Same θ used at t=0, t=0.1, t=0.5, t=1<br/>
                Time t is just another input!
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Total: 1 × network_size parameters
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>The Superpowers</h3>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>1. Adaptive Computation</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                The solver takes <strong>as many steps as needed</strong>. Simple inputs? Few steps. Complex inputs? More steps. A 50-layer ResNet always uses 50 layers worth of compute.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>2. Constant Memory Training</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Standard backprop stores every layer&apos;s activations. The <strong>adjoint method</strong> runs the solver backwards to get gradients, using O(1) memory regardless of depth.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>3. Irregular Time Series</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Patient visits at random intervals? Just integrate from t₁ to t₂ to t₃. No padding, no interpolation — the ODE handles arbitrary time gaps naturally.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>4. Invertibility</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Run the solver backwards (t=1 → t=0) to invert the transformation. This enables normalizing flows for density estimation.
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>The Classic Example: Learning a Spiral</h3>

          <p style={styles.prose}>
            The Neural ODE paper demonstrates learning to separate two spirals — a classic nonlinear classification problem.
          </p>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>What happens:</strong> Points from two interleaved spirals are dropped into the vector field at t=0. The dynamics network learns to define a flow that <strong>untangles</strong> them. By t=1, the two classes are linearly separable — a simple line can classify them.
            </p>
            <p style={{ color: 'var(--text-dim)', marginTop: '1rem', fontSize: '0.9rem' }}>
              The solver traces smooth curves through space. Each point follows its own trajectory, but all are governed by the same learned vector field. The beauty is that you don&apos;t tell the network &quot;how many steps&quot; — the solver figures out what&apos;s needed.
            </p>
          </div>

          <SpiralNeuralODEViz />

          <h3 style={styles.subsectionTitle}>Real-World Application: Satellite Imagery</h3>

          <p style={styles.prose}>
            One of the most compelling use cases for Neural ODEs: handling <strong>irregularly-sampled data</strong>. Satellite imagery is often blocked by clouds. Traditional methods need evenly-spaced data, requiring interpolation. Neural ODEs learn the <em>dynamics</em> of change and naturally fill gaps.
          </p>

          <SatelliteNeuralODEViz />

          <h3 style={styles.subsectionTitle}>When to Use Neural ODEs</h3>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88', marginBottom: '0.75rem' }}>Good Fit</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li>Irregularly-sampled time series</li>
                <li>Memory-constrained training</li>
                <li>Normalizing flows</li>
                <li>When you need continuous-time dynamics</li>
              </ul>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>Not Ideal</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li>Huge batch inference (solver overhead)</li>
                <li>Very deep discrete operations</li>
                <li>When fixed compute budget matters</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'optimization',
      label: 'Optimization as Dynamics',
      shortLabel: 'Training',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Training as a Dynamical System</h2>

          <p style={styles.prose}>
            The most surprising application of differential equations in ML isn&apos;t in the architecture — it&apos;s in understanding <strong>how the network learns</strong>.
          </p>

          <h3 style={styles.subsectionTitle}>Gradient Descent → Gradient Flow (ODE)</h3>

          <p style={styles.prose}>
            Standard gradient descent takes discrete steps:
          </p>

          <div style={styles.mathBlock}>
            θ<sub>k+1</sub> = θ<sub>k</sub> - η · ∇L(θ<sub>k</sub>)
          </div>

          <p style={styles.prose}>
            If we take the step size η → 0 (infinitely small steps), this becomes a continuous ODE called <strong>Gradient Flow</strong>:
          </p>

          <div style={styles.mathBlock}>
            dθ/dt = -∇L(θ)
          </div>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>Interpretation:</strong> Training a neural network is <em>simulating a particle sliding down a high-dimensional energy landscape</em>. The gradient is gravity. The parameters flow toward the valleys (low loss).
            </p>
          </div>

          <h3 style={styles.subsectionTitle}>SGD → Langevin Dynamics (SDE)</h3>

          <p style={styles.prose}>
            But we don&apos;t use the true gradient — we use a <strong>mini-batch estimate</strong>, which introduces noise. In the limit of small learning rates, SGD is better described as an SDE:
          </p>

          <div style={styles.mathBlock}>
            dθ = -∇L(θ) dt + σ(θ) dW
          </div>

          <p style={styles.prose}>
            The noise term σ depends on batch size and gradient variance.
          </p>

          <h3 style={styles.subsectionTitle}>Visualizing Gradient Flow vs Langevin</h3>

          <p style={styles.prose}>
            Watch a particle descend through a loss landscape. Pure gradient descent follows the deterministic path. With noise (SGD/Langevin), the particle jitters — and can escape local minima to find better solutions.
          </p>

          <GradientFlowViz />

          <h3 style={styles.subsectionTitle}>Why SGD Noise Helps</h3>

          <p style={styles.prose}>
            This explains a long-standing mystery: <strong>why does SGD generalize better than full-batch gradient descent?</strong>
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>Sharp Minima (Bad)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Narrow valleys that overfit to training data. Small changes in input cause large changes in output.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88', marginBottom: '0.75rem' }}>Flat Minima (Good)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Broad valleys that generalize well. Robust to small perturbations.
              </p>
            </div>
          </div>

          <p style={styles.prose}>
            The noise in SGD acts like <strong>thermal jitter</strong>. It kicks the parameters out of sharp minima (they&apos;re unstable under noise) and guides them into flat minima (which are stable). The SDE nature of SGD is an <em>implicit regularizer</em>.
          </p>
        </div>
      ),
    },
    {
      id: 'diffusion',
      label: 'Diffusion Models',
      shortLabel: 'Diffusion',
      content: (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Diffusion Models: Generative SDEs</h2>

          <p style={styles.prose}>
            The most spectacular application of SDEs in ML: the technology behind DALL-E, Midjourney, and Sora.
          </p>

          <h3 style={styles.subsectionTitle}>The Core Idea</h3>

          <p style={styles.prose}>
            Diffusion models are based on a profound observation: <strong>it&apos;s easy to destroy structure, hard to create it</strong>.
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>Forward Process (Easy)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Gradually add noise until the image becomes pure static. This is just an SDE we design — no learning required.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                dx = f(x, t)dt + g(t)dW
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88', marginBottom: '0.75rem' }}>Reverse Process (Hard)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Start with noise and gradually &quot;un-noise&quot; it into an image. This requires learning the <strong>score function</strong>.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                dx = [f - g²∇log p]dt + g dW̄
              </p>
            </div>
          </div>

          <h3 style={styles.subsectionTitle}>Watch the Process</h3>

          <p style={styles.prose}>
            See structure dissolve into noise (forward), then magically re-emerge (reverse). The two clusters represent &quot;data&quot; — watch them become indistinguishable static, then reform.
          </p>

          <DiffusionProcessViz />

          <h3 style={styles.subsectionTitle}>The Mathematical Magic</h3>

          <p style={styles.prose}>
            A remarkable theorem (Anderson, 1982) shows that the <strong>reverse of a diffusion SDE is also an SDE</strong>. But the reverse drift depends on the <em>score function</em>: ∇ log p(x, t).
          </p>

          <p style={styles.prose}>
            We train a neural network to estimate this score. As we showed in the Diffusion Models page, predicting noise is equivalent to learning the score.
          </p>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>The Unification:</strong> The SDE framework unifies &quot;score-based generative models&quot; and &quot;denoising diffusion probabilistic models.&quot; They&apos;re both discretizations of the same underlying continuous stochastic process.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const deepDives = [
    {
      id: 'history',
      title: 'Historical Timeline',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ffe66d' }}>1671 — Newton&apos;s Calculus</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Newton categorizes differential equations, laying the foundation for describing motion.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4' }}>1750s — Euler-Lagrange Equations</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Connect differential equations to the &quot;principle of stationary action&quot; — nature optimizes. This echoes in modern loss minimization.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#a78bfa' }}>1982 — Hopfield Networks</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                John Hopfield frames neural networks as physical systems with &quot;energy landscapes&quot; governed by ODEs.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ff6b6b' }}>2018 — Neural ODEs</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Chen et al. show that ResNets are discretized ODEs, winning Best Paper at NeurIPS.
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#00ff88' }}>2020+ — Diffusion Models</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                SDEs power the generative AI revolution: DALL-E, Stable Diffusion, Midjourney, Sora.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'Summary Table',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Concept</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--accent)' }}>Math Form</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ffe66d' }}>ML Application</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>ODE</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>dx/dt = f(x, t)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Neural ODEs, Gradient Flow</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>SDE</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>dx = f dt + g dW</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>SGD, Diffusion Models</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Euler Method</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>x<sub>t+h</sub> = x<sub>t</sub> + h·f</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>ResNet layers</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Gradient Flow</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>dθ/dt = -∇L</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Continuous gradient descent</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>Langevin Dynamics</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>dθ = -∇L dt + σdW</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>SGD with noise</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'connection',
      title: 'The 18th → 21st Century Bridge',
      content: (
        <div style={{ paddingTop: '1rem' }}>
          <p style={styles.prose}>
            The connection between Euler-Lagrange equations and neural network training is direct:
          </p>

          <div style={styles.distanceComparison}>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#ffe66d', marginBottom: '0.75rem' }}>18th Century (Physics)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                A particle moves from A to B. Which path does it take?
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                It takes the path that minimizes the <strong>Action</strong> S = ∫ L dt
              </p>
            </div>
            <div style={styles.distanceCard}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '0.75rem' }}>21st Century (AI)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                A neural network maps input to output. Which weights does it use?
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                It uses the weights that minimize the <strong>Loss</strong> L = Σ error²
              </p>
            </div>
          </div>

          <p style={styles.prose}>
            We replaced &quot;physical path&quot; with &quot;network weights&quot; and &quot;energy&quot; with &quot;error.&quot; The mathematics of minimizing them is the same.
          </p>

          <div style={styles.callout}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent)' }}>The Deep Connection:</strong> Euler and Lagrange weren&apos;t just solving physics — they were solving the fundamental problem of <em>how complex systems find optimal states</em>. Neural networks are just the latest system to which we apply their &quot;language of nature.&quot;
            </p>
          </div>
        </div>
      ),
    },
  ];

  return <VAETimelineLayout sections={tabs} deepDives={deepDives} />;
}
