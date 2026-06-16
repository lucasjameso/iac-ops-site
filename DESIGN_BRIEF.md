# IAC — Website Design Brief

**For: Claude Design.** Read this whole file, then look at `index.html` in this
same repo — it is the brand anchor. Match that identity, then make it more
ambitious.

---

## 0. TL;DR

Build an **impressive, single-page temporary launch site** for Innovative
Access Consultants (IAC) at `iac-ops.com`. Industrial-premium aesthetic.
Static, self-contained, deployable to Cloudflare Pages with no build step.
Use the copy and brand tokens below **verbatim** — your job is to elevate the
*visual execution*, not rewrite the words.

---

## 1. Objective & scope

- **Phase 1 — this deliverable:** a single-page "we're building something"
  landing site that still establishes real credibility for a prospect or
  client who lands on it. It must feel like a serious engineering firm, not a
  parked domain or a generic coming-soon template.
- **Phase 2 — context only, do NOT build now:** the full firm site (services,
  case studies, about, contact form). Design Phase 1 so it could grow into
  Phase 2 — same system, with headroom.

---

## 2. About IAC

- **Who:** Innovative Access Consultants, LLC — an operational consultancy
  led by Lucas Oliver.
- **What:** designs and builds custom operational platforms — automation, data
  pipelines, and workflow systems — for clients. The tech under the hood is
  n8n + Supabase + integrations, but IAC sells **outcomes, not software**.
- **Who it's for:** owners and operators of construction, **access**
  (scaffolding / work-at-height), and field-service companies who still run the
  business on spreadsheets, texts, and memory.
- **Positioning line:** *"We don't sell software. We build the operational
  backbone your business runs on — then hand you the keys."*
- **Name insight:** "Access" is a double meaning — the firm's name *and* the
  access/scaffolding construction niche it serves. The scaffold/structural
  motif is on-brand and fair game.

---

## 3. Brand system

### 3.1 The mark
A **braced square** — a scaffold node / structural frame with an X cross-brace.
Geometric, outline, amber. Use it as the wordmark glyph and the favicon.

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="#e8a33d" stroke-width="2">
  <rect x="3" y="3" width="18" height="18"/>
  <path d="M3 3 L21 21 M21 3 L3 21"/>
</svg>
```

You may develop this into a small *system* — variations, a repeating structural
pattern, or a hero line-drawing that "constructs" itself — but keep it
geometric and restrained.

### 3.2 Palette — use these exact tokens

| Token | Hex | Use |
| --- | --- | --- |
| Ink (base) | `#0d1014` | page background |
| Ink deep | `#0a0c10` | gradient base / footer |
| Surface | `#16191f` | elevated bars / cards |
| Paper | `#f4f1ea` | primary text, headline |
| Slate | `#c9ccd2` | secondary text, lede |
| Muted | `#868c97` | mono labels, tertiary text |
| **Amber (signal)** | `#e8a33d` | accent, focus, the mark, ONE key word |
| Hairline | `rgba(255,255,255,0.09)` | dividers, borders |
| Grid line | `rgba(255,255,255,0.035)` | background structural grid |

Dark canvas, warm-paper type, a single amber signal. That's the whole system.

### 3.3 Typography
- **Display:** Space Grotesk — 700 for headlines, 500 for subheads/labels
- **Technical/labels:** IBM Plex Mono — 400/500 for eyebrows, coordinates,
  status text, blueprint annotations
- **Body:** a neutral grotesque (system-ui / Inter) at 400 for running copy

Load via Google Fonts with `display=swap` and system fallbacks. Headlines are
large and confident with tight tracking (`letter-spacing: -0.02em`).

### 3.4 Voice & tone
Confident, plain-spoken, operator-to-operator. Outcome-first. Short
declarative sentences. Construction cadence — **not** SaaS jargon. Banned
vocabulary: "ARR," "ticket size," "synergy," "leverage AI," "solutions" as a
verb, "revolutionize." Say *deal*, not *ticket*. Say *answers*, not
*insights-as-a-service*.

### 3.5 Motion principles
Structural and precise — never bouncy or playful. Things **construct** into
place: lines draw on, the grid assembles, content settles in a short staggered
sequence on load. Amber is a *signal* — use it sparingly (status dot, a focus
ring, one emphasized word). Everything must degrade gracefully under
`prefers-reduced-motion: reduce`.

### 3.6 Anti-patterns — hard nos
- **No generic SaaS look:** no purple/indigo gradients, no gradient-mesh
  backgrounds, no floating 3D blobs, no glassmorphism.
- **No automation clichés:** no robots, gears, glowing brains, circuit-board
  art, "AI sparkle" iconography.
- **Must be visually distinct from "Build What Lasts"** (a separate brand owned
  by the same founder): no coral/terracotta, no Playfair Display, no
  warm-cream literary/book aesthetic. IAC is cool, structural, technical,
  industrial.
- **Not a centered single-column template.** Use a real grid, asymmetry, and
  editorial structure.

---

## 4. The page — content & copy

Use this copy **verbatim**. Layout, hierarchy, and motion are yours.

### Required blocks
- **Wordmark / eyebrow:** the mark + `Innovative Access Consultants`
- **H1:** `We build the systems that run your operation.`
  (consider amber-accenting *run your operation*)
- **Lede:** `IAC designs and builds custom operational platforms — automation,
  data, and workflow systems — for construction, access, and field-service
  companies. Less manual work. Faster answers. One source of truth.`
- **Status pill:** `Platform in development · first client builds underway`
  (pair with a slow-pulsing amber dot)
- **Capabilities (three):**
  - `01 · Automate — Replace the manual work that eats your week.`
  - `02 · Integrate — Connect the tools you already run.`
  - `03 · Operate — Dashboards and data you can actually trust.`
- **Contact CTA:** `Start a conversation` → `lucas@iac-ops.com` (mailto link)
- **Footer:** `Innovative Access Consultants, LLC` · `Est. 2026`

### Optional blocks — use to add depth if it strengthens the page
- **Positioning line:** `We don't sell software. We build the operational
  backbone your business runs on — then hand you the keys.`
- **Who it's for:** `For owners and operators still running the business out of
  spreadsheets, texts, and memory.`
- **Top status bar / mono ticker:** a thin bar reading
  `SYSTEM STATUS: BUILDING` with a blinking cursor — leans into the
  engineering-terminal feel.

> Contact note: `lucas@iac-ops.com` is the primary public address. Four
> mailboxes exist on the domain, but only this one goes on the page. It's a
> single, swappable mailto.

---

## 5. Aesthetic direction

Think **a declassified engineering blueprint meeting a premium industrial
product page.** Charcoal canvas, warm-paper type, one amber signal. A subtle
structural grid behind everything. Mono annotations and blueprint-style
coordinate ticks in the margins. Generous negative space. Large, confident
display type. A hero that feels *engineered* rather than decorated. Tasteful
and sparse — not busy.

### Ideas to elevate (optional — your call, all must be static + performant)
- Hero grid that subtly parallaxes to cursor position (CSS var from
  `pointermove`); static under reduced-motion.
- A scaffold/structural SVG line-drawing in the hero that draws itself on load
  (`stroke-dashoffset`).
- Staggered entrance: eyebrow → headline → lede → capabilities → CTA.
- Blueprint margin ticks / coordinate labels in IBM Plex Mono.
- Magnetic or underline-grow interaction on the contact CTA.

---

## 6. Technical requirements

- **Static & self-contained.** Deployable to Cloudflare Pages with **no build
  step**. Vanilla HTML/CSS/JS strongly preferred; if you use a framework, it
  must export fully static. Keep dependencies minimal.
- **Performance:** fast LCP, minimal JS, no heavy libraries. Fonts via Google
  Fonts (`display=swap`) with system fallbacks.
- **Responsive, mobile-first.** Verify 360px → 1440px.
- **Accessibility:** semantic HTML5, WCAG AA contrast (the palette already
  meets it on the dark canvas), visible keyboard focus, full keyboard nav,
  `prefers-reduced-motion` fallbacks, alt/aria where needed.
- **SEO & social:** descriptive `<title>`, meta description, Open Graph +
  Twitter card tags, `theme-color` `#0d1014`, and an inline SVG favicon using
  the mark.

---

## 7. Deliverable

Static files — `index.html` plus any assets — ready to drop into Cloudflare
Pages and ship via `wrangler pages deploy .`. Ideally a single `index.html`
with inline CSS (and a little JS), or a tidy folder of static assets.

---

## 8. Reference

`index.html` in this repo is the baseline build. It already encodes the
palette, type, mark, copy, and a first pass at the grid + status + capabilities
layout. **Treat it as the brand floor:** your version must be unmistakably the
same brand, and clearly more ambitious in craft and composition.
