/*
  ESTRUCTURA DEL PROYECTO (una sola página con cuatro pantallas que se cambian con fundido):
  1) Carta:    portada, sobre y carta.
  2) Álbum:    fotografías en marcos Polaroid.
  3) Libro:    libro de recuerdos (se abre desde el botón «Abrir nuestro libro» del álbum).
  4) Cinta VHS: última sorpresa (se abre desde «Ver mi última sorpresa ♡», al final del libro).
  Las pantallas inactivas se retiran con el atributo "hidden" para que nunca
  cubran ni bloqueen toques.
*/

(function () {
  'use strict';

  // ===== Referencias a elementos: carta y álbum =====
  const sobre = document.getElementById('envelope');
  const mensajeFinal = document.getElementById('final');
  const indicacion = document.getElementById('hint');
  const contenedorAccion = document.getElementById('accion');
  const botonDescubrir = document.getElementById('descubrir');
  const botonesVolver = document.querySelectorAll('#pantalla-album .btn-volver');
  const pantallaCarta = document.getElementById('pantalla-carta');
  const pantallaAlbum = document.getElementById('pantalla-album');
  const tituloAlbum = document.getElementById('album-titulo');
  const polaroids = document.querySelectorAll('.polaroid');

  // ===== Referencias a elementos: libro =====
  const botonLibro = document.getElementById('abrir-libro');
  const pantallaLibro = document.getElementById('pantalla-libro');
  const libroPantalla = document.getElementById('libro-pantalla');
  const tituloLibro = document.getElementById('libro-titulo-sr');
  const botonVolverAlbum = document.getElementById('volver-album');
  const escenaLibro = document.getElementById('libro-escena');
  const libro = document.getElementById('libro');
  const libroPaginas = document.getElementById('libro-paginas');
  const libroPortada = document.getElementById('libro-portada');
  const botonAnterior = document.getElementById('pag-anterior');
  const botonSiguiente = document.getElementById('pag-siguiente');
  const indicador = document.getElementById('libro-indicador');
  const libroFinal = document.getElementById('libro-final');
  const botonUltima = document.getElementById('ver-ultima');
  const paginasLibro = libroPaginas ? Array.from(libroPaginas.querySelectorAll('.pagina')) : [];

  // ===== Referencias a elementos: última sorpresa (VHS) =====
  const pantallaVHS = document.getElementById('pantalla-vhs');
  const vhs = document.getElementById('vhs');
  const tituloVHS = document.getElementById('vhs-titulo-sr');
  const botonVolverLibro = document.getElementById('volver-libro');
  const vhsFrase = document.getElementById('vhs-frase');
  const vhsContinuar = document.getElementById('vhs-continuar');
  const vhsCinta = document.getElementById('vhs-cinta');
  const vhsReproductor = document.getElementById('vhs-reproductor');
  const vhsPantalla = document.getElementById('vhs-pantalla');
  const vhsVideo = document.getElementById('vhs-video');
  const vhsPlay = document.getElementById('vhs-play');
  const vhsRepetir = document.getElementById('vhs-repetir');
  const vhsAviso = document.getElementById('vhs-aviso');

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Mismo criterio que el CSS: en computador el libro muestra dos páginas a la vez
  const consultaDoble = window.matchMedia('(min-width: 860px) and (min-height: 560px)');

  // Duración del fundido entre pantallas (debe coincidir con --duracion-pantalla en styles.css)
  const DURACION = 800;

  // Tiempos de la transición de la cinta VHS (milisegundos)
  const VHS_CUBRIR = 1450;   // la cinta termina de cubrir la pantalla
  const VHS_PAUSA = 700;     // breve pausa con el texto «PLAY»
  const VHS_REVELAR = 1450;  // la cinta se retira y descubre la siguiente escena

  let abierto = false;          // sobre abierto
  let albumAbierto = false;     // pantalla del álbum visible
  let libroVisible = false;     // pantalla del libro visible
  let libroAbierto = false;     // libro con la portada abierta
  let vhsVisible = false;       // pantalla de la cinta VHS visible
  let transicionando = false;   // evita clics repetidos durante un cambio de pantalla
  let observador = null;        // controla la aparición de las Polaroids
  let posicionAlbum = 0;        // posición del desplazamiento del álbum al ir al libro
  let posicionLibro = 0;        // posición del desplazamiento del libro al ir a la cinta
  let paginaInicial = 0;        // índice de la primera página visible del libro
  let cambiandoPagina = false;  // evita pasar de página mientras se anima

  let vhsTransicionHecha = false; // la transición de la cinta ocurre una sola vez por visita
  let vhsListo = false;           // la portada de la cinta ya es visible
  let vhsTemporizadores = [];     // temporizadores pendientes de la pantalla VHS
  let vhsPalabras = 0;            // número de palabras de la frase

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

  // ===== Fotos que no existen: mostrar marcador de posición (álbum y libro) =====
  document.querySelectorAll('.foto img, .foto-libro img').forEach((img) => {
    const marcarSinFoto = () => {
      const marco = img.closest('.foto, .foto-libro');
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
    if (transicionando || albumAbierto || libroVisible || vhsVisible || !pantallaCarta || !pantallaAlbum) return;
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

  // ===================== LIBRO DE RECUERDOS =====================

  // Número de páginas que se ven a la vez (2 en computador, 1 en celular)
  function paginasPorVista() {
    return consultaDoble.matches ? 2 : 1;
  }

  // Numerar las páginas automáticamente
  paginasLibro.forEach((pagina, i) => {
    pagina.dataset.num = String(i + 1);
  });

  // Mostrar la(s) página(s) actual(es) y actualizar indicador y botones
  function pintarVista() {
    if (!paginasLibro.length) return;

    const n = paginasPorVista();
    const total = paginasLibro.length;
    const fin = Math.min(paginaInicial + n, total);

    const teniaFocoSiguiente = document.activeElement === botonSiguiente;
    const teniaFocoAnterior = document.activeElement === botonAnterior;

    paginasLibro.forEach((pagina, i) => {
      pagina.classList.toggle('activa', i >= paginaInicial && i < fin);
    });

    indicador.textContent = (fin - paginaInicial > 1)
      ? (paginaInicial + 1) + '–' + fin + ' / ' + total
      : (paginaInicial + 1) + ' / ' + total;

    botonAnterior.disabled = paginaInicial <= 0;
    botonSiguiente.disabled = paginaInicial + n >= total;

    // Al llegar a la última página, aparece el botón hacia la última sorpresa
    if (libroAbierto && libroFinal && paginaInicial + n >= total) {
      libroFinal.classList.add('visible');
    }

    // Si el botón con foco quedó desactivado, pasar el foco al otro botón
    if (teniaFocoSiguiente && botonSiguiente.disabled) botonAnterior.focus({ preventScroll: true });
    if (teniaFocoAnterior && botonAnterior.disabled) botonSiguiente.focus({ preventScroll: true });
  }

  // Pasar de página con un fundido suave
  function cambiarVista(nuevaInicial, direccion) {
    if (!libroAbierto || cambiandoPagina) return;
    if (nuevaInicial < 0 || nuevaInicial >= paginasLibro.length) return;

    cambiandoPagina = true;
    const espera = reducirMovimiento.matches ? 0 : 260;

    // Salida: la página se desvanece y se desplaza un poco
    libroPaginas.style.setProperty('--desp', (direccion > 0 ? -16 : 16) + 'px');
    libroPaginas.classList.add('cambiando');

    setTimeout(() => {
      paginaInicial = nuevaInicial;
      pintarVista();

      // Preparar la entrada desde el lado contrario, sin animar el salto
      libroPaginas.classList.add('sin-transicion');
      libroPaginas.style.setProperty('--desp', (direccion > 0 ? 16 : -16) + 'px');
      void libroPaginas.offsetWidth;
      libroPaginas.classList.remove('sin-transicion');

      // Entrada: la nueva página aparece suavemente
      libroPaginas.classList.remove('cambiando');
      setTimeout(() => { cambiandoPagina = false; }, espera);
    }, espera);
  }

  function paginaSiguiente() {
    cambiarVista(paginaInicial + paginasPorVista(), 1);
  }

  function paginaAnterior() {
    cambiarVista(paginaInicial - paginasPorVista(), -1);
  }

  // Abrir la portada del libro
  function abrirPortadaLibro() {
    if (!libroVisible || libroAbierto) return;
    libroAbierto = true;

    pintarVista();
    libro.classList.add('abierto');
    libroPantalla.classList.add('libro-abierto');
    libroPortada.setAttribute('aria-expanded', 'true');

    // Llevar el foco a los controles cuando ya son visibles
    setTimeout(() => {
      if (libroVisible && libroAbierto) botonSiguiente.focus({ preventScroll: true });
    }, reducirMovimiento.matches ? 60 : 1300);
  }

  // Dejar el libro cerrado y en la primera página para la próxima vez
  function reiniciarLibro() {
    libro.classList.remove('abierto');
    libroPantalla.classList.remove('libro-abierto');
    libroPortada.setAttribute('aria-expanded', 'false');
    libroPaginas.classList.remove('cambiando');
    libroPaginas.classList.remove('sin-transicion');
    if (libroFinal) libroFinal.classList.remove('visible');
    if (botonUltima) botonUltima.setAttribute('aria-expanded', 'false');
    libroAbierto = false;
    cambiandoPagina = false;
    paginaInicial = 0;
    pintarVista();
  }

  // Si cambia entre celular y computador (o se gira la pantalla), mantener la página actual
  function alCambiarModo() {
    const n = paginasPorVista();
    paginaInicial = Math.floor(paginaInicial / n) * n;
    pintarVista();
  }
  if (consultaDoble.addEventListener) {
    consultaDoble.addEventListener('change', alCambiarModo);
  } else if (consultaDoble.addListener) {
    consultaDoble.addListener(alCambiarModo);
  }

  // ===== Álbum → Libro (fade out del álbum, luego fade in del libro) =====
  function abrirLibro() {
    if (transicionando || !albumAbierto || !pantallaLibro) return;
    transicionando = true;

    posicionAlbum = pantallaAlbum.scrollTop; // recordar dónde estaba el álbum
    botonLibro.setAttribute('aria-expanded', 'true');
    ocultarPantalla(pantallaAlbum);

    alTerminarFundido(() => {
      retirarPantalla(pantallaAlbum);
      albumAbierto = false;

      reiniciarLibro();
      mostrarPantalla(pantallaLibro);
      pantallaLibro.scrollTop = 0;
      libroVisible = true;

      if (tituloLibro) tituloLibro.focus({ preventScroll: true });
      transicionando = false;
    });
  }

  // ===== Libro → Álbum (transición inversa; el álbum se conserva completo) =====
  function volverAlAlbum() {
    if (transicionando || !libroVisible) return;
    transicionando = true;

    ocultarPantalla(pantallaLibro);

    alTerminarFundido(() => {
      retirarPantalla(pantallaLibro);
      reiniciarLibro();
      libroVisible = false;

      mostrarPantalla(pantallaAlbum);
      pantallaAlbum.scrollTop = posicionAlbum;
      albumAbierto = true;

      botonLibro.setAttribute('aria-expanded', 'false');
      botonLibro.focus({ preventScroll: true });
      transicionando = false;
    });
  }

  // ===================== ÚLTIMA SORPRESA: CINTA VHS =====================

  // Programar y limpiar temporizadores de esta pantalla
  function vhsEsperar(accion, ms) {
    const id = setTimeout(accion, ms);
    vhsTemporizadores.push(id);
    return id;
  }

  function vhsLimpiarTemporizadores() {
    vhsTemporizadores.forEach((id) => clearTimeout(id));
    vhsTemporizadores = [];
  }

  // Separar la frase en palabras para que aparezca poco a poco
  function prepararFrase() {
    if (!vhsFrase || !vhs) return;

    const texto = vhsFrase.textContent.trim().replace(/\s+/g, ' ');
    const palabras = texto.split(' ');

    vhsFrase.textContent = '';

    // Texto completo para lectores de pantalla
    const lector = document.createElement('span');
    lector.className = 'sr-only';
    lector.textContent = texto;

    // Palabras animadas (solo visuales)
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    palabras.forEach((palabra, i) => {
      const span = document.createElement('span');
      span.className = 'palabra';
      span.style.setProperty('--i', String(i));
      span.textContent = palabra;
      visual.appendChild(span);
      if (i < palabras.length - 1) visual.appendChild(document.createTextNode(' '));
    });

    vhsFrase.appendChild(lector);
    vhsFrase.appendChild(visual);

    vhsPalabras = palabras.length;
    vhs.style.setProperty('--n', String(palabras.length));
  }

  // --- Estado del video (si el archivo no existe, la página sigue funcionando) ---
  function videoConError() {
    return !!(vhsVideo && (vhsVideo.error || vhsVideo.networkState === 3));
  }

  function marcarVideoNoDisponible() {
    if (!vhsPantalla) return;
    vhsPantalla.classList.add('sin-video');
    if (vhsAviso) vhsAviso.textContent = 'El recuerdo estará disponible pronto ♡';
  }

  function marcarVideoDisponible() {
    if (!vhsPantalla) return;
    vhsPantalla.classList.remove('sin-video');
    if (vhsAviso) vhsAviso.textContent = '';
  }

  // Esperar a que el video cargue (o falle) para reintentar al pulsar ▶
  function esperarVideo() {
    return new Promise((resolve) => {
      if (vhsVideo.readyState >= 1 && !vhsVideo.error) {
        resolve(true);
        return;
      }

      let terminado = false;
      let temporizador = null;

      const alCargar = () => terminar(true);
      const alFallar = () => terminar(false);

      function terminar(ok) {
        if (terminado) return;
        terminado = true;
        clearTimeout(temporizador);
        vhsVideo.removeEventListener('loadedmetadata', alCargar);
        vhsVideo.removeEventListener('error', alFallar);
        resolve(ok);
      }

      vhsVideo.addEventListener('loadedmetadata', alCargar);
      vhsVideo.addEventListener('error', alFallar);
      temporizador = setTimeout(() => terminar(false), 4000);
    });
  }

  // La portada se transforma y aparece el video; solo entonces se reproduce
  function mostrarYReproducir() {
    vhsPantalla.classList.add('reproduciendo');
    if (vhsRepetir) vhsRepetir.hidden = true;

    try { vhsVideo.focus({ preventScroll: true }); } catch (e) { /* sin foco, no pasa nada */ }

    const promesa = vhsVideo.play();
    if (promesa && typeof promesa.catch === 'function') {
      promesa.catch(() => { /* si el navegador no lo permite, Dannita usa los controles */ });
    }
  }

  // Botón ▶ de la portada
  function reproducirVideo() {
    if (!vhsVideo || !vhsPantalla) return;

    if (videoConError()) {
      // Reintentar por si el archivo se agregó después de abrir la página
      vhsVideo.load();
      esperarVideo().then((ok) => {
        if (ok && vhsVisible) {
          marcarVideoDisponible();
          mostrarYReproducir();
        } else {
          marcarVideoNoDisponible();
        }
      });
      return;
    }

    marcarVideoDisponible();
    mostrarYReproducir();
  }

  // Ver el video otra vez cuando termina
  function repetirVideo() {
    if (!vhsVideo) return;
    try { vhsVideo.currentTime = 0; } catch (e) { /* se reinicia al reproducir */ }
    if (vhsRepetir) vhsRepetir.hidden = true;
    const promesa = vhsVideo.play();
    if (promesa && typeof promesa.catch === 'function') promesa.catch(() => {});
  }

  if (vhsVideo) {
    vhsVideo.addEventListener('error', () => {
      // Si el archivo falla, se conserva la portada con un mensaje discreto
      vhsPantalla.classList.remove('reproduciendo');
      marcarVideoNoDisponible();
    });
    vhsVideo.addEventListener('loadedmetadata', marcarVideoDisponible);
    vhsVideo.addEventListener('play', () => { if (vhsRepetir) vhsRepetir.hidden = true; });
    vhsVideo.addEventListener('ended', () => { if (vhsRepetir) vhsRepetir.hidden = false; });
    if (videoConError()) marcarVideoNoDisponible();
  }

  // --- Secuencia de la pantalla ---

  // Al terminar la transición, la portada de la cinta queda lista
  function vhsTerminarTransicion() {
    vhsListo = true;
    if (videoConError()) marcarVideoNoDisponible();
    if (vhsPlay) vhsPlay.focus({ preventScroll: true });
  }

  // La cinta cruza la pantalla: cubre el mensaje y se retira para revelar la portada
  function iniciarTransicionVHS() {
    if (!vhsVisible || vhsTransicionHecha) return; // solo ocurre una vez
    vhsTransicionHecha = true;
    vhsLimpiarTemporizadores();

    // Movimiento reducido: cambio directo de escena, sin cinta
    if (reducirMovimiento.matches) {
      vhs.dataset.fase = 'reproductor';
      vhsReproductor.classList.add('vhs-activa-rep');
      vhsTerminarTransicion();
      return;
    }

    // 1) La cinta cubre la pantalla
    vhsCinta.classList.add('activa');
    void vhsCinta.offsetWidth;
    vhsCinta.classList.add('cubriendo');

    // 2) Ya cubierta: cambia la escena por detrás y aparece «PLAY»
    vhsEsperar(() => {
      vhs.dataset.fase = 'reproductor';
      vhsCinta.classList.add('cubierta');
    }, VHS_CUBRIR);

    // 3) La cinta se retira y descubre la portada
    vhsEsperar(() => {
      vhsCinta.classList.remove('cubierta');
      vhsCinta.classList.remove('cubriendo');
      vhsCinta.classList.add('revelando');
      vhsReproductor.classList.add('vhs-activa-rep');
    }, VHS_CUBRIR + VHS_PAUSA);

    // 4) Fin: la portada queda lista para que Dannita pulse ▶
    vhsEsperar(() => {
      vhsCinta.classList.remove('activa');
      vhsCinta.classList.remove('revelando');
      vhsTerminarTransicion();
    }, VHS_CUBRIR + VHS_PAUSA + VHS_REVELAR);
  }

  // Empieza la escena del mensaje; después de leerlo, llega la transición automáticamente
  function iniciarMensajeVHS() {
    void vhs.offsetWidth;
    vhs.classList.add('vhs-activa');

    const espera = reducirMovimiento.matches
      ? 8000
      : vhsPalabras * 170 + 6300;

    vhsEsperar(iniciarTransicionVHS, espera);
  }

  // Dejar la pantalla VHS lista para la próxima visita
  function reiniciarVHS() {
    vhsLimpiarTemporizadores();

    if (vhsVideo) {
      try { vhsVideo.pause(); } catch (e) { /* sin acción */ }
      try { vhsVideo.currentTime = 0; } catch (e) { /* sin metadatos todavía */ }
    }
    if (vhsPantalla) vhsPantalla.classList.remove('reproduciendo');
    if (vhsRepetir) vhsRepetir.hidden = true;

    vhs.classList.remove('vhs-activa');
    vhs.dataset.fase = 'mensaje';
    vhsReproductor.classList.remove('vhs-activa-rep');
    vhsCinta.classList.remove('activa', 'cubriendo', 'cubierta', 'revelando');

    vhsTransicionHecha = false;
    vhsListo = false;
  }

  // ===== Libro → Última sorpresa (fade out del libro, luego fade in de la cinta) =====
  function abrirVHS() {
    if (transicionando || !libroVisible || !pantallaVHS) return;
    transicionando = true;

    posicionLibro = pantallaLibro.scrollTop; // recordar dónde estaba el libro
    botonUltima.setAttribute('aria-expanded', 'true');
    ocultarPantalla(pantallaLibro);

    alTerminarFundido(() => {
      retirarPantalla(pantallaLibro);
      libroVisible = false;

      reiniciarVHS();
      mostrarPantalla(pantallaVHS);
      pantallaVHS.scrollTop = 0;
      vhsVisible = true;

      if (tituloVHS) tituloVHS.focus({ preventScroll: true });
      iniciarMensajeVHS();
      transicionando = false;
    });
  }

  // ===== Última sorpresa → Libro (el libro queda como estaba) =====
  function volverAlLibro() {
    if (transicionando || !vhsVisible) return;
    transicionando = true;

    // Detener de inmediato la secuencia y el sonido mientras se desvanece la pantalla
    vhsLimpiarTemporizadores();
    if (vhsVideo) {
      try { vhsVideo.pause(); } catch (e) { /* sin acción */ }
    }
    ocultarPantalla(pantallaVHS);

    alTerminarFundido(() => {
      retirarPantalla(pantallaVHS);
      reiniciarVHS();
      vhsVisible = false;

      mostrarPantalla(pantallaLibro);
      pantallaLibro.scrollTop = posicionLibro;
      libroVisible = true;

      botonUltima.setAttribute('aria-expanded', 'false');
      botonUltima.focus({ preventScroll: true });
      transicionando = false;
    });
  }

  // Preparar la frase palabra por palabra
  prepararFrase();

  // ===== Eventos de los botones =====
  if (botonDescubrir) botonDescubrir.addEventListener('click', abrirAlbum);
  botonesVolver.forEach((b) => b.addEventListener('click', volverACarta));

  if (botonLibro) botonLibro.addEventListener('click', abrirLibro);
  if (botonVolverAlbum) botonVolverAlbum.addEventListener('click', volverAlAlbum);

  if (botonSiguiente) botonSiguiente.addEventListener('click', paginaSiguiente);
  if (botonAnterior) botonAnterior.addEventListener('click', paginaAnterior);

  if (botonUltima) botonUltima.addEventListener('click', abrirVHS);
  if (botonVolverLibro) botonVolverLibro.addEventListener('click', volverAlLibro);
  if (vhsContinuar) vhsContinuar.addEventListener('click', iniciarTransicionVHS);
  if (vhsPlay) vhsPlay.addEventListener('click', reproducirVideo);
  if (vhsRepetir) vhsRepetir.addEventListener('click', repetirVideo);

  // Portada del libro: clic, toque y teclado
  if (libroPortada) {
    libroPortada.addEventListener('click', abrirPortadaLibro);
    libroPortada.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        abrirPortadaLibro();
      }
    });
  }

  // ===== Navegación táctil: deslizar el dedo para pasar de página =====
  let toqueX = 0;
  let toqueY = 0;
  let toqueActivo = false;

  if (escenaLibro) {
    escenaLibro.addEventListener('touchstart', (e) => {
      if (!libroAbierto || e.touches.length !== 1) return;
      toqueX = e.touches[0].clientX;
      toqueY = e.touches[0].clientY;
      toqueActivo = true;
    }, { passive: true });

    escenaLibro.addEventListener('touchend', (e) => {
      if (!toqueActivo) return;
      toqueActivo = false;

      const toque = e.changedTouches[0];
      const dx = toque.clientX - toqueX;
      const dy = toque.clientY - toqueY;

      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) paginaSiguiente();
        else paginaAnterior();
      }
    }, { passive: true });
  }

  // ===== Teclado: Escape vuelve a la pantalla anterior; flechas pasan de página =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (vhsVisible) volverAlLibro();
      else if (libroVisible) volverAlAlbum();
      else if (albumAbierto) volverACarta();
      return;
    }

    if (libroVisible && libroAbierto) {
      if (e.key === 'ArrowRight') paginaSiguiente();
      else if (e.key === 'ArrowLeft') paginaAnterior();
    }
  });

  // Estado inicial del libro
  pintarVista();
})();