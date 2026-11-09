// Progreso: siempre contra ella misma. Desde acá manda su progreso a Owen (un archivo, sin servidores),
// y Owen lo abre en su copia en modo lectura (Ajustes → Ver el progreso de otra persona).
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, M = App.modelo;
  const fmt = (x, suf = '') => (x == null ? '—' : Math.round(x * 10) / 10 + suf);

  App.pantallas.progreso = function ({ exportado } = {}) {
    const st = M.estado;
    const ajeno = M.ajeno;
    const ses = st.sesiones.slice(-15);
    const sellos = App.datos.escenas.reduce((n, s) => n + ['A', 'B'].filter((v) => st.escenas[s.id]?.[v]?.cumplidas).length, 0);
    const mazo = Object.values(st.mazo);
    const aprendidas = mazo.filter((c) => c.intervalo >= 7).length;
    const errores = Object.entries(st.errores).sort((a, b) => b[1].n - a[1].n).slice(0, 5);
    const regla = (id) => App.evaluar.REGLAS.find((r) => r.id === id);
    const arr = App.datos.arrancar.map((q) => M.arr(q.id));
    const sinAyuda = arr.filter((a) => a.nivel === 2).length;
    const lat = ses.map((s) => s.latencia), ppm = ses.map((s) => s.ppm), pron = ses.map((s) => s.pron);
    const ultimos = (xs) => u.promedio(xs.filter((x) => x != null).slice(-3));
    const primeros = (xs) => u.promedio(xs.filter((x) => x != null).slice(0, 3));
    const pronUlt = ultimos(pron);
    const dias = M.diasPracticados().size;
    const nombreEsc = (id) => App.datos.escenas.find((s) => s.id === id);
    const turnos = st.registro.filter((e) => e.tipo === 'turno' || e.tipo === 'arrancar').slice(-8).reverse();

    const html = `${ajeno ? ui.barra('Progreso de ' + u.esc(ajeno.quien)) : '<div class="barra"><h1>Progreso</h1></div>'}
      ${ajeno ? `<div class="ajeno"><span>Modo lectura${exportado ? ' · enviado el ' + u.fecha(exportado) : ''}. Tus datos no se tocan.</span><button class="btn mini" id="salir-ajeno">Salir</button></div>` : ''}
      <div class="kpis" style="margin-top:10px">
        <div class="kpi"><b>${dias}</b><span>días practicados</span></div>
        <div class="kpi"><b>${sellos}</b><span>sellos de ${App.datos.escenas.length * 2}</span></div>
        <div class="kpi"><b>${pronUlt != null ? Math.round(pronUlt) : '—'}</b><span>pronunciación</span></div>
      </div>
      ${!ajeno ? `<div class="tarjeta acento clic" id="mandar"><div class="cta"><div class="play">📤</div><div><h2 style="font-size:19px">Mandarle mi progreso a Owen</h2><div class="chico">Se comparte un archivo por WhatsApp o mail. Nunca va audio ni claves.</div></div></div></div>` : ''}
      <div class="tarjeta"><h3>Fluidez y pronunciación</h3>
        <p class="chico">Tiempo hasta arrancar a hablar (más bajo es mejor)</p>${ui.sparkline(lat, { color: 'var(--sello)' })}
        <p class="chico">Palabras por minuto (más alto es mejor)</p>${ui.sparkline(ppm)}
        ${pron.some((x) => x != null) ? `<p class="chico">Pronunciación en las escenas (0 a 100)</p>${ui.sparkline(pron, { color: 'var(--r-persona)' })}` : ''}
        <div class="stat"><span>Arranque: primeras → últimas</span><b>${fmt(primeros(lat), ' s')} → ${fmt(ultimos(lat), ' s')}</b></div>
        <div class="stat"><span>Palabras/min: primeras → últimas</span><b>${fmt(primeros(ppm))} → ${fmt(ultimos(ppm))}</b></div>
        ${pron.some((x) => x != null) ? `<div class="stat"><span>Pronunciación: primeras → últimas</span><b>${fmt(primeros(pron))} → ${fmt(pronUlt)}</b></div>` : ''}
        <p class="nota-pie">Lo que vale es la tendencia, no un valor suelto.</p></div>
      <div class="tarjeta"><h3>Últimas escenas</h3>
        ${ses.length ? ses.slice(-6).reverse().map((s) => { const e = nombreEsc(s.escena); return `<div class="stat"><span>${e ? e.emoji + ' ' + u.esc(e.titulo) : s.escena} · ${s.version} <span class="chico">${u.fecha(s.t)}</span></span><b>${s.cumplida ? '✓' : '·'}${s.pron != null ? ` <span class="${App.pron.clase(s.pron)}">${s.pron}</span>` : ''}</b></div>`; }).join('') : '<p class="chico">Todavía ninguna.</p>'}</div>
      <div class="tarjeta"><h3>Lo último que dijo</h3>
        ${turnos.length ? turnos.map((t) => `<div class="stat"><span>«${u.esc(t.texto || t.dijo || '')}»</span><b class="chico">${t.pron?.total ?? (typeof t.pron === 'number' ? t.pron : '') ?? ''}</b></div>`).join('') : '<p class="chico">Nada todavía.</p>'}</div>
      <div class="tarjeta"><h3>Sonidos</h3>
        ${App.datos.sonidos.map((s) => `<div class="stat"><span>${u.esc(s.titulo)} <span class="simbolo chico">${s.simbolos.join(' ')}</span></span><b>oído ${ui.pct(M.aciertoPercepcion(s.id))} · boca ${ui.pct(M.aciertoProduccion(s.id))}</b></div>`).join('')}</div>
      <div class="tarjeta"><h3>Arrancar y repaso</h3>
        <div class="stat"><span>Preguntas que responde sin ayuda</span><b>${sinAyuda} de ${arr.length}</b></div>
        <div class="stat"><span>Frases en el repaso</span><b>${mazo.length}</b></div>
        <div class="stat"><span>Afianzadas (vuelven en 7 días o más)</span><b>${aprendidas}</b></div></div>
      <div class="tarjeta"><h3>Lo que más se repite</h3>
        ${errores.length ? errores.map(([id, e]) => `<div class="stat"><span>${u.esc(regla(id)?.porque.split(':')[0] || id)}</span><b>${e.n}×</b></div>`).join('') : '<p class="chico">Nada todavía.</p>'}</div>
      <div class="tarjeta"><h3>Ánimo</h3>${ui.sparkline(st.animo.slice(-20).map((a) => a.v), { color: 'var(--mostaza)' })}
        <p class="nota-pie">Lo que se marca al empezar cada sesión (1 a 5).</p></div>`;
    return {
      html,
      sinNav: !!ajeno,
      montar(r) {
        r.querySelector('#mandar')?.addEventListener('click', () => App.compartir.mandar());
        const salir = () => { M.salirAjeno(); ui.aInicio(); };
        r.querySelector('#salir-ajeno')?.addEventListener('click', salir);
        if (ajeno) { r.querySelector('[data-atras]')?.addEventListener('click', () => M.salirAjeno(), { capture: true }); }
      },
    };
  };
})();
