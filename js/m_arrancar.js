// Arrancar a hablar: escuchar una pregunta y responder en 3 pasos (eco + dato + extra).
// La ayuda (el armazón del eco) se retira a medida que le sale: nivel 0 completo, 1 solo la pista, 2 nada.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, M = App.modelo, E = App.evaluar;

  function elegirPreguntas(n) {
    const l = App.datos.arrancar.slice();
    // Primero las menos dominadas y las que hace más que no ve.
    l.sort((a, b) => {
      const A = M.arr(a.id), B = M.arr(b.id);
      return A.nivel - B.nivel || (A.ultima || 0) - (B.ultima || 0) || Math.random() - 0.5;
    });
    return u.mezclar(l.slice(0, Math.min(n + 2, l.length))).slice(0, n);
  }

  App.pantallas.arrancar = function ({ cantidad = 5, sesion = false } = {}) {
    const lista = elegirPreguntas(cantidad);
    let i = 0, aciertos = 0;
    const html = `${ui.barra('🗣️ Arrancar a hablar')}
      <div class="tarjeta mostaza"><b>La respuesta está en la pregunta</b>
        <p class="chico" style="margin-bottom:4px">Para no quedarte en blanco, respondé en 3 pasos:</p>
        <ol class="reglas" style="margin-top:0"><li><b>Arrancá repitiendo la pregunta, dada vuelta.</b> "Where <u>are you</u> from?" → "<u>I'm</u> from…"</li><li><b>Completá con tu dato:</b> "…Argentina."</li><li><b>Si querés, sumá algo más:</b> "I live in Buenos Aires. And you?"</li></ol>
        <button class="chip" data-ficha="eco">📘 Ver la ficha</button></div>
      <div id="zona"></div>`;
    return {
      html,
      montar(r) {
        App.voz.precargar(lista.flatMap((q) => [{ texto: q.q }, { texto: q.ejemplo }]));
        ui.on(r, '[data-ficha]', (el) => ui.fichaHoja(el.dataset.ficha));
        const zona = r.querySelector('#zona');
        function pintar() {
          if (i >= lista.length) {
            zona.innerHTML = `<div class="tarjeta ok"><b>Listo: ${aciertos} de ${lista.length} bien armadas.</b><p class="chico">A medida que te salen, la ayuda se va retirando sola.</p></div>
              <button class="btn acento ancho" id="fin">${sesion ? 'Seguir con la sesión →' : 'Terminar'}</button>`;
            zona.querySelector('#fin').onclick = () => (sesion ? App.sesion.siguiente() : ui.atras());
            M.log('arrancar-fin', { aciertos, total: lista.length });
            return;
          }
          const q = lista[i];
          const nivel = M.arr(q.id).nivel;
          const ayuda = nivel === 0 ? `<div class="pista"><div class="fila"><span style="flex:1">Arrancá con: <b>${u.esc(q.eco)}</b></span>${ui.botonDecir(q.eco.split('/')[0].replace(/…|\(.*\)/g, '').trim(), { clase: 'icono chico2' })}</div><span class="chico">${u.esc(q.como)}</span></div>`
            : nivel === 1 ? `<div class="pista chico">Pista: ${u.esc(q.como)}</div>` : '';
          zona.innerHTML = `<p class="chico">${i + 1} de ${lista.length}</p>
            <div class="burbuja npc" style="max-width:100%"><div class="quien">Pregunta</div><div style="font-size:20px"><b>${u.esc(q.q)}</b></div>
              <div class="acciones">${ui.botonDecir(q.q, { clase: 'icono chico2' })}${ui.botonDecir(q.q, { lento: true, etiqueta: '🐢', clase: 'icono chico2' })}</div></div>
            <div class="espacio"></div>${ayuda}
            ${nivel === 2 ? '<button class="btn mini sec" id="ayuda">💡 Necesito el comienzo</button>' : ''}
            <div id="mic"></div><div id="res"></div>`;
          ui.montarDecir(zona);
          zona.querySelector('#ayuda')?.addEventListener('click', (e) => { e.target.outerHTML = `<div class="pista">Arrancá con: <b>${u.esc(q.eco)}</b></div>`; });
          App.voz.decir(q.q);
          ui.microfono(zona.querySelector('#mic'), {
            alResultado(res, met) {
              const ev = E.evaluarArrancar(q, res.texto);
              M.anotarArrancar(q.id, ev.ok);
              ev.errores.forEach((e) => M.anotarError(e.regla, res.texto));
              if (ev.ok) aciertos++;
              M.log('arrancar', { id: q.id, nivel, dijo: res.texto, ...ev, errores: ev.errores.map((e) => e.regla), ...met, pron: res.pron?.total });
              const check = (b, t) => `<span class="${b ? 'marca-ok' : 'marca-no'}">${b ? '✓' : '○'} ${t}</span>`;
              const err = ev.errores[0] ? `<p class="chico">Ojo: ${u.esc(ev.errores[0].porque)} → <b>${u.esc(ev.errores[0].mejor)}</b></p>` : '';
              zona.querySelector('#res').innerHTML = `<div class="tarjeta borde"><p>Entendí: «${u.esc(res.texto)}»</p>
                <div class="fila">${check(ev.eco, 'arrancaste con la pregunta')} ${check(ev.dato, 'dijiste tu dato')} ${ev.extra ? '<span class="marca-ok">★ sumaste algo más</span>' : '<span class="chico">(sumar algo más es opcional)</span>'}</div>
                ${!ev.eco ? `<p class="chico">Probá arrancar repitiendo la pregunta: <b>${u.esc(q.eco)}</b></p>` : ''}${err}
                ${App.pron.tarjeta(res.pron)}
                <p class="fila">Ejemplo: <b>${u.esc(q.ejemplo)}</b> ${ui.botonDecir(q.ejemplo, { clase: 'icono chico2' })}</p>
                <div class="fila"><button class="btn mini sec" id="otra">Probar de nuevo</button><button class="btn mini" id="sig">Siguiente →</button></div></div>`;
              ui.montarDecir(zona);
              App.pron.montar(zona.querySelector('#res'), res.pron);
              zona.querySelector('#otra').onclick = () => pintar();
              zona.querySelector('#sig').onclick = () => { i++; pintar(); };
            },
          });
        }
        pintar();
      },
    };
  };
})();
