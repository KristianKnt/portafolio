/**
 * Interacciones del portafolio y renderizador de The Grid.
 * La inicialización espera al DOM para que el canvas tenga dimensiones válidas.
 */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.querySelector('#grid-canvas');
  const context = canvas?.getContext('2d', { alpha: true });

  if (!canvas || !context) return;

  // Estado mutable de la animación; evita crear estructuras nuevas por frame.
  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    animationFrame: 0,
    resizeTimer: 0,
    lastTime: 0,
    trails: Array.from({ length: 12 }, (_, index) => ({
      x: Math.random(),
      y: Math.random() * 0.48 + 0.05,
      speed: 0.00006 + Math.random() * 0.00014,
      length: 30 + Math.random() * 90,
      orange: index % 5 === 0,
      alpha: 0.25 + Math.random() * 0.4,
    })),
  };

  // Ajusta la resolución física sin saturar memoria en pantallas retina.
  const resizeCanvas = () => {
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.pixelRatio);
    canvas.height = Math.floor(state.height * state.pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  };

  // Debounce: varios eventos resize terminan en una sola medición y redibujado.
  const requestResize = () => {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      if (reduceMotion) draw(performance.now());
    }, 120);
  };

  // Perspectiva de The Grid. Los límites fijos garantizan que nunca haya un bucle infinito.
  const drawGrid = () => {
    const { width, height } = state;
    const horizon = height * 0.61;
    const horizontalLines = 18;
    const verticalLines = Math.ceil(width / 70) + 2;

    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    context.lineWidth = 1;

    // Fixed iteration count prevents a zero-increment loop at y === horizon.
    for (let line = 0; line < horizontalLines; line += 1) {
      const progress = line / horizontalLines;
      const y = horizon + Math.pow(progress, 0.65) * (height - horizon + 40);
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    for (let line = -1; line <= verticalLines; line += 1) {
      const x = line * 70;
      context.beginPath();
      context.moveTo(width / 2 + (x - width / 2) * 0.06, horizon);
      context.lineTo(x, height);
      context.stroke();
    }
  };

  // Estelas neon cian/naranja: dos trazos ligeros sustituyen gradientes por frame.
  const drawTrails = (delta) => {
    const { width, height, trails } = state;

    trails.forEach((trail) => {
      trail.x += trail.speed * delta;
      if (trail.x > 1.15) trail.x = -0.1;

      const x = trail.x * width;
      const y = trail.y * height;
      const color = trail.orange ? '#ff5e00' : '#00f0ff';

      // Two lightweight strokes preserve the neon tail without allocating a
      // CanvasGradient for every trail on every frame.
      context.save();
      context.globalAlpha = trail.alpha * 0.25;
      context.strokeStyle = color;
      context.shadowColor = color;
      context.shadowBlur = trail.orange ? 10 : 8;
      context.lineWidth = trail.orange ? 4 : 3;
      context.beginPath();
      context.moveTo(x - trail.length, y);
      context.lineTo(x, y);
      context.stroke();
      context.globalAlpha = trail.alpha;
      context.shadowBlur = 3;
      context.lineWidth = trail.orange ? 1.5 : 1;
      context.beginPath();
      context.moveTo(x - trail.length, y);
      context.lineTo(x, y);
      context.stroke();
      context.restore();
    });
  };

  // Único ciclo continuo: cada llamada agenda como máximo un siguiente frame.
  const draw = (time) => {
    const delta = Math.min(time - state.lastTime || 16.67, 50);
    state.lastTime = time;
    drawGrid();
    drawTrails(delta);

    if (!reduceMotion) {
      state.animationFrame = window.requestAnimationFrame(draw);
    }
  };

  resizeCanvas();
  draw(0);
  window.addEventListener('resize', requestResize, { passive: true });

  // El preloader se cierra cuando todos los recursos de la página están listos.
  const preloader = document.querySelector('.preloader');
  window.addEventListener('load', () => {
    window.setTimeout(() => preloader?.classList.add('done'), 800);
  }, { once: true });

  // Decodificación de títulos al entrar en viewport, sin cambiar su texto final.
  const decode = (element) => {
    if (!element.classList.contains('decode') || reduceMotion || element.dataset.decoded) return;
    element.dataset.decoded = 'true';
    const target = element.dataset.text || element.textContent;
    const characters = '01<>[]{}+/';
    let frame = 0;

    const tick = () => {
      element.textContent = target.split('').map((character, index) => {
        if (index < frame) return character;
        return character === ' ' ? ' ' : characters[Math.floor(Math.random() * characters.length)];
      }).join('');
      frame += 1.5;
      if (frame < target.length) window.requestAnimationFrame(tick);
      else element.textContent = target;
    };
    tick();
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.decode').forEach(decode);
      decode(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  // Menú responsive y navegación activa por sección.
  const nav = document.querySelector('.main-nav');
  const menu = document.querySelector('.menu-toggle');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('open');
  });
  document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => {
    nav?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  const links = [...document.querySelectorAll('.nav-link')];
  const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  }), { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section').forEach((section) => sectionObserver.observe(section));

  // Retículo del cursor: sigue al puntero con interpolación para una estela suave.
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (dot) dot.style.transform = `translate(${mouseX - 2.5}px, ${mouseY - 2.5}px)`;
  }, { passive: true });

  const followCursor = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    if (ring) ring.style.transform = `translate(${ringX - 12.5}px, ${ringY - 12.5}px)`;
    window.requestAnimationFrame(followCursor);
  };
  if (!reduceMotion) followCursor();

  document.querySelectorAll('a, button, .stack-item, .project-card').forEach((element) => {
    element.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    element.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  // Sustituir este feedback local por fetch/Formspree/tu endpoint cuando tengas backend.
  document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const feedback = event.currentTarget.querySelector('.form-feedback');
    if (feedback) feedback.textContent = '✓ TRANSMISSION RECEIVED // CHANNEL OPEN';
    event.currentTarget.reset();
  });
});
