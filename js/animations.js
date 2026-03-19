/* =========================================================
   Next Gen Innovations Nepal — animations.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── TYPED TEXT EFFECT ──────────────────────────────── */
  const typedEl = document.getElementById('typedText');
  if (typedEl) {
    const texts = [
      'FinTech Solutions',
      'IT Services',
      'AI & Research',
      'Digital Banking',
      'Cloud Platforms',
      'Custom Software'
    ];
    let ti = 0, ci = 0, isDeleting = false;

    function type() {
      const current = texts[ti];
      if (isDeleting) {
        typedEl.textContent = current.substring(0, ci - 1);
        ci--;
      } else {
        typedEl.textContent = current.substring(0, ci + 1);
        ci++;
      }

      let delay = isDeleting ? 60 : 100;

      if (!isDeleting && ci === current.length) {
        delay = 1800;
        isDeleting = true;
      } else if (isDeleting && ci === 0) {
        isDeleting = false;
        ti = (ti + 1) % texts.length;
        delay = 400;
      }

      setTimeout(type, delay);
    }
    setTimeout(type, 800);
  }

  /* ── FLOATING CARDS (hero right-side cards) ─────────── */
  // Nothing extra needed — CSS handles float keyframe

  /* ── PARTICLE CANVAS (subtle, performance-safe) ─────── */
  const canvas = document.getElementById('heroParticles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x   = Math.random() * W;
        this.y   = Math.random() * H;
        this.r   = Math.random() * 2.5 + 0.5;
        this.vx  = (Math.random() - 0.5) * 0.4;
        this.vy  = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.5
          ? 'rgba(26,52,138,' + this.alpha + ')'
          : 'rgba(0,201,177,' + this.alpha + ')';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function init() {
      resize();
      const count = Math.min(Math.floor((W * H) / 12000), 80);
      particles = Array.from({ length: count }, () => new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }

    init();
    animate();
    window.addEventListener('resize', init);
  }

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  window.initializeScrollAnimations = function() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });
  };

  /* ── STAGGER CHILDREN ────────────────────────────────── */
  window.initializeStagger = function() {
    document.querySelectorAll('[data-stagger]').forEach(parent => {
      const delay = parseFloat(parent.dataset.stagger) || 0.1;
      parent.children && Array.from(parent.children).forEach((child, i) => {
        child.style.animationDelay = (i * delay) + 's';
      });
    });
  };

  initializeScrollAnimations();
  initializeStagger();
});
