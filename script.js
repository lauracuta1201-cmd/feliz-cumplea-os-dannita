/*
  REVISIÓN: en los archivos entregados anteriormente no encontré un error que
  impidiera el clic sobre el sobre (identificadores, funciones y eventos estaban
  conectados). Para que el sobre no dependa de nada más, en esta versión:
  - El evento del sobre se registra primero y es independiente del resto.
  - Los efectos opcionales (corazones, álbum) van protegidos con try/catch.
  - Las pantallas inactivas se retiran con el atributo "hidden", para que nunca
    cubran ni bloqueen toques.
  Si el sobre sigue sin abrirse en tu equipo, abre la consola (F12) y comparte
  el mensaje de error o tus archivos actuales para revisarlos directamente.
*/

(function () {
  'use strict';

  // ===== Referencias a elementos =====
  const sobre = document.getElementById('envelope');
  const mensajeFinal = document.getElementById('final');
  const indicacion = document.getElementById('hint');
  const contenedorAccion = document.getElementById('accion');
  const botonDescubrir = document.getElementById('descubrir');
  const botonesVolver = document.querySelectorAll('.btn-volver');
  const pantallaCarta = document.getElementById('pantalla-carta');
  const pantallaAlbum = document.getElementById('pantalla-album');
  const tituloAlbum = document.getElementById('album-titulo');
  const polaroids = document.querySelectorAll('.polaroid');

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Duración del fundido entre pantallas (debe coincidir con --duracion-pantalla en styles.css)
  const DURACION = 800;

  let abierto = false;          // sobre abierto
  let albumAbierto = false;     // pantalla del álbum visible
  let transicionando = false;   // evita clics repetidos durante un cambio de pantalla
  let observador = null;        // controla la aparición de las Polaroids

  // ===== Abrir el sobre =====
  function abrirSobre() {
    if (abierto) return;
    abierto = true;

    // 1) Animación original de apertura (solapa y carta)
    sobre.classList.add('abierto');
    sobre.setAttribute('aria-expanded', 'true');
    sobre.setAttribute('aria-label', 'Sobre abierto');
    if (indicacion) indicacion.classList.add('oculto');

    // 2) Mensaje final y botón «Descúbrelo» cuando termina la animación
    const espera = reducirMovimiento.matches ? 50 : 1700;
    setTimeout(() => {
      if (mensajeFinal) mensajeFinal.classList.add('visible');
      if (botonDescubrir) botonDescubrir.hidden = false;
      if (contenedorAccion) contenedorAccion.classList.add('visible');
    }, espera);

    // 3) Corazones decorativos (opcional: si fallan, no afectan a lo anterior)
    if (!reducirMovimiento.matches) {
      try { lanzarCorazones(); } catch (e) { /* efecto decorativo, se ignora */ }
    }
  }

  // ===== Corazones decorativos al abrir =====
  function lanzarCorazones() {
    const caja = sobre.getBoundingClientRect();
    const simbolos = ['♡', '♥', '✦', '✿'];
    const total = 14;

    for (let i = 0; i < total; i++) {
      const p = document.createElement('span');
      p.className = 'confeti';
      p.setAttribute('aria-hidden', 'true');
      p.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
      p.style.left = (caja.left + caja.width / 2) + 'px';
      p.style.top = (caja.top + caja.height / 2) + 'px';
      p.style.fontSize = (14 + Math.random() * 16) + 'px';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * caja.width * 1.3) + 'px');
      p.style.setProperty('--dy', (-60 - Math.random() * 160) + 'px');
      p.style.setProperty('--rot', ((Math.random() - 0.5) * 120) + 'deg');
      p.style.animationDelay = (Math.random() * 0.35) + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2400);
    }
  }

  // ===== Eventos del sobre: clic, toque y teclado =====
  if (sobre) {
    sobre.addEventListener('click', abrirSobre);

    sobre.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        abrirSobre();
      }
    });
  }

  // ===== Fotos que no existen: mostrar marcador de posición =====
  document.querySelectorAll('.foto img').forEach((img) => {
    const marcarSinFoto = () => {
      const marco = img.closest('.foto');
      if (marco) marco.classList.add('sin-foto');
    };
    img.addEventListener('error', marcarSinFoto);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) marcarSinFoto();
  });

  // ===== Utilidades para cambiar de pantalla =====
  function ocultarPantalla(pantalla) {
    pantalla.classList.add('oculta');   // inicia el fundido de salida
    pantalla.inert = true;
    pantalla.setAttribute('aria-hidden', 'true');
  }

  function retirarPantalla(pantalla) {
    pantalla.hidden = true;             // deja de ocupar espacio y de recibir toques
  }

  function mostrarPantalla(pantalla) {
    pantalla.hidden = false;
    pantalla.inert = false;
    pantalla.removeAttribute('aria-hidden');
    void pantalla.offsetWidth;          // fuerza el cálculo de estilos para que el fundido se anime
    pantalla.classList.remove('oculta'); // inicia el fundido de entrada
  }

  // Ejecuta una acción cuando termina el fundido de salida
  function alTerminarFundido(accion) {
    setTimeout(accion, reducirMovimiento.matches ? 0 : DURACION);
  }

  // ===== Aparición de las Polaroids, una por una =====
  function revelarPolaroids() {
    // Reducción de movimiento: se muestran todas de inmediato
    if (reducirMovimiento.matches) {
      polaroids.forEach((p) => p.classList.add('visible'));
      return;
    }

    // Navegadores sin IntersectionObserver: aparecen en secuencia
    if (!('IntersectionObserver' in window)) {
      polaroids.forEach((p, i) => {
        setTimeout(() => p.classList.add('visible'), 600 + i * 450);
      });
      return;
    }

    // Cada Polaroid aparece al entrar en la pantalla del álbum, con un retraso entre ellas
    let primerLote = true;
    observador = new IntersectionObserver((entradas) => {
      const retrasoInicial = primerLote ? 600 : 0;
      primerLote = false;

      entradas
        .filter((e) => e.isIntersecting)
        .sort((a, b) =>
          (a.boundingClientRect.top - b.boundingClientRect.top) ||
          (a.boundingClientRect.left - b.boundingClientRect.left))
        .forEach((entrada, i) => {
          if (observador) observador.unobserve(entrada.target);
          setTimeout(() => entrada.target.classList.add('visible'), retrasoInicial + i * 420);
        });
    }, { root: pantallaAlbum, threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    polaroids.forEach((p) => observador.observe(p));
  }

  // ===== Dejar el álbum listo para la próxima vez =====
  function reiniciarAlbum() {
    if (observador) {
      observador.disconnect();
      observador = null;
    }
    polaroids.forEach((p) => p.classList.remove('visible'));
    pantallaAlbum.classList.remove('activa');
    pantallaAlbum.scrollTop = 0;
  }

  // ===== Carta → Álbum (fade out de la carta, luego fade in del álbum) =====
  function abrirAlbum() {
    if (transicionando || albumAbierto || !pantallaCarta || !pantallaAlbum) return;
    transicionando = true;

    botonDescubrir.setAttribute('aria-expanded', 'true');
    ocultarPantalla(pantallaCarta);

    alTerminarFundido(() => {
      retirarPantalla(pantallaCarta);

      mostrarPantalla(pantallaAlbum);
      pantallaAlbum.scrollTop = 0;
      pantallaAlbum.classList.add('activa');
      albumAbierto = true;

      if (tituloAlbum) tituloAlbum.focus({ preventScroll: true });
      revelarPolaroids();
      transicionando = false;
    });
  }

  // ===== Álbum → Carta (transición inversa) =====
  function volverACarta() {
    if (transicionando || !albumAbierto) return;
    transicionando = true;

    ocultarPantalla(pantallaAlbum);

    alTerminarFundido(() => {
      retirarPantalla(pantallaAlbum);
      reiniciarAlbum();
      albumAbierto = false;

      mostrarPantalla(pantallaCarta);
      botonDescubrir.setAttribute('aria-expanded', 'false');
      botonDescubrir.focus({ preventScroll: true });
      transicionando = false;
    });
  }

  // ===== Eventos de los botones =====
  if (botonDescubrir) botonDescubrir.addEventListener('click', abrirAlbum);
  botonesVolver.forEach((b) => b.addEventListener('click', volverACarta));

  // Tecla Escape: volver a la carta desde el álbum
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && albumAbierto) volverACarta();
  });
})();