# IAC Hero Architecture & 3D Concept Plan

## 1. The Goal
Create a dramatically enhanced, cinematic hero/opening section for Innovative Access Consultants (IAC) at `iac-ops.com`. The result must be a self-contained static site deployable to Cloudflare Pages. It needs to look high-end, premium, and feature a signature 3D showstopper.

## 2. Brand DNA
- **Palette:** Warm cream base `#F6F3EE`, ink `#1A1A1A`, coral accent `#C75B3F` / brighter `#E0623C`.
- **Type:** Playfair Display (display), DM Sans (body), DM Mono (technical labels).
- **Vibe:** Structural, precise, premium, alive.

## 3. The 3D Showstopper Concept
**Concept:** "Living Workflow Engine" (Concept A combined with C).
Instead of the current flat 2D canvas, we will build a high-end **Three.js** WebGL scene.
- **Visuals:** A volumetric, glowing, abstract 3D data/automation flow sculpture. It will feature interconnected 3D nodes (representing Intake, Automate, Integrate, Operate, Source of Truth) linked by glowing spline curves.
- **Materials:** Glass-like nodes, glowing cores, and metallic/dark structures that contrast beautifully with the cream base (or perhaps the 3D scene sits in a dark, premium panel to the right, matching the current layout but elevated to 3D).
- **Motion:** 
  - On load, the nodes assemble/scale in.
  - Data pulses (glowing particles) travel along the splines.
  - A slow, continuous, hypnotic camera glide.
  - Parallax effect on mouse move.

## 4. Animation Choreography (Cinematic Entrance)
- **0.0s:** Scene loads. 3D engine begins to assemble in the right panel.
- **0.2s:** Eyebrow ("Innovative Access Consultants") fades in and slides up.
- **0.4s - 1.2s:** Headline ("We build the systems that run your operation.") reveals word-by-word from a mask.
- **1.4s:** The underline under "operation" draws itself.
- **1.6s:** Lede text fades and slides up.
- **1.8s:** Capabilities list cascades in.
- **2.0s:** Status pill pulses live; CTA buttons appear.
- **2.2s:** The 3D engine hits full "online" status, with a bright surge of data particles.

## 5. Technical Architecture
- **HTML/CSS:** Semantic, accessible HTML. CSS using CSS Variables for the design system. Flexbox/Grid for layout.
- **JS:** Vanilla JavaScript (no build step). 
- **3D Library:** Three.js (imported via CDN or local file).
- **Post-processing:** Optional, but we'll try to keep it lightweight (bloom effect for the data pulses if performance allows, otherwise baked-in additive blending materials).
- **Responsive:** On mobile, the 3D canvas scales down or simplifies (fewer particles, simpler geometry) to maintain 60fps.
- **Accessibility:** `prefers-reduced-motion` will hide the 3D canvas and show a high-quality pre-rendered static image (or a very simplified, non-moving 3D view), and instantly show all text without staggered animations.

## 6. Execution Steps
1. Create `index.html` structure based on the new design.
2. Implement the CSS for typography, layout, and the staggered CSS animations.
3. Write `hero-3d.js` to replace the old `hero.js`, setting up the Three.js scene.
4. Add nodes, edges, and particle animation.
5. Polish lighting, materials, and camera movement.
6. Test performance, responsiveness, and reduced-motion fallback.
