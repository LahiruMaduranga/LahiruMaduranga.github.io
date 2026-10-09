(() => {
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111317' : '#ffffff');
  }
  setTheme(document.documentElement.dataset.theme || 'light');
  themeButtons.forEach(button => button.addEventListener('click', () => {
    const theme = button.dataset.setTheme;
    setTheme(theme);
    try { localStorage.setItem('lahiru-theme', theme); } catch {}
  }));
  const filters = document.querySelectorAll('[data-filter]');
  filters.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      let visible = 0;
      document.querySelectorAll('[data-category]').forEach(card => {
        card.hidden = category !== 'All' && card.dataset.category !== category;
        if (!card.hidden) visible++;
      });
      document.querySelector('[data-filter-status]').textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
    });
  });

  // Mobile menu: a disclosure button; Escape or choosing a link closes it.
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('nav-menu');
  if (menuButton && menu) {
    const setMenu = open => {
      menuButton.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); menuButton.focus(); }
    });
  }

  // Active section: mark the nav link for the section crossing the upper part of the viewport.
  const navLinks = new Map(Array.from(document.querySelectorAll('[data-nav]'), link => [link.dataset.nav, link]));
  const tracked = Array.from(navLinks.keys(), id => document.getElementById(id)).filter(Boolean);
  if (tracked.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach(link => link.removeAttribute('aria-current'));
        navLinks.get(entry.target.id)?.setAttribute('aria-current', 'location');
      }
    }, {rootMargin: '-35% 0px -60% 0px'});
    tracked.forEach(section => sectionObserver.observe(section));
  }

  // Project showcase: the step crossing the middle of the viewport drives the pinned image panel.
  const showcase = document.querySelector('.showcase');
  if (showcase && 'IntersectionObserver' in window) {
    const steps = Array.from(showcase.querySelectorAll('[data-step]'));
    const stages = Array.from(showcase.querySelectorAll('[data-stage]'));
    const dots = Array.from(showcase.querySelectorAll('.stage-dots i'));
    const count = showcase.querySelector('.stage-count');
    const activate = index => {
      [steps, stages, dots].forEach(list => list.forEach((el, i) => el.classList.toggle('is-active', i === index)));
      if (count) count.textContent = `0${index + 1} / 0${steps.length}`;
    };
    showcase.classList.add('is-live');
    const stepObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) activate(steps.indexOf(entry.target));
    }, {rootMargin: '-45% 0px -45% 0px'});
    steps.forEach(step => stepObserver.observe(step));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Parallax: move each layer by its parent's distance from the viewport centre times its factor.
  // Parents never move themselves, so measuring them avoids feedback from the layer's own offset.
  const layers = Array.from(document.querySelectorAll('[data-parallax],[data-parallax-x]'), el => ({
    el, y: Number(el.dataset.parallax) || 0, x: Number(el.dataset.parallaxX) || 0
  }));
  let queued = false;
  function updateLayers() {
    queued = false;
    const height = window.innerHeight;
    for (const {el, x, y} of layers) {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -height || box.top > height * 2) continue;
      const offset = Math.max(-height, Math.min(height, box.top + box.height / 2 - height / 2));
      if (y) el.style.setProperty('--py', `${(offset * y).toFixed(1)}px`);
      if (x) el.style.setProperty('--px', `${(offset * x).toFixed(1)}px`);
    }
  }
  const queueLayers = () => { if (!queued) { queued = true; requestAnimationFrame(updateLayers); } };
  window.addEventListener('scroll', queueLayers, {passive: true});
  window.addEventListener('resize', queueLayers);
  updateLayers();

  if (!('IntersectionObserver' in window)) return;

  // Simulation clips: muted loops that play only while mostly on screen, with a pause control.
  // With reduced motion this never runs, so the clips keep their native controls and stay still.
  const videoObserver = new IntersectionObserver(entries => {
    for (const {target, intersectionRatio} of entries) {
      if (intersectionRatio >= 0.4 && !target.dataset.paused) target.play().catch(() => {});
      else target.pause();
    }
  }, {threshold: [0, 0.4]});
  document.querySelectorAll('.sim-frame video').forEach(video => {
    const toggle = video.nextElementSibling;
    const label = () => {
      toggle.textContent = video.dataset.paused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', `${toggle.textContent}: ${video.getAttribute('aria-label')}`);
    };
    video.controls = false;
    toggle.hidden = false;
    label();
    toggle.addEventListener('click', () => {
      if (video.dataset.paused) { delete video.dataset.paused; video.play().catch(() => {}); }
      else { video.dataset.paused = 'true'; video.pause(); }
      label();
    });
    videoObserver.observe(video);
  });

  // Reveal: only content that starts below the fold is hidden, so nothing visible ever blinks out.
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      el.style.transitionDelay = `${Math.min(order++, 4) * 90}ms`;
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, {once: true});
      el.classList.remove('is-pending');
      observer.unobserve(el);
    }
  }, {rootMargin: '0px 0px -8% 0px'});
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add('is-pending');
    observer.observe(el);
  });
})();
