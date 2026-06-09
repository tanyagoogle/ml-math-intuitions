'use client';

import vizStyles from './visualization.module.css';
import SwissRollViz from '../../components/SwissRollViz';
import CrumpledPaperViz from '../../components/CrumpledPaperViz';
import HypercubeViz from '../../components/HypercubeViz';
import ConcentrationViz from '../../components/ConcentrationViz';
import InterpolationViz from '../../components/InterpolationViz';
import TopologyComparisonViz from '../../components/TopologyComparisonViz';
import VAESmearingViz from '../../components/VAESmearingViz';
import GANStretchingViz from '../../components/GANStretchingViz';
import GeodesicTrickViz from '../../components/GeodesicTrickViz';
import ManifoldTimelineLayout from '../../components/ManifoldTimelineLayout';

export default function ManifoldContent() {
  const sections = [
    {
      id: 'curse',
      label: 'The Curse of Dimensionality',
      shortLabel: 'Curse',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Curse of Dimensionality</h2>

          <p className={vizStyles.prose}>
            To understand why deep learning works, we must first appreciate the <strong>hostility of high-dimensional geometry</strong>. In low dimensions (1D, 2D, 3D), our intuition is guided by Euclidean geometry. We understand distances, volumes, and neighborhoods. However, as dimensions increase, these intuitions <em>catastrophically fail</em>.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Visualizing Higher Dimensions</h3>
              <p>Explore hypercubes from 2D to 5D. Watch how complexity explodes with each dimension.</p>
            </div>
            <HypercubeViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>Concentration of Measure</h3>

          <p className={vizStyles.prose}>
            Consider a unit hypercube in <em>d</em> dimensions. As <em>d → ∞</em>, the volume concentrates entirely in its <strong>corners</strong>, and the center becomes empty. Similarly, for a unit hypersphere, as dimensions increase, the volume concentrates in a thin shell near the surface.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Volume Concentration</h3>
              <p>Sample random points in a hypercube and measure their distance from the center. In high dimensions, nearly all points are &quot;far away.&quot;</p>
            </div>
            <ConcentrationViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Problem:</strong> If all data points are equidistant and isolated in a vast empty void, how can a model learn to group similar items? The notion of &quot;nearest neighbors&quot; breaks down because the contrast between the nearest and farthest neighbor vanishes.
            </p>
          </div>

          <p className={vizStyles.prose}>
            The answer lies in the fact that <strong>real-world data does not fill the space uniformly</strong>. Instead, it collapses onto lower-dimensional structures.
          </p>
        </div>
      ),
    },
    {
      id: 'hypothesis',
      label: 'The Manifold Hypothesis',
      shortLabel: 'Hypothesis',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Manifold Hypothesis</h2>

          <p className={vizStyles.prose}>
            The Manifold Hypothesis provides the rigorous geometric justification for deep learning. It posits that <strong>real-world high-dimensional data lies on, or very close to, a smooth, low-dimensional manifold</strong> embedded within the high-dimensional input space.
          </p>

          <h3 className={vizStyles.subsectionTitle}>The Crumpled Paper Analogy</h3>

          <p className={vizStyles.prose}>
            Imagine a flat, 2D sheet of paper. This sheet represents a <em>low-dimensional space</em> where data is organized and continuous. Now, imagine <strong>crumpling this paper</strong> into a tight ball and tossing it into a 3D box.
          </p>

          <p className={vizStyles.prose}>
            The paper now exists in 3D space—every point has an (x, y, z) coordinate. However, the <strong>intrinsic structure</strong> of the paper remains 2D. Despite its complex 3D shape, you can still define a location on the paper using just two numbers.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Interactive Crumpled Paper</h3>
              <p>The crumpled state represents data in the high-dimensional input space. The flat state represents the latent space—the simplified, intrinsic coordinate system.</p>
            </div>
            <CrumpledPaperViz />
          </div>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4>🎯 The Goal of Learning</h4>
              <p>An autoencoder or generative model seeks to &quot;uncrumple&quot; the paper—finding a mapping that translates complex high-dimensional coordinates back to simple intrinsic coordinates.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>⚠️ The Void</h4>
              <p>If an input falls &quot;off the paper&quot;—into the empty space of the box—the model has no roadmap. It has only learned the geometry of the paper, not the physics of the void.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'distance',
      label: 'Euclidean vs. Geodesic Distance',
      shortLabel: 'Distance',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Euclidean vs. Geodesic Distance</h2>

          <p className={vizStyles.prose}>
            The most profound implication of the manifold hypothesis is that <strong>Euclidean distance is a misleading metric</strong> for similarity in the input space.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4>Euclidean Distance (Extrinsic)</h4>
              <p>The straight-line distance between two points in the high-dimensional space. Fast to compute but ignores the data structure.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Geodesic Distance (Intrinsic)</h4>
              <p>The distance measured along the surface of the manifold. Captures true semantic similarity.</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>The Swiss Roll</h3>
              <p>A canonical example in manifold learning. Two points may appear close in 3D (Euclidean) but are actually far apart when measured along the spiral surface (geodesic).</p>
            </div>
            <SwissRollViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              Deep learning algorithms aim to &quot;unroll&quot; complex manifolds, transforming the geodesic geometry into a flat latent space where <strong>Euclidean distance becomes a valid proxy for semantic similarity</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'latent',
      label: 'Latent Space',
      shortLabel: 'Latent',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Latent Space: The Hidden Coordinate System</h2>

          <p className={vizStyles.prose}>
            A <strong>latent space</strong> is a compressed, abstract representation of data that captures its essential factors of variation. The term &quot;latent&quot; comes from the Latin <em>latere</em>, meaning &quot;to lie hidden.&quot;
          </p>

          <p className={vizStyles.prose}>
            Consider a dataset of human faces. The raw data consists of pixel values—perhaps millions of dimensions. However, the <strong>latent variables</strong> generating these images might be just a few factors: &quot;age,&quot; &quot;pose,&quot; &quot;lighting,&quot; and &quot;expression.&quot;
          </p>

          <h3 className={vizStyles.subsectionTitle}>Compression vs. Understanding</h3>

          <p className={vizStyles.prose}>
            Dimensionality reduction is frequently described as compression, but in deep learning, it is more accurately described as <em>understanding</em>. To compress data efficiently, a model must understand the rules that generate it.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>Key Insight:</strong> True random noise cannot be compressed—it has no manifold structure. The ability of a neural network to compress an image implies the existence of patterns. The latent space is a distillation of these patterns.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Interpolation: The Litmus Test</h3>

          <p className={vizStyles.prose}>
            The test for whether a model has truly learned the manifold is <strong>interpolation</strong>. If you select two points in latent space (e.g., a smiling face and a frowning face) and move in a straight line between them, the decoded images should morph smoothly.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Latent Space Interpolation</h3>
              <p>A good manifold produces valid outputs everywhere. A bad manifold has &quot;holes&quot; that produce noise.</p>
            </div>
            <InterpolationViz />
          </div>

          <p className={vizStyles.prose}>
            If the interpolation produces garbage or static noise in the middle, the manifold has holes—the paper was <strong>torn</strong>, not just crumpled. This confirms the model has merely memorized training points rather than learning the underlying structure.
          </p>
        </div>
      ),
    },
    {
      id: 'topology',
      label: 'Topology and Continuity',
      shortLabel: 'Topology',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Topology and Continuity</h2>

          <p className={vizStyles.prose}>
            From a topological perspective, we ask: <em>can we map the data to a flat sheet without tearing it?</em> Mathematically, is the data manifold <strong>homeomorphic</strong> to Euclidean space?
          </p>

          <h3 className={vizStyles.subsectionTitle}>Holes and Islands</h3>

          <p className={vizStyles.prose}>
            Some datasets have complex topologies that cannot be mapped to a single flat sheet. For instance, a dataset of digits might consist of <strong>ten separate islands</strong> (one for each digit). A continuous path from a &apos;1&apos; to a &apos;0&apos; might not exist on the manifold without passing through invalid space.
          </p>

          <h3 className={vizStyles.subsectionTitle}>Deep Learning&apos;s Solution</h3>

          <p className={vizStyles.prose}>
            This is why <strong>VAEs</strong> (Variational Autoencoders) and <strong>GANs</strong> are powerful. They force the latent space to be continuous and dense (usually a Gaussian blob), effectively <em>coercing</em> the data manifold to conform to a simple topology.
          </p>

          <div className={vizStyles.callout}>
            <p>
              They stretch and pull the disjoint islands of data until they touch, creating a <strong>continuous landscape where interpolation is possible</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'solving',
      label: 'Solving the Topology Problem',
      shortLabel: 'Solutions',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Solving the Topology Problem</h2>

          <p className={vizStyles.prose}>
            Standard autoencoders fail because they map each input to a <strong>single point</strong> in latent space, leaving vast empty oceans between data clusters. When you sample from the void, you get noise. VAEs and GANs solve this problem through fundamentally different mechanisms.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Comparing Approaches</h3>
              <p>See how Standard Autoencoders, VAEs, and GANs handle the topology of disconnected data clusters.</p>
            </div>
            <TopologyComparisonViz />
          </div>

          <h3 className={vizStyles.subsectionTitle}>The VAE Solution: Smearing Points into Clouds</h3>

          <p className={vizStyles.prose}>
            Instead of mapping an image to a single point, a VAE maps it to a <strong>probability distribution</strong> (a Gaussian &quot;cloud&quot;). The <em>KL Divergence</em> term in the loss function forces all these clouds to cluster tightly around the origin.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4>The Smearing Effect</h4>
              <p>Imagine each data point as a drop of ink. A standard autoencoder places it at a single coordinate. A VAE &quot;smears&quot; it into a fuzzy cloud.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Forcing Overlap</h4>
              <p>Because clouds are large and forced to cluster together, they overlap. The gap between clusters gets filled with the edges of neighboring distributions.</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>KL Divergence in Action</h3>
              <p>Watch how increasing KL weight causes point distributions to expand and overlap, filling the void between digit clusters.</p>
            </div>
            <VAESmearingViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Topological Effect:</strong> The VAE forces the data manifold to be homeomorphic (topologically equivalent) to a simple sphere by &quot;inflating&quot; data points until they touch and fill empty space.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The GAN Solution: Stretching the Rubber Sheet</h3>

          <p className={vizStyles.prose}>
            GANs approach the problem from the <strong>opposite direction</strong>. They don&apos;t start with data and try to squash it—they start with the &quot;flat sheet&quot; and learn to sculpt it into data.
          </p>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4>Continuous Input</h4>
              <p>The Generator starts with random points from a simple, continuous distribution (Gaussian noise). This is the &quot;flat sheet&quot; or &quot;block of clay.&quot;</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>The Guarantee</h4>
              <p>Because the input is continuous and neural networks are continuous functions, the output must also be a continuous manifold—no holes by construction!</p>
            </div>
          </div>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Generator Training</h3>
              <p>Watch the Generator learn to stretch and twist the uniform noise grid to cover the target digit clusters while maintaining continuity.</p>
            </div>
            <GANStretchingViz />
          </div>

          <div className={vizStyles.callout}>
            <p>
              <strong>Topological Effect:</strong> The GAN defines topology as simple <em>a priori</em> (by choosing continuous noise as input) and learns a continuous mapping function to project that simple topology onto complex data.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>Summary Comparison</h3>

          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Aspect</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ff4444' }}>Standard AE</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--accent)' }}>VAE</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ffe66d' }}>GAN</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Topology</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Discrete islands with empty oceans</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fuzzy clouds that overlap and merge</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Continuous sheet stretched to fit</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Mechanism</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Point-to-point mapping</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Point-to-distribution + KL regularization</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Noise-to-data continuous mapping</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Analogy</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>GPS coordinates with no roads</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Overlapping spotlights on a stage</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Rubber sheet over rocky terrain</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'unrolling',
      label: 'The Unrolling Trick',
      shortLabel: 'Unrolling',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>The Unrolling Trick: Avoiding Geodesic Computation</h2>

          <p className={vizStyles.prose}>
            A natural question arises: <em>how do VAEs and GANs actually calculate the geodesic distance?</em> The answer is surprising: <strong>they don&apos;t</strong>. Calculating geodesic distance on a complex, high-dimensional manifold is computationally prohibitive—it requires solving differential equations to find the shortest path along a curved surface.
          </p>

          <div className={vizStyles.callout}>
            <p>
              <strong>The Magic Trick:</strong> Instead of computing geodesic distance directly, VAEs and GANs learn a coordinate transformation that makes geodesic distance in input space equivalent to Euclidean distance in latent space.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Strategy: Unrolling the Map</h3>

          <p className={vizStyles.prose}>
            Think of a cartographer making a map of the Earth. The Earth is curved (a manifold), but the map is flat (latent space). The encoder learns to &quot;flatten&quot; the curved manifold so that distances become simple to compute.
          </p>

          <div className={vizStyles.container}>
            <div className={vizStyles.controls}>
              <h3>Input Space vs. Latent Space</h3>
              <p>In input space, the correct path follows the curve. In latent space, a simple ruler (Euclidean distance) gives us the answer.</p>
            </div>
            <GeodesicTrickViz />
          </div>

          <div className={vizStyles.distanceComparison}>
            <div className={vizStyles.distanceCard}>
              <h4>Input Space (Hard)</h4>
              <p>Geodesic distance requires differential geometry or graph shortest-path algorithms. Computationally expensive.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>Latent Space (Easy)</h4>
              <p>Simple Euclidean: ||z₁ - z₂||₂. Just subtract and sum squares. The encoder did the hard work.</p>
            </div>
          </div>

          <h3 className={vizStyles.subsectionTitle}>How Each Model Enforces This</h3>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>VAE: The Encoder Creates the Flat Map</h4>
            <p className={vizStyles.prose}>
              The VAE encoder q(z|x) maps points from the curved manifold to a flat latent space. The <strong>continuity constraint</strong> ensures that if x₁ and x₂ are close on the manifold, their encodings z₁ and z₂ must be close in latent space. If this fails, reconstruction loss spikes.
            </p>
            <p className={vizStyles.prose}>
              <em>To measure similarity:</em> Encode your images z₁ = E(x₁), z₂ = E(x₂), then compute ||z₁ - z₂||.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ color: '#ffe66d', marginBottom: '0.75rem' }}>GAN: The Generator Defines the Bending</h4>
            <p className={vizStyles.prose}>
              GANs work backwards. The generator G(z) starts with the flat sheet (latent distribution) and <strong>defines</strong> how to bend it into data space. To interpolate between two images, we find their latent points z₁ and z₂, draw a straight line between them (Linear Interpolation), and the generator bends that line into the correct geodesic curve on the manifold.
            </p>
          </div>

          <h3 className={vizStyles.subsectionTitle}>The Rigorous View: Riemannian Geometry</h3>

          <p className={vizStyles.prose}>
            For mathematical precision, the latent space isn&apos;t perfectly Euclidean—distortions occur like map projections distorting the Earth. The <strong>Jacobian matrix</strong> J = ∂f/∂z of the decoder captures how much the manifold stretches at each point.
          </p>

          <div className={vizStyles.callout}>
            <p>
              The <strong>Riemannian metric tensor</strong> M(z) = JᵀJ tells us the local stretching factor. The true geodesic distance integrates this along the path. <em>In practice</em>, we rarely compute this—we assume the latent space is &quot;flat enough&quot; and use simple linear interpolation (LERP) or spherical interpolation (SLERP).
            </p>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Metric</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#ff4444' }}>Input Space (Pixels)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00ff88' }}>Latent Space (Z)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Type</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Geodesic (curved, hard)</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Euclidean (straight, easy)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Calculation</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Differential geometry / graph shortest path</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>√Σ(z₁ - z₂)²</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Deep Learning Trick</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Don&apos;t calculate it!</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Map x → z, then measure Euclidean</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'takeaways',
      label: 'Key Takeaways',
      shortLabel: 'Takeaways',
      content: (
        <div className={vizStyles.section}>
          <h2 className={vizStyles.sectionTitle}>Key Takeaways</h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className={vizStyles.distanceCard}>
              <h4>1. The Curse is Real</h4>
              <p>High-dimensional spaces are mostly empty. Random sampling produces noise, not meaningful data.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>2. Data Lives on Manifolds</h4>
              <p>Real-world data clusters on low-dimensional surfaces embedded in high-dimensional space.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>3. Learning = Uncrumpling</h4>
              <p>Neural networks learn to map complex, twisted manifolds to simple, flat latent spaces.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>4. Distance Metrics Matter</h4>
              <p>Geodesic distance (along the manifold) reflects true similarity; Euclidean distance can be misleading.</p>
            </div>
            <div className={vizStyles.distanceCard}>
              <h4>5. Interpolation Tests Understanding</h4>
              <p>Smooth interpolation in latent space proves the model learned structure, not just memorized examples.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <ManifoldTimelineLayout sections={sections} />;
}
