import { identity, projects, routes } from './content.js';

const nav = (active) => `
<header class="nav" data-nav>
  <a class="nav__brand mono" href="/home" data-link>SM<span class="nav__sig">—</span>ORGANISM</a>
  <nav class="nav__links mono" aria-label="Primary">
    ${routes.filter(r => r !== 'enter').map(r => `<a href="/${r}" data-link ${r === active ? 'aria-current="page"' : ''}>${r.toUpperCase()}</a>`).join('')}
  </nav>
  <a class="nav__gh mono" href="${identity.github}" target="_blank" rel="noreferrer">GITHUB&nbsp;↗</a>
</header>`;

const footer = () => `
<footer class="foot mono">
  <span>© 2026 ${identity.name.toUpperCase()}</span>
  <span>${identity.location.toUpperCase()}</span>
  <a href="mailto:${identity.email}">${identity.email.toUpperCase()}</a>
</footer>`;

// ---------------------------------------------------------------- ENTER gate
const enter = () => `
<main class="gate" data-route-root>
  <div class="gate__frame mono" aria-hidden="true">
    <span>SM—2026</span>
    <span>LIVING ASCII SYSTEM · v3</span>
    <span>BONGAON / INDIA</span>
  </div>
  <section class="gate__core">
    <p class="eyebrow" data-blur>PORTFOLIO OF ${identity.name.toUpperCase()} — DEVELOPER</p>
    <h1 class="gate__title" data-split="chars">Enter the<br>organism.</h1>
    <p class="gate__sub" data-blur>I build useful software — databases, products, tools. The organism behind this glass is alive: it listens to your cursor, and it changes shape as you move through my world.</p>
    <a class="gatebtn mono" href="/home" data-link data-magnetic data-blur>
      <span class="gatebtn__br">[</span><span class="gatebtn__label">ENTER</span><span class="gatebtn__br">]</span>
    </a>
  </section>
  <p class="gate__hint mono" aria-hidden="true">move your cursor — the organism is listening · click to send a pulse</p>
</main>`;

// --------------------------------------------------------------------- HOME
const home = () => `
${nav('home')}
<main data-route-root>
  <section class="hero" data-hero>
    <div class="hero__inner">
      <p class="eyebrow" data-blur>${identity.name.toUpperCase()} — DEVELOPER · SYSTEMS THINKER · BUILDER</p>
      <h1 class="hero__title" data-split="chars">I build working software from the inside out.</h1>
      <p class="hero__lede" data-blur>From distributed databases to full-stack products and Python tools — I learn by building real systems, then documenting how they work.</p>
      <div class="hero__actions" data-blur>
        <a class="btn mono" href="/work" data-link data-magnetic>VIEW WORK&nbsp;↗</a>
        <a class="link-arrow mono" href="/about" data-link>ABOUT ME&nbsp;→</a>
      </div>
    </div>
    <div class="hero__hud mono" aria-hidden="true"><span data-hud>000</span><span>% DEPTH</span></div>
    <p class="hero__cue mono" aria-hidden="true">( scroll to descend )</p>
  </section>

  <section class="marquee" data-marquee aria-hidden="true">
    <div class="marquee__track">
      ${'<span class="marquee__item">DEVELOPER <i>+</i> SYSTEMS <i>+</i> JAVA <i>+</i> TYPESCRIPT <i>+</i> PYTHON <i>+</i> PRODUCTS <i>+</i> TOOLS <i>+</i>&nbsp;</span>'.repeat(4)}
    </div>
  </section>

  <section class="manifesto">
    <p class="manifesto__label mono" data-blur>— THE SHORT VERSION</p>
    <p class="manifesto__text" data-split="words">I care less about staying inside one label and more about understanding how software works as a whole. Learn the fundamentals. Build the real thing. Document the process.</p>
  </section>

  <section class="workpin" data-hscroll>
    <header class="workpin__head">
      <p class="eyebrow" data-blur>SELECTED WORK — GITHUB.COM/SHAYANBYTES</p>
      <h2 class="section-title" data-split="chars">Real work.<br>No mockups.</h2>
    </header>
    <div class="workpin__track" data-track>
      ${projects.map((p, i) => `
      <a class="pcard" href="${p.href}" target="_blank" rel="noreferrer" data-project="${p.id}" data-tilt>
        <span class="pcard__num mono" aria-hidden="true">0${i + 1}</span>
        <span class="pcard__top mono"><span>${p.type.toUpperCase()}</span><span>↗</span></span>
        <span class="pcard__name">${p.name}</span>
        <span class="pcard__desc">${p.description}</span>
        <span class="pcard__open mono">OPEN REPOSITORY&nbsp;↗</span>
      </a>`).join('')}
      <a class="pcard pcard--more" href="${identity.github}" target="_blank" rel="noreferrer" data-magnetic>
        <span class="pcard__name">+ everything<br>else on GitHub</span>
        <span class="pcard__open mono">BROWSE ALL&nbsp;↗</span>
      </a>
    </div>
  </section>

  <section class="focus">
    <p class="eyebrow" data-blur>OPERATING PRINCIPLES</p>
    <div class="focus__grid">
      <div class="fcard" data-flip><span class="fcard__key mono">CURRENT FOCUS</span><span class="fcard__val">Distributed systems, product engineering, developer tools</span></div>
      <div class="fcard" data-flip><span class="fcard__key mono">LANGUAGES IN ROTATION</span><span class="fcard__val">Java · TypeScript · Python · JavaScript · HTML/CSS</span></div>
      <div class="fcard" data-flip><span class="fcard__key mono">APPROACH</span><span class="fcard__val">Learn the fundamentals. Build the real thing. Document the process.</span></div>
    </div>
  </section>

  <section class="cta">
    <p class="eyebrow" data-blur>NEXT TRANSMISSION</p>
    <a class="cta__link" href="/contact" data-link data-magnetic data-split="chars">Let's build something useful.</a>
  </section>
  ${footer()}
</main>`;

// --------------------------------------------------------------------- WORK
const work = () => `
${nav('work')}
<main data-route-root>
  <header class="pagehead">
    <p class="eyebrow" data-blur>SELECTED REPOSITORIES — PULLED STRAIGHT FROM GITHUB</p>
    <h1 class="pagehead__title" data-split="chars">Real work.<br>No mockups.</h1>
    <p class="pagehead__sub" data-blur>Systems, products and tools that represent how I think and build. Hover a row — the organism becomes the project.</p>
  </header>
  <section class="plist" aria-label="Projects">
    ${projects.map((p, i) => `
    <a class="prow" href="${p.href}" target="_blank" rel="noreferrer" data-project="${p.id}">
      <span class="prow__idx mono" aria-hidden="true">0${i + 1}</span>
      <span class="prow__body">
        <span class="prow__name">${p.name}</span>
        <span class="prow__type mono">${p.type.toUpperCase()}</span>
        <span class="prow__desc">${p.description}</span>
      </span>
      <span class="prow__arrow" aria-hidden="true">↗</span>
    </a>`).join('')}
  </section>
  <p class="plist__note mono" data-blur>OPENING A REPOSITORY LEAVES THIS UNIVERSE — YOU'LL LAND ON GITHUB&nbsp;↗</p>
  ${footer()}
</main>`;

// -------------------------------------------------------------------- ABOUT
const about = () => `
${nav('about')}
<main data-route-root>
  <header class="pagehead">
    <p class="eyebrow" data-blur>ABOUT THE OPERATOR</p>
    <h1 class="pagehead__title" data-split="chars">Curious enough<br>to go deeper.</h1>
  </header>
  <section class="about">
    <aside class="about__side mono" data-blur>
      <span>NAME — ${identity.name.toUpperCase()}</span>
      <span>BASE — ${identity.location.toUpperCase()}</span>
      <span>CLASS — COMPUTER SCIENCE</span>
    </aside>
    <div class="about__copy">
      <p data-split="words">I'm ${identity.name}, a computer science student and developer from Bongaon, West Bengal. My repositories move across Java, TypeScript, Python, JavaScript, databases, full-stack products, and problem solving.</p>
      <p data-split="words">That range is intentional: I care less about staying inside one label and more about understanding how software works as a whole — from the storage engine up to the pixel.</p>
      <dl class="about__facts">
        <div class="fact" data-flip><dt class="mono">CURRENT FOCUS</dt><dd>Distributed systems, product engineering, developer tools</dd></div>
        <div class="fact" data-flip><dt class="mono">LANGUAGES SEEN IN MY WORK</dt><dd>Java, TypeScript, Python, JavaScript, HTML/CSS</dd></div>
        <div class="fact" data-flip><dt class="mono">APPROACH</dt><dd>Learn the fundamentals. Build the real thing. Document the process.</dd></div>
      </dl>
    </div>
  </section>
  ${footer()}
</main>`;

// ------------------------------------------------------------------ CONTACT
const contact = () => `
${nav('contact')}
<main data-route-root>
  <section class="contact">
    <p class="eyebrow" data-blur>OPEN CHANNEL</p>
    <h1 class="pagehead__title" data-split="chars">Let's build<br>something useful.</h1>
    <a class="contact__email" href="mailto:${identity.email}" data-magnetic data-blur>${identity.email}</a>
    <div class="contact__links mono" data-blur>
      <a href="${identity.github}" target="_blank" rel="noreferrer">GITHUB&nbsp;↗</a>
      <a href="${identity.linkedin}" target="_blank" rel="noreferrer">LINKEDIN&nbsp;↗</a>
      <a href="mailto:${identity.email}">EMAIL&nbsp;↗</a>
    </div>
    <p class="contact__note mono" data-blur>BASED IN ${identity.location.toUpperCase()} — AVAILABLE FOR THOUGHTFUL COLLABORATIONS</p>
  </section>
  ${footer()}
</main>`;

const templates = { enter, home, work, about, contact };

export function resolve() {
  const r = location.pathname.split('/').filter(Boolean).pop() || 'enter';
  return routes.includes(r) ? r : 'enter';
}
export function render(route) { return templates[route](); }
