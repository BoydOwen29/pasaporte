// Pronunciación: muestra lo que devuelve Azure (puntaje por palabra y por sonido) de forma entendible,
// y elige qué sonidos corregir. Los umbrales están juntos para calibrarlos en las pruebas.
window.App = window.App || {};

App.pron = (() => {
  const u = App.u;
  const UMBRAL = { bien: 80, medio: 60, labOk: 70 };

  // Consejos en castellano para los sonidos que más le cuestan a una rioplatense (IPA de Azure, en-US).
  const TIPS = {
    'i': 'i larga y tensa, con los labios estirados (seat, meet).',
    'ɪ': 'i corta y floja, casi entre "i" y "e" (sit, live). No la estires.',
    'æ': 'a muy abierta con la lengua adelante, entre "a" y "e" (cat, bag).',
    'ʌ': 'a corta y floja, boca a medio abrir: "uh" (cut, cup, bus).',
    'ə': 'la vocal "perezosa": corta y relajada, casi no se oye (about, the).',
    'ɑ': 'a abierta y atrás, como al bostezar (hot en EE. UU., father).',
    'ɛ': 'como la "e" castellana, un poco más abierta (bed, yes).',
    'eɪ': 'e que se desliza a i: "ei" (day, take, gate).',
    'oʊ': 'o que se desliza a u: "ou" (go, boat, hotel).',
    'ʊ': 'u corta y floja (book, good, could).',
    'u': 'u larga y tensa (food, room, two).',
    'ɝ': 'r de vocal: la lengua se curva sin tocar el paladar (bird, work, first).',
    'ɚ': 'final con r suave, sin vibrar (water, later).',
    'ɹ': 'r inglesa: la lengua no toca el paladar ni vibra (room, right).',
    'v': 'dientes de arriba sobre el labio de abajo, y que vibre (very, visit).',
    'b': 'los dos labios juntos y se abren de golpe (best, bag).',
    'z': 'como una "s" con zumbido, con la voz (is, please, dogs).',
    's': 's normal, sin "e" antes si viene una consonante (Spain, street).',
    'j': 'y suave como la "i" de "hielo", sin "sh" (yes, you).',
    'dʒ': 'como "ch" pero con voz, con un golpecito (job, juice).',
    'ʃ': 'sh (she, ship).',
    'tʃ': 'ch (chip, check).',
    'h': 'h aspirada suave, solo aire: no es la jota (hotel, help).',
    'θ': 'lengua entre los dientes, sin voz (think, three).',
    'ð': 'lengua entre los dientes, con voz (this, the).',
    'ŋ': 'n que se queda atrás en la garganta, sin "g" final fuerte (going, morning).',
    'd': 'd firme; al final de palabra no la pierdas (ordered, booked → t).',
    't': 't firme; al final no la pierdas (want, light).',
    'l': 'l; al final suena más oscura (hotel, all).',
    'w': 'como "u" rápida antes de vocal (water, window).',
  };
  // Fonemas británicos extra (Azure en-GB) y normalización: 'iː' se compara como 'i'.
  Object.assign(TIPS, {
    'ɒ': 'o corta, abierta y redondeada (hot, stop, coffee en UK).',
    'əʊ': 'empieza casi en "e" y se desliza a "u": "eu" (go, hotel, phone en UK).',
    'ɜ': 'vocal central larga, sin r: boca relajada (bird, work, first en UK).',
    'eə': 'e abierta que se desliza a la vocal relajada (where, chair, there).',
    'ɪə': 'i que se desliza a la vocal relajada (here, near, beer).',
    'ʊə': 'u que se desliza a la vocal relajada (tour, sure).',
  });
  const norm = (f) => String(f || '').replace(/ː/g, '');

  // Sonidos de alta carga funcional para ella (ver INVESTIGACION §4): pesan más en la devolución.
  const ALTA = new Set(['i', 'ɪ', 'æ', 'ʌ', 'v', 'b', 'j', 'dʒ', 'z', 's', 't', 'd']);

  const clase = (x) => (x == null ? 'p-gris' : x >= UMBRAL.bien ? 'p-bien' : x >= UMBRAL.medio ? 'p-medio' : 'p-mal');
  const oido = (f) => (f.oidos && f.oidos[0] ? norm(f.oidos[0].f) : null);

  // Sonidos flojos de una toma: [{ fonema, oido, palabra, precision, alta }]
  function sonidosFlojos(pron, max = 3) {
    if (!pron) return [];
    const out = [];
    for (const p of pron.palabras) {
      if (p.error === 'Omission' || p.error === 'Insertion') continue;
      for (const f of p.fonemas) {
        if (f.precision == null || f.precision >= UMBRAL.medio) continue;
        const o = oido(f), ff = norm(f.f);
        out.push({ fonema: ff, oido: o && o !== ff ? o : null, palabra: p.w, precision: Math.round(f.precision), alta: ALTA.has(ff) });
      }
    }
    out.sort((a, b) => (b.alta - a.alta) || a.precision - b.precision);
    const vistos = new Set();
    return out.filter((x) => (vistos.has(x.fonema) ? false : vistos.add(x.fonema))).slice(0, max);
  }

  function puntaje(n, etiqueta) {
    return n == null ? '' : `<div class="pp"><b class="${clase(n)}">${n}</b><span>${etiqueta}</span></div>`;
  }

  const frase = (n) => (n >= UMBRAL.bien ? 'Muy clara: se te entiende sin esfuerzo.' : n >= UMBRAL.medio ? 'Se entiende. Algunas palabras para pulir.' : 'Cuesta entenderla. Mirá las palabras en rojo.');

  // Tarjeta de pronunciación: UN número principal (cuán clara sonó la frase), las palabras en colores
  // y el resto de los puntajes adentro de "Ver detalle", cada uno con su explicación.
  // sinNumero: para cuando la pantalla ya muestra otro número (por ejemplo el de un sonido), así no se mezclan.
  function tarjeta(pron, { sinNumero = false, contenidoMal = false } = {}) {
    if (!pron) return '';
    const palabras = pron.palabras.map((p, i) => {
      const cls = p.error === 'Omission' ? 'p-omit' : p.error === 'Insertion' ? 'p-ins' : clase(p.precision);
      const tit = p.error === 'Omission' ? 'te la comiste' : p.error === 'Insertion' ? 'de más' : p.precision != null ? Math.round(p.precision) + '/100' : '';
      return `<button class="pw ${cls}" data-pw="${i}" title="${tit}">${u.esc(p.w)}</button>`;
    }).join(' ');
    const det = [
      [pron.precision, 'Sonidos', 'qué tan bien salió cada sonido de las palabras'],
      [pron.fluidez, 'Fluidez', 'si salió de corrido, sin cortes ni pausas largas'],
      [pron.prosodia, 'Entonación', 'la melodía y el ritmo de la frase (solo en inglés de EE. UU.)'],
      [pron.completitud, 'Completa', 'si dijiste todas las palabras de la frase'],
    ].filter(([v]) => v != null);
    return `<div class="pron">
      ${!sinNumero && pron.total != null ? `<div class="pron-top"><div class="pp"><b class="${clase(pron.total)}">${pron.total}</b><span>de 100</span></div><div><b>Pronunciación</b><div class="chico">${contenidoMal ? 'Mide solo cómo sonó lo que dijiste, no si la frase es la correcta.' : frase(pron.total)}</div></div></div>` : ''}
      <div class="pron-palabras">${palabras}</div>
      <div class="chico">Verde: bien · amarillo: casi · rojo: a pulir. Tocá una palabra para ver sus sonidos.</div>
      ${det.length && !sinNumero ? `<details class="pron-mas"><summary class="chico">Ver detalle del puntaje</summary>
        ${det.map(([v, t, d]) => `<div class="stat"><span><b>${t}</b> <span class="chico">${d}</span></span><b class="${clase(v)}">${v}</b></div>`).join('')}
        <p class="nota-pie">El número grande combina todos estos. Es el único que hace falta mirar.</p></details>` : ''}
      <div class="pron-det"></div></div>`;
  }

  function montar(el, pron) {
    if (!pron || !el) return;
    el.querySelectorAll('[data-pw]').forEach((b) => b.addEventListener('click', () => {
      const p = pron.palabras[Number(b.dataset.pw)];
      const det = b.closest('.pron').querySelector('.pron-det');
      const fon = p.fonemas.map((f) => {
        const o = oido(f), ff = norm(f.f);
        const otro = o && o !== ff && (f.precision ?? 100) < UMBRAL.bien;
        return `<div class="pf"><span class="simbolo">/${u.esc(f.f)}/</span> <b class="${clase(f.precision)}">${f.precision != null ? Math.round(f.precision) : '—'}</b>
          ${otro ? `<span class="chico">sonó como /${u.esc(o)}/</span>` : ''}
          ${(f.precision ?? 100) < UMBRAL.bien && TIPS[ff] ? `<div class="chico">${u.esc(TIPS[ff])}</div>` : ''}</div>`;
      }).join('');
      const msj = p.error === 'Omission' ? '<p class="chico">Esta palabra no se escuchó: te la comiste.</p>' : p.error === 'Insertion' ? '<p class="chico">Esta palabra estaba de más.</p>' : '';
      det.innerHTML = `<div class="tarjeta borde" style="margin:8px 0 0"><div class="fila entre"><b>${u.esc(p.w)}</b><span class="fila">${App.ui.botonDecir(p.w.toLowerCase(), { clase: 'icono chico2' })}${App.ui.botonDecir(p.w.toLowerCase(), { lento: true, etiqueta: '🐢', clase: 'icono chico2' })}</span></div>${msj}${fon || '<p class="chico">Sin detalle de sonidos.</p>'}</div>`;
      App.ui.montarDecir(det);
    }));
  }

  // Para el laboratorio: ¿cómo salió el sonido objetivo dentro de la palabra?
  function sonidoObjetivo(pron, ipaContraste, palabra) {
    if (!pron) return null;
    const p = pron.palabras.find((x) => x.w.toLowerCase() === palabra.toLowerCase()) || pron.palabras[0];
    if (!p) return null;
    const f = p.fonemas.find((x) => ipaContraste.includes(norm(x.f)));
    if (!f) return { precision: p.precision, oido: null, fonema: null, palabra: p };
    return { precision: f.precision, oido: oido(f), fonema: norm(f.f), palabra: p };
  }

  return { UMBRAL, TIPS, ALTA, clase, sonidosFlojos, tarjeta, montar, sonidoObjetivo };
})();
