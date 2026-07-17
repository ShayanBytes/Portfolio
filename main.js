(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const header = document.querySelector('[data-header]');
  const reveals = document.querySelectorAll('.reveal');

  addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => root.classList.add('loaded'));
    document.querySelector('[data-year]').textContent = new Date().getFullYear();
  }, { once: true });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  let ticking = false;
  const updateScroll = () => {
    header.classList.toggle('is-scrolled', scrollY > 24);
    const manifesto = document.querySelector('.manifesto');
    const words = manifesto?.querySelectorAll('.word');
    if (manifesto && words?.length && !reduced) {
      const rect = manifesto.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height * .65)));
      const lit = Math.ceil(progress * words.length);
      words.forEach((word, index) => word.classList.toggle('is-lit', index < lit));
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive: true });

  const split = document.querySelector('[data-split]');
  if (split) {
    const words = split.textContent.trim().split(/\s+/);
    split.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
  }
  updateScroll();

  if (finePointer && !reduced) {
    const cursor = document.querySelector('.cursor');
    let cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener('pointermove', event => { tx = event.clientX; ty = event.clientY; }, { passive: true });
    const follow = () => {
      cx += (tx - cx) * .16; cy += (ty - cy) * .16;
      cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`;
      requestAnimationFrame(follow);
    };
    follow();
    document.querySelectorAll('[data-project] a').forEach(link => {
      link.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
      link.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    });

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        el.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();
