import './styles.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Organism } from './ascii.js';
import { routeMeta } from './content.js';
import { render, resolve } from './router.js';
import { initScroll, initCursor, scrollTop, transition, buildScene } from './motion.js';

const app = document.querySelector('#app');
const canvas = document.querySelector('#organism');

let organism = null;   // persistent background life-form, created once
let scene = null;      // gsap.matchMedia for the current route's scroll scenes
let route;

// Render the route markup, morph the organism to match, and build its scenes.
function mount() {
  route = resolve();
  document.body.dataset.route = route;
  const meta = routeMeta[route];

  app.innerHTML = render(route);

  if (canvas) {
    if (!organism) organism = new Organism(canvas, meta);
    else { organism.transform(meta.shapes, meta.hues); organism.setGlow(meta.glow); }
  }

  scene = buildScene(route, organism);
  requestAnimationFrame(() => app.focus?.());
}

// Tear down the outgoing route's scroll scenes before mounting the next.
function swap() {
  scene?.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  scrollTop();
  mount();
}

function navigate(href, push = true) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const target = href.startsWith(base) ? href : `${base}${href}`;
  transition(() => {
    if (push) history.pushState({}, '', target);
    swap();
  });
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (!link) return;
  e.preventDefault();
  navigate(link.getAttribute('href'));
});
addEventListener('popstate', () => navigate(location.pathname, false));

// Recover deep links routed through a 404 redirect (?route=work).
const recovered = new URLSearchParams(location.search).get('route');
if (recovered) history.replaceState({}, '', `${import.meta.env.BASE_URL}${recovered}`);

initScroll();
initCursor();
mount();
