// Pantallas generales (bienvenida, inicio, practicar, pasaporte, cierre, ajustes, registro) y arranque.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, M = App.modelo;
  const CARITAS = ['😣', '😕', '😐', '🙂', '😄'];
  const marca = '<span class="marca-logo">En</span>Pasaporte';
  const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada = () => window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;

  // Campo de código de acceso (desbloquea Azure sin pegar claves). Llama a alEntrar(resultado) si funciona.
  function campoCodigo(id = 'cod') {
    return `<div class="fila" style="flex-wrap:nowrap"><input type="text" id="${id}" placeholder="por ejemplo: luna-tango-faro-miel" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn acento" id="${id}-ok">Entrar</button></div><div id="${id}-estado" class="chico" style="margin-top:6px"></div>`;
  }
  function montarCodigo(r, id, alEntrar) {
    const inp = r.querySelector('#' + id), est = r.querySelector('#' + id + '-estado'), btn = r.querySelector('#' + id + '-ok');
    const probar = async () => {
      if (!inp.value.trim()) return;
      btn.disabled = true; est.textContent = 'Abriendo…';
      const res = await App.acceso.entrar(inp.value);
      btn.disabled = false;
      if (res) { est.innerHTML = `<span class="azure-ok">✓ Listo${res.quien ? ', ' + u.esc(res.quien) : ''}.</span> Voz natural y puntaje de pronunciación activados.`; alEntrar && alEntrar(res); }
      else est.innerHTML = '<span class="marca-no">Ese código no funciona.</span> Revisalo (van las palabras con guiones).';
    };
    btn.onclick = probar;
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') probar(); });
  }

  // ── Bienvenida (primera vez)
  App.pantallas.bienvenida = function () {
    const p = M.estado.perfil;
    const conCodigo = App.acceso.hayCodigos() && !App.azure.configurado();
    const html = `<div class="barra"><h1 class="marca">${marca}</h1></div>
      <div class="hero"><p class="saludo">Hola 👋</p>
        <p class="sub">Esto es para <b style="color:#fff">hablar</b> inglés, no para leerlo. Cada día, unos minutos: frases de viaje, una escena con un personaje y una devolución corta.</p>
        <p class="sub" style="font-size:13px;margin-top:8px">No se graba nada: lo que decís se convierte en texto para evaluarlo y queda en este teléfono.</p></div>
      ${conCodigo ? `<div class="tarjeta"><h3>Tu código de acceso</h3><p class="chico">Te lo pasó Owen. Activa las voces naturales y el puntaje de pronunciación.</p>${campoCodigo('cod')}</div>` : ''}
      <div class="tarjeta">
        <label for="nom" style="margin-top:0">¿Cómo te llamás?</label><input type="text" id="nom" value="${u.esc(p.nombre)}" placeholder="Tu nombre">
        <label for="acc">¿Qué inglés preferís escuchar?</label>
        <select id="acc"><option value="en-GB" ${p.acento !== 'en-US' ? 'selected' : ''}>Británico</option><option value="en-US" ${p.acento === 'en-US' ? 'selected' : ''}>Estadounidense</option></select>
      </div>
      <div class="tarjeta mostaza"><h3>Tres frases de emergencia</h3><p class="chico">Con estas nunca te quedás muda. Escuchalas y decilas una vez.</p>
        ${[['Sorry, could you repeat that?', 'Perdón, ¿podés repetir?'], ['Could you speak more slowly, please?', '¿Podés hablar más despacio?'], ['How do you say … in English?', '¿Cómo se dice … en inglés?']]
          .map(([en, es]) => `<div class="frase"><div class="txt"><div class="en">${u.esc(en)}</div><div class="es">${es}</div></div>${ui.botonDecir(en)}</div>`).join('')}
      </div>
      <div class="tarjeta"><h3>Probá el micrófono</h3><p class="chico">Tocá, decí "Hello, my name is…" y tocá de nuevo.</p><div id="mic"></div><div id="res" class="centro"></div></div>
      <button class="btn acento ancho grande" id="listo">Empezar</button>`;
    return {
      html,
      montar(r) {
        ui.montarDecir(r);
        if (conCodigo) montarCodigo(r, 'cod', (res) => { if (res.quien && !r.querySelector('#nom').value) r.querySelector('#nom').value = res.quien; });
        ui.microfono(r.querySelector('#mic'), {
          alResultado(res) {
            const z = r.querySelector('#res');
            z.innerHTML = `<p>Entendí: «${u.esc(res.texto)}» ✓</p>${App.pron.tarjeta(res.pron)}`;
            App.pron.montar(z, res.pron);
            M.log('prueba-mic', { dijo: res.texto, pron: res.pron?.total });
          },
        });
        r.querySelector('#acc').onchange = (e) => { p.acento = e.target.value; M.guardar(); };
        r.querySelector('#listo').onclick = () => {
          p.nombre = u.capital(r.querySelector('#nom').value.trim());
          p.acento = r.querySelector('#acc').value;
          p.listo = true; M.guardar(); M.log('bienvenida', { acento: p.acento });
          ui.aInicio();
        };
      },
    };
  };

  // ── Inicio
  App.pantallas.inicio = function () {
    const p = M.estado.perfil;
    if (!p.listo) return App.pantallas.bienvenida();
    const animo = M.animoHoy();
    const plan = App.sesion.plan();
    const venc = M.vencidas().length;
    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buen día' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
    // Semana actual (lunes a domingo) y días practicados: la racha es semanal, 4 de 7 alcanza.
    const dias = M.diasPracticados();
    const hoy = new Date(); const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const semana = [...'LMMJVSD'].map((l, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); const k = d.toLocaleDateString('sv-SE'); return { l, hecho: dias.has(k), hoy: k === hoy.toLocaleDateString('sv-SE') }; });
    const enSemana = semana.filter((d) => d.hecho).length;
    const sellos = App.datos.escenas.reduce((n, s) => n + ['A', 'B'].filter((v) => M.estado.escenas[s.id]?.[v]?.cumplidas).length, 0);
    const toca = M.sonidoQueToca();
    const html = `<div class="barra"><h1 class="marca">${marca}</h1><button class="btn-redondo" id="ajustes" aria-label="Ajustes">⚙️</button></div>
      <div class="hero">
        <p class="saludo">${saludo}${p.nombre ? ', ' + u.esc(p.nombre) : ''}</p>
        <p class="sub">${enSemana >= 4 ? '¡Semana cumplida! Todo lo que sumes ahora es extra.' : enSemana ? `Esta semana practicaste ${enSemana} ${enSemana === 1 ? 'día' : 'días'}.` : 'Unos minutos hoy y arrancás la semana.'}</p>
        <div class="semana">${semana.map((d) => `<div class="dia ${d.hecho ? 'hecho' : ''} ${d.hoy ? 'hoy' : ''}"><i>${d.hecho ? '✓' : ''}</i>${d.l}</div>`).join('')}</div>
        <div class="racha">Meta: 4 días por semana · ${Math.min(enSemana, 4)}/4</div>
      </div>
      ${esIOS() && !instalada() && !p.ocultarInstalar ? `<div class="tarjeta mostaza" id="instalar"><b>📲 Guardá la app en tu inicio</b>
        <p class="chico">En Safari, tocá el botón <b>Compartir</b> (el cuadrado con la flecha ⬆), después <b>"Agregar a inicio"</b>. Va a quedar como una app más.</p>
        <p class="chico">Ojo: la app del inicio empieza de cero. Para llevarte lo que ya practicaste, primero tocá <b>"Llevar mi progreso"</b>, guardá el archivo y abrilo en la app nueva desde ⚙️ Ajustes → <b>Recuperar mi progreso</b>. También vas a tener que volver a escribir tu código.</p>
        <div class="fila"><button class="btn mini" id="llevar">⬇ Llevar mi progreso</button><button class="btn mini sec" id="ocultar-instalar">Ya está</button></div></div>` : ''}
      ${!App.azure.configurado() ? `<div class="tarjeta sello clic" id="falta-azure"><b>${App.acceso.hayCodigos() ? 'Ingresá tu código de acceso' : 'Falta configurar Azure'}</b><p class="chico">Sin eso, la voz depende del navegador y no hay puntaje de pronunciación. Tocá acá.</p></div>` : ''}
      <div class="tarjeta"><b>¿Cómo venís hoy para hablar?</b>
        <div class="caritas">${CARITAS.map((c, i) => `<button data-animo="${i + 1}" class="${animo === i + 1 ? 'sel' : ''}" aria-label="${i + 1}">${c}</button>`).join('')}</div>
        ${animo ? `<p class="chico" style="margin-top:8px">${{ suave: 'Modo suave: escenas guiadas y una sola corrección.', normal: 'Modo normal.', desafio: 'Modo desafío: versiones con imprevistos.' }[M.modo()]}</p>` : ''}</div>
      <div class="tarjeta acento clic" id="sesion">
        <div class="cta"><div class="play">▶</div><div><div class="chico">Sesión de hoy · unos 12 minutos</div><h2>Empezar</h2></div></div>
        <div class="pasos-chip">${plan.map((x, i) => `<span>${i + 1}. ${u.esc(x.titulo.replace(/^(Calentamiento|Escena|Arrancar a hablar): ?/, (m, a) => a === 'Escena' ? '' : a + ' · '))}</span>`).join('')}</div>
      </div>
      <div class="seccion">Por tu cuenta</div>
      <div class="grilla">
        <div class="tarjeta modulo clic" data-ir="mapa"><span class="ico c1">🛂</span><b>Pasaporte</b><span class="chico">${sellos} de ${App.datos.escenas.length * 2} sellos</span></div>
        <div class="tarjeta modulo clic" data-ir="arrancar"><span class="ico c2">🗣️</span><b>Arrancar</b><span class="chico">Responder sin quedarte en blanco</span></div>
        <div class="tarjeta modulo clic" data-ir="sonidos"><span class="ico c3">🔊</span><b>Sonidos</b><span class="chico">Te toca: ${u.esc(toca.titulo)}</span></div>
        <div class="tarjeta modulo clic" data-ir="repaso"><span class="ico c4">🔁</span><b>Repaso</b><span class="chico">${venc ? venc + ' frases para hoy' : 'Al día'}</span></div>
      </div>`;
    return {
      html,
      montar(r) {
        ui.on(r, '[data-animo]', (el) => { M.registrarAnimo(Number(el.dataset.animo)); ui.refrescar(); });
        ui.on(r, '[data-ir]', (el) => ui.ir(el.dataset.ir));
        r.querySelector('#sesion').onclick = () => App.sesion.empezar();
        r.querySelector('#ajustes').onclick = () => ui.ir('ajustes');
        r.querySelector('#falta-azure')?.addEventListener('click', () => ui.ir('ajustes'));
        r.querySelector('#llevar')?.addEventListener('click', () => App.compartir.mandar());
        r.querySelector('#ocultar-instalar')?.addEventListener('click', () => { p.ocultarInstalar = true; M.guardar(); ui.refrescar(); });
      },
    };
  };

  // ── Practicar (los módulos sueltos)
  App.pantallas.practicar = function () {
    const venc = M.vencidas().length;
    const toca = M.sonidoQueToca();
    const items = [
      ['arrancar', '🗣️', 'c2', 'Arrancar a hablar', 'Te hacen una pregunta y respondés arrancando con la misma pregunta, dada vuelta.'],
      ['sonidos', '🔊', 'c3', 'Laboratorio de sonidos', `Oído y boca, sonido por sonido. Te toca: ${toca.titulo}.`],
      ['repaso', '🔁', 'c4', 'Repaso de frases', venc ? `${venc} frases para hoy, dichas en voz alta.` : 'Al día. Podés practicar igual.'],
      ['arsenal', '🛡️', 'c1', 'Arsenal para defenderte', 'Frases armadas por situación, para practicarlas en voz alta.'],
      ['verbos', '📋', 'c2', 'Verbos irregulares', 'Las tres formas de cada verbo, su conjugación y práctica oral del pasado.'],
    ];
    const html = `<div class="barra"><h1>Practicar</h1></div>
      <p class="tenue">Módulos sueltos, para cuando tengas ganas. La sesión de hoy ya los combina.</p>
      <div class="lista-mod">${items.map(([id, e, c, t, d]) => `<div class="tarjeta clic" data-ir="${id}"><span class="ico ${c}">${e}</span><div><b>${t}</b><div class="chico">${u.esc(d)}</div></div><span class="flecha">›</span></div>`).join('')}</div>`;
    return { html, montar(r) { ui.on(r, '[data-ir]', (el) => ui.ir(el.dataset.ir)); } };
  };

  // ── Pasaporte (mapa de escenas)
  App.pantallas.mapa = function () {
    const rec = M.escenaRecomendada();
    const tramos = [];
    for (const s of App.datos.escenas) { let t = tramos.find((x) => x.n === s.tramo); if (!t) tramos.push((t = { n: s.tramo, l: [] })); t.l.push(s); }
    const html = `<div class="barra"><h1>Pasaporte</h1></div>
      <p class="tenue">Cada escena tiene dos sellos: <b>A</b>, guiada, y <b>B</b>, con imprevistos. Elegí la que quieras; la marcada es la que te recomiendo hoy.</p>
      ${tramos.map((t) => `<div class="tramo"><div class="tramo-titulo">${u.esc(t.n)}</div>
        ${t.l.map((s) => {
          const e = M.estado.escenas[s.id];
          const prox = e?.proxima ? (e.proxima <= Date.now() ? 'toca repetirla' : 'vuelve el ' + u.fecha(e.proxima)) : '';
          return `<div class="tarjeta escena"><span class="emoji">${s.emoji}</span><div class="info">
            <div class="fila entre"><b>${u.esc(s.titulo)}</b>${rec.escena.id === s.id ? '<span class="chip">hoy</span>' : ''}</div>
            <div class="chico">${u.esc(s.puedo)}</div>
            <div class="sellos">${['A', 'B'].map((v) => `<button class="sellito ${e?.[v]?.cumplidas ? 'hecho' : ''}" data-escena="${s.id}" data-v="${v}" aria-label="Versión ${v}">${v}</button>`).join('')}
              <span class="chico">${prox}</span></div></div></div>`;
        }).join('')}</div>`).join('')}
      <p class="nota-pie">Próximamente: moverse por la ciudad, restaurante, compras, farmacia e imprevistos.</p>`;
    return { html, montar(r) { ui.on(r, '[data-escena]', (el) => ui.ir('escena', { id: el.dataset.escena, version: el.dataset.v })); } };
  };

  // ── Cierre de la sesión
  App.pantallas.cierre = function ({ pasos = [] }) {
    const ult = M.estado.sesiones[M.estado.sesiones.length - 1];
    const html = `${ui.barra('Sesión terminada', { atras: false })}
      <div class="sellote"><span class="e">✈️</span>Hoy<br>hablaste</div>
      <div class="tarjeta"><ul class="pasos">${pasos.map((p) => `<li class="hecho">✓ ${u.esc(p)}</li>`).join('')}</ul></div>
      ${ult ? `<div class="tarjeta ok"><b>Hoy:</b> ${ult.palabras} palabras dichas en la escena${ult.latencia != null ? `, arrancando en ${ult.latencia} s en promedio` : ''}${ult.pron != null ? `, con ${ult.pron}/100 de pronunciación` : ''}.</div>` : ''}
      <p class="chico centro">Mañana, otro ratito. Con 4 días por semana alcanza.</p>
      <button class="btn acento ancho grande" id="ok">Volver al inicio</button>`;
    return { html, montar(r) { r.querySelector('#ok').onclick = () => ui.aInicio(); } };
  };

  // ── Ajustes
  App.pantallas.ajustes = function () {
    const p = M.estado.perfil;
    const conCodigos = App.acceso.hayCodigos();
    const html = `${ui.barra('Ajustes')}
      <div class="tarjeta">
        <label style="margin-top:0">Nombre</label><input type="text" id="nom" value="${u.esc(p.nombre)}">
        <label>Inglés que preferís escuchar</label>
        <select id="acc"><option value="en-GB" ${p.acento !== 'en-US' ? 'selected' : ''}>Británico</option><option value="en-US" ${p.acento === 'en-US' ? 'selected' : ''}>Estadounidense</option></select>
        <p class="chico">También define contra qué acento se evalúa tu pronunciación.</p>
        <label>Velocidad de las voces: <span id="vel-v">${p.velocidad}</span></label>
        <input type="range" id="vel" min="0.7" max="1.1" step="0.05" value="${p.velocidad}" style="width:100%">
        <label style="font-weight:600"><input type="checkbox" id="tec" ${p.teclado ? 'checked' : ''}> Modo teclado (escribir en vez de hablar, para probar)</label>
        <button class="btn mini sec" id="probar" style="margin-top:8px">▶ Probar la voz</button>
      </div>
      <div class="tarjeta ${App.azure.configurado() ? 'ok' : 'mostaza'}">
        <h3>Voz natural y puntaje de pronunciación</h3>
        <p class="chico">${App.azure.configurado() ? `✓ Activado${p.quien ? ' para ' + u.esc(p.quien) : ''}.` : 'Todavía no está activado.'}</p>
        ${conCodigos ? `<label>Código de acceso</label>${campoCodigo('cod')}` : ''}
        <details style="margin-top:10px"><summary class="chico">Avanzado: cargar la clave de Azure a mano</summary>
          <label>Clave (Key 1)</label><input type="password" id="az-clave" value="${u.esc(p.azure?.clave || '')}" autocomplete="off" placeholder="pegá la clave del recurso">
          <label>Región</label><input type="text" id="az-region" value="${u.esc(p.azure?.region || '')}" placeholder="por ejemplo: eastus">
          <label style="font-weight:600"><input type="checkbox" id="az-off" ${p.azure?.desactivado ? 'checked' : ''}> Desactivar Azure por ahora</label>
          <div class="fila" style="margin-top:8px"><button class="btn mini" id="az-probar">Guardar y probar</button><span id="az-estado" class="chico"></span></div>
        </details>
      </div>
      <div class="tarjeta borde">
        <h3>Recuperar mi progreso</h3>
        <p class="chico">Si guardaste la app en el inicio o cambiaste de teléfono: abrí el archivo que bajaste con "Llevar mi progreso" o "Mandar mi progreso". Reemplaza lo de este dispositivo.</p>
        <input type="file" id="propio" accept=".json,application/json" style="display:none"><button class="btn mini sec" id="propio-btn">📂 Abrir mi archivo de progreso</button>
      </div>
      <div class="tarjeta borde">
        <h3>Ver el progreso de otra persona</h3>
        <p class="chico">Abrí el archivo que te mandaron desde "Mandar mi progreso". Se ve en modo lectura y no toca tus datos.</p>
        <input type="file" id="ajeno" accept=".json,application/json" style="display:none"><button class="btn mini sec" id="ajeno-btn">📂 Abrir archivo de progreso</button>
      </div>
      <p class="centro chico"><a href="#" id="registro">Registro de pruebas</a></p>
      <button class="btn acento ancho grande" id="guardar">Guardar</button>`;
    return {
      html,
      montar(r) {
        if (conCodigos) montarCodigo(r, 'cod', () => setTimeout(() => ui.refrescar(), 1200));
        r.querySelector('#vel').oninput = (e) => (r.querySelector('#vel-v').textContent = e.target.value);
        r.querySelector('#probar').onclick = () => { p.velocidad = Number(r.querySelector('#vel').value); App.voz.decir('Hi! Could I get a medium latte with oat milk, please?', { acento: r.querySelector('#acc').value }); };
        const guardarAzure = () => {
          const clave = r.querySelector('#az-clave').value.trim(), region = r.querySelector('#az-region').value.trim().toLowerCase().replace(/\s+/g, '');
          if (clave || region || p.azure) p.azure = { clave: clave || p.azure?.clave || '', region: region || p.azure?.region || '', desactivado: r.querySelector('#az-off').checked };
          M.guardar();
          App.acceso.guardarRespaldo();
        };
        r.querySelector('#az-probar').onclick = async () => {
          guardarAzure();
          const est = r.querySelector('#az-estado');
          if (!App.azure.configurado()) { est.textContent = 'Falta la clave o la región.'; return; }
          est.textContent = 'Probando…';
          const res = await App.azure.probar();
          if (res.ok) {
            est.innerHTML = '<span class="azure-ok">✓ Funciona.</span> Escuchá la voz.';
            App.voz.decir('Hello! Your pronunciation coach is ready.', { neural: App.voz.narrador() });
            M.log('azure-ok', { region: p.azure.region });
          } else {
            est.textContent = '✗ ' + (res.msj || 'No funcionó') + ' Revisá la clave y la región.';
            M.log('azure-error', { msj: res.msj });
          }
        };
        const propio = r.querySelector('#propio');
        r.querySelector('#propio-btn').onclick = () => propio.click();
        propio.onchange = async () => {
          try {
            const d = JSON.parse(await propio.files[0].text());
            if (!d.estado || !d.estado.perfil) throw new Error('formato');
            if (!confirm(`¿Reemplazar el progreso de este dispositivo por el del archivo (${d.estado.sesiones?.length || 0} escenas)?`)) return;
            M.restaurar(d.estado);
            ui.aviso('Listo: recuperé tu progreso.'); ui.aInicio();
          } catch (e) { ui.aviso('Ese archivo no es un progreso de Pasaporte.'); }
        };
        const archivo = r.querySelector('#ajeno');
        r.querySelector('#ajeno-btn').onclick = () => archivo.click();
        archivo.onchange = async () => {
          try {
            const d = JSON.parse(await archivo.files[0].text());
            if (!d.estado || !d.estado.perfil) throw new Error('formato');
            M.verAjeno(d.estado, d.quien);
            ui.ir('progreso', { exportado: d.exportado });
          } catch (e) { ui.aviso('Ese archivo no es un progreso de Pasaporte.'); }
        };
        r.querySelector('#registro').onclick = (e) => { e.preventDefault(); ui.ir('registro'); };
        r.querySelector('#guardar').onclick = () => {
          guardarAzure();
          p.nombre = u.capital(r.querySelector('#nom').value.trim());
          p.acento = r.querySelector('#acc').value;
          p.velocidad = Number(r.querySelector('#vel').value);
          p.teclado = r.querySelector('#tec').checked;
          M.guardar(); M.log('ajustes', { acento: p.acento, velocidad: p.velocidad, teclado: p.teclado });
          ui.aviso('Guardado'); ui.atras();
        };
      },
    };
  };

  // ── Registro de pruebas (para revisar con Owen)
  App.pantallas.registro = function () {
    const reg = M.estado.registro.slice(-80).reverse();
    const linea = (e) => {
      const { t, tipo, ...rest } = e;
      const det = Object.entries(rest).filter(([, v]) => v != null && v !== '' && !(Array.isArray(v) && !v.length)).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ');
      return `${u.fechaHora(t)}  ${tipo}  ${det}`;
    };
    const html = `${ui.barra('Registro de pruebas')}
      <p class="chico">Todo lo que hace la app queda anotado acá (lo último arriba). Sirve para revisar las pruebas y ajustar la evaluación. La clave de Azure nunca se exporta.</p>
      <div class="fila"><button class="btn mini" id="exp">⬇ Exportar JSON</button><button class="btn mini sec" id="cop">Copiar</button><button class="btn mini sello" id="borrar">Borrar todo</button></div>
      <div class="espacio"></div>
      <div class="registro">${reg.length ? reg.map((e) => u.esc(linea(e))).join('\n') : 'Vacío.'}</div>`;
    return {
      html,
      montar(r) {
        r.querySelector('#exp').onclick = () => App.compartir.descargar();
        r.querySelector('#cop').onclick = async () => { try { await navigator.clipboard.writeText(M.exportar()); ui.aviso('Copiado'); } catch (e) { ui.aviso('No se pudo copiar'); } };
        r.querySelector('#borrar').onclick = () => { if (confirm('¿Borrar todo el progreso y el registro de este dispositivo?')) { M.borrarTodo(); ui.aInicio(); } };
      },
    };
  };

  // ── Compartir el progreso (sin servidores: un archivo que ella manda por WhatsApp, mail, etc.)
  App.compartir = {
    nombreArchivo() {
      const q = (M.estado.perfil.quien || M.estado.perfil.nombre || 'progreso').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-');
      return `pasaporte-${q}-${new Date().toLocaleDateString('sv-SE')}.json`;
    },
    resumen() {
      const st = M.estado, ses = st.sesiones;
      const ult = ses.slice(-5);
      const prom = (k) => { const xs = ult.map((s) => s[k]).filter((x) => x != null); return xs.length ? Math.round(u.promedio(xs)) : null; };
      const dias = M.diasPracticados().size;
      return [`Pasaporte · progreso de ${st.perfil.nombre || 'alguien'} (${new Date().toLocaleDateString('es-AR')})`,
        `Días practicados: ${dias} · Escenas jugadas: ${ses.length}`,
        prom('pron') != null ? `Pronunciación (últimas escenas): ${prom('pron')}/100` : null,
        prom('latencia') != null ? `Tarda en arrancar: ${prom('latencia')} s` : null,
        'El detalle está en el archivo adjunto (abrilo en Pasaporte → Ajustes → Ver el progreso de otra persona).'].filter(Boolean).join('\n');
    },
    descargar() {
      const blob = new Blob([M.exportar()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = this.nombreArchivo();
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    async mandar() {
      const archivo = new File([M.exportar()], this.nombreArchivo(), { type: 'application/json' });
      const texto = this.resumen();
      M.log('compartir', {});
      try {
        if (navigator.canShare && navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], title: 'Mi progreso en Pasaporte', text: texto }); return; }
      } catch (e) { if (e.name === 'AbortError') return; }
      this.descargar();
      try { await navigator.clipboard.writeText(texto); } catch (e) {}
      ui.aviso('Bajé el archivo y copié el resumen: mandáselo a Owen por WhatsApp.', 4500);
    },
  };

  // ── Arranque
  window.addEventListener('DOMContentLoaded', () => {
    M.log('abrir', { reconocimiento: App.voz.hayReconocimiento(), voces: App.voz.voces.length, azure: App.azure.configurado() });
    ui.aInicio();
    // Carga el SDK de Azure en segundo plano; cuando está, el micrófono pasa a evaluar pronunciación.
    App.acceso.recuperar().then((recuperado) => {
      if (recuperado && ['inicio', 'ajustes', 'bienvenida'].includes(ui.actual?.nombre)) ui.refrescar();
      return App.azure.iniciar();
    }).then((ok) => { if (ok && ['inicio', 'ajustes'].includes(ui.actual?.nombre)) ui.refrescar(); });
  });
})();
