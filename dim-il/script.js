(() => {
  const sequence = document.querySelector('[data-sequence]');
  if (!sequence) return;

  const steps = [...sequence.querySelectorAll('[data-sequence-step]')];
  const panels = [...sequence.querySelectorAll('[data-sequence-panel]')];
  const toggle = sequence.querySelector('[data-sequence-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let visible = false;
  let manuallyPaused = false;

  function show(index) {
    current = index;
    steps.forEach((step, position) => {
      const active = position === index;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-pressed', String(active));
    });
    panels.forEach((panel, position) => {
      const active = position === index;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    toggle.textContent = 'Replay sequence';
    toggle.setAttribute('aria-label', 'Replay sequence');
  }

  function start() {
    if (timer || !visible || document.hidden) return;
    timer = window.setInterval(() => show((current + 1) % panels.length), 3200);
    toggle.textContent = 'Pause';
    toggle.setAttribute('aria-label', 'Pause sequence');
  }

  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      manuallyPaused = true;
      stop();
      show(index);
    });
  });

  toggle.addEventListener('click', () => {
    if (timer) {
      manuallyPaused = true;
      stop();
    } else {
      manuallyPaused = false;
      show(0);
      start();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible && !manuallyPaused && !reducedMotion.matches) start();
  });

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !manuallyPaused && !reducedMotion.matches) {
      show(0);
      start();
    } else {
      stop();
    }
  }, { threshold: 0.3 });
  observer.observe(sequence);
  stop();
})();
