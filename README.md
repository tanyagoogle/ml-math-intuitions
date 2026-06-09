# ML Math Intuitions

Interactive visual explorations of the core mathematical ideas powering modern machine learning.

> **See the math behind the machine.**

Rather than memorizing formulas, this site lets you *play* with the concepts: drag sliders, watch transformations unfold, and build geometric intuition for ideas that usually live in dense notation.

## Topics

### Foundations
- **Eigenvalues & Neural Networks** -- Why deep networks explode or vanish, told through the lens of spectral theory and weight matrix eigenvalues.
- **Matrix Calculus Visualized** -- Scalar derivatives, gradients, Jacobians, and Hessians rendered as interactive geometry.
- **Loss Landscapes & Forgetting** -- Fine-tune a model and watch catastrophic forgetting reshape the loss surface in real time.

### Generative Models
- **Probabilistic Generative Models** -- What it means to learn p(x), and the shared DNA connecting GANs, VAEs, and diffusion models.
- **Variational Autoencoders** -- Compress high-dimensional data into a handful of latent dimensions, then reconstruct it.
- **Diffusion Models** -- Destroy an image with noise, then learn to reverse time -- from Langevin dynamics to denoising score matching.

### Geometry & Dynamics
- **The Manifold Hypothesis** -- Why high-dimensional data secretly lives on low-dimensional structures, visualized with Swiss rolls and hypercubes.
- **ODEs & SDEs in ML** -- From Newton to Neural ODEs: the mathematics of continuous-depth networks and stochastic flows.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- Canvas-based animations via `requestAnimationFrame`
- No heavy visualization libraries -- every animation is hand-written for minimal bundle size

## Deployment

Deploy with [Vercel](https://vercel.com):

```bash
npx vercel
```

## License

MIT
