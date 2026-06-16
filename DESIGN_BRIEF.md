# IAC — Motion-Forward Hero Landing Brief

**For: Claude Design.** The whole point of this page is **motion**. Go all-in on
your animation, motion, and video features and build a hero that genuinely stops
people. This is a temporary high-impact placeholder for `iac-ops.com` until the
full site is built.

> **Brand identity is already handled.** Use my existing design system in this
> workspace for ALL visual identity — colors, type, components, logo. Do **not**
> invent a palette or fonts, and do not pull brand cues from the placeholder
> `index.html` in this repo. This brief gives you the *content* and the *motion
> direction*; the design system gives you the *look*.

---

## 0. TL;DR

A short, cinematic, single-screen hero (optionally one quiet second beat). The
job is **impression, not information** — it should feel premium, alive, and
unmistakably the work of a serious operations/automation firm. One unforgettable
motion moment. Everything else quiet around it.

---

## 1. About IAC — context for the motion themes

IAC builds custom **operational platforms** — automation, data pipelines, and
workflow systems (n8n + Supabase under the hood) — for construction, **access**
(scaffolding / work-at-height), and field-service companies. It sells
*outcomes*, not software.

That gives motion something real to mean. Thematic hooks worth animating:
- **systems assembling** — modules/nodes snapping into a working whole
- **automation & data flowing** through a network (an n8n workflow is literally
  a node graph with data moving along the edges)
- **structure erecting** — scaffolding / an architectural frame building itself
- **an operational engine coming online** — a status flipping to live/green

Motion should *say something* from that list — not be decorative noise.

---

## 2. The copy — the words to animate (use verbatim)

- **Eyebrow / wordmark:** Innovative Access Consultants
- **H1:** We build the systems that run your operation.
- **Lede:** IAC designs and builds custom operational platforms — automation,
  data, and workflow systems — for construction, access, and field-service
  companies. Less manual work. Faster answers. One source of truth.
- **Status:** Platform in development · first client builds underway
- **Capabilities (three):**
  - Automate — Replace the manual work that eats your week.
  - Integrate — Connect the tools you already run.
  - Operate — Dashboards and data you can actually trust.
- **CTA:** Start a conversation → `lucas@iac-ops.com` (mailto)
- **Footer:** Innovative Access Consultants, LLC · Est. 2026

---

## 3. Motion & video direction — the heart of this build

**Overall feel:** structural, precise, premium, alive. Cinematic, not cheesy.
Eased and deliberate, never bouncy. Restraint everywhere except the one hero
moment that's allowed to show off.

### Pick ONE showstopper (or combine two) and make it unforgettable

- **Concept A — Living workflow.** An n8n-style node graph builds itself, then
  pulses with data flowing along its edges; nodes light up in sequence and the
  system resolves into a steady "online" state. On-theme: this is literally what
  IAC builds.
- **Concept B — Structure erects.** A scaffold / architectural line-structure
  constructs itself piece by piece behind the headline, then a status indicator
  flips to live. Ties to "we build the systems" and the access/scaffolding niche.
- **Concept C — Ambient engine loop.** A slow, generated ambient **motion-video**
  background — an abstract operational engine / flowing network of light —
  premium and hypnotic, looping seamlessly behind the type.

### Use your animation / motion / video features for
- **A generated background video loop** if it elevates the hero — seamless loop,
  compressed, with a poster-frame fallback and lazy loading.
- **Kinetic typography** — the H1 assembles / resolves on load; consider a
  special kinetic treatment on *run your operation*.
- **Entrance choreography** — a short staggered reveal: eyebrow → headline →
  lede → capabilities → CTA, timed like a title sequence (~1.5–2.5s total).
- **Living micro-motion** — a pulsing status indicator, hairlines that draw on,
  cursor-reactive parallax on the hero centerpiece.

**Rule of one:** a single hero moment is the star. If two things compete for
attention, kill one.

---

## 4. Non-negotiables

- **Brand = my existing design system.** Don't override it; don't invent one.
- **Performance:** target 60fps, no jank. Lazy-load and compress any video; keep
  total payload sane. Motion should feel expensive, not *be* expensive.
- **`prefers-reduced-motion`:** a graceful, still-beautiful static fallback —
  poster frame instead of video, no entrance animation, no parallax.
- **Static & self-contained:** deployable to Cloudflare Pages with **no build
  step**. Video and motion assets are fine as static files.
- **Responsive:** motion adapts or simplifies on mobile; never ship a phone hero
  that stutters.
- **Accessible:** semantic HTML, AA contrast, keyboard nav, visible focus.
- **SEO/social basics:** descriptive `<title>`, meta description, Open Graph +
  Twitter tags, favicon.

---

## 5. Deliverable

Static files — `index.html` plus any assets (including generated video) — ready
to drop into Cloudflare Pages and ship via `wrangler pages deploy .`.

---

## 6. The placeholder `index.html` in this repo

Use it **only** for the copy and a rough sense of the sections. **Ignore its
colors, fonts, and styling entirely** — those are throwaway placeholders, not
the brand. Your build comes from the design system and should be far more
ambitious and motion-led than that file.
