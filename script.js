

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

        // Respaldo: el botón «Saltar video ♡» siempre debe estar visible mientras se ve el video
        if (vhs) vhs.classList.add('vhs-lista');

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
        if (promesa && typeof promesa.catch === 'function') promesa.catch(() => { });
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
    // (aquí también aparece el botón «Saltar video ♡»)
    function vhsTerminarTransicion() {
        vhsListo = true;
        vhs.classList.add('vhs-lista');
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
        vhs.classList.remove('vhs-lista');
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

/*
  PANTALLA 5 · UN ÚLTIMO SECRETO (después del video):
  - Al terminar el video, o al pulsar «Saltar video ♡», transición suave hacia la pantalla de clave.
  - Clave de 4 dígitos (2608).
  - Tu carta larga se divide sola en páginas y se "escribe" poco a poco.
  - Al final de la carta, el botón «Continuar ♡» abre las cartitas de los amigos (pantalla 6).
*/
(function () {
    'use strict';

    // ====== CONFIGURACIÓN ======
    const CLAVE = '2608'; // 26 de agosto

    // ====== TU CARTA ======
    // Texto EXACTO escrito por ti (no se corrigió nada).
    // Separa los párrafos con una línea en blanco. Si algún día quieres resaltar una parte
    // para encontrarla fácil, ponla entre [CORCHETES]: saldrá marcada hasta que los borres.
    const TEXTO = `Mi Dannita hermosa quiero decirte que a pesar de que ya se que esto no estuvo listo para el día de tu cumpleaños quiero decirte que espero te guste mucho porque va con mucho cariño para ti... Mi Dannita siempre desde que te conocí has sido esa amistad que siempre esta para mi nunca me ha dejado a pesar de la distancia de todo... cuando recuerdo como nos conocimos recuerdo en que lo que mas me llamo la atención fue tu sonrisa porque yo también soy así con una personalidad que nos permite reír a pesar de todo, también se que eres una persona muy fuerte y eso admiro mucho de ti, tienes unas cualidades que hace que yo te considere una persona tan especial para mi. No se como explicarte que tu llegaste a mi vida de una forma tan especial que Dios te mando para que recordara que los angelitos también llegan de formas inesperadas y que tu llegaste a mi vida para ser un apoyo incondicional que nunca me ha decepcionado y a pesar de los errores que tal vez he cometido contigo tu siempre estas ahí sin importar que, eres aquella que siempre da todo de si a pesar de las circunstancias a pesar de todo.

Dannita quiero que siempre recuerdes la mujer tan valiosa que eres tu en serio eres una persona tan especial que yo nunca quisiera perder y que sabes que siempre cuentas con todo mi apoyo incondicional.

Aunque últimamente no hemos compartido mucho ni hemos podido salir, tu sabes que conmigo cuentas siempre ante cualquier emergencia o lo que necesites ahí voy a estar, que tu sabes que mi casa es tu casa y cuando lo necesites aquí puedes llegar, hace ya prácticamente 2 años que nos conocimos y gracias a Dios que así paso porque no hubiera querido otra mejor amiga sino solo tu, a la que llaman mi hermana en la calle, que la verdad de me hace lo mas lindo del mundo porque no quisiera que me dijeran lo mismo por alguien mas, Dannita gracias por ser quien eres gracias por esa personalidad tan única tuya, por confiar en mi y pasar cada choco aventura posible, que sin importar que siempre estas ahí conmigo.

Mira que últimamente he pensado en tu futuro y sea lo que sea que pienses hacer espero que tu hagas lo que tu quieres hacer he orado mucho por ti porque tengas claro ya que quieres hacer y que realmente sea tu sueño que realmente sea lo que Danna quiere hacer y que sepas que a la final lo que termines haciendo sepas que cuentas con todo mi apoyo aquí y siempre que si sigues en matemáticas o si vas para enfermería o si vas para medicina que me encantaría para ti, me encantaría. Dannita esta es tu vida y lo que te demore se que podrás hacer lo que tu realmente quieras ser.

Mi Dannita sabes que yo te quiero demasiado tu tienes un pedacito de mi corazón y muy grande porque eres tu y solo tu, mi Dannita quiero que me perdones si en algún momento te hice sentir mal o cualquier cosa tu eres tan importante en mi vida, siempre he sido una persona muy cerrada pero gracias a ti he podido confiarte tanto que agradezco por eso, Dios quiera que sigamos siendo así por muchísimos años mas estés donde estés sabes que cuentas siempre conmigo.

Te amoo mi Dannita hermosa ♡`;

    // ====== Referencias al proyecto existente ======
    const pantallaVHS = document.getElementById('pantalla-vhs');
    const vhsVideo = document.getElementById('vhs-video');
    if (!pantallaVHS || !vhsVideo) return;
    const vhsSaltar = document.getElementById('vhs-saltar');

    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
    const DURACION = 800; // igual que --duracion-pantalla

    // ====== Construir la pantalla ======
    const pantalla = document.createElement('div');
    pantalla.className = 'pantalla pantalla-ded oculta';
    pantalla.id = 'pantalla-dedicatoria';
    pantalla.hidden = true;
    pantalla.inert = true;
    pantalla.setAttribute('aria-hidden', 'true');
    pantalla.innerHTML = `
    <div class="ded-escena">
      <section class="ded-cerradura" id="ded-cerradura" aria-labelledby="ded-tit">
        <span class="ded-esq e1" aria-hidden="true">✿</span>
        <span class="ded-esq e2" aria-hidden="true">✿</span>
        <span class="ded-esq e3" aria-hidden="true">❀</span>
        <span class="ded-esq e4" aria-hidden="true">❀</span>
        <div class="ded-sello" aria-hidden="true">♥</div>
        <h2 class="ded-titulo" id="ded-tit" tabindex="-1">Un último secreto para ti ♡</h2>
        <div class="ded-div" aria-hidden="true">✦ ♡ ✦</div>
        <p class="ded-sub">Hay algo que escribí con todo mi cariño, solo para ti. Escribe la clave de cuatro números y descúbrelo.</p>
        <div class="ded-clave" id="ded-clave" role="group" aria-label="Clave de cuatro dígitos">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Dígito 1">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Dígito 2">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Dígito 3">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Dígito 4">
        </div>
        <p class="ded-msg" id="ded-msg" role="status" aria-live="polite"></p>
        <button type="button" class="ded-btn" id="ded-abrir">Desbloquear mi sorpresa ♡</button>
        <p class="ded-pista">Pista: una fecha muy especial para mí ♡</p>
      </section>

      <section class="ded-libro-wrap" id="ded-wrap" hidden aria-label="Dedicatoria para Dannita">
        <div class="ded-libro" id="ded-libro">
          <div class="ded-hoja" id="ded-hoja">
            <span class="ded-flor" aria-hidden="true">✿</span>
            <div class="ded-texto" id="ded-texto"></div>
            <span class="ded-num" id="ded-num" aria-hidden="true"></span>
          </div>
          <div class="ded-cierre" id="ded-cierre">
            <div class="ded-cierre-deco" aria-hidden="true">✿ ♡ ✦</div>
            <p class="ded-cierre-fel">¡Feliz cumpleaños, Dannita!</p>
            <p class="ded-cierre-con">Y si algún día olvidas lo mucho que te quiero, vuelve a leer estas palabras. Siempre habrá un pedacito de mí en ellas. ♡</p>
            <button type="button" class="ded-btn sec" id="ded-releer">Leer de nuevo ♡</button>
            <!-- NUEVO: sigue hacia las cartitas de los amigos -->
            <button type="button" class="ded-btn" id="ded-cartitas">Continuar ♡</button>
          </div>
        </div>
        <div class="ded-pie" id="ded-pie">
          <div class="ded-accion">
            <button type="button" class="ded-btn ded-continuar" id="ded-continuar">Continuar leyendo ♡</button>
          </div>
          <div class="ded-nav">
            <button type="button" class="ded-btn sec" id="ded-prev" aria-label="Página anterior">‹ Anterior</button>
            <span class="ded-ind" id="ded-ind" aria-live="polite"></span>
          </div>
        </div>
      </section>
    </div>`;
    document.body.appendChild(pantalla);

    const $ = (id) => document.getElementById(id);
    const cerradura = $('ded-cerradura'), tit = $('ded-tit');
    const filaClave = $('ded-clave'), msg = $('ded-msg'), btnAbrir = $('ded-abrir');
    const entradas = Array.from(filaClave.querySelectorAll('input'));
    const wrap = $('ded-wrap'), libro = $('ded-libro'), hoja = $('ded-hoja'), texto = $('ded-texto');
    const num = $('ded-num'), pie = $('ded-pie');
    const btnCont = $('ded-continuar'), btnPrev = $('ded-prev'), ind = $('ded-ind'), btnReleer = $('ded-releer');
    const btnCartitas = $('ded-cartitas');

    // Hoja invisible para medir cuánto texto cabe en cada página
    const medida = hoja.cloneNode(true);
    medida.removeAttribute('id');
    medida.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    medida.classList.add('ded-medida');
    medida.setAttribute('aria-hidden', 'true');
    libro.appendChild(medida);
    const medidaTexto = medida.querySelector('.ded-texto');

    let activo = false, transicion = false, libroListo = false;
    let intentos = 0;
    let temporizadorFin = null;
    let finProgramado = false; // evita programar dos veces el paso a la pantalla de la clave

    // ====== Pantallas (mismo patrón de fundido que el bloque anterior) ======
    function esperar(fn) { setTimeout(fn, reducir.matches ? 0 : DURACION); }
    function mostrar(p) {
        p.hidden = false; p.inert = false; p.removeAttribute('aria-hidden');
        void p.offsetWidth; p.classList.remove('oculta');
    }

    // Escape no debe devolver al libro anterior desde esta pantalla
    document.addEventListener('keydown', (e) => {
        if (activo && e.key === 'Escape') e.stopPropagation();
    }, true);

    // ====== Salir de la pantalla completa (en algunos celulares el video se abre así y tapa todo) ======
    function salirDePantallaCompleta() {
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                const p = document.exitFullscreen();
                if (p && typeof p.catch === 'function') p.catch(() => { });
            } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            if (vhsVideo.webkitDisplayingFullscreen && vhsVideo.webkitExitFullscreen) {
                vhsVideo.webkitExitFullscreen();
            }
        } catch (e) { /* sin acción */ }
    }

    // ====== Al terminar el video (o al saltarlo): transición suave hacia el secreto ======
    function irAlSecreto() {
        if (transicion || activo) return;
        if (pantallaVHS.hidden || pantallaVHS.classList.contains('oculta')) return; // se salió de la pantalla
        transicion = true;
        clearTimeout(temporizadorFin);
        try { vhsVideo.pause(); } catch (e) { /* sin acción */ }
        salirDePantallaCompleta();

        pantallaVHS.classList.add('oculta');
        pantallaVHS.inert = true;
        pantallaVHS.setAttribute('aria-hidden', 'true');

        esperar(() => {
            pantallaVHS.hidden = true;

            // Desde aquí el video queda como pieza final: sin botón de saltar y sin volver a la clave
            const seccionVHS = document.getElementById('vhs');
            if (seccionVHS) seccionVHS.classList.add('vhs-final');

            reiniciarBloqueo();
            mostrar(pantalla);
            activo = true;
            transicion = false;
            if (window.matchMedia('(hover: hover)').matches) entradas[0].focus({ preventScroll: true });
            else tit.focus({ preventScroll: true });
        });
    }

    // El video terminó: tras una breve pausa pasa a la pantalla de la clave
    function alTerminarVideo() {
        if (activo) return; // ya se pasó por la clave: el video solo se puede ver otra vez
        if (finProgramado) return;
        finProgramado = true;
        clearTimeout(temporizadorFin);
        salirDePantallaCompleta();
        temporizadorFin = setTimeout(irAlSecreto, reducir.matches ? 300 : 1800);
    }

    // Si Dannita vuelve a reproducir o mueve el video, se cancela el paso automático
    function cancelarFinVideo() {
        finProgramado = false;
        clearTimeout(temporizadorFin);
    }

    vhsVideo.addEventListener('ended', alTerminarVideo);
    // Respaldo: algunos celulares no envían «ended» a tiempo, así que también se vigila el final del video
    vhsVideo.addEventListener('timeupdate', () => {
        const d = vhsVideo.duration;
        if (d && isFinite(d) && d > 1 && vhsVideo.currentTime >= d - 0.1) alTerminarVideo();
    });
    vhsVideo.addEventListener('play', cancelarFinVideo);
    vhsVideo.addEventListener('seeking', () => {
        // Solo se cancela si el usuario se movió lejos del final
        const d = vhsVideo.duration;
        if (!d || !isFinite(d) || vhsVideo.currentTime < d - 0.5) cancelarFinVideo();
    });

    // Botón «Saltar video ♡»: va directo a la pantalla de la clave sin ver el video
    if (vhsSaltar) {
        vhsSaltar.addEventListener('click', () => {
            clearTimeout(temporizadorFin);
            irAlSecreto();
        });
    }

    // ====== Bloqueo ======
    function reiniciarBloqueo() {
        intentos = 0;
        msg.textContent = '';
        entradas.forEach((i) => { i.value = ''; i.disabled = false; });
        btnAbrir.disabled = false;
        cerradura.hidden = false;
        cerradura.classList.remove('saliendo');
        wrap.hidden = true;
        wrap.classList.remove('visible');
        libro.classList.remove('cerrando');
        pie.classList.remove('oculto');
        libroListo = false;
    }

    const mensajesError = [
        'Esa no es todavía, inténtalo de nuevo, bonita ♡',
        'Casi, casi… Respira y vuelve a intentarlo, que tú sí te la sabes ♡',
        'Esa tampoco, mi niña ♡ Piensa en nosotras y en un día que no se me olvida.',
        'Sin afán, Dannita. El secreto te espera todo el tiempo que necesites ♡'
    ];

    function validar() {
        const codigo = entradas.map((i) => i.value).join('');
        if (codigo.length < 4) {
            msg.textContent = 'Faltan algunos números ♡';
            (entradas.find((i) => !i.value) || entradas[0]).focus();
            return;
        }
        if (codigo === CLAVE) { desbloquear(); return; }

        msg.textContent = mensajesError[intentos % mensajesError.length];
        intentos++;
        filaClave.classList.remove('error');
        void filaClave.offsetWidth;
        filaClave.classList.add('error');
        setTimeout(() => {
            entradas.forEach((i) => { i.value = ''; });
            entradas[0].focus();
        }, 450);
    }

    entradas.forEach((inp, i) => {
        inp.addEventListener('input', () => {
            inp.value = inp.value.replace(/\D/g, '').slice(-1);
            if (inp.value && i < 3) entradas[i + 1].focus();
            if (entradas.every((x) => x.value)) setTimeout(validar, 150);
        });
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !inp.value && i > 0) { entradas[i - 1].focus(); entradas[i - 1].value = ''; }
            else if (e.key === 'ArrowLeft' && i > 0) entradas[i - 1].focus();
            else if (e.key === 'ArrowRight' && i < 3) entradas[i + 1].focus();
            else if (e.key === 'Enter') validar();
        });
        inp.addEventListener('focus', () => inp.select());
        inp.addEventListener('paste', (e) => {
            const d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
            if (!d) return;
            e.preventDefault();
            d.split('').forEach((ch, k) => { entradas[k].value = ch; });
            (entradas[d.length] || entradas[3]).focus();
            if (d.length === 4) setTimeout(validar, 150);
        });
    });
    btnAbrir.addEventListener('click', validar);

    function desbloquear() {
        entradas.forEach((i) => { i.disabled = true; });
        btnAbrir.disabled = true;
        msg.textContent = '¡Eso es! ♡';

        const t = reducir.matches ? 0 : 800;
        setTimeout(async () => {
            cerradura.classList.add('saliendo');
            setTimeout(async () => {
                cerradura.hidden = true;
                wrap.hidden = false;
                if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* sin acción */ } }
                paginar();
                maxPagina = -1;
                mostrarPagina(0, false);
                void wrap.offsetWidth;
                wrap.classList.add('visible');
                libroListo = true;
                setTimeout(() => mostrarPagina(0, true), reducir.matches ? 0 : 1100);
            }, reducir.matches ? 0 : 700);
        }, t);
    }

    // ====== Paginación automática ======
    const paras = TEXTO.trim().split(/\n\s*\n/).map((p) => {
        let dentro = false;
        return p.trim().split(/\s+/).map((w) => {
            if (w.indexOf('[') !== -1) dentro = true;
            const palabra = { w, m: dentro };
            if (w.indexOf(']') !== -1) dentro = false;
            return palabra;
        });
    });

    let pages = [];
    let anchoMedido = 0, altoMedido = 0;

    function nodoPalabra(p, conLetras) {
        const s = document.createElement('span');
        s.className = 'w' + (p.m ? ' marcador' : '');
        if (!conLetras) { s.textContent = p.w; return s; }
        for (const ch of p.w) {
            const c = document.createElement('span');
            c.className = 'c';
            c.textContent = ch;
            s.appendChild(c);
        }
        return s;
    }

    function paginar() {
        const t = medidaTexto;
        t.innerHTML = '';
        pages = [];
        let pi = 0, wi = 0, pagina = [];

        while (pi < paras.length) {
            const P = paras[pi];
            const p = document.createElement('p');
            if (wi > 0) p.className = 'cont';
            t.appendChild(p);
            const item = { pi, start: wi, end: wi, cont: wi > 0 };
            let lleno = false;

            while (wi < P.length) {
                const sp = wi > item.start ? document.createTextNode(' ') : null;
                if (sp) p.appendChild(sp);
                const n = nodoPalabra(P[wi], false);
                p.appendChild(n);
                if (t.scrollHeight > t.clientHeight + 1) {
                    p.removeChild(n);
                    if (sp) p.removeChild(sp);
                    if (item.end === item.start && pagina.length === 0) { // palabra que no cabe ni sola: se acepta
                        p.appendChild(n); wi++; item.end = wi; continue;
                    }
                    lleno = true;
                    break;
                }
                wi++; item.end = wi;
            }

            if (item.end > item.start) pagina.push(item); else t.removeChild(p);
            if (wi >= P.length) { pi++; wi = 0; }
            if (lleno) { pages.push(pagina); pagina = []; t.innerHTML = ''; }
        }
        if (pagina.length) pages.push(pagina);

        anchoMedido = texto.clientWidth;
        altoMedido = texto.clientHeight;
    }

    // ====== Mostrar y escribir ======
    let idx = 0, maxPagina = -1, letras = [], pos = 0, temporizador = null;
    let escribiendo = false, cambiando = false;

    function pintar(i) {
        texto.innerHTML = '';
        letras = [];
        pages[i].forEach((item) => {
            const p = document.createElement('p');
            if (item.cont) p.className = 'cont';
            for (let k = item.start; k < item.end; k++) {
                if (k > item.start) p.appendChild(document.createTextNode(' '));
                const n = nodoPalabra(paras[item.pi][k], true);
                n.querySelectorAll('.c').forEach((c) => letras.push(c));
                p.appendChild(n);
            }
            texto.appendChild(p);
        });
    }

    function mostrarPagina(i, animar) {
        clearTimeout(temporizador);
        idx = i;
        pintar(i);
        num.textContent = '· ' + (i + 1) + ' ·';
        ind.textContent = (i + 1) + ' / ' + pages.length;
        btnPrev.disabled = i === 0;
        const ultima = i === pages.length - 1;
        btnCont.textContent = ultima ? 'Terminar de leer ♡' : 'Continuar leyendo ♡';

        const yaLeida = i <= maxPagina;
        maxPagina = Math.max(maxPagina, i);

        if (animar && !yaLeida && !reducir.matches) escribir();
        else completar();
    }

    function escribir() {
        escribiendo = true;
        pos = 0;

        (function paso() {
            if (pos >= letras.length) { terminarEscritura(); return; }
            const c = letras[pos++];
            c.classList.add('on');
            const ch = c.textContent;
            let d = 32;
            if (ch === ',' || ch === ';' || ch === ':') d = 170;
            else if (ch === '.' || ch === '?' || ch === '!' || ch === '…') d = 360;
            temporizador = setTimeout(paso, d);
        })();
    }

    function completar() {
        clearTimeout(temporizador);
        letras.forEach((c) => c.classList.add('on'));
        terminarEscritura();
    }

    function terminarEscritura() {
        escribiendo = false;
    }

    // Tocar la página mientras se escribe: mostrar todo al instante
    hoja.addEventListener('click', () => { if (escribiendo) completar(); });
    document.addEventListener('keydown', (e) => {
        if (!activo || !libroListo || !escribiendo) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); completar(); }
    });

    function cambiarPagina(n) {
        if (cambiando || n < 0 || n >= pages.length) return;
        cambiando = true;
        clearTimeout(temporizador);
        texto.classList.add('fuera');
        setTimeout(() => {
            mostrarPagina(n, true);
            texto.classList.remove('fuera');
            cambiando = false;
        }, reducir.matches ? 0 : 380);
    }

    // Botón principal: si aún se escribe, revela todo el texto; si ya terminó, avanza
    btnCont.addEventListener('click', () => {
        if (cambiando) return;
        if (escribiendo) { completar(); return; }
        if (idx < pages.length - 1) cambiarPagina(idx + 1);
        else mostrarCierre();
    });
    btnPrev.addEventListener('click', () => {
        if (escribiendo) completar();
        cambiarPagina(idx - 1);
    });

    function mostrarCierre() {
        pie.classList.add('oculto');
        libro.classList.add('cerrando');
        setTimeout(() => btnReleer.focus({ preventScroll: true }), reducir.matches ? 50 : 1500);
    }

    btnReleer.addEventListener('click', () => {
        libro.classList.remove('cerrando');
        pie.classList.remove('oculto');
        maxPagina = -1;
        setTimeout(() => mostrarPagina(0, true), reducir.matches ? 0 : 500);
    });

    // NUEVO: «Continuar ♡» abre las cartitas de los amigos (las maneja el bloque siguiente de este archivo)
    btnCartitas.addEventListener('click', () => {
        libroListo = false; // tu carta ya terminó: se detienen sus atajos y el repaginado
        document.dispatchEvent(new CustomEvent('dannita:abrir-cartitas'));
    });

    // ====== Cambio de tamaño: volver a paginar solo si la hoja cambió de medida ======
    let tRedim = null;
    window.addEventListener('resize', () => {
        if (!activo || !libroListo) return;
        clearTimeout(tRedim);
        tRedim = setTimeout(() => {
            if (Math.abs(texto.clientWidth - anchoMedido) < 2 && Math.abs(texto.clientHeight - altoMedido) < 2) return;
            const actual = pages[idx] && pages[idx][0];
            paginar();
            let nuevo = 0;
            if (actual) {
                pages.forEach((pg, k) => {
                    const it = pg[0];
                    if (it.pi < actual.pi || (it.pi === actual.pi && it.start <= actual.start)) nuevo = k;
                });
            }
            maxPagina = nuevo;
            mostrarPagina(nuevo, false);
        }, 250);
    });
})();

/*
  PANTALLA 6 (NUEVA) · CARTITAS DE LOS AMIGOS:
  - Se abre cuando, al final de tu carta, se pulsa «Continuar ♡».
  - Orden: «Pero yo no soy la única…» → «Cartitas para Dannita ♡» → Karen → amiga del pueblo
           → Santiago → Samuel → mensaje final → «♡ Volver al video».
  - «♡ Volver al video» abre la pantalla del video que ya existe (no se duplica el video).
  - Las imágenes de las cartas se escriben en index.html (busca «CAMBIA AQUÍ»).
  No modifica nada de los bloques anteriores.
*/
(function () {
    'use strict';

    const pantallaCartas = document.getElementById('pantalla-cartas');
    const pantallaVHS = document.getElementById('pantalla-vhs');
    if (!pantallaCartas || !pantallaVHS) return;

    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
    const DURACION = 800;         // igual que --duracion-pantalla
    const CAMBIO_SLIDE = 650;     // fundido entre una página y otra de esta sección

    const slides = Array.from(pantallaCartas.querySelectorAll('.cs'));
    const botonVolverVideo = document.getElementById('cs-volver-video');

    let visible = false;          // la pantalla de las cartitas está visible
    let transicion = false;       // cambio de pantalla en curso
    let cambiando = false;        // cambio de página en curso
    let indice = 0;               // página actual
    let temporizadores = [];      // avance automático pendiente

    // ====== Utilidades de pantallas (mismo patrón de fundido del resto del proyecto) ======
    function ocultarP(p) {
        p.classList.add('oculta');
        p.inert = true;
        p.setAttribute('aria-hidden', 'true');
    }
    function mostrarP(p) {
        p.hidden = false;
        p.inert = false;
        p.removeAttribute('aria-hidden');
        void p.offsetWidth;
        p.classList.remove('oculta');
    }
    function esperar(fn) { setTimeout(fn, reducir.matches ? 0 : DURACION); }

    function esperarCartas(fn, ms) {
        temporizadores.push(setTimeout(fn, ms));
    }
    function limpiarTemporizadores() {
        temporizadores.forEach((id) => clearTimeout(id));
        temporizadores = [];
    }

    // ====== Imágenes de las cartas: si falta un archivo, se muestra un aviso discreto ======
    pantallaCartas.querySelectorAll('.cp-marco img').forEach((img) => {
        const marcar = () => {
            const marco = img.closest('.cp-marco');
            if (marco) marco.classList.add('sin-carta');
        };
        img.addEventListener('error', marcar);
        if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) marcar();
    });

    // ====== Páginas de esta sección ======
    function mostrarSlide(i) {
        limpiarTemporizadores();
        indice = i;

        slides.forEach((s, k) => {
            s.classList.remove('saliendo');
            s.classList.toggle('activa', k === i);
        });
        pantallaCartas.scrollTop = 0;

        const actual = slides[i];
        const foco = actual.querySelector('[data-foco]');
        if (foco) foco.focus({ preventScroll: true });

        // Páginas con avance automático (la transición y el título de la sección)
        const auto = Number(actual.dataset.auto) || 0;
        if (auto) {
            esperarCartas(() => irA(i + 1), reducir.matches ? Math.min(auto, 7000) : auto);
        }
    }

    function irA(i) {
        if (!visible || cambiando || i < 0 || i >= slides.length) return;
        cambiando = true;
        limpiarTemporizadores();
        slides[indice].classList.add('saliendo');

        setTimeout(() => {
            cambiando = false;
            if (visible) mostrarSlide(i);
        }, reducir.matches ? 0 : CAMBIO_SLIDE);
    }

    function reiniciarCartas() {
        limpiarTemporizadores();
        slides.forEach((s) => s.classList.remove('activa', 'saliendo'));
        indice = 0;
        cambiando = false;
    }

    // ====== Tu carta → Cartitas ======
    function abrirCartitas() {
        const pantallaCarta = document.getElementById('pantalla-dedicatoria');
        if (transicion || visible || !pantallaCarta) return;
        transicion = true;

        ocultarP(pantallaCarta);
        esperar(() => {
            pantallaCarta.hidden = true;

            reiniciarCartas();
            mostrarP(pantallaCartas);
            pantallaCartas.scrollTop = 0;
            visible = true;
            transicion = false;
            mostrarSlide(0);
        });
    }

    // ====== Cartitas → Video (la pantalla del video que ya existe) ======
    // Se deja el video listo en la portada con el botón ▶ (sin repetir el mensaje ni la cinta)
    function prepararVideo() {
        const vhs = document.getElementById('vhs');
        const reproductor = document.getElementById('vhs-reproductor');
        const cinta = document.getElementById('vhs-cinta');
        const pantallaVideo = document.getElementById('vhs-pantalla');
        const video = document.getElementById('vhs-video');
        const repetir = document.getElementById('vhs-repetir');
        if (!vhs) return;

        vhs.dataset.fase = 'reproductor';
        vhs.classList.add('vhs-lista', 'vhs-final');
        if (reproductor) reproductor.classList.add('vhs-activa-rep');
        if (cinta) cinta.classList.remove('activa', 'cubriendo', 'cubierta', 'revelando');
        if (pantallaVideo) pantallaVideo.classList.remove('reproduciendo');
        if (repetir) repetir.hidden = true;
        if (video) {
            try { video.pause(); } catch (e) { /* sin acción */ }
            try { video.currentTime = 0; } catch (e) { /* sin metadatos todavía */ }
        }
    }

    function volverAlVideo() {
        if (transicion || !visible) return;
        transicion = true;
        limpiarTemporizadores();

        ocultarP(pantallaCartas);
        esperar(() => {
            pantallaCartas.hidden = true;
            visible = false;

            prepararVideo();
            mostrarP(pantallaVHS);
            pantallaVHS.scrollTop = 0;
            transicion = false;

            const play = document.getElementById('vhs-play');
            if (play) play.focus({ preventScroll: true });
        });
    }

    // ====== Eventos ======
    // Botones «Continuar ♡», «Siguiente carta →» y «Última carta →»
    pantallaCartas.querySelectorAll('[data-ir="siguiente"]').forEach((b) => {
        b.addEventListener('click', () => irA(indice + 1));
    });
    if (botonVolverVideo) botonVolverVideo.addEventListener('click', volverAlVideo);

    // Lo envía el botón «Continuar ♡» del final de tu carta larga
    document.addEventListener('dannita:abrir-cartitas', abrirCartitas);
})();