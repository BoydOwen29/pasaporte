// Laboratorio de sonidos: 1) escuchar y elegir (con muchas voces), 2) decir la palabra, 3) llevarla a una frase.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

(() => {
  const u = App.u, ui = App.ui, M = App.modelo;

  App.pantallas.sonidos = function () {
    const toca = M.sonidoQueToca();
    const html = `${ui.barra('🔊 Laboratorio de sonidos')}
      <p class="tenue">Pocos sonidos, los que más cambian el significado. Primero se entrena el oído y después la boca.</p>
      ${App.datos.sonidos.map((s) => {
        const p = M.aciertoPercepcion(s.id), d = M.aciertoProduccion(s.id);
        return `<div class="tarjeta clic" data-son="${s.id}"><div class="fila entre"><b>${u.esc(s.titulo)}</b>${s.id === toca.id ? '<span class="chip">te toca</span>' : ''}</div>
          <div class="chico"><span class="simbolo">${s.simbolos.join(' · ')}</span> · prioridad ${s.prioridad}</div>
          <div class="fila chico" style="margin-top:6px">Oído: <b>${ui.pct(p)}</b> · Boca: <b>${ui.pct(d)}</b></div></div>`;
      }).join('')}
      <p class="nota-pie">El sonido siguiente se recomienda cuando acertás 85 % al escuchar. La "th" no está a propósito: casi no afecta que te entiendan.</p>`;
    return { html, montar(r) { ui.on(r, '[data-son]', (el) => ui.ir('sonido', { id: el.dataset.son })); } };
  };

  App.pantallas.sonido = function ({ id, sesion = false, rondas = 10 }) {
    const s = App.datos.sonidos.find((x) => x.id === id);
    const html = `${ui.barra('🔊 ' + u.esc(s.titulo))}
      <div class="tarjeta borde"><p>${u.esc(s.porQue)}</p>
        <p><span class="simbolo">${u.esc(s.simbolos[0])}</span> <b>${u.esc(s.nombres[0])}</b>: ${u.esc(s.comoA)}</p>
        <p><span class="simbolo">${u.esc(s.simbolos[1])}</span> <b>${u.esc(s.nombres[1])}</b>: ${u.esc(s.comoB)}</p></div>
      <div id="zona"></div>`;
    return {
      html,
      montar(r) {
        const zona = r.querySelector('#zona');
        let etapa = 'menu';
        function menu() {
          zona.innerHTML = `<div class="col">
            <button class="btn acento ancho" id="e1">1 · Escuchar y elegir (${rondas})</button>
            <button class="btn ancho" id="e2">2 · Decir las palabras</button>
            <button class="btn sec ancho" id="e3">3 · En una frase de viaje</button></div>`;
          zona.querySelector('#e1').onclick = percepcion;
          zona.querySelector('#e2').onclick = produccion;
          zona.querySelector('#e3').onclick = frases;
        }

        // 1. Percepción (HVPT): una voz distinta en cada ronda.
        function percepcion() {
          const voces = App.voz.vocesVariadas();
          let n = 0, bien = 0;
          const plan = Array.from({ length: rondas }, () => {
            const par = u.azar(s.pares), cual = Math.random() < 0.5 ? 0 : 1;
            const grabadas = App.voz.vocesGrabadas(par[cual]);
            return { par, cual, neural: grabadas.length ? u.azar(grabadas) : null };
          });
          App.voz.precargar(plan.filter((x) => x.neural).map((x) => ({ texto: x.par[x.cual], neural: x.neural })));
          function ronda() {
            if (n >= rondas) {
              zona.innerHTML = `<div class="tarjeta ok"><b>${bien} de ${rondas}</b> al escuchar.</div>
                <div class="col"><button class="btn acento ancho" id="sig">${sesion ? 'Seguir con la sesión →' : 'Ahora, a decirlas'}</button><button class="btn sec ancho" id="otra">Otra ronda</button></div>`;
              M.log('percepcion-fin', { id: s.id, bien, rondas });
              zona.querySelector('#sig').onclick = () => (sesion ? App.sesion.siguiente() : produccion());
              zona.querySelector('#otra').onclick = percepcion;
              return;
            }
            const { par, cual } = plan[n];
            // Con audios grabados: una voz neuronal distinta cada vez (US, UK, AU, IE, CA). Si no, las del navegador.
            const neural = plan[n].neural;
            const voz = neural ? null : voces.length ? voces[Math.floor(Math.random() * voces.length)] : null;
            const opciones = Math.random() < 0.5 ? [0, 1] : [1, 0];
            zona.innerHTML = `<div class="barra-prog"><i style="width:${(n / rondas) * 100}%"></i></div>
              <p class="centro tenue" style="margin-top:14px">¿Qué palabra escuchaste?</p>
              <div class="centro"><button class="btn sec" id="otra-vez">▶ Escuchar de nuevo</button></div>
              <div class="opciones">${opciones.map((k) => `<button class="opcion" data-k="${k}">${u.esc(par[k])}</button>`).join('')}</div>
              <div id="fb" class="centro"></div>`;
            const decir = () => App.voz.decir(par[cual], neural ? { neural } : { voz });
            zona.querySelector('#otra-vez').onclick = decir;
            setTimeout(decir, 250);
            let respondido = false;
            ui.on(zona, '.opcion', (el) => {
              if (respondido) return; respondido = true;
              const ok = Number(el.dataset.k) === cual;
              if (ok) bien++;
              el.classList.add(ok ? 'bien' : 'mal');
              if (!ok) zona.querySelector(`.opcion[data-k="${cual}"]`).classList.add('bien');
              M.anotarPercepcion(s.id, ok, { par, dijo: par[cual], eligio: par[el.dataset.k], voz: neural || voz?.name });
              zona.querySelector('#fb').innerHTML = `<p>${ok ? '<span class="marca-ok">✓ Bien</span>' : `<span class="marca-no">Era <b>${u.esc(par[cual])}</b></span>`}</p>
                <div class="fila" style="justify-content:center">${ui.botonDecir(par[0], { neural: neural || '', etiqueta: '▶ ' + par[0], clase: 'chip' })}${ui.botonDecir(par[1], { neural: neural || '', etiqueta: '▶ ' + par[1], clase: 'chip' })}</div>
                <p class="chico">Voz: ${u.esc(neural ? neural.replace(/Neural$/, '').replace(/^en-/, '') : voz ? voz.name.replace(/Microsoft |Google /, '') : 'del sistema')}</p>
                <button class="btn mini" id="sig">Siguiente →</button>`;
              ui.montarDecir(zona);
              zona.querySelector('#sig').onclick = () => { n++; ronda(); };
            });
          }
          ronda();
        }

        // 2. Producción: dice una palabra del par; si el reconocedor oye la otra, se marca.
        function produccion() {
          const lista = u.mezclar(s.pares.flatMap((p) => [{ w: p[0], otra: p[1], ipa: s.ipa[0], ipaOtra: s.ipa[1] }, { w: p[1], otra: p[0], ipa: s.ipa[1], ipaOtra: s.ipa[0] }])).slice(0, 6);
          let n = 0, bien = 0;
          function ronda() {
            if (n >= lista.length) {
              zona.innerHTML = `<div class="tarjeta ok"><b>${bien} de ${lista.length}</b> se reconocieron como la palabra que querías.</div>
                <p class="nota-pie">${App.azure.listo() ? 'Puntaje del sonido según Azure. Para pasar, 70/100 o más.' : 'Sin Azure, el reconocedor del navegador es solo una aproximación.'}</p>
                <div class="col"><button class="btn acento ancho" id="sig">${sesion ? 'Seguir con la sesión →' : 'Llevarlo a una frase'}</button><button class="btn sec ancho" id="volver">Volver</button></div>`;
              zona.querySelector('#sig').onclick = () => (sesion ? App.sesion.siguiente() : frases());
              zona.querySelector('#volver').onclick = menu;
              return;
            }
            const it = lista[n];
            zona.innerHTML = `<div class="barra-prog"><i style="width:${(n / lista.length) * 100}%"></i></div>
              <p class="centro tenue" style="margin-top:14px">Decí:</p>
              <p class="centro" style="font-size:34px;margin:4px 0"><b>${u.esc(it.w)}</b></p>
              <p class="centro chico">(no <i>${u.esc(it.otra)}</i>)</p>
              <div class="fila" style="justify-content:center">${ui.botonDecir(it.w, { etiqueta: '▶ modelo', clase: 'chip' })}${ui.botonDecir(it.w, { etiqueta: '🐢', clase: 'chip', lento: true })}</div>
              <div id="mic"></div><div id="res" class="centro"></div>`;
            ui.montarDecir(zona);
            ui.microfono(zona.querySelector('#mic'), {
              continuo: false, maxAlternativas: 5, etiqueta: 'Tocá, decí la palabra sola y tocá de nuevo.',
              referencia: it.w.toLowerCase(),
              alResultado(res) {
                const tks = u.tokens(res.texto);
                const alts = (res.alternativas[0] || []).map((a) => u.norm(a.t));
                const w = it.w.toLowerCase(), o = it.otra.toLowerCase();
                let resul, msj, extra = '';
                const obj = App.pron.sonidoObjetivo(res.pron, s.ipa, it.w);
                if (obj && obj.precision != null) {
                  // Con Azure: se mira el sonido objetivo dentro de la palabra.
                  const p = Math.round(obj.precision);
                  resul = p >= App.pron.UMBRAL.labOk ? 'ok' : obj.oido === it.ipaOtra ? 'par' : 'casi';
                  // Si el reconocedor escuchó otra palabra (la del par u otra), no aprueba aunque el sonido puntúe bien.
                  if (tks.length && !tks.includes(w)) resul = tks.includes(o) ? 'par' : 'otra';
                  msj = `<span class="simbolo">/${u.esc(it.ipa)}/</span> <b class="${App.pron.clase(p)}">${p}/100</b>` +
                    (resul === 'ok' ? ' <span class="marca-ok">✓</span>' : resul === 'otra' ? ` <span class="marca-no">se escuchó otra palabra</span>` : resul === 'par' ?` <span class="marca-no">sonó como /${u.esc(it.ipaOtra)}/ (<i>${u.esc(it.otra)}</i>)</span>` : obj.oido && obj.oido !== it.ipa ? ` <span class="marca-casi">sonó más a /${u.esc(obj.oido)}/</span>` : ' <span class="marca-casi">casi</span>');
                  extra = App.pron.tarjeta(res.pron, { sinNumero: true });
                  M.anotarProduccion(s.id, resul, { palabra: it.w, dijo: res.texto, precision: p, oido: obj.oido });
                } else {
                  resul = tks.includes(w) && !tks.includes(o) ? 'ok' : tks.includes(o) ? 'par' : alts.some((a) => a.split(' ').includes(w)) ? 'casi' : 'otra';
                  msj = { ok: '<span class="marca-ok">✓ Se reconoció bien</span>', par: `<span class="marca-no">Sonó como <b>${u.esc(it.otra)}</b></span>`, casi: '<span class="marca-casi">Casi: estaba entre las opciones</span>', otra: '<span class="marca-casi">No lo pude reconocer</span>' }[resul];
                  M.anotarProduccion(s.id, resul, { palabra: it.w, dijo: res.texto, alts });
                }
                if (resul === 'ok') bien++;
                zona.querySelector('#res').innerHTML = `<p>Entendí: «${u.esc(res.texto)}» — ${msj}</p>${extra}
                  <div class="fila" style="justify-content:center"><button class="btn mini sec" id="rep">Otra vez</button><button class="btn mini" id="sig">Siguiente →</button></div>`;
                App.pron.montar(zona.querySelector('#res'), res.pron);
                zona.querySelector('#rep').onclick = () => ronda();
                zona.querySelector('#sig').onclick = () => { n++; ronda(); };
              },
            });
          }
          ronda();
        }

        // 3. En frase de viaje.
        function frases() {
          App.pantallas._drillFrases(s.frases, 'Frases con ' + s.titulo);
          menu();
        }

        if (sesion) percepcion(); else menu();
      },
    };
  };
})();
