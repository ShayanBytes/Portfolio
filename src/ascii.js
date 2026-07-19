import gsap from 'gsap';

// ---------------------------------------------------------------------------
// The Organism — a persistent, autonomous ASCII life-form rendered on canvas.
// It breathes on every route, morphs shape-set + hue when the route changes,
// reacts to the pointer with ripples, and pulses when you click.
// ---------------------------------------------------------------------------

// Single dot glyph: the organism renders as a fine halftone dot-matrix rather
// than chunky mixed-weight ASCII. All shading is carried by opacity + lightness
// (see draw()), so one '.' at every lit cell is enough — and the tight cell
// grid below is what makes it read as high detail.
const GLYPHS = '.';
// Detail knob: pixel size of each dot cell. Smaller = finer detail but more
// draws per frame. 6/5 (desktop/mobile) is a dense, smooth default; drop to 5/4
// for more detail if your machine holds 60fps, raise to 8 if it stutters.
const DOT_CELL = 6;
const DOT_CELL_MOBILE = 5;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const ellipse = (x, y, cx, cy, rx, ry) => 1 - Math.hypot((x - cx) / rx, (y - cy) / ry);
const box = (x, y, cx, cy, rx, ry) => 1 - Math.max(Math.abs(x - cx) / rx, Math.abs(y - cy) / ry);
const ring = (v, w = 0.1) => 1 - Math.abs(v) / w;
// Fast deterministic flicker-noise for the glitch crossfade.
const flicker = (x, y, f) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + f * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------------------
// Fractal tree — baked once into a distance field so per-cell sampling stays
// cheap. A recursive trunk forks into branches, sub-branches and twigs, with
// soft leaf clusters at every tip. Runtime sway is applied at sample time so
// the geometry itself never has to be rebuilt.
// ---------------------------------------------------------------------------
const TREE_RES = 256;
let TREE_FIELD = null;

function bakeTree() {
  const res = TREE_RES;
  const field = new Float32Array(res * res).fill(-1);
  const segs = [];   // [ax, ay, bx, by, halfWidth]
  const leaves = []; // [x, y, radius]

  let seed = 20260718 >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  // Grow a branch as a short chain of curving segments (so limbs bend rather
  // than snap straight), scatter leaves along the higher/thinner ones, then
  // recursively fork into thinner branches.
  function grow(x, y, ang, len, w, depth) {
    if (segs.length > 3200) return;
    let cx = x, cy = y, ca = ang;
    const steps = 3;                              // sub-segments per branch = curvature
    for (let s = 0; s < steps; s++) {
      ca += (rnd() - 0.5) * 0.28;                 // gentle wander gives an organic curve
      const sl = len / steps;
      const nx = cx + Math.sin(ca) * sl;
      const ny = cy - Math.cos(ca) * sl;
      const wA = w * (1 - s / steps * 0.4), wB = w * (1 - (s + 1) / steps * 0.4);
      segs.push([cx, cy, nx, ny, Math.max(0.007, wA), Math.max(0.006, wB)]);
      // Leaves cling to thinner, higher branches — foliage, not bare wood.
      if (depth >= 3 && rnd() < 0.5) {
        leaves.push([nx + (rnd() - 0.5) * 0.06, ny + (rnd() - 0.5) * 0.06, 0.032 + rnd() * 0.03]);
      }
      cx = nx; cy = ny; ang = ca;
    }
    if (depth >= 9 || len < 0.032) {
      // Twig tip → a denser burst of leaves.
      for (let k = 0; k < 3; k++) {
        leaves.push([cx + (rnd() - 0.5) * 0.11, cy + (rnd() - 0.5) * 0.11, 0.04 + rnd() * 0.04]);
      }
      return;
    }
    const forks = depth < 2 ? 2 : (rnd() < 0.55 ? 3 : 2);
    for (let i = 0; i < forks; i++) {
      const spread = 0.3 + rnd() * 0.5;
      const off = (i - (forks - 1) / 2) * spread + (rnd() - 0.5) * 0.28;
      grow(cx, cy, ang + off, len * (0.68 + rnd() * 0.16), w * 0.7, depth + 1);
    }
  }
  grow(0, 0.92, 0, 0.42, 0.07, 0);
  // Roots flaring into the ground (also tapered).
  segs.push([0, 0.9, -0.26, 1.06, 0.035, 0.012], [0, 0.9, 0.26, 1.06, 0.035, 0.012],
            [0, 0.9, -0.11, 1.09, 0.028, 0.01], [0, 0.9, 0.14, 1.09, 0.028, 0.01]);

  const toTexel = (v) => (v + 1) / 2 * (res - 1);
  const clampI = (v) => (v < 0 ? 0 : v > res - 1 ? res - 1 : v);

  // Rasterise each primitive only inside its own bounding box (fast bake).
  const stamp = (minX, minY, maxX, maxY, valAt) => {
    const gx0 = clampI(Math.floor(toTexel(minX))), gx1 = clampI(Math.ceil(toTexel(maxX)));
    const gy0 = clampI(Math.floor(toTexel(minY))), gy1 = clampI(Math.ceil(toTexel(maxY)));
    for (let gy = gy0; gy <= gy1; gy++) {
      const wy = (gy / (res - 1)) * 2 - 1;
      for (let gx = gx0; gx <= gx1; gx++) {
        const wx = (gx / (res - 1)) * 2 - 1;
        const val = valAt(wx, wy);
        const idx = gy * res + gx;
        if (val > field[idx]) field[idx] = val;
      }
    }
  };

  for (const [ax, ay, bx, by, wA, wB] of segs) {
    const m = Math.max(wA, wB) * 1.5;
    const vx = bx - ax, vy = by - ay, len2 = vx * vx + vy * vy + 1e-9;
    stamp(Math.min(ax, bx) - m, Math.min(ay, by) - m, Math.max(ax, bx) + m, Math.max(ay, by) + m,
      (wx, wy) => {
        let tp = ((wx - ax) * vx + (wy - ay) * vy) / len2;
        tp = tp < 0 ? 0 : tp > 1 ? 1 : tp;
        const w = wA + (wB - wA) * tp;             // taper along the segment
        const dx = wx - (ax + vx * tp), dy = wy - (ay + vy * tp);
        return 1 - Math.hypot(dx, dy) / w;
      });
  }
  for (const [lx, ly, r] of leaves) {
    stamp(lx - r, ly - r, lx + r, ly + r,
      (wx, wy) => 1 - Math.hypot(wx - lx, wy - ly) / r);
  }
  TREE_FIELD = field;
}

function sampleTree(qx, qy) {
  const res = TREE_RES;
  let fx = (qx + 1) / 2 * (res - 1), fy = (qy + 1) / 2 * (res - 1);
  fx = fx < 0 ? 0 : fx > res - 1 ? res - 1 : fx;
  fy = fy < 0 ? 0 : fy > res - 1 ? res - 1 : fy;
  const x0 = fx | 0, y0 = fy | 0;
  const x1 = x0 + 1 < res ? x0 + 1 : x0, y1 = y0 + 1 < res ? y0 + 1 : y0;
  const tx = fx - x0, ty = fy - y0, f = TREE_FIELD;
  const a = f[y0 * res + x0], b = f[y0 * res + x1], c = f[y1 * res + x0], d = f[y1 * res + x1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

function shapeField(name, x, y, t) {
  const pulse = 1 + Math.sin(t * 0.75) * 0.07;
  switch (name) {
    case 'robot': {
      const blink = Math.pow(Math.max(0, Math.sin(t * 0.85)), 48); // rare, quick blink
      const head = box(x, y, 0, -0.18, 0.44, 0.33);
      const eyeH = 0.075 * (1 - 0.92 * blink);
      const eyeL = box(x, y, -0.19, -0.22, 0.095, eyeH);
      const eyeR = box(x, y, 0.19, -0.22, 0.095, eyeH);
      const mouth = 1 - Math.abs(y - 0.02 - Math.sin(x * 22 + t * 3) * 0.018) / 0.03 - Math.abs(x) / 0.24;
      const antenna = Math.max(box(x, y, 0, -0.6, 0.018, 0.13), ellipse(x, y, 0, -0.76, 0.05, 0.05) * (0.7 + 0.5 * Math.sin(t * 2.6)));
      const earL = box(x, y, -0.5, -0.18, 0.06, 0.1);
      const earR = box(x, y, 0.5, -0.18, 0.06, 0.1);
      const neck = box(x, y, 0, 0.16, 0.12, 0.05);
      const chest = box(x, y, 0, 0.52, 0.46, 0.3);
      const heart = ellipse(x, y, 0, 0.5, 0.1, 0.1) * (0.65 + 0.45 * Math.sin(t * 2.2));
      const scan = Math.max(0, Math.sin(y * 30 + t * 2)) * 0.1 * Math.max(ring(head, 0.14), ring(chest, 0.14));
      return Math.max(ring(head, 0.12), eyeL, eyeR, mouth, antenna, earL, earR, neck, ring(chest, 0.11), heart, scan);
    }
    case 'cell':
      return ring(ellipse(x, y, 0, 0, 0.65 * pulse, 0.72 * pulse), 0.2) + ellipse(x, y, 0.13, -0.08, 0.18, 0.23) * 0.7;
    case 'spiral': {
      const a = Math.atan2(y, x), r = Math.hypot(x, y);
      return 0.78 - Math.abs(Math.sin(a * 3 - r * 12 + t)) * 1.2 - r * 0.45;
    }
    case 'bloom': {
      const a = Math.atan2(y, x), r = Math.hypot(x, y);
      return 0.8 - r * 1.2 + Math.cos(a * 7 + t) * 0.23 + Math.sin(r * 18 - t) * 0.12;
    }
    case 'wave':
      return Math.sin(x * 7 + t * 1.4) + Math.cos(y * 8 - t * 0.9) - Math.hypot(x, y) * 0.65;
    case 'tree': {
      if (!TREE_FIELD) bakeTree();
      // Sway grows toward the top (roots stay planted); higher branches drift more.
      const up = Math.max(0, -y + 1) * 0.5;              // 0 at base → ~1 at crown
      const sway = (Math.sin(t * 0.7) * 0.05 + Math.sin(t * 1.9 + 1.3) * 0.018) * up;
      const rustle = Math.sin(x * 9 + t * 1.6) * Math.cos(y * 11 - t * 1.1) * 0.06 * up;
      const d = sampleTree(x - sway - rustle, y);
      // Foliage shimmer so the canopy twinkles like leaves catching light.
      const shimmer = d > 0 ? Math.sin(x * 24 + t * 2 + y * 18) * 0.12 : 0;
      return d * 1.15 + shimmer;
    }
    case 'earth': {
      // A rotating globe: solid sphere, continents scrolling with longitude,
      // a glowing atmosphere rim, and shading toward the terminator.
      const R = 0.7;
      const r = Math.hypot(x, y);
      const atmos = ring(r - R - 0.06, 0.05) * (0.55 + 0.25 * Math.sin(t * 1.5)); // halo
      if (r > R) return atmos;                        // outside the disc → just glow
      const z = Math.sqrt(Math.max(0, R * R - x * x - y * y)); // sphere depth
      const lat = Math.asin(clamp(y / R, -1, 1));
      const lon = Math.atan2(x, z) + t * 0.45;        // spin
      // Layered sines fake continents/oceans; >0 is land.
      const land =
        Math.sin(lon * 3 + Math.sin(lat * 4) * 1.4) * 0.6 +
        Math.sin(lon * 5 - lat * 3 + 1.7) * 0.4 +
        Math.cos(lat * 6 + lon * 2) * 0.35;
      const surface = 0.55 + (land > 0.15 ? 0.42 : 0.08);   // land brighter than sea
      const light = clamp(0.35 + (x * 0.6 + -y * 0.5 + z * 0.7), 0, 1); // day/night
      const grid = (Math.abs(Math.sin(lon * 6)) < 0.06 || Math.abs(Math.sin(lat * 6)) < 0.06) ? 0.12 : 0;
      return surface * (0.35 + light * 0.85) + grid + atmos * 0.5;
    }
    case 'helix': {
      // DNA double helix: two phosphate strands crossing, with base-pair rungs.
      const spin = t * 1.1;
      const s1 = Math.sin(y * 5 + spin), s2 = Math.sin(y * 5 + spin + Math.PI);
      const strandA = ring(x - s1 * 0.5, 0.07) * (0.6 + 0.4 * (Math.cos(y * 5 + spin) + 1) / 2);
      const strandB = ring(x - s2 * 0.5, 0.07) * (0.6 + 0.4 * (Math.cos(y * 5 + spin + Math.PI) + 1) / 2);
      const xa = s1 * 0.5, xb = s2 * 0.5;
      const onRung = Math.abs(Math.sin(y * 15)) > 0.86;                 // periodic base pairs
      const between = (x - Math.min(xa, xb)) * (Math.max(xa, xb) - x);  // >0 between strands
      const rung = onRung && between > -0.002 ? 0.7 - Math.abs(y % 0.02) * 8 : -1;
      const nodes = Math.max(ellipse(x, y, xa, y, 0.05, 0.05), ellipse(x, y, xb, y, 0.05, 0.05));
      return Math.max(strandA, strandB, rung, nodes) - Math.max(0, Math.abs(y) - 0.95) * 4;
    }
    case 'hand': {
      let v = ellipse(x, y, 0.02, 0.24, 0.31, 0.38);
      v = Math.max(v, ellipse(x, y, -0.27, -0.05, 0.11, 0.43));
      v = Math.max(v, ellipse(x, y, -0.09, -0.18, 0.095, 0.53));
      v = Math.max(v, ellipse(x, y, 0.09, -0.2, 0.09, 0.5));
      v = Math.max(v, ellipse(x, y, 0.26, -0.12, 0.085, 0.41));
      v = Math.max(v, ellipse(x, y, 0.38, 0.17, 0.12, 0.33));
      return v;
    }
    case 'folder': {
      const body = box(x, y, 0, 0.08, 0.65, 0.42), tab = box(x, y, -0.34, -0.38, 0.25, 0.12);
      return Math.max(ring(body, 0.1), ring(tab, 0.12), body * 0.16);
    }
    case 'monitor': {
      const screen = box(x, y, 0, -0.08, 0.63, 0.4), stand = box(x, y, 0, 0.45, 0.08, 0.19), base = box(x, y, 0, 0.64, 0.3, 0.055);
      return Math.max(ring(screen, 0.09), stand, base) + Math.sin(x * 18 + t) * screen * 0.16;
    }
    case 'terminal': {
      const frame = box(x, y, 0, 0, 0.67, 0.48), prompt = box(x, y, -0.3, 0.05, 0.22, 0.035), caret = box(x, y, 0.04, 0.05, 0.025, 0.1);
      return Math.max(ring(frame, 0.08), prompt, caret * (0.5 + 0.5 * Math.sin(t * 4)));
    }
    case 'brackets': {
      const l = Math.max(box(x, y, -0.48, 0, 0.05, 0.52), box(x, y, -0.35, -0.47, 0.18, 0.05), box(x, y, -0.35, 0.47, 0.18, 0.05));
      const r = Math.max(box(x, y, 0.48, 0, 0.05, 0.52), box(x, y, 0.35, -0.47, 0.18, 0.05), box(x, y, 0.35, 0.47, 0.18, 0.05));
      return Math.max(l, r);
    }
    case 'profile': {
      const skull = ellipse(x, y, 0.02, -0.18, 0.34, 0.43), neck = box(x, y, 0.1, 0.36, 0.18, 0.28), shoulders = ellipse(x, y, 0, 0.7, 0.7, 0.32);
      return Math.max(ring(skull, 0.12), neck * 0.55, shoulders * 0.45);
    }
    case 'signal': {
      const r = Math.hypot(x, y);
      return Math.max(ring(r - 0.22, 0.08), ring(r - 0.48, 0.08), ring(r - 0.74, 0.08), ellipse(x, y, 0, 0, 0.06, 0.06));
    }
    case 'envelope': {
      const frame = box(x, y, 0, 0, 0.67, 0.43), diag = 1 - Math.abs(Math.abs(y + 0.04) - Math.abs(x) * 0.56) / 0.08;
      return Math.max(ring(frame, 0.08), diag * frame);
    }
    default:
      return 0;
  }
}

export class Organism {
  constructor(canvas, { hues = [32, 52], shapes = ['robot', 'wave'], glow = 1 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.hue = { h0: hues[0], h1: hues[1] };
    this.setOld = shapes;
    this.setNew = shapes;
    this.morph = 1; // 1 = fully on setNew
    this.glow = glow;
    this.pointer = { x: 0.5, y: 0.5 };
    this.pulses = [];
    this.time = Math.random() * 40;
    this.running = true;
    this.glitchFrame = 0;

    this.resize = () => {
      // Tight, near-square dot grid — this density is what gives the fine detail.
      const cell = innerWidth < 640 ? DOT_CELL_MOBILE : DOT_CELL;
      this.cellW = cell;
      this.cellH = cell;
      // Dot is drawn a touch larger than the cell so lit regions read as solid
      // shading, and centered in the cell rather than top-left aligned.
      this.font = cell * 1.6;
      this.cols = Math.ceil(innerWidth / this.cellW);
      this.rows = Math.ceil(innerHeight / this.cellH);
      this.canvas.width = innerWidth;
      this.canvas.height = innerHeight;
      this.ctx.font = `${this.font}px "JetBrains Mono", monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
    };
    this.onPointer = (e) => { this.pointer.x = e.clientX / innerWidth; this.pointer.y = e.clientY / innerHeight; };
    this.onDown = (e) => this.pulse(e.clientX / innerWidth, e.clientY / innerHeight);
    this.onVisibility = () => { this.running = !document.hidden; };

    this.resize();
    addEventListener('resize', this.resize, { passive: true });
    addEventListener('pointermove', this.onPointer, { passive: true });
    addEventListener('pointerdown', this.onDown, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);

    // The organism always breathes — its motion is ambient, not scroll-driven,
    // so it stays alive even under prefers-reduced-motion.
    this.loop();
  }

  pulse(nx, ny) {
    this.pulses.push({ x: nx * 2 - 1, y: ny * 2 - 1, t0: this.time });
    if (this.pulses.length > 4) this.pulses.shift();
  }

  // Morph to a new shape-set + hue range (route change or project focus).
  transform(shapes, hues, duration = 1.1) {
    if (!shapes || shapes.join() === this.setNew.join()) {
      if (hues) gsap.to(this.hue, { h0: hues[0], h1: hues[1], duration: 0.9, ease: 'power2.inOut', overwrite: true });
      return;
    }
    // Continue from whatever mix is currently visible to avoid a pop.
    this.setOld = this.morph >= 0.5 ? this.setNew : this.setOld;
    this.setNew = shapes;
    gsap.killTweensOf(this, 'morph');
    this.morph = 0;
    gsap.to(this, { morph: 1, duration, ease: 'power2.inOut' });
    if (hues) gsap.to(this.hue, { h0: hues[0], h1: hues[1], duration: duration * 0.8, ease: 'power2.inOut', overwrite: true });
  }

  setGlow(g, duration = 0.7) {
    gsap.to(this, { glow: g, duration, ease: 'power2.out', overwrite: 'auto' });
  }

  // Field of one shape-set at a normalised coordinate, with idle cycling.
  setField(set, nx, ny, t) {
    const cycle = t / 6.2;
    const i = Math.floor(cycle) % set.length;
    const j = (i + 1) % set.length;
    const mix = smooth(0.2, 0.8, cycle - Math.floor(cycle));
    return shapeField(set[i], nx, ny, t) * (1 - mix) + shapeField(set[j], nx, ny, t) * mix;
  }

  field(x, y, t) {
    let nx = (x / this.cols) * 2 - 1;
    let ny = (y / this.rows) * 2 - 1;
    const zoom = 1 + 0.16 * Math.sin(t * 0.35) + 0.06 * Math.sin(t * 1.1);
    nx *= zoom * 1.02; ny *= zoom;

    // Pointer repulsion — cells bulge away from the cursor.
    const px = this.pointer.x * 2 - 1, py = this.pointer.y * 2 - 1;
    const dx = nx - px, dy = ny - py;
    const dist = Math.hypot(dx, dy) + 1e-4;
    const push = Math.exp(-dist * 3.4) * 0.1;
    nx += (dx / dist) * push; ny += (dy / dist) * push;

    let v;
    if (this.morph >= 1) v = this.setField(this.setNew, nx, ny, t);
    else v = this.setField(this.setOld, nx, ny, t) * (1 - this.morph) + this.setField(this.setNew, nx, ny, t) * this.morph;

    // Cursor ripple.
    v += Math.exp(-dist * 4.5) * Math.sin(dist * 30 - t * 3.2) * 0.34;

    // Click pulses — expanding energy rings.
    for (const p of this.pulses) {
      const age = t - p.t0;
      if (age > 2.4) continue;
      const pd = Math.hypot(nx - p.x, ny - p.y);
      v += ring(pd - age * 1.1, 0.07) * Math.exp(-age * 1.7) * 0.9;
    }

    // Ambient texture so empty regions still feel alive.
    v += Math.sin(nx * 11 + Math.sin(ny * 6 + t) * 2) * 0.09 + Math.cos(ny * 12 - t * 0.7) * 0.07;
    return v;
  }

  draw(t) {
    const c = this.ctx;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const { h0, h1 } = this.hue;
    const glitch = this.morph < 1 ? Math.sin(this.morph * Math.PI) : 0; // peaks mid-morph
    const gf = Math.floor(t * 16);
    const lum = 26 + this.glow * 6;
    // Cells are center-aligned (textAlign/Baseline set in resize), so draw at
    // each cell's midpoint.
    const hw = this.cellW / 2, hh = this.cellH / 2;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let v = this.field(x, y, t);
        let n = clamp((v + 0.3) / 1.35);
        // Glitch crossfade: random cells flash the dot at random brightness while morphing.
        if (glitch > 0.04 && flicker(x, y, gf) < glitch * 0.34) {
          n = 0.25 + flicker(y, x, gf + 9) * 0.75;
          c.fillStyle = `hsl(${h1 + flicker(x, y, gf + 3) * 60} 90% ${lum + n * 42}%)`;
          c.globalAlpha = 0.15 + n * 0.7;
          c.fillText(GLYPHS, x * this.cellW + hw, y * this.cellH + hh);
          continue;
        }
        if (n < 0.07) continue;
        const hue = h0 + (h1 - h0) * n + Math.sin(t * 0.5 + x * 0.018) * 7;
        c.fillStyle = `hsl(${hue} 82% ${lum + n * 50}%)`;
        c.globalAlpha = (0.1 + n * 0.82) * (0.55 + this.glow * 0.45);
        c.fillText(GLYPHS, x * this.cellW + hw, y * this.cellH + hh);
      }
    }
    c.globalAlpha = 1;
  }

  loop = () => {
    requestAnimationFrame(this.loop);
    if (!this.running) return;
    this.time += 0.016;
    this.draw(this.time);
  };

  destroy() {
    this.running = false;
    removeEventListener('resize', this.resize);
    removeEventListener('pointermove', this.onPointer);
    removeEventListener('pointerdown', this.onDown);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
