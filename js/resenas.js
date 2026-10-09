/* ============================================================================
   Carrusel de reseñas de Google — Raptor Marketer   (skill: carrusel-resenas-raptor)
   Componente AUTOCONTENIDO (sin dependencias). Se copia al sitio: js/resenas.js  (<script src defer>).

   Busca  <div class="rev-car" data-resenas="URL del Worker" data-maps="URL de la ficha en Google Maps">
   y, cuando la seccion se acerca a la pantalla, pide el JSON al Worker `raptor-resenas`
   (https://resenas.agconsultorweb.com/v1/<slug>.json), pinta las tarjetas con textContent (NUNCA innerHTML)
   y mantiene al dia las cifras marcadas con data-res (prom, total, stars, todas5, aside5).

   SOLO el comentario de la reseña: NUNCA la respuesta del propietario (estándar de Raptor, Alberto 2026-10-07).
   Condiciones de Google (confirmadas por escrito, 2026-10-05): SIN fotos de resenistas · sin modificar ni filtrar
   · atribucion «Reseña en Google» + enlace a la ficha en Maps (data-maps) · los datos caducan solos (Worker, 25 dias).

   Atributos opcionales en .rev-car:  data-max="40" (tarjetas mostradas)  data-intervalo="4200" (ms)  data-autoplay="off"
   Idioma: usa <html lang>; «en*» => ingles, cualquier otro => español. Para otro idioma, añade su bloque a TXT.
   Avance automatico accesible (WCAG 2.2.2): pausa con mouse, foco, toque/flechas, fuera de pantalla, pestaña oculta,
   boton de pausa; con «reducir movimiento» NO avanza solo.
   ============================================================================ */
(function () {
  'use strict';

  var TXT = {
    es: {
      meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      fuente: 'Reseña en Google', mas: 'Leer más', menos: 'Leer menos', propietario: 'Respuesta del propietario',
      estrellas: function (n) { return n + ' de 5 estrellas'; },
      cuenta: function (mostradas, n) { return (mostradas < n ? 'Las ' + mostradas + ' más recientes de ' + n + ' reseñas con comentario' : n + ' reseñas con comentario') + ' · '; },
      verTodas: 'ver todas en Google Maps', pausar: 'Pausar el avance automático', reanudar: 'Reanudar el avance automático',
      anteriores: 'Reseñas anteriores', siguientes: 'Más reseñas', todas5: ', todas de 5 estrellas', aside5: ['Todas de 5 estrellas: f', 'F'],
      fallo: 'No pudimos cargar las reseñas en este momento. ', leerGoogle: 'Léelas en Google Maps', usuario: 'Usuario de Google'
    },
    en: {
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      fuente: 'Google review', mas: 'Read more', menos: 'Read less', propietario: 'Response from the owner',
      estrellas: function (n) { return n + ' out of 5 stars'; },
      cuenta: function (mostradas, n) { return (mostradas < n ? 'The ' + mostradas + ' most recent of ' + n + ' reviews with comments' : n + ' reviews with comments') + ' · '; },
      verTodas: 'see all on Google Maps', pausar: 'Pause automatic scrolling', reanudar: 'Resume automatic scrolling',
      anteriores: 'Previous reviews', siguientes: 'More reviews', todas5: ', all 5 stars', aside5: ['All 5 stars: ', ''],
      fallo: 'We could not load the reviews right now. ', leerGoogle: 'Read them on Google Maps', usuario: 'Google user'
    }
  };
  var lang = ((document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0) ? 'en' : 'es';
  var t = TXT[lang];
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function lineas(texto, destino) {
    String(texto).split('\n').filter(function (l) { return l.trim(); }).forEach(function (l, i) {
      if (i) destino.appendChild(document.createElement('br'));
      destino.appendChild(document.createTextNode(l.trim()));
    });
  }

  // Cifras visibles (promedio, total, «todas de 5 estrellas»): se mantienen al dia con lo que dice la ficha
  function aplicarResumen(d) {
    function set(k, fn) { document.querySelectorAll('[data-res="' + k + '"]').forEach(fn); }
    var prom = Number(d.promedio);
    if (isFinite(prom)) {
      var n = Math.max(0, Math.min(5, Math.round(prom)));
      set('prom', function (e) { e.textContent = prom.toFixed(1); });
      set('stars', function (e) {
        e.textContent = '★'.repeat(n) + '☆'.repeat(5 - n);
        if (e.hasAttribute('aria-label')) e.setAttribute('aria-label', t.estrellas(prom.toFixed(1)));
      });
    }
    if (d.total != null) set('total', function (e) { e.textContent = String(d.total); });
    set('todas5', function (e) { e.textContent = d.todas_5 ? t.todas5 : ''; });
    set('aside5', function (e) { e.textContent = d.todas_5 ? t.aside5[0] : t.aside5[1]; });
  }

  function crearTarjeta(r, destacada) {
    var texto = String(r.texto || '');
    var card = el('figure', 'rev' + (destacada ? ' hl' : '') + (texto.length > 120 ? ' long' : ''));
    var nombre = String(r.nombre || t.usuario);
    var av = el('span', 'av');
    av.setAttribute('aria-hidden', 'true');
    var letra = (nombre.match(/[A-Za-zÀ-ÿ]/) || ['G'])[0].toUpperCase();   // SIN foto del resenista (condicion de Google)
    av.appendChild(el('b', '', letra));
    var quien = el('span');
    quien.appendChild(el('b', '', nombre));
    var partes = String(r.fecha || '').split('-');
    var mes = t.meses[Number(partes[1]) - 1];
    quien.appendChild(el('span', '', (mes ? mes + ' ' + partes[0] + ' · ' : '') + t.fuente));
    var cap = el('figcaption');
    cap.appendChild(av); cap.appendChild(quien);
    var est = Math.max(0, Math.min(5, Number(r.estrellas) || 0));
    var gs = el('span', 'gs');
    gs.setAttribute('role', 'img');
    gs.setAttribute('aria-label', t.estrellas(est));
    gs.style.setProperty('--n', est);
    var bq = el('blockquote');
    var p = el('p');
    p.appendChild(document.createTextNode('«'));
    lineas(texto, p);
    p.appendChild(document.createTextNode('»'));
    bq.appendChild(p);
    card.appendChild(cap); card.appendChild(gs); card.appendChild(bq);
    return card;
  }

  function fallo(car) {
    var track = car.querySelector('.rev-track');
    var nav = car.querySelector('.rev-nav');
    if (nav) nav.hidden = true;
    if (track) {
      var p = el('p', 'rev-empty', t.fallo);
      var a = el('a', '', t.leerGoogle);
      a.href = car.getAttribute('data-maps') || '#'; a.target = '_blank'; a.rel = 'noopener';
      p.appendChild(a); p.appendChild(document.createTextNode('.'));
      while (track.firstChild) track.removeChild(track.firstChild);
      track.appendChild(p);
      track.removeAttribute('aria-busy'); track.removeAttribute('tabindex');
    }
  }

  function cargar(car) {
    fetch(car.getAttribute('data-resenas'), { credentials: 'omit', mode: 'cors' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (d) {
        if (!d || !Array.isArray(d.resenas) || !d.resenas.length) throw new Error('sin reseñas');
        var max = Number(car.getAttribute('data-max')) || 40;
        var lista = d.resenas.slice(0, max);
        var track = car.querySelector('.rev-track');
        while (track.firstChild) track.removeChild(track.firstChild);
        lista.forEach(function (r, i) { track.appendChild(crearTarjeta(r, i === 0 && String(r.texto || '').length <= 140)); });
        track.removeAttribute('aria-busy');
        var cuenta = car.querySelector('.rev-count');
        if (cuenta) {
          var n = d.con_texto || d.resenas.length;
          cuenta.textContent = t.cuenta(lista.length, n);
          var a = el('a', '', t.verTodas);
          a.href = car.getAttribute('data-maps') || d.maps || '#'; a.target = '_blank'; a.rel = 'noopener';
          cuenta.appendChild(a);
        }
        aplicarResumen(d);
        montar(car);
      })
      .catch(function () { fallo(car); });
  }

  function montar(car) {
    var track = car.querySelector('.rev-track');
    var prev = car.querySelector('.rev-btn[data-dir="-1"]');
    var next = car.querySelector('.rev-btn[data-dir="1"]');
    var pausaBtn = car.querySelector('.rev-pause');
    if (prev) prev.setAttribute('aria-label', t.anteriores);
    if (next) next.setAttribute('aria-label', t.siguientes);
    function paso() {
      var c = track.querySelector('.rev');
      return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth * 0.8;
    }
    function alFinal() { return track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; }
    function estado() {
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = alFinal();
    }

    // --- avance automatico ---
    var INTERVALO = Number(car.getAttribute('data-intervalo')) || 4200;
    var timer = null, pausadoPorUsuario = false, dentro = false, visible = false, tocado = false, pausaTmp = null;
    var autoplay = car.getAttribute('data-autoplay') !== 'off';
    function debeCorrer() { return autoplay && !RM && !pausadoPorUsuario && !dentro && !tocado && visible && !document.hidden; }
    function programar() {
      clearTimeout(timer);
      if (!debeCorrer()) return;
      timer = setTimeout(function () {
        if (alFinal()) track.scrollTo({ left: 0, behavior: 'smooth' });
        else track.scrollBy({ left: paso(), behavior: 'smooth' });
        programar();
      }, INTERVALO);
    }
    function pausaTemporal(ms) {
      tocado = true; clearTimeout(timer); clearTimeout(pausaTmp);
      pausaTmp = setTimeout(function () { tocado = false; programar(); }, ms);
    }

    [prev, next].forEach(function (b) {
      if (!b) return;
      b.addEventListener('click', function () {
        pausaTemporal(8000);
        track.scrollBy({ left: Number(b.getAttribute('data-dir')) * paso() * (window.innerWidth > 640 ? 2 : 1), behavior: RM ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', function () { requestAnimationFrame(estado); }, { passive: true });
    window.addEventListener('resize', estado);
    estado();

    if (pausaBtn) {
      pausaBtn.disabled = false;
      pausaBtn.setAttribute('aria-label', t.pausar);
      if (RM || !autoplay) pausaBtn.hidden = true;
      pausaBtn.addEventListener('click', function () {
        pausadoPorUsuario = !pausadoPorUsuario;
        pausaBtn.classList.toggle('pausado', pausadoPorUsuario);
        pausaBtn.setAttribute('aria-label', pausadoPorUsuario ? t.reanudar : t.pausar);
        programar();
      });
    }
    car.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { dentro = true; clearTimeout(timer); } });
    car.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { dentro = false; programar(); } });
    car.addEventListener('focusin', function () { dentro = true; clearTimeout(timer); });
    car.addEventListener('focusout', function () { dentro = false; programar(); });
    track.addEventListener('touchstart', function () { pausaTemporal(8000); }, { passive: true });
    document.addEventListener('visibilitychange', programar);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; programar(); }, { threshold: 0.35 }).observe(car);
    }

    // «Leer más» solo donde el texto realmente se corta
    track.querySelectorAll('.rev.long').forEach(function (card) {
      var p = card.querySelector('blockquote p');
      if (!p || p.scrollHeight <= p.clientHeight + 1) { card.classList.remove('long'); return; }
      var b = el('button', 'rev-more', t.mas);
      b.type = 'button'; b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () {
        var abierto = card.classList.toggle('open');
        b.textContent = abierto ? t.menos : t.mas;
        b.setAttribute('aria-expanded', String(abierto));
        if (abierto) pausaTemporal(15000);
      });
      card.querySelector('blockquote').insertAdjacentElement('afterend', b);
    });
  }

  // Pide las reseñas solo cuando la seccion se acerca a la pantalla
  function init() {
    document.querySelectorAll('.rev-car[data-resenas]').forEach(function (car) {
      if (car.__rvIniciado) return;
      car.__rvIniciado = true;
      var pedido = false;
      function pedir() { if (pedido) return; pedido = true; cargar(car); }
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { pedir(); io.disconnect(); } }, { rootMargin: '700px' });
        io.observe(car);
      } else pedir();
    });
  }

  window.RaptorResenas = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
