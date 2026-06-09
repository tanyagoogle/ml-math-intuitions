# Plan: "MathGram" — The Dopamine-Driven ML Desktop App

## 1. The Concept: "TikTok for Tensors" 📱
Instead of long scrolling articles (like our current `page.tsx`), the app presents **Bite-Sized Interactive Cards** in a vertical "Feed".
Every interaction gives immediate visual feedback (Dopamine hit).

**Core Loop:**
1.  **Hook**: Short, punchy text/analogy (e.g., "Why do Gradients Explode? 💥").
2.  **Interact**: A visualization that *requires* touch/click to unlock the next card.
3.  **Reward**: Fancy animation + "Aha!" moment explanation.

## 2. Technical Architecture (Desktop)

### A. The Shell: Electron + React
Since we already have a Next.js/React codebase, **Electron** is the fastest path.
-   **Why**: It allows us to bundle the existing React app into a native window (Mac/Windows/Linux).
-   **Setup**: Use `electron-forge` or `nextron` to wrap the existing `src` folder.

### B. Reusing Your Assets
We can reuse ~90% of your current code.
-   **`NetworkSimulation.js`**: Becomes a "Challenge Card".
    -   *User Goal*: "Adjust sliders until the signal turns Green/Stable."
    -   *Reward*: Unlocks the "ResNet" explanation card.
-   **`MatrixTransformationViz.tsx`**: Becomes an "Exploration Card".
    -   *Interaction*: User drags the slider to "Shear" the cat/grid.
-   **`NormVsRadiusViz.tsx`**: Becomes a "Deep Dive Story".
-   **`LossLandscapeViz.tsx`**: The "Danger Zone".
    -   *Interaction*: Slider to increase "Fine-tuning Intensity" (Chaos).
    -   *Action*: Toggle "SAM" to smooth the landscape.

## 3. The "Instagram" UX Design

### The "Stories" Format (The Feed)
Instead of a single long page, we structure content as a **Doubly Linked List** of components.

**Component Structure:**
```tsx
// The Feed Container
<SnapScrollContainer>
  <Card>
     <Header>The Axis of Evil 😈</Header>
     <VideoLoop src="/assets/eigenvalue-explode.mp4" />
  </Card>
  
  <Card>
     <Header>Fix it with Norm</Header>
     {/* Reusing your component! */}
     <NormVsRadiusViz simplified={true} /> 
  </Card>
</SnapScrollContainer>
```

### Dopamine Triggers 🧠
1.  **Haptic/Audio Feedback**: When a user stabilizes the network (in `NetworkSimulation`), play a satisfying "Click" sound and shake the screen slightly.
2.  **Progress Bars**: "Chapter 1: 30% Complete".
3.  **"Unlockable" Presets**:
    -   Initially, `MatrixTransformationViz` only has "Scaling".
    -   After reading about Rotation, they "Unlock" the "Rotation" slider.
    -   Start strictly limited, then expand.

## 4. Implementation Steps (Hypothetical)

### Step 1: The "Cardify" Refactor
Wrap existing components in a generic `<CardLayout>` that forces them to fit a 9:16 or 4:3 aspect ratio (Phone/Tablet style).
-   **Action**: Create `src/components/FeedCard.tsx`.
-   **Action**: CSS `scroll-snap-type: y mandatory`.

### Step 2: Gamify the Components
Modify `NetworkSimulation` to accept an `onSuccess` callback.
```javascript
// Inside NetworkSimulation
useEffect(() => {
   if (isStable && useResNet) {
       triggerConfetti();
       onSuccess(); // Unlocks next scroll card
   }
}, [signals]);
```

### Step 3: Desktop Shell
Initialize Electron.
```bash
npx create-electron-app math-gram
# Copy over src/components
```

## 5. Summary
By wrapping your **interactive simulations** in a **snap-scroll feed** and gating progress behind **interaction success** (e.g., "Make the graph green"), you turn a textbook into a game. You already have the "Hard" part done (the math engines); the rest is just UI wrapper!
