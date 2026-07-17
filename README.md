# Shayan — Digital Universe

An immersive multi-route portfolio built as a connected digital world rather than a conventional scrolling site.

## Environments

- `/home` — particle cosmos and kinetic manifesto
- `/work` — cinematic project worlds
- `/about` — interactive ASCII identity portrait
- `/laboratory` — live GPU experiments
- `/archive` — perspective-driven experience corridor
- `/contact` — open signal

## Stack

Vite · Three.js · GLSL · GSAP · Lenis · semantic HTML · responsive CSS

## Run

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

The renderer uses a single shared WebGL context, capped device pixel ratio, reduced particle count on mobile, visibility-aware rendering, reduced-motion fallbacks, and route-aware scene reuse.
