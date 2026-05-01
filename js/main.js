// ==========================================================================
// MARISCOS MUELLE 27 — main.js
// Interactividad: header scroll, menú móvil, fill-text, reveal, modales,
// tracking GTM de conversiones.
// ==========================================================================

const CONFIG = {
  name: 'Mariscos Muelle 27',
  phone: '+524428085907',
  phoneDisplay: '442 808 5907',
  whatsapp: '524428085907',
  address: 'Jardín de Alcatraz s/n, Jardines del Cimatario, Querétaro',
  hours: 'Martes a Domingo, 9:00 – 18:00',
  gbpPlaceId: '0x85d34500183f1ca5:0xcad72d3045025a19',
  geo: { lat: 20.5466963, lng: -100.3859008 }
};

/* ================= Header scroll ================= */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const threshold = 80;
  const toggle = () => {
    if (window.scrollY > threshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* ================= Menú móvil ================= */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-primary');
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.hamburger').textContent = '☰';
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    nav.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.hamburger').textContent = '✕';
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });
}

/* ================= Fill text (palabras que se "encienden") ================= */
function initTextFill() {
  const containers = document.querySelectorAll('.fill-text');
  if (!containers.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  containers.forEach((el) => {
    // Wrappea cada palabra respetando los elementos hijos (ej. <em>, <span>)
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.nodeValue
          .split(/(\s+)/)
          .forEach((part) => {
            if (part.trim()) {
              const span = document.createElement('span');
              span.className = 'fill-word';
              if (node.parentElement.classList.contains('is-accent-parent')) {
                span.classList.add('is-accent');
              }
              span.textContent = part;
              frag.appendChild(span);
            } else {
              frag.appendChild(document.createTextNode(part));
            }
          });
        node.replaceWith(frag);
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        !node.classList.contains('fill-word')
      ) {
        [...node.childNodes].forEach(walk);
      }
    };

    [...el.childNodes].forEach(walk);
  });

  if (reduced) {
    document.querySelectorAll('.fill-word').forEach((w) => w.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sibs = [...entry.target.parentElement.querySelectorAll('.fill-word')];
        const idx = sibs.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 90);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  document.querySelectorAll('.fill-word').forEach((w) => obs.observe(w));
}

/* ================= Reveal on scroll (fade IN al entrar, una sola vez) ================= */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  els.forEach((el) => obs.observe(el));
}

/* ================= Fade Cycle (fade IN al entrar Y fade OUT al salir) =================
   Para títulos y elementos que se "respiren" cada vez que se vuelve a scrollear sobre ellos. */
function initFadeCycle() {
  const els = document.querySelectorAll('.fade-cycle');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  els.forEach((el) => obs.observe(el));
}

/* ================= Modales (WhatsApp + Llamada) ================= */
function initModals() {
  const waModal = document.getElementById('wa-modal');
  const callModal = document.getElementById('call-modal');

  const open = (modal) => {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const firstFocusable = modal.querySelector('input, button, select, a');
    if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
  };

  const close = (modal) => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  // WhatsApp
  if (waModal) {
    document
      .querySelectorAll('[data-open="wa"]')
      .forEach((btn) =>
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          open(waModal);
        })
      );

    waModal.addEventListener('click', (e) => {
      if (e.target === waModal) close(waModal);
    });

    waModal
      .querySelector('.modal-close')
      ?.addEventListener('click', () => close(waModal));

    const form = waModal.querySelector('#wa-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#wa-name').value.trim();
      const service = form.querySelector('#wa-service').value;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'whatsapp_click',
        lead_name: name,
        lead_service: service
      });
      window.dataLayer.push({
        event: 'user_data_capture',
        user_data: { address: { first_name: name } }
      });

      const msg = `Hola, soy ${name}. Me interesa: ${service}.`;
      window.open(
        `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`,
        '_blank',
        'noopener'
      );
      close(waModal);
      form.reset();
    });
  }

  // Llamada
  if (callModal) {
    document
      .querySelectorAll('[data-open="call"], a[href^="tel:"]')
      .forEach((btn) =>
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          open(callModal);
        })
      );

    callModal.addEventListener('click', (e) => {
      if (e.target === callModal) close(callModal);
    });

    callModal
      .querySelector('#cancel-call-btn')
      ?.addEventListener('click', () => close(callModal));

    callModal
      .querySelector('#confirm-call-btn')
      ?.addEventListener('click', () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'call_click',
          destination_number: CONFIG.phone
        });
        window.location.href = 'tel:' + CONFIG.phone;
        close(callModal);
      });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (waModal?.classList.contains('is-open')) close(waModal);
    if (callModal?.classList.contains('is-open')) close(callModal);
  });
}

/* ================= Tilt 3D (data-tilt) ================= */
function initTilt() {
  const els = document.querySelectorAll('[data-tilt]');
  if (!els.length) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const max = 8; // grados máximos

  els.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform =
        `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(1.025)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ================= Cursor personalizado (tinta de bitácora) ================= */
function initCustomCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const halo = document.createElement('div');
  halo.className = 'cursor-halo';

  document.body.appendChild(dot);
  document.body.appendChild(halo);
  document.body.classList.add('has-custom-cursor');

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let hx = mx;
  let hy = my;

  const ctaSelector =
    '.btn-primary, .btn-secondary, .btn-ghost, .btn-confirm, .btn-submit, .nav-cta, ' +
    '.floating-wa-btn, .floating-call-btn';

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  function lerp() {
    hx += (mx - hx) * 0.18;
    hy += (my - hy) * 0.18;
    halo.style.transform = `translate(${hx}px, ${hy}px) translate(-50%, -50%)`;
    requestAnimationFrame(lerp);
  }
  lerp();

  document.querySelectorAll('a, button, [role="button"], summary, label').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const isCta = el.matches(ctaSelector);
      dot.classList.toggle('is-cta', isCta);
      dot.classList.toggle('is-link', !isCta);
      halo.classList.toggle('is-cta', isCta);
      halo.classList.toggle('is-link', !isCta);
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('is-link', 'is-cta');
      halo.classList.remove('is-link', 'is-cta');
    });
  });

  document.addEventListener('mouseleave', () => {
    dot.classList.add('is-hidden');
    halo.classList.add('is-hidden');
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('is-hidden');
    halo.classList.remove('is-hidden');
  });
}

/* ================= Magnetic buttons (data-magnetic) ================= */
function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = document.querySelectorAll('[data-magnetic]');
  if (!els.length) return;

  const strength = 10; // px máximos de desplazamiento

  els.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const max = Math.max(rect.width, rect.height);
      el.style.transform = `translate(${(x / max) * strength}px, ${(y / max) * strength}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ================= Click Ripple ================= */
function initRipple() {
  const sel = '.btn-primary, .btn-confirm, .btn-submit, .cta-final .btn-secondary';

  document.addEventListener('click', (e) => {
    const btn = e.target.closest(sel);
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

/* ================= Init ================= */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initTextFill();
  initReveal();
  initFadeCycle();
  initModals();
  initTilt();
  initCustomCursor();
  initMagnetic();
  initRipple();
});
