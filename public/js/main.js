(function setupCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  const mouse = { x: -999, y: -999 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });
  resize();

  const red = 'rgba(232,0,13,';
  const darkRed = 'rgba(154,0,9,';
  const white = 'rgba(240,237,232,';

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.r = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
      this.color = Math.random() > 0.6 ? red : darkRed;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < 200) {
        this.vx += (dx / distance) * 0.015;
        this.vy += (dy / distance) * 0.015;
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x += this.vx;
      this.y += this.vy;
      this.life += 1;

      if (this.life > this.maxLife || this.y < -10) {
        this.reset(false);
      }
    }

    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${alpha})`;
      ctx.fill();
    }
  }

  class Ember {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 5;
      this.r = Math.random() * 2.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -(Math.random() * 1.5 + 0.3);
      this.life = 0;
      this.maxLife = Math.random() * 180 + 80;
      this.hue = Math.random() > 0.5 ? 0 : 20;
    }

    update() {
      this.vx += (Math.random() - 0.5) * 0.08;
      this.vy -= 0.01;
      this.x += this.vx;
      this.y += this.vy;
      this.life += 1;

      if (this.life > this.maxLife || this.y < -10) {
        this.reset(false);
      }
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha = (1 - progress) * 0.9;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2);
      gradient.addColorStop(0, `hsla(${this.hue},100%,70%,${alpha})`);
      gradient.addColorStop(1, `hsla(${this.hue},100%,40%,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  class SoundRing {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = 0;
      this.maxRadius = Math.random() * 180 + 60;
      this.speed = Math.random() * 1.2 + 0.5;
      this.life = 0;
      this.maxLife = this.maxRadius / this.speed;
      this.color = Math.random() > 0.4 ? red : darkRed;
    }

    update() {
      this.radius += this.speed;
      this.life += 1;
      if (this.life > this.maxLife) {
        this.reset();
      }
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha = (1 - progress) * 0.18;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${this.color}${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  class Lightning {
    constructor() {
      this.reset();
    }

    reset() {
      this.active = false;
      this.timer = Math.random() * 180 + 60;
      this.segments = [];
      this.alpha = 0;
    }

    trigger() {
      this.active = true;
      this.alpha = 1;
      const sx = Math.random() * width;
      const sy = 0;
      const ex = sx + (Math.random() - 0.5) * 300;
      const ey = Math.random() * height * 0.6 + height * 0.1;
      const steps = Math.floor(Math.random() * 8 + 6);
      this.segments = [];

      for (let i = 0; i <= steps; i += 1) {
        const progress = i / steps;
        this.segments.push({
          x: sx + (ex - sx) * progress + (Math.random() - 0.5) * (120 * (1 - progress)),
          y: sy + (ey - sy) * progress
        });
      }
    }

    update() {
      if (!this.active) {
        this.timer -= 1;
        if (this.timer <= 0) this.trigger();
        return;
      }

      this.alpha -= 0.04;
      if (this.alpha <= 0) {
        this.reset();
      }
    }

    draw() {
      if (!this.active || this.segments.length < 2) return;

      ctx.save();
      ctx.globalAlpha = this.alpha * 0.3;
      ctx.strokeStyle = `${red}1)`;
      ctx.lineWidth = 8;
      ctx.shadowColor = '#e8000d';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      this.segments.slice(1).forEach((segment) => ctx.lineTo(segment.x, segment.y));
      ctx.stroke();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = `${white}0.9)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    }
  }

  class GridLine {
    constructor(vertical) {
      this.vertical = vertical;
      this.pos = Math.random() * (vertical ? width : height);
      this.speed = (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
      this.alpha = Math.random() * 0.04 + 0.01;
    }

    update() {
      this.pos += this.speed;
      if (this.vertical && (this.pos < 0 || this.pos > width)) this.speed *= -1;
      if (!this.vertical && (this.pos < 0 || this.pos > height)) this.speed *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.strokeStyle = `${red}${this.alpha})`;
      ctx.lineWidth = 1;
      if (this.vertical) {
        ctx.moveTo(this.pos, 0);
        ctx.lineTo(this.pos, height);
      } else {
        ctx.moveTo(0, this.pos);
        ctx.lineTo(width, this.pos);
      }
      ctx.stroke();
    }
  }

  const density = width < 700 ? 0.55 : 1;
  const particles = Array.from({ length: Math.floor(120 * density) }, () => new Particle());
  const embers = Array.from({ length: Math.floor(60 * density) }, () => new Ember());
  const rings = Array.from({ length: Math.floor(12 * density) }, () => new SoundRing());
  const bolts = Array.from({ length: Math.floor(4 * density) }, () => new Lightning());
  const gridLines = [
    ...Array.from({ length: 8 }, () => new GridLine(true)),
    ...Array.from({ length: 6 }, () => new GridLine(false))
  ];

  let glowX = width * 0.6;
  let glowY = height * 0.3;
  let glowVX = 0.4;
  let glowVY = 0.25;

  function frame() {
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(8,8,8,0.55)';
    ctx.fillRect(0, 0, width, height);

    glowX += glowVX;
    glowY += glowVY;
    if (glowX < width * 0.2 || glowX > width * 0.85) glowVX *= -1;
    if (glowY < height * 0.1 || glowY > height * 0.85) glowVY *= -1;

    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.45);
    glow.addColorStop(0, 'rgba(154,0,9,0.09)');
    glow.addColorStop(0.5, 'rgba(232,0,13,0.04)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    gridLines.forEach((line) => { line.update(); line.draw(); });
    rings.forEach((ring) => { ring.update(); ring.draw(); });
    particles.forEach((particle) => { particle.update(); particle.draw(); });
    embers.forEach((ember) => { ember.update(); ember.draw(); });
    bolts.forEach((bolt) => { bolt.update(); bolt.draw(); });

    requestAnimationFrame(frame);
  }

  if (reducedMotion) {
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, height);
  } else {
    frame();
  }
}());

(function setupAudio() {
  const audio = document.getElementById('site-audio');
  const disc = document.getElementById('disc');
  const playBtn = document.getElementById('play-btn');
  const waveform = document.getElementById('waveform');
  let playing = false;

  function setPlaying(state) {
    playing = state;
    playBtn.textContent = playing ? 'II' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'Pause audio' : 'Play audio');
    disc.classList.toggle('paused', !playing);
    waveform.classList.toggle('paused', !playing);
  }

  playBtn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  });

  function tryAutoplay() {
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutoplay, { once: true });
  } else {
    tryAutoplay();
  }

  window.addEventListener('load', tryAutoplay, { once: true });
}());

(function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.tab;

      tabs.forEach((item) => {
        item.classList.toggle('active', item === tab);
        item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
      });

      panels.forEach((panel) => {
        const active = panel.id === `panel-${selected}`;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });
}());

(function setupReveal() {
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealItems.forEach((item) => observer.observe(item));
}());

(function setupHeader() {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  function syncHeader() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('open');
    primaryNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    });
  });

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
}());

(function setupMissingAssetFallbacks() {
  document.querySelectorAll('img[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    });
  });
}());
