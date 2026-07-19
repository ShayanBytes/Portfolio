import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { routeMeta } from './content.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export let lenis = null;

// ------------------------------------------------------------------- scroll
export function initScroll() {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else scrollTo(0, 0);
}

// ------------------------------------------------------------------- cursor
export function initCursor() {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;
  const root = document.querySelector('.cursor');
  if (!root) return;
  document.documentElement.classList.add('has-cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power2.out' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power2.out' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power2.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power2.out' });
  addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('a, button, [data-magnetic], [data-tilt]')) document.body.classList.add('cursor-on');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('a, button, [data-magnetic], [data-tilt]')) document.body.classList.remove('cursor-on');
  });
}

// -------------------------------------------------------------- transitions
export function transition(cb) {
  gsap.timeline()
    .set('.wipe', { pointerEvents: 'auto' })
    .fromTo('.wipe__panel--ink', { yPercent: 101 }, { yPercent: 0, duration: 0.45, ease: 'power4.inOut' }, 0)
    .fromTo('.wipe__panel--acc', { yPercent: 101 }, { yPercent: 0, duration: 0.45, ease: 'power4.inOut' }, 0.06)
    .add(() => cb(), '+=0.02')
    .to('.wipe__panel--acc', { yPercent: -101, duration: 0.55, ease: 'power4.inOut' }, '+=0.06')
    .to('.wipe__panel--ink', { yPercent: -101, duration: 0.55, ease: 'power4.inOut' }, '<0.06')
    .set('.wipe', { pointerEvents: 'none' })
    .set('.wipe__panel', { yPercent: 101 });
}

// -------------------------------------------------------------- micro-deps
function magnets(scope) {
  scope.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.32);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

function tilts(scope) {
  scope.querySelectorAll('[data-tilt]').forEach((card) => {
    gsap.set(card, { transformPerspective: 900 });
    const rX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      rY((px - 0.5) * 9); rX((0.5 - py) * 7);
      card.style.setProperty('--gx', `${px * 100}%`);
      card.style.setProperty('--gy', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => { rX(0); rY(0); });
  });
}

// Title chars blur-rise on mount (hero + page headers).
function charLoadIn(scope) {
  scope.querySelectorAll('[data-split="chars"]:not(.cta__link)').forEach((el) => {
    const split = new SplitText(el, { type: 'chars' });
    gsap.from(split.chars, {
      opacity: 0, y: 70, rotateX: -45, filter: 'blur(14px)',
      stagger: 0.018, duration: 1.05, ease: 'power3.out', delay: 0.18
    });
  });
}

// Elements tagged data-blur reveal once when they enter the viewport.
function blurBatch(scope) {
  const els = scope.querySelectorAll('[data-blur]');
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y: 26, filter: 'blur(10px)' });
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      stagger: 0.09, duration: 0.9, ease: 'power3.out', overwrite: true
    })
  });
}

// Paragraphs resolve word-by-word from far/blurred as you scroll through them.
function wordScrub(scope) {
  scope.querySelectorAll('[data-split="words"]').forEach((el) => {
    const split = new SplitText(el, { type: 'words' });
    gsap.fromTo(split.words,
      { opacity: 0.08, filter: 'blur(9px)', y: 16, scale: 1.12 },
      {
        opacity: 1, filter: 'blur(0px)', y: 0, scale: 1,
        ease: 'none', stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 84%', end: 'top 32%', scrub: 0.4 }
      });
  });
}

function flipCards(scope) {
  const els = scope.querySelectorAll('[data-flip]');
  if (!els.length) return;
  gsap.set(els, { transformPerspective: 800, transformOrigin: '50% 0%' });
  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch,
      { opacity: 0, rotateX: -52, y: 54 },
      { opacity: 1, rotateX: 0, y: 0, stagger: 0.12, duration: 1, ease: 'power3.out', overwrite: true })
  });
}

// ------------------------------------------------------------------ scenes
function homeScene(scope, organism, desktop) {
  const hero = scope.querySelector('[data-hero]');
  const hud = scope.querySelector('[data-hud]');
  if (hero && desktop) {
    gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top', end: '+=130%',
        scrub: 0.5, pin: true, anticipatePin: 1,
        onUpdate: (self) => { if (hud) hud.textContent = String(Math.round(self.progress * 100)).padStart(3, '0'); }
      }
    })
      .to('.hero__inner', { scale: 1.5, filter: 'blur(18px)', opacity: 0, ease: 'power2.in' }, 0)
      .to('.hero__cue', { opacity: 0, duration: 0.2 }, 0)
      .to(organism, { glow: 1.1, ease: 'none' }, 0);
  }

  const trackEl = scope.querySelector('[data-track]');
  if (trackEl && desktop) {
    const dist = () => Math.max(0, trackEl.scrollWidth - innerWidth + 60);
    const scrollTween = gsap.to(trackEl, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '[data-hscroll]', start: 'top top',
        end: () => `+=${dist() + innerHeight * 0.15}`,
        scrub: 0.5, pin: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    scope.querySelectorAll('.pcard__num').forEach((num) => {
      gsap.fromTo(num, { yPercent: -34 }, {
        yPercent: 34, ease: 'none',
        scrollTrigger: { containerAnimation: scrollTween, trigger: num.closest('.pcard'), start: 'left right', end: 'right left', scrub: true }
      });
    });
  }

  const cta = scope.querySelector('.cta__link');
  if (cta) {
    const split = new SplitText(cta, { type: 'chars' });
    gsap.fromTo(split.chars,
      { opacity: 0.05, filter: 'blur(10px)', y: 34 },
      {
        opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: 0.02,
        scrollTrigger: { trigger: '.cta', start: 'top 88%', end: 'top 42%', scrub: 0.4 }
      });
  }
}

function workScene(scope) {
  const rows = scope.querySelectorAll('.prow');
  if (!rows.length) return;
  ScrollTrigger.batch(rows, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch,
      { opacity: 0, y: 70 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.95, ease: 'power3.out', overwrite: true })
  });
}

// The marquee is ambient decoration, so its base scroll runs on every route —
// even under reduced motion — like the organism breathing. When full motion is
// allowed it also reacts to scroll velocity for a bit of momentum.
function marquee(scope, reactive) {
  const track = scope.querySelector('.marquee__track');
  if (!track) return;
  const loop = gsap.to(track, { xPercent: -50, repeat: -1, ease: 'none', duration: 24 });
  if (!reactive) return;
  ScrollTrigger.create({
    onUpdate: (self) => {
      loop.timeScale(1 + Math.min(3.2, Math.abs(self.getVelocity()) / 850));
      gsap.to(loop, { timeScale: 1, duration: 1.4, ease: 'power2.out', overwrite: true });
    }
  });
}

function navScene(scope) {
  const nav = scope.querySelector('[data-nav]');
  if (!nav) return;
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (y > 150 && y > lastY + 4) nav.classList.add('nav--hidden');
      else if (y < lastY - 4) nav.classList.remove('nav--hidden');
      lastY = y;
    }
  });
}

// Build every ScrollTrigger for the freshly mounted route. Returns a
// gsap.matchMedia — main.js reverts it on the way out.
export function buildScene(route, organism) {
  const root = document.querySelector('[data-route-root]');
  const mm = gsap.matchMedia();
  mm.add(
    // `base` always matches so the scene builds at every width; `desktop`
    // gates the pin/parallax/pointer effects that only make sense with a mouse.
    { base: '(min-width: 1px)', desktop: '(min-width: 761px)' },
    (ctx) => {
      const { desktop } = ctx.conditions;
      if (!root) return;

      if (route === 'home') marquee(root, true);
      charLoadIn(root);
      blurBatch(root);
      wordScrub(root);
      flipCards(root);
      navScene(document);
      if (route === 'home') homeScene(root, organism, desktop);
      if (route === 'work') workScene(root);
      if (desktop) { magnets(root); tilts(root); }
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  );
  return mm;
}
