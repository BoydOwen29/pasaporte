// Repaso espaciado de frases: consigna en castellano → ella lo dice → escucha el modelo → califica.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, M = App.modelo;

  App.pantallas.repaso = function ({ max = 8, sesion = false } = {}) {
    let lista = M.vencidas().slice(0, max);
    const libre = !lista.length;
    if (libre) lista = u.mezclar(Object.values(M.estado.mazo)).slice(0, 5);
    let i = 0;
    const html = `${ui.barra('🔁 Repaso')}
      ${!Object.keys(M.estado.mazo).length ? `<div class="tarjeta">Todavía no hay frases. Se suman solas cuando terminás una escena.</div>`
        : libre ? '<p class="chico">No hay frases para hoy. Estas son de práctica extra.</p>' : `<p class="chico">${lista.length} frases para hoy.</p>`}
      <div id="zona"></div>`;
    return {
      html,
      montar(r) {
        const zona = r.querySelector('#zona');
        App.voz.precargar(lista.map((c) => ({ texto: c.en })));
        if (!lista.length) { zona.innerHTML = `<button class="btn ancho" id="fin">${sesion ? 'Seguir →' : 'Volver'}</button>`; zona.querySelector('#fin').onclick = () => (sesion ? App.sesion.siguiente() : ui.atras()); return; }
        function pintar() {
          if (i >= lista.length) {
            zona.innerHTML = `<div class="tarjeta ok"><b>Repaso terminado.</b><p class="chico">Las que te costaron vuelven pronto; las fáciles, en unos días.</p></div>
              <button class="btn acento ancho" id="fin">${sesion ? 'Seguir con la sesión →' : 'Terminar'}</button>`;
            zona.querySelector('#fin').onclick = () => (sesion ? App.sesion.siguiente() : ui.atras());
            return;
          }
          const c = lista[i];
          zona.innerHTML = `<p class="chico">${i + 1} de ${lista.length}</p>
            <div class="tarjeta"><p style="font-size:18px"><b>${u.esc(c.es)}</b></p><p class="chico">Decilo en inglés, en voz alta.</p></div>
            <div id="mic"></div><div id="res"></div>
            <button class="btn mini sec" id="nosale">No me sale: mostrame</button>`;
          let latencia = null, sim = null, pronUlt = null;
          const res = zona.querySelector('#res');
          function mostrar(sugerida) {
            zona.querySelector('#nosale')?.remove();
            res.innerHTML += `<div class="tarjeta mostaza"><p class="fila"><b>${u.esc(c.en)}</b> ${ui.botonDecir(c.en, { clase: 'icono chico2' })}</p>
              <p class="chico">¿Cómo te salió?</p>
              <div class="fila">${[[1, 'No salió'], [2, 'Dudé'], [3, 'Salió'], [4, 'Fácil']].map(([n, t]) => `<button class="btn mini ${n === sugerida ? 'acento' : 'sec'}" data-nota="${n}">${t}</button>`).join('')}</div></div>`;
            ui.montarDecir(res);
            App.voz.decir(c.en);
            ui.on(res, '[data-nota]', (el) => { M.calificar(c.id, Number(el.dataset.nota), { latencia, sim, sugerida, pron: pronUlt }); i++; pintar(); });
          }
          zona.querySelector('#nosale').onclick = () => mostrar(1);
          ui.microfono(zona.querySelector('#mic'), {
            referencia: c.en.replace(/…/g, ''),
            alResultado(rr, met) {
              sim = u.redondear(u.similitud(rr.texto, c.en.replace(/…/g, '')), 2);
              latencia = met.latencia;
              const pt = rr.pron?.total;
              pronUlt = pt ?? null;
              // La frase tiene que ser la misma (sin cambiar palabras ni tiempos); recién después cuenta cómo sonó.
              const cmp = App.evaluar.comparar(rr.texto, c.en);
              const errores = cmp.cambios.length + cmp.faltan.length + cmp.sobran.length;
              let sug = cmp.exacto ? ((latencia == null || latencia < 2.5) ? 4 : 3) : errores <= 1 ? 2 : 1;
              if (cmp.exacto && pt != null && pt < 60) sug = 2; // bien dicha, pero la pronunciación todavía no está
              const ver = cmp.exacto ? '<span class="marca-ok">✓ misma frase</span>' : errores <= 1 ? '<span class="marca-casi">casi: cambió una palabra</span>' : '<span class="marca-no">distinta</span>';
              res.innerHTML = `<p>Entendí: «${u.esc(rr.texto)}» — ${ver}${latencia != null ? ` <span class="chico">· arrancaste en ${latencia} s</span>` : ''}</p>${App.evaluar.diferenciasHtml(cmp)}${App.pron.tarjeta(rr.pron, { contenidoMal: !cmp.exacto })}`;
              App.pron.montar(res, rr.pron);
              mostrar(sug);
            },
          });
        }
        pintar();
      },
    };
  };
})();
