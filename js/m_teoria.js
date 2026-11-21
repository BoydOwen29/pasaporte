// Teoría mínima: fichas con fórmula en bloques, reglas, ejemplos y "Probalo" en voz alta.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, M = App.modelo, E = App.evaluar;
  const ROLES = { pregunta: 'pregunta', aux: 'ayudante', persona: 'persona', verbo: 'verbo', resto: 'resto', extra: 'extra' };

  const textoFormula = (f) => f.map((b) => b.t).filter((t) => t !== '—' && t !== '→').join(' ').replace(/\s+([?.,!])/g, '$1').replace(/\s+,/g, ',');
  const formulaHtml = (f, conVoz = false) => `<div class="formula">${f.map((b) => `<span class="bloque r-${b.r}">${u.esc(b.t)}<small>${ROLES[b.r]}</small></span>`).join('')}${conVoz && !f.some((b) => b.t === '→') ? `<span class="fila">${App.ui.botonDecir(textoFormula(f), { clase: 'icono chico2' })}</span>` : ''}</div>`;

  App.pantallas._fichaHtml = function (f, conBarra = true) {
    const escenas = f.escenas.map((id) => App.datos.escenas.find((s) => s.id === id)).filter(Boolean);
    return `${conBarra ? ui.barra('📘 Teoría') : ''}
      <h2>${u.esc(f.titulo)}</h2>
      <p class="tenue">${u.esc(f.idea)}</p>
      <div class="tarjeta">${f.formulas.map((x) => formulaHtml(x, true)).join('')}</div>
      <div class="tarjeta borde"><b>Las reglas</b><ul class="reglas">${f.reglas.map((x) => `<li>${u.esc(x)}</li>`).join('')}</ul></div>
      <div class="tarjeta"><b>Ejemplos</b>${f.ejemplos.map((e) => `<div class="frase"><div class="txt"><div class="en">${u.esc(e.en)}</div><div class="es">${u.esc(e.es)}</div></div>${App.ui.botonDecir(e.en)}</div>`).join('')}</div>
      <div class="tarjeta mostaza"><b>Probalo en voz alta</b><p class="chico">Leé la consigna y decilo en inglés usando la fórmula.</p><div id="probalo"></div></div>
      ${f.id === 'pasado' || f.id === 'presente-simple' ? `<button class="btn sec ancho" data-ir-verbos>📋 Ver todos los verbos irregulares</button>` : ''}
      ${escenas.length ? `<p class="chico">Se usa en: ${escenas.map((s) => `<button class="chip gris" data-ir-escena="${s.id}">${s.emoji} ${u.esc(s.titulo)}</button>`).join(' ')}</p>` : ''}`;
  };

  App.pantallas._fichaMontar = function (r, f) {
    M.vistaTeoria(f.id);
    M.log('teoria', { id: f.id });
    App.ui.montarDecir(r);
    ui.on(r, '[data-ir-verbos]', () => { document.querySelector('.velo')?.remove(); ui.ir('verbos'); });
    ui.on(r, '[data-ir-escena]', (el) => { document.querySelector('.velo')?.remove(); ui.ir('escena', { id: el.dataset.irEscena, version: 'A' }); });
    let i = 0;
    const zona = r.querySelector('#probalo');
    function pintar() {
      if (i >= f.probalo.length) { zona.innerHTML = '<p>✓ Listo. Esta fórmula la vas a usar en las escenas.</p><button class="btn mini sec" id="otra">Hacerlo de nuevo</button>'; zona.querySelector('#otra').onclick = () => { i = 0; pintar(); }; return; }
      const p = f.probalo[i];
      zona.innerHTML = `<p class="chico">${i + 1} de ${f.probalo.length}</p><p><b>${u.esc(p.es)}</b></p><div id="pm"></div><div id="pr"></div>`;
      ui.microfono(zona.querySelector('#pm'), {
        alResultado(res) {
          const ev = E.evaluarProbalo(p, res.texto);
          M.probaloTeoria(f.id);
          M.log('probalo', { ficha: f.id, i, dijo: res.texto, ok: ev.ok, idea: ev.idea, forma: ev.forma });
          ev.errores.forEach((e) => M.anotarError(e.regla, res.texto));
          const msj = ev.ok ? '<span class="marca-ok">✓ ¡Bien armada!</span>'
            : !ev.idea ? '<span class="marca-casi">No llegué a escuchar la idea.</span>'
            : '<span class="marca-casi">La idea está, pero probá con la fórmula de la ficha.</span>';
          const err = ev.errores[0] ? `<p class="chico">Ojo: ${u.esc(ev.errores[0].porque)} → <b>${u.esc(ev.errores[0].mejor)}</b></p>` : '';
          zona.querySelector('#pr').innerHTML = `<p>Entendí: «${u.esc(res.texto)}» ${msj}</p>${err}${App.pron.tarjeta(res.pron)}
            <p class="fila">Una forma: <b>${u.esc(p.en)}</b> ${App.ui.botonDecir(p.en, { clase: 'icono chico2' })}</p>
            <button class="btn mini" id="sig">Siguiente →</button>`;
          App.ui.montarDecir(zona);
          App.pron.montar(zona.querySelector('#pr'), res.pron);
          zona.querySelector('#sig').onclick = () => { i++; pintar(); };
        },
      });
    }
    pintar();
  };

  // Teoría como temario: secciones con sus fichas, más el arsenal de frases y los verbos irregulares.
  App.pantallas.teoria = function () {
    const ficha = (id) => App.datos.teoria.find((x) => x.id === id);
    const extra = {
      arsenal: `<div class="tarjeta acento clic" data-ir="arsenal"><div class="cta"><div class="play">🛡️</div><div><h2 style="font-size:19px">Arsenal para defenderte</h2><div class="chico">${App.datos.arsenal.reduce((n, g) => n + g.frases.length, 0)} frases armadas por situación: no entender, pedir, reclamar, opinar, salud…</div></div></div></div>`,
      verbos: `<div class="tarjeta mostaza clic" data-ir="verbos"><div class="cta"><div class="play" style="background:var(--papel)">📋</div><div><h2 style="font-size:19px;color:var(--tinta)">Verbos irregulares</h2><div class="chico">${App.datos.verbos.length} verbos con su conjugación y práctica oral del pasado.</div></div></div></div>`,
    };
    const html = `<div class="barra"><h1>Teoría</h1></div>
      <p class="tenue">Un temario corto, por secciones. Cada ficha tiene la fórmula, las reglas, ejemplos con audio y traducción, y una práctica en voz alta.</p>
      ${App.datos.temario.map((s) => `<div class="seccion">${u.esc(s.titulo)}</div><p class="chico" style="margin:-4px 2px 6px">${u.esc(s.desc)}</p>
        ${s.extra ? extra[s.extra] : ''}
        <div class="lista-fichas">${s.fichas.map(ficha).filter(Boolean).map((f) => {
          const v = M.estado.teoria[f.id];
          return `<div class="tarjeta clic ficha-fila" data-ficha="${f.id}"><div style="flex:1"><b>${u.esc(f.titulo)}</b><div class="chico">${u.esc(f.idea.length > 90 ? f.idea.slice(0, 88) + '…' : f.idea)}</div></div>${v ? '<span class="chip gris">vista</span>' : '<span class="flecha">›</span>'}</div>`;
        }).join('')}</div>`).join('')}`;
    return {
      html,
      montar(r) {
        ui.on(r, '[data-ficha]', (el) => ui.ir('ficha', { id: el.dataset.ficha }));
        ui.on(r, '[data-ir]', (el) => ui.ir(el.dataset.ir));
      },
    };
  };

  // Arsenal: frases armadas por situación, para escuchar, traducir, practicar y sumar al repaso.
  App.pantallas.arsenal = function () {
    const html = `${ui.barra('Arsenal para defenderte')}
      <p class="tenue">Frases armadas que sirven en cualquier lado. Donde dice <b>…</b>, completás con lo tuyo. Tocá <b>ES</b> para ver la traducción y cómo suena.</p>
      ${App.datos.arsenal.map((g) => `<div class="tarjeta">
        <div class="fila entre"><h3 style="margin:0">${g.emoji} ${u.esc(g.titulo)}</h3><button class="btn mini sec" data-practicar="${g.id}">🎙️ Practicar</button></div>
        ${g.frases.map((f) => `<div class="frase"><div class="txt"><div class="en">${u.esc(f.en)}</div><div class="es">${u.esc(f.es)}</div></div>${ui.botonDecir(f.en.replace(/…/g, ''))}</div>`).join('')}
        <button class="chip" data-repaso="${g.id}" style="margin-top:8px">＋ Sumar al repaso</button></div>`).join('')}`;
    return {
      html,
      montar(r) {
        ui.montarDecir(r);
        ui.on(r, '[data-practicar]', (el) => {
          const g = App.datos.arsenal.find((x) => x.id === el.dataset.practicar);
          App.pantallas._drillFrases(g.frases, g.titulo);
        });
        ui.on(r, '[data-repaso]', (el) => {
          const g = App.datos.arsenal.find((x) => x.id === el.dataset.repaso);
          let n = 0;
          g.frases.forEach((f, i) => { if (M.agregarTarjeta({ id: `arsenal:${g.id}:${i}`, en: f.en, es: f.es, origen: 'arsenal' })) n++; });
          M.log('arsenal-repaso', { grupo: g.id, nuevas: n });
          ui.aviso(n ? `Sumé ${n} frases a tu repaso.` : 'Ya estaban en tu repaso.');
          el.textContent = '✓ En el repaso';
        });
      },
    };
  };

  App.pantallas.ficha = function ({ id }) {
    const f = App.datos.teoria.find((x) => x.id === id);
    return { html: App.pantallas._fichaHtml(f, true), montar(r) { App.pantallas._fichaMontar(r, f); } };
  };
})();
