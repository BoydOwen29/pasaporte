// Interfaz común: navegación entre pantallas, micrófono, hojas, avisos y gráficos chicos.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

App.ui = (() => {
  const u = App.u;
  const raiz = () => document.getElementById('app');
  let pila = [];
  let actual = null;
  let limpiezas = [];

  function alSalir(fn) { limpiezas.push(fn); }

  function ir(nombre, params = {}, { reemplazar = false } = {}) {
    limpiar();
    if (actual && !reemplazar) pila.push(actual);
    actual = { nombre, params };
    pintar();
  }
  function atras() {
    limpiar();
    if (App.sesion?.activa) App.sesion.cancelar();
    actual = pila.pop() || { nombre: 'inicio', params: {} };
    pintar();
  }
  function aInicio() { limpiar(); pila = []; actual = { nombre: 'inicio', params: {} }; pintar(); }
  function limpiar() { App.voz.callar(); limpiezas.forEach((f) => { try { f(); } catch (e) {} }); limpiezas = []; }

  // Barra de navegación inferior: solo en las pantallas principales (en una escena o ejercicio, foco total).
  const ICONOS = {
    inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    mapa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M8.5 17h7"/></svg>',
    practicar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
    progreso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    teoria: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v17H5.5A1.5 1.5 0 0 1 4 18.5zM20 4.5A1.5 1.5 0 0 0 18.5 3H13v17h5.5a1.5 1.5 0 0 0 1.5-1.5z"/></svg>',
  };
  const NAV = [['inicio', 'Inicio'], ['mapa', 'Pasaporte'], ['teoria', 'Teoría'], ['practicar', 'Practicar'], ['progreso', 'Progreso']];
  const CON_NAV = new Set(NAV.map((n) => n[0]));
  function navHtml(activo) {
    return `<nav class="nav"><div class="nav-in">${NAV.map(([id, t]) => `<button data-nav="${id}" class="${id === activo ? 'activo' : ''}">${ICONOS[id]}<span>${t}</span></button>`).join('')}</div></nav>`;
  }

  function pintar() {
    const p = App.pantallas[actual.nombre];
    const r = raiz();
    if (!p) { r.innerHTML = '<p>Pantalla no encontrada.</p>'; return; }
    const vista = p(actual.params) || {};
    const conNav = CON_NAV.has(actual.nombre) && App.modelo.estado.perfil.listo && !vista.sinNav;
    r.classList.toggle('sin-nav', !conNav);
    r.innerHTML = `<div class="vista">${vista.html || ''}</div>${conNav ? navHtml(actual.nombre) : ''}`;
    window.scrollTo(0, 0);
    r.querySelector('[data-atras]')?.addEventListener('click', atras);
    r.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
      const dest = b.dataset.nav;
      if (dest === actual.nombre) return;
      limpiar(); pila = dest === 'inicio' ? [] : [{ nombre: 'inicio', params: {} }];
      actual = { nombre: dest, params: {} }; pintar();
    }));
    vista.montar && vista.montar(r);
  }
  const refrescar = () => { limpiar(); pintar(); };

  function barra(titulo, { atras: conAtras = true, derecha = '' } = {}) {
    return `<div class="barra">${conAtras ? '<button class="btn-atras" data-atras aria-label="Volver">←</button>' : ''}<h1>${titulo}</h1>${derecha}</div>`;
  }

  // Avatar de personaje: inicial con color propio y la bandera de su acento.
  const BANDERAS = { 'en-gb': '🇬🇧', 'en-us': '🇺🇸', 'en-au': '🇦🇺', 'en-ie': '🇮🇪', 'en-ca': '🇨🇦' };
  const COLORES = ['#6a4c9c', '#2d5a9b', '#127466', '#c4432c', '#a8761a', '#1b2745'];
  function avatar(pj, { chico = false } = {}) {
    const n = (pj.nombre || '?').replace(/^Oficial /, '');
    const color = COLORES[[...n].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORES.length];
    return `<span class="avatar ${chico ? 'chico3' : ''}" style="background:${color}">${u.esc(n[0])}${chico ? '' : `<span class="bandera">${BANDERAS[(pj.acento || '').toLowerCase()] || ''}</span>`}</span>`;
  }

  // Anillo de puntaje (0 a 100).
  function anillo(valor, { tam = 96, color } = {}) {
    if (valor == null) return '';
    const r = tam / 2 - 7, c = 2 * Math.PI * r, f = Math.max(0, Math.min(100, valor)) / 100;
    const col = color || (valor >= 80 ? 'var(--ok)' : valor >= 60 ? 'var(--mostaza)' : 'var(--sello)');
    return `<div class="anillo" style="width:${tam}px;height:${tam}px"><svg viewBox="0 0 ${tam} ${tam}"><circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="var(--linea)" stroke-width="8"/><circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c * f} ${c}"/></svg><b>${Math.round(valor)}</b></div>`;
  }

  // Delegación simple: on(raíz, '[data-x]', fn(elemento, evento))
  function on(r, sel, fn, ev = 'click') {
    r.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, (e) => fn(el, e)));
  }

  function aviso(msg, ms = 2600) {
    const d = document.createElement('div');
    d.className = 'aviso'; d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), ms);
  }

  function hoja(html, montar) {
    const velo = document.createElement('div');
    velo.className = 'velo';
    velo.innerHTML = `<div class="hoja"><button class="btn mini sec cerrar">Cerrar</button>${html}</div>`;
    document.body.appendChild(velo);
    const cerrar = () => { App.voz.callar(); velo.remove(); };
    velo.addEventListener('click', (e) => { if (e.target === velo) cerrar(); });
    velo.querySelector('.cerrar').addEventListener('click', cerrar);
    montar && montar(velo.querySelector('.hoja'), cerrar);
    return cerrar;
  }

  // Botón de escuchar en inglés: <button data-decir="texto" data-acento="en-GB">
  function botonDecir(texto, { acento = '', neural = '', lento = false, etiqueta = '▶', clase = 'icono' } = {}) {
    return `<button class="${clase}" data-decir="${u.esc(texto)}" data-acento="${acento}" data-neural="${neural}" ${lento ? 'data-lento="1"' : ''} title="${lento ? 'Escuchar despacio' : 'Escuchar'}">${etiqueta}</button>`;
  }
  function montarDecir(r) {
    r.querySelectorAll('[data-decir]').forEach((el) => {
      if (el.dataset.montado) return; // si se monta dos veces la misma zona, no duplica
      el.dataset.montado = '1';
      el.addEventListener('click', () => {
        el.classList.add('cargando');
        const listo = () => el.classList.remove('cargando');
        App.voz.decir(el.dataset.decir, { acento: el.dataset.acento || undefined, neural: el.dataset.neural || undefined, lento: !!el.dataset.lento, onInicio: listo }).finally(listo);
      });
      // Al lado de cada ▶ normal, un botón ES: traducción completa y palabra por palabra.
      if (el.dataset.lento || el.dataset.sinTraducir) return;
      const ancla = el.nextElementSibling && el.nextElementSibling.dataset && el.nextElementSibling.dataset.lento ? el.nextElementSibling : el;
      const b = document.createElement('button');
      b.className = (el.classList.contains('chip') ? 'chip gris' : 'icono chico2') + ' btn-es';
      b.textContent = 'ES'; b.title = 'Traducir al español';
      ancla.insertAdjacentElement('afterend', b);
      let panel = null;
      b.addEventListener('click', () => {
        if (panel) { panel.remove(); panel = null; b.classList.remove('activo'); return; }
        const tmp = document.createElement('div');
        tmp.innerHTML = App.traductor.panelHtml(el.dataset.decir);
        panel = tmp.firstElementChild;
        const burbuja = el.closest('.burbuja');
        if (burbuja) burbuja.appendChild(panel);
        else (el.closest('.frase, .fila, .acciones, .pista, p') || el.parentElement).insertAdjacentElement('afterend', panel);
        b.classList.add('activo');
        App.modelo.log('traducir', { en: el.dataset.decir });
      });
    });
    // Precarga lo que hay para escuchar en esta pantalla (los ▶ normales; los lentos se piden al tocarlos).
    App.voz.precargar([...r.querySelectorAll('[data-decir]:not([data-lento])')].map((el) => ({ texto: el.dataset.decir, neural: el.dataset.neural || undefined })));
  }

  // ── Micrófono con turno marcado por ella. Si no hay reconocimiento (o está el modo teclado), se escribe.
  // opciones: { alResultado(res, met), etiqueta, continuo, maxAlternativas }
  // Devuelve { habilitar(), deshabilitar(), elemento }.
  function microfono(contenedor, opciones = {}) {
    const usarTeclado = !App.voz.hayReconocimiento() || App.modelo.estado.perfil.teclado;
    const cont = typeof contenedor === 'string' ? document.querySelector(contenedor) : contenedor;
    let tListo = performance.now();
    let control = null;
    let habil = true;

    if (usarTeclado) {
      cont.innerHTML = `<div class="mic-zona"><div class="teclado"><input type="text" placeholder="Escribí lo que dirías (modo teclado)" autocomplete="off"><button class="btn acento">Enviar</button></div>
        <div class="chico">${App.voz.hayReconocimiento() ? 'Modo teclado activado en Ajustes.' : 'Este navegador no reconoce voz: probalo en Chrome o Edge para hablar.'}</div></div>`;
      const inp = cont.querySelector('input'), btn = cont.querySelector('button');
      let primeraTecla = null;
      inp.addEventListener('keydown', (e) => { if (primeraTecla == null) primeraTecla = performance.now(); if (e.key === 'Enter') enviar(); });
      btn.addEventListener('click', enviar);
      function enviar() {
        const texto = inp.value.trim(); if (!texto || !habil) return;
        const ahora = performance.now();
        const res = { texto, alternativas: [], t0: tListo, inicioHabla: primeraTecla ?? ahora, finHabla: ahora, teclado: true };
        inp.value = ''; primeraTecla = null;
        const met = App.evaluar.metricas(res, tListo); met.ppm = null;
        opciones.alResultado && opciones.alResultado(res, met);
      }
      return {
        elemento: cont,
        habilitar() { habil = true; inp.disabled = false; btn.disabled = false; tListo = performance.now(); setTimeout(() => inp.focus(), 50); },
        deshabilitar() { habil = false; inp.disabled = true; btn.disabled = true; },
      };
    }

    cont.innerHTML = `<div class="mic-zona"><div class="parcial"></div><button class="mic" aria-label="Hablar">🎙️</button><div class="mic-texto">${opciones.etiqueta || 'Tocá para hablar. Tocá de nuevo cuando termines.'}</div>
      <button class="enlace-teclado" type="button">⌨️ Escribirlo</button>
      <div class="teclado oculto"><input type="text" placeholder="Escribilo en inglés" autocomplete="off" autocapitalize="off"><button class="btn acento" type="button">Enviar</button></div></div>`;
    const mic = cont.querySelector('.mic'), parcial = cont.querySelector('.parcial'), texto = cont.querySelector('.mic-texto');
    const etiquetaBase = texto.textContent;
    // Salida por si el micrófono no la entiende o algo se traba: lo escribe y sigue.
    const enlace = cont.querySelector('.enlace-teclado'), filaTec = cont.querySelector('.teclado');
    const inp = filaTec.querySelector('input'), btnEnv = filaTec.querySelector('button');
    let tTecla = null;
    enlace.addEventListener('click', () => { filaTec.classList.toggle('oculto'); if (!filaTec.classList.contains('oculto')) setTimeout(() => inp.focus(), 50); });
    inp.addEventListener('keydown', (e) => { if (tTecla == null) tTecla = performance.now(); if (e.key === 'Enter') enviarTexto(); });
    btnEnv.addEventListener('click', enviarTexto);
    function enviarTexto() {
      const t = inp.value.trim(); if (!t || !habil) return;
      const ahora = performance.now();
      const res = { texto: t, alternativas: [], t0: tListo, inicioHabla: tTecla ?? ahora, finHabla: ahora, teclado: true };
      inp.value = ''; tTecla = null; filaTec.classList.add('oculto');
      App.modelo.log('escrito', { texto: t });
      const met = App.evaluar.metricas(res, tListo); met.ppm = null; met.latencia = null;
      opciones.alResultado && opciones.alResultado(res, met);
    }

    let intento = 0;
    function reiniciar(mensaje) {
      control = null;
      mic.classList.remove('escuchando', 'preparando', 'terminando'); mic.textContent = '🎙️';
      texto.textContent = mensaje || etiquetaBase;
      parcial.textContent = '';
    }
    mic.addEventListener('click', async () => {
      if (!habil) return;
      if (!control) {
        App.voz.callar();
        const miIntento = ++intento;
        mic.classList.add('preparando'); mic.textContent = '…';
        texto.textContent = 'Un segundo…';
        parcial.textContent = '';
        const referencia = typeof opciones.referencia === 'function' ? opciones.referencia() : opciones.referencia || '';
        const alListo = () => {
          if (!control || miIntento !== intento) return;
          mic.classList.remove('preparando'); mic.classList.add('escuchando'); mic.textContent = '■';
          texto.textContent = '¡Te escucho! Tomate tu tiempo. Tocá ■ cuando termines.';
          try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
        };
        control = App.voz.escuchar({ onParcial: (t) => (parcial.textContent = t), onListo: alListo, continuo: opciones.continuo !== false, maxAlternativas: opciones.maxAlternativas || 3, referencia });
        const res = await control.resultado;
        if (miIntento !== intento) return; // se reinició por el corte de seguridad: este resultado ya no cuenta
        if (res.error && !res.texto) {
          const msj = res.error === 'not-allowed' ? 'No tengo permiso para el micrófono. Revisalo en los ajustes del navegador.'
            : res.error === 'network' ? 'Se cortó internet. Probá de nuevo.'
            : res.error === 'audio-capture' ? 'No encuentro el micrófono.' : 'No pude escuchar. Probá de nuevo.';
          reiniciar(msj + ' O tocá ⌨️ Escribirlo.');
          App.modelo.log('mic-error', { error: res.error });
          return;
        }
        if (!res.texto) { reiniciar('No te escuché. Tocá 🎙️ y hablá de nuevo, o tocá ⌨️ Escribirlo.'); App.modelo.log('mic-vacio', {}); return; }
        reiniciar();
        const met = App.evaluar.metricas(res, tListo);
        opciones.alResultado && opciones.alResultado(res, met);
      } else {
        texto.textContent = 'Terminando de escuchar…';
        mic.classList.add('terminando');
        const c = control, miIntento = intento;
        c.detener();
        // Corte de seguridad: si la conexión se colgó, se libera el micrófono para que no quede trabado.
        setTimeout(() => {
          if (control === c && intento === miIntento) {
            intento++;
            reiniciar('Se trabó la conexión. Probá de nuevo, o tocá ⌨️ Escribirlo.');
            App.modelo.log('mic-trabado', {});
          }
        }, 12000);
      }
    });
    alSalir(() => control && control.detener());
    return {
      elemento: cont,
      habilitar() { habil = true; mic.disabled = false; btnEnv.disabled = false; inp.disabled = false; tListo = performance.now(); },
      deshabilitar() { habil = false; mic.disabled = true; btnEnv.disabled = true; inp.disabled = true; },
    };
  }

  // Gráfico de línea mínimo (SVG) para tendencias.
  function sparkline(valores, { alto = 44, color = 'var(--acento)' } = {}) {
    const v = valores.filter((x) => x != null);
    if (v.length < 2) return '<div class="chico">Todavía no hay suficientes datos.</div>';
    const min = Math.min(...v), max = Math.max(...v), rango = max - min || 1, ancho = 300;
    const pts = v.map((x, i) => `${(i / (v.length - 1)) * ancho},${alto - 4 - ((x - min) / rango) * (alto - 8)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${ancho} ${alto}" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/></svg>`;
  }

  const pct = (x) => (x == null ? '—' : Math.round(x * 100) + ' %');

  function fichaHoja(id) {
    const f = App.datos.teoria.find((x) => x.id === id);
    if (!f) return;
    hoja(App.pantallas._fichaHtml(f, false), (h) => App.pantallas._fichaMontar(h, f));
  }

  return { ir, atras, aInicio, refrescar, barra, avatar, anillo, on, aviso, hoja, botonDecir, montarDecir, microfono, sparkline, pct, alSalir, fichaHoja, get actual() { return actual; } };
})();
