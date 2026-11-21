// Escena: preparación (misión, teoría, frases) → diálogo con el personaje → devolución.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, E = App.evaluar, M = App.modelo;
  const REPAROS = ['Sorry?', "Sorry, I didn't catch that.", 'Sorry, could you say that again?', 'Pardon?'];

  const slotsBase = () => ({ yo: M.estado.perfil.nombre || 'Ana' });
  const tpl = (s, slots) => E.plantilla(s, slots);

  // ── Práctica rápida de frases (hoja): una por vez, la dice y se compara.
  App.pantallas._drillFrases = function (lista, titulo, acento) {
    let i = 0;
    ui.hoja(`<h2>${u.esc(titulo)}</h2><div id="drill"></div>`, (h) => {
      const zona = h.querySelector('#drill');
      function pintar() {
        if (i >= lista.length) { zona.innerHTML = '<p>¡Listo! Ya las dijiste todas.</p>'; return; }
        const f = lista[i];
        zona.innerHTML = `<p class="chico">${i + 1} de ${lista.length}</p>
          <div class="tarjeta"><p class="tenue">${u.esc(f.es)}</p><p class="en"><b>${u.esc(f.en)}</b></p>
          <div class="fila">${ui.botonDecir(f.en, { acento })}${ui.botonDecir(f.en, { acento, lento: true, etiqueta: '🐢' })}</div></div>
          <div id="drill-mic"></div><div id="drill-res"></div>
          <div class="fila" style="justify-content:flex-end"><button class="btn sec mini" id="drill-sig">${i + 1 < lista.length ? 'Siguiente frase →' : 'Terminar'}</button></div>`;
        ui.montarDecir(zona);
        zona.querySelector('#drill-sig').onclick = () => { i++; pintar(); };
        ui.microfono(zona.querySelector('#drill-mic'), {
          referencia: f.en.replace(/…/g, ''),
          alResultado(res) {
            const s = u.similitud(res.texto, f.en);
            const r = zona.querySelector('#drill-res');
            const pt = res.pron?.total;
            // Primero: ¿dijo la frase correcta? Después: ¿cómo sonó? Una buena pronunciación no salva otra palabra u otro tiempo verbal.
            const cmp = E.comparar(res.texto, f.en);
            const veredicto = !cmp.exacto ? '<span class="marca-no">no es la misma frase</span>'
              : pt == null || pt >= 80 ? '<span class="marca-ok">✓ muy bien</span>'
              : pt >= 60 ? '<span class="marca-casi">bien dicha; la pronunciación, casi</span>' : '<span class="marca-casi">bien dicha; la pronunciación, a pulir</span>';
            r.innerHTML = `<p>Entendí: «${u.esc(res.texto)}» — ${veredicto}</p>${E.diferenciasHtml(cmp)}${App.pron.tarjeta(res.pron, { contenidoMal: !cmp.exacto })}`;
            App.pron.montar(r, res.pron);
            M.log('drill', { en: f.en, dijo: res.texto, sim: u.redondear(s, 2), exacto: cmp.exacto, pron: res.pron?.total, flojos: App.pron.sonidosFlojos(res.pron).map((x) => x.fonema + '@' + x.palabra) });
            zona.querySelector('#drill-sig').classList.remove('sec'); // ya la dijo: el botón pasa a ser el principal
          },
        });
      }
      pintar();
    });
  };

  App.pantallas.escena = function ({ id, version = 'A', sesion = false }) {
    const escena = App.datos.escenas.find((s) => s.id === id);
    const ver = escena.versiones[version];
    const pj = ver.personaje || escena.personaje;
    const slots = slotsBase();
    const est = M.estado.escenas[id];

    const fichas = escena.teoria.map((t) => App.datos.teoria.find((x) => x.id === t)).filter(Boolean);
    const html = `${ui.barra(`${escena.emoji} ${u.esc(escena.titulo)} · ${version}`)}
      <div class="tarjeta acento">
        <div class="chico">${version === 'A' ? 'Versión A · guiada' : 'Versión B · con imprevistos'}</div>
        <h2 style="margin:4px 0 6px;color:#fff">Tu misión</h2>
        <p>${u.esc(ver.mision)}</p>
        <div class="personaje" style="margin-top:12px">${ui.avatar(pj)}<div><b>${u.esc(pj.nombre)}</b><div class="chico">${u.esc(pj.rol)}</div></div></div>
      </div>
      <div class="tarjeta borde"><b>Puedo…</b><p class="tenue">${u.esc(escena.puedo)}</p>
        <ul class="logros">${ver.logros.map((l) => `<li>${u.esc(l.texto)}</li>`).join('')}</ul></div>
      <div class="tarjeta mostaza">
        <h3>Lo que vas a usar</h3>
        <p>${u.esc(escena.resumenTeoria)}</p>
        <div class="fila">${fichas.map((f) => `<button class="chip" data-ficha="${f.id}">📘 ${u.esc(f.titulo)}</button>`).join('')}</div>
      </div>
      <div class="tarjeta">
        <div class="fila entre"><h3 style="margin:0">Frases para esta escena</h3><button class="btn mini sec" id="practicar">🎙️ Practicarlas</button></div>
        ${escena.frases.map((f) => `<div class="frase"><div class="txt"><div class="en">${u.esc(tpl(f.en, slots))}</div><div class="es">${u.esc(f.es)}</div></div>${ui.botonDecir(tpl(f.en, slots))}</div>`).join('')}
      </div>
      <p class="chico centro">Tomate 30 segundos para mirar las frases y la fórmula. No hace falta memorizar: durante la escena tenés pistas.</p>
      <button class="btn acento ancho grande" id="empezar">Empezar la escena</button>
      ${est && est[version] ? `<p class="chico centro">La hiciste ${est[version].veces} ${est[version].veces === 1 ? 'vez' : 'veces'}.</p>` : ''}`;

    return {
      html,
      montar(r) {
        // Primero las líneas del personaje (así la escena arranca sin espera), después las frases.
        App.voz.precargar(Object.values(ver.nodos).map((n) => ({ texto: tpl(n.npc, slots), neural: pj.voz })));
        ui.montarDecir(r);
        ui.on(r, '[data-ficha]', (el) => ui.fichaHoja(el.dataset.ficha));
        r.querySelector('#practicar').onclick = () => App.pantallas._drillFrases(escena.frases.map((f) => ({ en: tpl(f.en, slots), es: f.es })), 'Frases: ' + escena.titulo);
        r.querySelector('#empezar').onclick = (e) => { e.currentTarget.disabled = true; dialogo(r, { escena, version, ver, pj, slots, sesion }); };
      },
    };
  };

  // ── Diálogo
  function dialogo(r, ctx) {
    const { escena, version, ver, pj, slots } = ctx;
    const run = { nodoId: ver.inicio, turnos: [], intentos: 0, pistasNodo: 0, pistas: 0, reparaciones: 0, logros: new Set(), problemas: [], pidioRepetir: 0, dificiles: [], inicio: Date.now() };
    const mostrarConsigna = version === 'A';
    // Si se sale de la pantalla, el diálogo deja de correr (evita turnos fantasma).
    let vivo = true;
    ui.alSalir(() => { vivo = false; });
    M.log('escena-inicio', { escena: escena.id, version });

    r.innerHTML = `${ui.barra(`${escena.emoji} ${u.esc(escena.titulo)} · ${version}`)}
      <div class="tarjeta">
        <div class="personaje">${ui.avatar(pj)}<div style="flex:1"><b>${u.esc(pj.nombre)}</b><div class="chico">${u.esc(pj.rol)}</div></div><span class="chip gris" id="cuenta"></span></div>
        <div class="progreso-mision" id="barra-mision"></div>
        <details ${version === 'A' ? 'open' : ''} style="margin-top:8px"><summary class="chico">Misión</summary>
          <p class="chico">${u.esc(ver.mision)}</p><ul class="logros" id="logros"></ul></details>
      </div>
      <div class="chat" id="chat"></div>
      <div id="control" class="dock">
        <div id="consigna"></div>
        <div id="pista"></div>
        <div id="seguir" class="centro"></div>
        <div id="mic"></div>
        <div class="fila entre"><button class="btn sec mini" id="btn-pista">💡 Pista</button><button class="btn sec mini" id="btn-salir">Salir</button></div>
      </div>`;
    r.querySelector('[data-atras]').addEventListener('click', ui.atras);
    const chat = r.querySelector('#chat'), consigna = r.querySelector('#consigna'), pista = r.querySelector('#pista'), seguirIgual = r.querySelector('#seguir');
    // La barra de abajo (consigna, pista y micrófono) queda fija. El chat reserva abajo el alto de esa barra,
    // así el último mensaje siempre queda visible justo encima y nada salta.
    const dock = r.querySelector('#control');
    let pegadoAbajo = true;
    const ajustarEspacio = () => { chat.style.paddingBottom = (dock.offsetHeight + 12) + 'px'; };
    let ignorarHasta = 0; // mientras la app baja sola, el scroll no cuenta como si ella hubiera subido
    const alFinal = () => setTimeout(() => {
      ajustarEspacio();
      if (!pegadoAbajo) return;
      ignorarHasta = Date.now() + 700;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      // Si el desplazamiento suave no llegó (pestaña en segundo plano, teléfono lento), se completa de golpe.
      setTimeout(() => { if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 4) window.scrollTo(0, document.documentElement.scrollHeight); }, 500);
    }, 30);
    const obs = window.ResizeObserver ? new ResizeObserver(() => { ajustarEspacio(); if (pegadoAbajo) window.scrollTo(0, document.documentElement.scrollHeight); }) : null;
    obs && obs.observe(dock);
    ui.alSalir(() => obs && obs.disconnect());
    // Si ella sube a releer algo, no se la arrastra para abajo hasta que vuelva al final.
    const alScroll = () => { if (Date.now() < ignorarHasta) return; pegadoAbajo = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80; };
    window.addEventListener('scroll', alScroll, { passive: true });
    ui.alSalir(() => window.removeEventListener('scroll', alScroll));
    ajustarEspacio();
    const mic = ui.microfono(r.querySelector('#mic'), { alResultado: alHablar });
    r.querySelector('#btn-pista').onclick = darPista;
    r.querySelector('#btn-salir').onclick = () => { M.log('escena-abandono', { escena: escena.id, version, nodo: run.nodoId }); ui.atras(); };

    function pintarLogros() {
      r.querySelector('#logros').innerHTML = ver.logros.map((l) => `<li class="${run.logros.has(l.id) ? 'hecho' : ''}">${u.esc(l.texto)}</li>`).join('');
      r.querySelector('#cuenta').textContent = `${run.logros.size} de ${ver.logros.length}`;
      r.querySelector('#barra-mision').innerHTML = ver.logros.map((l) => `<i class="${run.logros.has(l.id) ? 'hecho' : ''}"></i>`).join('');
    }
    pintarLogros();

    const nodo = () => ver.nodos[run.nodoId];

    function burbujaNpc(texto, tr, { rapido = false } = {}) {
      const d = document.createElement('div');
      d.className = 'burbuja npc';
      d.innerHTML = `<div class="quien">${u.esc(pj.nombre.replace(/^Oficial /, ''))}</div><div>${u.esc(texto)}</div>
        <div class="acciones">${ui.botonDecir(texto, { acento: pj.acento, neural: pj.voz, clase: 'icono chico2' })}${ui.botonDecir(texto, { acento: pj.acento, neural: pj.voz, lento: true, etiqueta: '🐢', clase: 'icono chico2' })}</div>`;
      const fila = document.createElement('div');
      fila.className = 'fila-npc';
      fila.innerHTML = ui.avatar(pj, { chico: true });
      fila.appendChild(d);
      chat.appendChild(fila);
      ui.montarDecir(d);
      pegadoAbajo = true; alFinal();
      return App.voz.decir(texto, { acento: pj.acento, neural: pj.voz, rapido });
    }
    function burbujaYo(texto, entendido) {
      const d = document.createElement('div');
      d.className = 'burbuja yo' + (entendido ? '' : ' noentendi');
      d.innerHTML = `<div>${u.esc(texto)}</div><div class="chico">${entendido ? 'así te entendí' : 'así te entendí (no le alcanzó)'}</div>`;
      chat.appendChild(d);
      pegadoAbajo = true; alFinal();
    }

    async function turnoNpc({ lento = false, texto = null } = {}) {
      if (!vivo) return;
      const n = nodo();
      run.pistasNodo = 0;
      pista.innerHTML = '';
      seguirIgual.innerHTML = '';
      consigna.innerHTML = !n.fin && (mostrarConsigna || M.modo() === 'suave') ? `<div class="consigna"><b>Qué hacer:</b> ${u.esc(n.consigna)}</div>` : '';
      mic.deshabilitar();
      const linea = texto || tpl(n.npc, slots);
      const p = lento ? (burbujaNpcLento(linea)) : burbujaNpc(linea, tpl(n.tr || '', slots), { rapido: !!n.rapido });
      await p;
      if (!vivo) return;
      alFinal();
      if (n.fin) return terminar();
      mic.habilitar();
    }
    function burbujaNpcLento(linea) {
      return burbujaNpc(linea, null).then(() => {}); // la versión lenta ya se escucha con 🐢; acá se repite normal
    }

    function darPista() {
      const n = nodo(); if (n.fin) return;
      run.pistasNodo++; run.pistas++;
      setTimeout(alFinal, 0);
      M.log('pista', { escena: escena.id, nodo: run.nodoId, nivel: run.pistasNodo });
      const modelo = tpl(n.modelo, slots);
      if (run.pistasNodo === 1) {
        pista.innerHTML = `<div class="pista">💡 ${u.esc(n.consigna)}<br><b>Palabras clave:</b> ${u.esc(n.pistas[0])}</div>`;
      } else if (run.pistasNodo === 2) {
        pista.innerHTML = `<div class="pista fila">💡 <span style="flex:1">Arrancá así: <b>${u.esc(tpl(n.pistas[1], slots))}</b></span>${ui.botonDecir(tpl(n.pistas[1], slots).replace(/…/g, ''), { clase: 'icono chico2' })}</div>`;
        ui.montarDecir(pista);
      } else {
        pista.innerHTML = `<div class="pista fila">💡 <span style="flex:1">Podés decir: <b>${u.esc(modelo)}</b></span>${ui.botonDecir(modelo, { clase: 'icono chico2' })}</div>`;
        ui.montarDecir(pista);
      }
    }

    let ocupado = false;
    async function alHablar(res, met) {
      if (!vivo || ocupado) return;
      ocupado = true;
      mic.deshabilitar();
      try { await procesar(res, met); } finally { ocupado = false; }
    }
    async function procesar(res, met) {
      const n = nodo();
      if (n.fin) return;
      const texto = res.texto;
      const intent = E.intencion(n, texto, slots);
      const errs = E.errores(texto, n);
      const conf = E.confusiones(texto, n);
      const entendido = !!intent || (!!n.cualquiera && u.tokens(texto).length > 0);
      burbujaYo(texto, entendido || E.pideRepetir(texto));

      errs.forEach((e) => { M.anotarError(e.regla, texto); run.problemas.push({ ...e, nodo: run.nodoId }); });
      conf.forEach((c) => run.problemas.push({ ...c, nodo: run.nodoId, dijo: texto }));
      // Con Azure: los sonidos flojos de este turno se guardan para la devolución (no se corrige ahora).
      const flojos = App.pron.sonidosFlojos(res.pron, 2);
      flojos.forEach((f) => run.problemas.push({ tipo: 'pronunciacion', ...f, nodo: run.nodoId, dijo: texto, grav: f.alta ? 3 : 2 }));
      if (res.pron && res.pron.ppm) met.ppm = res.pron.ppm;
      const turno = { nodo: run.nodoId, texto, alternativas: res.alternativas, ...met, pistas: run.pistasNodo, intent: intent ? intent.ir : null, errores: errs.map((e) => e.regla), sonidos: conf.map((c) => c.esperada + '→' + c.oida),
        pron: res.pron ? { total: res.pron.total, precision: res.pron.precision, fluidez: res.pron.fluidez, prosodia: res.pron.prosodia, pausas: res.pron.pausasLargas } : null, flojos: flojos.map((f) => `${f.fonema}@${f.palabra}:${f.precision}`) };
      run.turnos.push(turno);
      M.log('turno', { escena: escena.id, version, ...turno, alternativas: undefined, alts: (res.alternativas || []).map((a) => a.map((x) => x.t)) });

      if (!intent && E.pideRepetir(texto)) {
        run.pidioRepetir++;
        if (ver.logros.find((l) => l.id === 'repetir')) { run.logros.add('repetir'); pintarLogros(); }
        mic.deshabilitar();
        await u.espera(300);
        await burbujaNpc('Sure.', null);
        await App.voz.decir(tpl(n.npc, slots), { acento: pj.acento, neural: pj.voz, lento: true });
        mic.habilitar();
        return;
      }

      if (intent || entendido) {
        if (intent?.captura?.valor) slots[intent.captura.slot] = intent.captura.valor;
        if (intent?.logra) { run.logros.add(intent.logra); pintarLogros(); }
        if (run.pistasNodo >= 2 || run.intentos >= 1) run.dificiles.push(run.nodoId);
        run.nodoId = intent ? intent.ir : n.cualquiera;
        run.intentos = 0;
        await u.espera(350);
        return turnoNpc();
      }

      // No se entendió: el personaje reacciona como una persona real.
      run.intentos++; run.reparaciones++;
      run.problemas.push({ tipo: 'noentendido', nodo: run.nodoId, dijo: texto, modelo: tpl(n.modelo, slots), grav: 2 });
      mic.deshabilitar();
      await u.espera(300);
      if (run.intentos >= 3) {
        run.dificiles.push(run.nodoId);
        const sig = n.porDefecto || (n.espera[0] && n.espera[0].ir);
        pista.innerHTML = `<div class="pista">Seguimos igual. Una forma que funciona: <b>${u.esc(tpl(n.modelo, slots))}</b> (la vemos en la devolución).</div>`;
        await burbujaNpc(sig === n.porDefecto ? "Okay, no worries." : "I think I understand. Okay!", null);
        run.nodoId = sig; run.intentos = 0;
        await u.espera(900);
        return turnoNpc();
      }
      const reparo = conf.length ? `Sorry, did you say "${conf[0].oida}"?` : u.azar(REPAROS);
      await burbujaNpc(reparo, conf.length ? '' : 'Perdón, ¿qué dijiste?');
      if (run.intentos === 2 && run.pistasNodo < 2) { run.pistasNodo = 1; darPista(); }
      // Salida para no trabarse: desde el primer "no te entendí" puede seguir igual.
      seguirIgual.innerHTML = `<button class="enlace-teclado" type="button">Seguir igual →</button>`;
      seguirIgual.firstChild.onclick = async () => {
        if (ocupado || !vivo) return;
        ocupado = true; mic.deshabilitar(); seguirIgual.innerHTML = '';
        try {
          run.dificiles.push(run.nodoId);
          M.log('seguir-igual', { escena: escena.id, nodo: run.nodoId });
          const sig = n.porDefecto || n.cualquiera || (n.espera[0] && n.espera[0].ir);
          await burbujaNpc('Okay, no worries.', null);
          run.nodoId = sig; run.intentos = 0;
          await u.espera(500);
          await turnoNpc();
        } finally { ocupado = false; }
      };
      alFinal();
      mic.habilitar();
    }

    function terminar() {
      if (!vivo || !r.querySelector('#control')) return;
      r.querySelector('#control').innerHTML = `<button class="btn acento ancho grande" id="ver-dev">Ver la devolución ›</button>`;
      r.querySelector('#ver-dev').onclick = () => devolucion(r, ctx, run);
      alFinal();
    }

    turnoNpc();
  }

  // ── Devolución
  function devolucion(r, ctx, run) {
    const { escena, version, ver, pj, slots, sesion } = ctx;
    const modo = M.modo();
    const cumplida = ver.logros.every((l) => run.logros.has(l.id));
    const lats = run.turnos.map((t) => t.latencia).filter((x) => x != null && x < 60);
    const ppms = run.turnos.map((t) => t.ppm).filter((x) => x != null && x < 400);
    const metricas = { latencia: u.redondear(u.promedio(lats), 1), ppm: Math.round(u.promedio(ppms) || 0) || null, turnos: run.turnos.length, palabras: run.turnos.reduce((s, t) => s + t.palabras, 0), duracionMin: u.redondear((Date.now() - run.inicio) / 60000, 1), pidioRepetir: run.pidioRepetir };
    const conPron = run.turnos.map((t) => t.pron).filter((x) => x && x.total != null);
    if (conPron.length) {
      metricas.pron = Math.round(u.promedio(conPron.map((x) => x.total)));
      metricas.fluidezAz = Math.round(u.promedio(conPron.map((x) => x.fluidez).filter((x) => x != null)) || 0) || null;
      metricas.prosodia = Math.round(u.promedio(conPron.map((x) => x.prosodia).filter((x) => x != null)) || 0) || null;
    }

    let problemas = run.problemas;
    if (modo === 'suave') problemas = problemas.filter((p) => p.tipo !== 'sonido');
    const elegidos = E.elegirDevolucion(problemas, modo === 'suave' ? 1 : 3);

    // Algo que salió bien
    const buenos = run.turnos.filter((t) => t.intent && t.pistas === 0 && !t.errores.length);
    const mejor = buenos.sort((a, b) => b.palabras - a.palabras || (a.latencia ?? 99) - (b.latencia ?? 99))[0];
    const porQueBien = mejor ? (mejor.palabras >= 6 ? 'una frase completa, sin pistas' : mejor.latencia != null && mejor.latencia < 3 ? 'arrancaste rápido y se entendió' : 'se entendió a la primera') : '';

    // Frases al repaso
    let nuevas = 0;
    escena.frases.forEach((f, i) => { if (M.agregarTarjeta({ id: `${escena.id}:${i}`, en: tpl(f.en, slots), es: f.es, origen: escena.id })) nuevas++; });
    [...new Set(run.dificiles)].forEach((nid) => {
      const n = ver.nodos[nid];
      if (n && n.modelo && M.agregarTarjeta({ id: `${escena.id}:${version}:${nid}`, en: tpl(n.modelo, slots), es: n.consigna, origen: escena.id })) nuevas++;
    });

    M.terminarEscena(escena.id, version, { cumplida, pistas: run.pistas, reparaciones: run.reparaciones, metricas });
    M.log('escena-fin', { escena: escena.id, version, cumplida, pistas: run.pistas, reparaciones: run.reparaciones, ...metricas, devolucion: elegidos.map((e) => e.clave) });

    const falta = ver.logros.filter((l) => !run.logros.has(l.id));
    const tarjetas = elegidos.map((p, i) => tarjetaProblema(p, i, pj)).join('');
    r.innerHTML = `${ui.barra('Devolución')}
      ${cumplida ? `<div class="sellote"><span class="e">${escena.emoji}</span>Misión<br>cumplida</div>` :
        `<div class="tarjeta mostaza"><b>Casi.</b> Te faltó: ${falta.map((l) => u.esc(l.texto.toLowerCase())).join(', ')}. La próxima sale.</div>`}
      ${metricas.pron != null ? `<div class="tarjeta"><div class="fila" style="flex-wrap:nowrap;gap:16px">${ui.anillo(metricas.pron, { tam: 84 })}<div><b>Pronunciación de la escena</b><div class="chico">${metricas.pron >= 80 ? 'Muy clara: se te entiende sin esfuerzo.' : metricas.pron >= 60 ? 'Se entiende. Abajo está lo que más conviene pulir.' : 'Hay sonidos que todavía cuesta entender. Vamos de a uno.'}</div></div></div></div>` : ''}
      ${mejor ? `<div class="tarjeta ok"><b>Lo que salió bien</b><p>«${u.esc(mejor.texto)}» — ${porQueBien}.</p></div>` : ''}
      ${elegidos.length ? `<h2>${elegidos.length === 1 ? 'Una cosa para mejorar' : `${elegidos.length} cosas para mejorar`}</h2><p class="chico">Primero intentá vos; si no sale, mirá la respuesta.</p>${tarjetas}`
        : `<div class="tarjeta"><b>Nada para corregir esta vez.</b> ${modo === 'suave' ? 'Hoy estaba en modo suave.' : '¡Muy bien!'}</div>`}
      <div class="tarjeta borde">
        <div class="stat"><span>Tardaste en arrancar (promedio)</span><b>${metricas.latencia != null ? metricas.latencia + ' s' : '—'}</b></div>
        <div class="stat"><span>Palabras por minuto</span><b>${metricas.ppm ?? '—'}</b></div>
        <div class="stat"><span>Pistas usadas</span><b>${run.pistas}</b></div>
        <div class="stat"><span>Veces que no te entendió</span><b>${run.reparaciones}</b></div>
        ${run.pidioRepetir ? `<div class="stat"><span>Pediste que repita</span><b>${run.pidioRepetir} 👍</b></div>` : ''}
        <p class="nota-pie">${nuevas ? `Sumé ${nuevas} frases a tu repaso.` : ''} Esta escena vuelve en unos días para repetirla.</p>
      </div>
      <div class="col">
        <button class="btn acento ancho" id="seguir">${sesion ? 'Seguir con la sesión →' : 'Terminar'}</button>
        <button class="btn sec ancho" id="repetir">Repetir la escena</button>
      </div>`;
    r.querySelector('[data-atras]').addEventListener('click', ui.atras);
    ui.montarDecir(r);
    ui.on(r, '[data-ficha]', (el) => ui.fichaHoja(el.dataset.ficha));
    ui.on(r, '[data-ver]', (el) => { r.querySelector('#sol-' + el.dataset.ver).classList.remove('oculto'); el.remove(); });
    ui.on(r, '[data-lab]', (el) => ui.ir('sonido', { id: el.dataset.lab }));
    elegidos.forEach((p, i) => montarReintento(r, p, i));
    r.querySelector('#seguir').onclick = () => (sesion ? App.sesion.siguiente({ problemas: elegidos }) : ui.atras());
    r.querySelector('#repetir').onclick = () => ui.ir('escena', { id: escena.id, version, sesion }, { reemplazar: true });
  }

  function tarjetaProblema(p, i, pj) {
    if (p.tipo === 'gramatica') {
      return `<div class="tarjeta"><div class="chico">Cómo se arma</div>
        <p>Dijiste: «${u.esc(p.dijo)}»</p>
        <p class="tenue">¿Cómo lo dirías mejor? Decilo de nuevo.</p>
        <div id="mic-${i}"></div><div id="res-${i}"></div>
        <button class="btn mini sec" data-ver="${i}">Ver la respuesta</button>
        <div id="sol-${i}" class="oculto"><p><b>${u.esc(p.mejor)}</b> ${ui.botonDecir(p.mejor, { clase: 'icono chico2' })}</p><p class="chico">${u.esc(p.porque)}</p>
          <button class="chip" data-ficha="${p.ficha}">📘 Ver la ficha</button></div></div>`;
    }
    if (p.tipo === 'sonido') {
      const s = App.datos.sonidos.find((x) => x.id === p.contraste);
      return `<div class="tarjeta"><div class="chico">Sonido · ${u.esc(s.titulo)}</div>
        <p>Quisiste decir <b>${u.esc(p.esperada)}</b>, pero se escuchó <b>${u.esc(p.oida)}</b>.</p>
        <div class="fila">${ui.botonDecir(p.esperada, { etiqueta: '▶ ' + p.esperada, clase: 'chip' })}${ui.botonDecir(p.oida, { etiqueta: '▶ ' + p.oida, clase: 'chip gris' })}</div>
        <p class="chico">${u.esc(s.simbolos[0])} ${u.esc(s.comoA)}<br>${u.esc(s.simbolos[1])} ${u.esc(s.comoB)}</p>
        <p class="tenue">Decí <b>${u.esc(p.esperada)}</b>:</p><div id="mic-${i}"></div><div id="res-${i}"></div>
        <button class="chip mostaza" data-lab="${s.id}">🔊 Practicar este sonido</button></div>`;
    }
    if (p.tipo === 'pronunciacion') {
      const tip = App.pron.TIPS[p.fonema];
      const lab = App.datos.sonidos.find((s) => s.ipa && s.ipa.includes(p.fonema));
      const w = p.palabra.toLowerCase();
      return `<div class="tarjeta"><div class="chico">Pronunciación</div>
        <p>En <b>${u.esc(p.palabra)}</b>, el sonido <span class="simbolo">/${u.esc(p.fonema)}/</span> salió <b class="${App.pron.clase(p.precision)}">${p.precision}/100</b>${p.oido ? ` (sonó como <span class="simbolo">/${u.esc(p.oido)}/</span>)` : ''}.</p>
        ${tip ? `<p class="chico">${u.esc(tip)}</p>` : ''}
        <div class="fila">${ui.botonDecir(w, { etiqueta: '▶ ' + w, clase: 'chip' })}${ui.botonDecir(w, { etiqueta: '🐢', lento: true, clase: 'chip' })}</div>
        <p class="tenue">Escuchala y decí <b>${u.esc(w)}</b>:</p><div id="mic-${i}"></div><div id="res-${i}"></div>
        ${lab ? `<button class="chip mostaza" data-lab="${lab.id}">🔊 Practicar este sonido</button>` : ''}</div>`;
    }
    return `<div class="tarjeta"><div class="chico">Esto no se entendió</div>
      <p>Dijiste: «${u.esc(p.dijo)}»</p>
      <p>Una forma que funciona: <b>${u.esc(p.modelo)}</b> ${ui.botonDecir(p.modelo, { clase: 'icono chico2' })}</p>
      <p class="tenue">Escuchala y decila vos:</p><div id="mic-${i}"></div><div id="res-${i}"></div></div>`;
  }

  function montarReintento(r, p, i) {
    const res = r.querySelector('#res-' + i);
    ui.microfono(r.querySelector('#mic-' + i), {
      etiqueta: 'Tocá y decilo.',
      continuo: p.tipo !== 'sonido' && p.tipo !== 'pronunciacion',
      referencia: p.tipo === 'pronunciacion' ? p.palabra.toLowerCase() : p.tipo === 'sonido' ? p.esperada : p.tipo === 'noentendido' ? p.modelo : '',
      maxAlternativas: 5,
      alResultado(rr) {
        let ok = false;
        if (p.tipo === 'gramatica') {
          const sigue = E.errores(rr.texto, { pedir: true }).some((e) => e.regla === p.regla);
          ok = !sigue && u.similitud(rr.texto, p.mejor.replace(/…/g, '')) >= 0.45;
          if (ok) M.anotarCorregido(p.regla);
        } else if (p.tipo === 'sonido') {
          const tks = u.tokens(rr.texto);
          ok = tks.includes(p.esperada) && !tks.includes(p.oida);
          M.anotarProduccion(p.contraste, ok ? 'ok' : tks.includes(p.oida) ? 'par' : 'otra', { palabra: p.esperada, dijo: rr.texto, origen: 'devolucion' });
        } else if (p.tipo === 'pronunciacion') {
          const o = App.pron.sonidoObjetivo(rr.pron, [p.fonema], p.palabra);
          ok = !!o && (o.precision ?? 0) >= App.pron.UMBRAL.labOk;
        } else {
          ok = E.comparar(rr.texto, p.modelo).exacto;
        }
        M.log('reintento', { tipo: p.tipo, clave: p.clave, dijo: rr.texto, ok, pron: rr.pron?.total });
        const obj = p.tipo === 'pronunciacion' ? App.pron.sonidoObjetivo(rr.pron, [p.fonema], p.palabra) : null;
        const detalle = obj && obj.precision != null ? ` <span class="chico">· /${u.esc(p.fonema)}/ ${Math.round(obj.precision)}/100 (antes ${p.precision})</span>` : '';
        res.innerHTML = `<p>Entendí: «${u.esc(rr.texto)}» ${ok ? '<span class="marca-ok">✓ ¡eso!</span>' : '<span class="marca-casi">todavía no; probá de nuevo o mirá la respuesta</span>'}${detalle}</p>${App.pron.tarjeta(rr.pron, { sinNumero: p.tipo === 'pronunciacion' })}`;
        App.pron.montar(res, rr.pron);
      },
    });
  }
})();
