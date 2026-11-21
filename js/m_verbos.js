// Verbos irregulares: lista con buscador, ficha de cada verbo con su conjugación (con audio y castellano)
// y una práctica oral del pasado.
window.App = window.App || {};
App.pantallas = App.pantallas || {};

App.verbos = (() => {
  // Tercera persona del presente (he / she / it).
  function pres3(b) {
    const esp = { be: 'is', have: 'has', do: 'does', go: 'goes' };
    if (esp[b]) return esp[b];
    if (/(s|sh|ch|x|z|o)$/.test(b)) return b + 'es';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ies';
    return b + 's';
  }
  // Filas de la conjugación: { tiempo, para, en, es } para "yo" y para "él / ella".
  function conjugar(v) {
    const b = v.base, es = v.es, pas = v.pasado.split(' / ');
    const ser = b === 'be';
    return [
      { tiempo: 'Presente', para: 'Rutinas y datos', en: ser ? 'I am' : `I ${b}`, es: 'yo ' + es[0] },
      { tiempo: 'Presente', en: ser ? 'She is' : `She ${pres3(b)}`, es: 'ella ' + es[1] },
      { tiempo: 'Pasado', para: 'Lo que ya pasó', en: `I ${pas[0]}`, es: 'yo ' + es[2] },
      { tiempo: 'Pasado', en: `She ${pas[0]}`, es: 'ella ' + es[3] },
      { tiempo: 'Presente perfecto', para: 'Experiencias ("alguna vez")', en: `I have ${v.part}`, es: 'yo ' + es[4] },
      { tiempo: 'Presente perfecto', en: `She has ${v.part}`, es: 'ella ' + es[5] },
      { tiempo: 'Futuro', para: 'Planes (going to)', en: ser ? "I'm going to be" : `I'm going to ${b}`, es: 'yo ' + es[6] },
      { tiempo: 'Futuro', en: ser ? "She's going to be" : `She's going to ${b}`, es: 'ella ' + es[7] },
    ];
  }
  // Negativo y pregunta, que es donde más se tropieza (did + verbo normal, no "did you went").
  function negPreg(v) {
    const b = v.base;
    if (b === 'be') return [
      { en: "I'm not", es: 'no soy / no estoy' }, { en: 'Are you…?', es: '¿Sos…? / ¿Estás…?' },
      { en: "I wasn't", es: 'no fui / no estuve' }, { en: 'Were you…?', es: '¿Fuiste…? / ¿Estuviste…?' },
    ];
    return [
      { en: `I don't ${b}`, es: 'no (presente)' }, { en: `Do you ${b}?`, es: '¿(presente)?' },
      { en: `I didn't ${b}`, es: 'no (pasado): did + verbo normal' }, { en: `Did you ${b}?`, es: '¿(pasado)?: did + verbo normal' },
    ];
  }
  // Traducciones para el botón ES y el glosario.
  function traducciones() {
    const frases = {}, palabras = {};
    for (const v of App.datos.verbos || []) {
      for (const f of conjugar(v)) frases[f.en] = f.es;
      frases[v.ej.en] = v.ej.es;
      palabras[v.base] = palabras[v.base] || v.inf;
      for (const p of v.pasado.split(' / ')) palabras[p] = palabras[p] || `${v.inf} (pasado)`;
      palabras[v.part] = palabras[v.part] || `${v.inf} (participio)`;
      palabras[pres3(v.base)] = palabras[pres3(v.base)] || `${v.inf} (él / ella)`;
    }
    return { frases, palabras };
  }
  return { conjugar, negPreg, pres3, traducciones };
})();

(() => {
  const u = App.u, ui = App.ui, M = App.modelo;
  // Cada forma con cómo suena debajo (do / did / done = du / did / dan). "was / were" va de a una.
  const formaHtml = (t, tag) => `<${tag}>${u.esc(t)}<small class="suena">${u.esc(t.split(' / ').map((x) => App.traductor.comoSuena(x)).join(' / '))}</small></${tag}>`;
  const textoTres = (v) => `${v.base}, ${v.pasado.replace(' / ', ', ')}, ${v.part}`;
  // ▶ de las tres formas, dentro de la fila de la lista (sin botón ES, para no cargar la lista).
  const tresFormas = (v) => `<button class="chip" data-decir="${u.esc(textoTres(v))}" data-sin-traducir="1" title="Escuchar las tres formas">▶ escuchar</button>`;

  App.pantallas.verbos = function () {
    const lista = App.datos.verbos;
    const fila = (v) => `<div class="tarjeta clic verbo-fila" data-verbo="${v.base}" data-buscar="${u.esc((v.base + ' ' + v.pasado + ' ' + v.part + ' ' + v.inf).toLowerCase())}">
      <div class="verbo-formas">${formaHtml(v.base, 'b')}${formaHtml(v.pasado, 'span')}${formaHtml(v.part, 'span')}</div>
      <div class="fila entre" style="margin-top:4px"><div class="chico">${u.esc(v.inf)}</div>${tresFormas(v)}</div></div>`;
    const html = `${ui.barra('Verbos irregulares')}
      <p class="tenue">Las tres formas de cada verbo: <b>base</b> (presente), <b>pasado</b> y <b>participio</b> (para <i>I have…</i>). Tocá uno para ver la conjugación completa.</p>
      <button class="btn acento ancho" id="practicar">🎙️ Practicar el pasado en voz alta</button>
      <input type="text" id="buscar" placeholder="Buscar (ir, went, comer…)" style="margin-top:12px" autocomplete="off">
      <div class="verbo-cab chico"><span>base</span><span>pasado</span><span>participio</span></div>
      <div id="lista">${lista.map(fila).join('')}</div>`;
    return {
      html,
      montar(r) {
        r.querySelector('#practicar').onclick = () => ui.ir('verbos-practica');
        r.querySelector('#buscar').oninput = (e) => {
          const q = u.norm(e.target.value);
          r.querySelectorAll('[data-buscar]').forEach((el) => el.classList.toggle('oculto', !!q && !u.norm(el.dataset.buscar).includes(q)));
        };
        ui.montarDecir(r);
        // Tocar ▶ dentro de una fila suena y no abre la ficha.
        r.querySelectorAll('.verbo-fila [data-decir]').forEach((b) => b.addEventListener('click', (e) => e.stopPropagation()));
        ui.on(r, '[data-verbo]', (el) => ui.ir('verbo', { base: el.dataset.verbo }));
      },
    };
  };

  App.pantallas.verbo = function ({ base }) {
    const v = App.datos.verbos.find((x) => x.base === base);
    const filas = App.verbos.conjugar(v);
    let tiempo = '';
    const tabla = filas.map((f) => {
      const cab = f.tiempo !== tiempo ? `<div class="seccion" style="margin-top:14px">${f.tiempo}${f.para ? ` <span style="text-transform:none;letter-spacing:0;font-weight:600">· ${u.esc(f.para)}</span>` : ''}</div>` : '';
      tiempo = f.tiempo;
      return `${cab}<div class="frase"><div class="txt"><div class="en">${u.esc(f.en)} <span class="suena">${u.esc(App.traductor.comoSuena(f.en))}</span></div><div class="es">${u.esc(f.es)}</div></div>${ui.botonDecir(f.en)}</div>`;
    }).join('');
    const html = `${ui.barra(u.esc(v.base))}
      <div class="tarjeta acento"><div class="verbo-formas grande">${formaHtml(v.base, 'b')}${formaHtml(v.pasado, 'span')}${formaHtml(v.part, 'span')}</div>
        <div class="chico" style="margin-top:6px">${u.esc(v.inf)}</div>
        <div class="fila" style="margin-top:10px">${ui.botonDecir(`${v.base}, ${v.pasado.replace(' / ', ', ')}, ${v.part}`, { clase: 'chip', etiqueta: '▶ las tres formas' })}</div></div>
      <div class="tarjeta"><h3>Conjugación</h3><p class="chico">"She" vale igual para he / it. I, you, we y they van como "I".</p>${tabla}</div>
      <div class="tarjeta borde"><h3>Negativo y pregunta</h3>${App.verbos.negPreg(v).map((f) => `<div class="frase"><div class="txt"><div class="en">${u.esc(f.en)}</div><div class="es">${u.esc(f.es)}</div></div>${f.en.includes('…') ? '' : ui.botonDecir(f.en)}</div>`).join('')}
        <p class="nota-pie">En pasado, la pregunta y el negativo usan <b>did</b> y el verbo vuelve a la forma base: <i>Did you go?</i>, no <i>Did you went?</i></p></div>
      <div class="tarjeta mostaza"><h3>En un viaje</h3><div class="frase"><div class="txt"><div class="en">${u.esc(v.ej.en)}</div><div class="es">${u.esc(v.ej.es)}</div></div>${ui.botonDecir(v.ej.en)}</div></div>`;
    return { html, montar(r) { ui.montarDecir(r); M.log('verbo', { base }); } };
  };

  // Práctica oral: aparece el verbo en castellano y ella dice "I + pasado" en voz alta.
  App.pantallas['verbos-practica'] = function ({ cantidad = 8 } = {}) {
    const lista = u.mezclar(App.datos.verbos).slice(0, cantidad);
    let i = 0, bien = 0;
    const html = `${ui.barra('Practicar el pasado')}<p class="tenue">Decí <b>"I"</b> + el verbo en pasado. Por ejemplo, para <i>ir</i>: "I went".</p><div id="zona"></div>`;
    return {
      html,
      montar(r) {
        const zona = r.querySelector('#zona');
        App.voz.precargar(lista.map((v) => ({ texto: `I ${v.pasado.split(' / ')[0]}` })));
        function pintar() {
          if (i >= lista.length) {
            zona.innerHTML = `<div class="tarjeta ok"><b>${bien} de ${lista.length} bien.</b><p class="chico">Los que costaron, repasalos en la lista.</p></div><button class="btn acento ancho" id="otra">Otra ronda</button>`;
            zona.querySelector('#otra').onclick = () => ui.ir('verbos-practica', {}, { reemplazar: true });
            M.log('verbos-fin', { bien, total: lista.length });
            return;
          }
          const v = lista[i];
          const pasados = v.pasado.split(' / ');
          const modelo = `I ${pasados[0]}`;
          zona.innerHTML = `<div class="barra-prog"><i style="width:${(i / lista.length) * 100}%"></i></div>
            <div class="tarjeta centro" style="margin-top:14px"><div class="chico">Pasado de…</div><div style="font:700 30px var(--titulo)">${u.esc(v.inf)}</div><div class="chico">(${u.esc(v.base)})</div></div>
            <div id="mic"></div><div id="res"></div>
            <div class="fila" style="justify-content:flex-end"><button class="btn sec mini" id="sig">Siguiente →</button></div>`;
          zona.querySelector('#sig').onclick = () => { i++; pintar(); };
          ui.microfono(zona.querySelector('#mic'), {
            referencia: modelo, continuo: false, etiqueta: 'Tocá, decí "I …" y tocá de nuevo.',
            alResultado(res) {
              const tks = u.tokens(res.texto);
              const ok = pasados.some((p) => tks.includes(p));
              const dijoBase = !ok && tks.includes(v.base);
              if (ok) bien++;
              M.log('verbo-practica', { base: v.base, dijo: res.texto, ok, pron: res.pron?.total });
              zona.querySelector('#res').innerHTML = `<div class="tarjeta ${ok ? 'ok' : 'sello'}"><p>Entendí: «${u.esc(res.texto)}» ${ok ? '<span class="marca-ok">✓</span>' : ''}</p>
                ${ok ? '' : `<p>${dijoBase ? 'Ese es el presente.' : 'No es esa forma.'} El pasado es <b>${u.esc(v.pasado)}</b>.</p>`}
                <div class="frase"><div class="txt"><div class="en">${u.esc(modelo)}</div><div class="es">yo ${u.esc(v.es[2])}</div></div>${ui.botonDecir(modelo)}</div>
                ${App.pron.tarjeta(res.pron, { contenidoMal: !ok })}</div>`;
              ui.montarDecir(zona.querySelector('#res'));
              App.pron.montar(zona.querySelector('#res'), res.pron);
              zona.querySelector('#sig').classList.remove('sec');
            },
          });
        }
        pintar();
      },
    };
  };
})();
