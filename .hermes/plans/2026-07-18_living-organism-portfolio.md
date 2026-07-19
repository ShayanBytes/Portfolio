# Living Organism Portfolio — Redesign Plan

**Goal:** Total redesign of Shayan Mondal's portfolio into an award-grade "living ASCII organism" experience: an enter gate with a single Enter button over a full-strength autonomous ASCII organism, then modern scroll-driven routes with camera-like motion. Keep all real content (name, location, email, GitHub/LinkedIn, the 4 projects with descriptions).

**Architecture:** Vite SPA, history-router (existing pattern). One persistent ASCII organism canvas living OUTSIDE `#app` so it never reloads — it morphs shape + hue on route change (glitch crossfade) and reacts to cursor, scroll, and project hovers. GSAP 3.15 (ScrollTrigger + SplitText, all free since 3.13) + Lenis smooth scroll drive the motion. All route scenes are built/killed per mount inside a gsap.context.

**Tech stack:** Vite 5 · GSAP 3.15 (ScrollTrigger, SplitText) · Lenis 1.3 · vanilla JS modules · Google/Fontshare fonts.

**Research basis (modern award-site toolkit):** smooth inertial scroll (Lenis), pinned scrub scenes with dolly-zoom feel (scale+blur), split-text char/word blur reveals, pinned horizontal-scroll galleries, velocity-reactive marquees, magnetic buttons, custom blend-mode cursor, film grain overlay, glass surfaces with backdrop-filter, living generative canvas backgrounds. No purple-blue SaaS gradients, no generic card grids.

---

## Design tokens

- Ink `#08080a` (bg) · Bone `#ece9e2` (text) · Mute `#8a877e`
- Route accents (also organism hues): enter amber `#ffb224` · home acid `#b8f53d` · work ember `#ff6a2b` · about indigo `#7b8cff` · contact signal `#ff3d55`
- Type: **Clash Display** (display, Fontshare) · **Space Grotesk** (body) · **JetBrains Mono** (data/eyebrows/labels)
- Signature: **the organism** — a full-viewport ASCII life-form (robot / wave / hand / bloom / spiral / terminal …) breathing behind glass-modern typography. Old ASCII soul, ultra-modern type.

## Route designs

1. `/enter` — organism at full strength. Mono top bar, eyebrow, giant display "Enter the organism.", one bracketed `[ ENTER ]` magnetic button. Organism cycles robot → gradient wave → hand → bloom → spiral; cursor creates ripples, click sends a pulse.
2. `/home` — scroll journey:
   - HERO: pinned; headline chars blur-in on load; on scroll the hero scales 1→1.5 + blurs out (dolly-through) while organism brightens; mono HUD shows scroll %.
   - MARQUEE: infinite strip, skewed, timeScale reacts to scroll velocity.
   - MANIFESTO: paragraph words scrub from blurred/scaled/far → sharp (the "coming from far away" feel).
   - SELECTED WORK: pinned horizontal scroll of 4 project cards (3D tilt + glare); hovering a card morphs organism into that project's shape.
   - FOCUS: 3 glass facts cards, rotateX reveal.
   - CTA: giant "Let's build something useful" magnetic link → /contact.
3. `/work` — split-reveal header; 4 full-width project rows (index, name, type, description, ↗). Hover fills row with accent + organism morphs to monitor/terminal in the project's hue. Click = GitHub (new tab) + glitch burst.
4. `/about` — sticky mono label + long-form copy reveals; fact rows in glass; organism in indigo (profile/hand/cell).
5. `/contact` — huge email link, mono link row (GitHub/LinkedIn), signal/envelope organism in red.

## Motion system (src/motion.js)

- Lenis tied into gsap ticker; `ScrollTrigger.update` on lenis scroll.
- Per-route scene builder inside `gsap.context`; killed on leave. `ScrollTrigger.refresh()` after mount + `document.fonts.ready`.
- Hero pin/scrub dolly, word-blur manifesto scrub, horizontal pin (`ease:"none"` on track tween), batch reveals, marquee w/ velocity timeScale, magnetic buttons, tilt cards, custom cursor (dot+ring, mix-blend-difference, grows on interactives, hidden on touch).
- Page transition: dual-panel wipe (ink + accent) with power4.inOut; organism `setRoute()` fires mid-wipe with glyph-glitch crossfade.
- `prefers-reduced-motion`: no lenis/pins/scrubs, organism frozen on one frame, content set to final states.
- Mobile (<760px): pins/horizontal disabled via gsap.matchMedia, stacked layout, simpler reveals.

## Organism upgrades (src/ascii.js)

- Persistent class instance; `setRoute(route)` tweens hue pair (~0.9s) + crossfades shape sets with glitch noise burst.
- New `robot` shape (antenna, pulsing eyes, breathing chest); kept: wave, hand, bloom, spiral, cell, brackets, monitor, terminal, folder(s), signal, envelope, profile.
- Autonomous idle cycling (~6s/shape, SDF lerp), breathing zoom, cursor ripple repulsion, click pulse, per-route palettes + shape sets.
- Perf: ~10px cells, DPR 1, skip low-density cells, pause when tab hidden.

## Files

- `package.json` — add `gsap`, `lenis`
- `index.html` — fonts; persistent layers outside #app: `canvas#organism`, `.grain`, `.cursor`, `.wipe`, `#app`
- `src/content.js` — projects (+accent/shape/tagline), route meta, socials, identity
- `src/ascii.js` — rewrite (persistent organism)
- `src/router.js` — rewrite (5 templates w/ motion hooks)
- `src/motion.js` — new (lenis, scenes, cursor, transitions)
- `src/main.js` — rewrite (wiring, route lifecycle, `?route=` recovery kept)
- `src/styles.css` — full rewrite

## Verification

1. `npm run build` passes clean.
2. `vite preview`/`dev` + browser screenshots of every route (enter, home top/mid/bottom, work, about, contact), iterate micro-passes on visual bugs.
3. Check reduced-motion + mobile widths.
