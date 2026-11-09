// Traductor sin conexión: la traducción completa de cada frase (escrita a mano en datos/traducciones.js o
// traída en los propios datos) y un "palabra por palabra" con el glosario y las expresiones fijas.
window.App = window.App || {};

App.traductor = (() => {
  const T = () => App.datos.trad || { frases: {}, expresiones: {}, palabras: {} };
  const limpia = (w) => w.toLowerCase().replace(/[’‘]/g, "'").replace(/^[^a-z0-9']+|[^a-z0-9'-]+$/g, '').replace(/-$/, '');
  const BEBIDAS = ['hot chocolate', 'flat white', 'cappuccino', 'americano', 'macchiato', 'espresso', 'coffee', 'latte', 'mocha', 'tea'];

  // Todas las traducciones conocidas en un solo mapa: las de traducciones.js más las que ya traen los datos
  // (lo que dicen los personajes, los ejemplos de teoría, las frases de sonidos y las preguntas de Arrancar).
  let mapa = null;
  function todas() {
    if (mapa) return mapa;
    mapa = Object.assign({}, T().frases);
    const D = App.datos;
    for (const e of D.escenas || []) for (const v of Object.values(e.versiones)) for (const n of Object.values(v.nodos)) if (n.npc && n.tr) mapa[n.npc] = n.tr;
    for (const f of D.teoria || []) for (const x of f.ejemplos) mapa[x.en] = x.es;
    for (const s of D.sonidos || []) for (const x of s.frases) mapa[x.en] = x.es;
    for (const q of D.arrancar || []) mapa[q.q] = q.tr;
    for (const f of D.teoria || []) for (const p of f.probalo) if (p.tr) mapa[p.en] = p.tr;
    for (const g of D.arsenal || []) for (const x of g.frases) { mapa[x.en] = x.es; mapa[x.en.replace(/…/g, '').trim()] = x.es; }
    if (App.verbos) Object.assign(mapa, App.verbos.traducciones().frases);
    return mapa;
  }

  // Glosario de palabras sueltas: el escrito a mano más las formas de los verbos irregulares.
  let glos = null;
  function glosario() {
    if (glos) return glos;
    glos = Object.assign({}, App.verbos ? App.verbos.traducciones().palabras : {}, T().palabras);
    return glos;
  }

  // Traducción completa: exacta, o con su nombre / la bebida puestos como en la plantilla.
  function frase(en) {
    const f = todas(), t = String(en || '').trim();
    if (f[t]) return f[t];
    const nombre = App.modelo?.estado?.perfil?.nombre;
    const variantes = [];
    if (nombre) {
      variantes.push([t.split(nombre).join('{yo}'), (s) => s.split('{yo}').join(nombre)]);
      variantes.push([t.split(nombre).join('{nombre}'), (s) => s.split('{nombre}').join(nombre)]);
    }
    for (const b of BEBIDAS) if (t.includes(b)) variantes.push([t.replace(b, '{bebida}'), (s) => s.split('{bebida}').join(b)]);
    for (const [k, volver] of variantes) if (f[k]) return volver(f[k]);
    return null;
  }

  // Palabra por palabra: [{ en, es }] respetando la escritura original; las expresiones van juntas.
  function porPalabra(en) {
    const { expresiones } = T();
    const palabras = glosario();
    const orig = String(en || '').replace(/…/g, ' … ').split(/\s+/).filter(Boolean);
    const lim = orig.map(limpia);
    const out = [];
    for (let i = 0; i < orig.length;) {
      let hecho = false;
      for (let n = Math.min(6, orig.length - i); n >= 2; n--) {
        const k = lim.slice(i, i + n).join(' ');
        if (expresiones[k]) { out.push({ en: orig.slice(i, i + n).join(' '), es: expresiones[k], expr: true }); i += n; hecho = true; break; }
      }
      if (hecho) continue;
      const w = lim[i];
      if (!w && orig[i] !== '…') { i++; continue; } // signos sueltos (? / , —): no llevan glosa
      let es = w ? palabras[w] ?? palabras[w.replace(/'s$/, '')] ?? (w.endsWith('s') ? palabras[w.slice(0, -1)] : undefined) : undefined;
      if (es == null && /^[A-Z]/.test(orig[i]) && i > 0) es = '(nombre)';
      if (es == null && /^\d/.test(w || '')) es = w;
      out.push({ en: orig[i], es: orig[i] === '…' ? '…' : es ?? '—' });
      i++;
    }
    return out;
  }

  // ── Cómo suena, escrito a la española (a partir de la pronunciación de CMUdict).
  // Cuidados: tilde en la sílaba fuerte, "ii" para la i larga (sheep = shiip, ship = ship), "th" para la
  // lengua entre los dientes, "v" se queda (dientes sobre el labio), la y inglesa se escribe "i" (yes = ies,
  // para no decir "shes") y la j inglesa "dy" (job = dyob). En británico se cae la r que no va antes de vocal.
  const VOC = { AA: 'a', AE: 'a', AH: 'a', AO: 'o', AW: 'au', AY: 'ai', EH: 'e', ER: 'er', EY: 'ei', IH: 'i', IY: 'ii', OW: 'ou', OY: 'oi', UH: 'u', UW: 'u' };
  const CONS = { B: 'b', CH: 'ch', D: 'd', DH: 'd', F: 'f', G: 'g', HH: 'j', JH: 'dy', K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ng', P: 'p', R: 'r', S: 's', SH: 'sh', T: 't', TH: 'th', V: 'v', W: 'u', Y: 'i', Z: 's', ZH: 'sh' };
  const TILDE = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
  function suenaPalabra(w) {
    const dic = App.datos.fonetica || {};
    const clave = String(w).toLowerCase().replace(/[’‘]/g, "'").replace(/^[^a-z']+|[^a-z']+$/g, '');
    if (!clave) return '';
    if (!dic[clave]) {
      if (clave.includes('-')) return clave.split('-').map(suenaPalabra).join('-');
      return w.replace(/[^\p{L}'-]/gu, '');
    }
    const brit = (App.modelo?.estado?.perfil?.acento || 'en-GB') !== 'en-US';
    const fon = dic[clave].split(' ');
    const esVocal = (f) => /\d$/.test(f);
    const vocales = fon.filter(esVocal).length;
    let out = '';
    fon.forEach((f, i) => {
      const base = f.replace(/\d$/, ''), acento = f.slice(-1);
      const sig = fon[i + 1];
      if (esVocal(f)) {
        // La vocal débil (schwa) se escribe 'a': con 'e' se leía como una e castellana fuerte.
        let v = VOC[base];
        // r británica que no suena: débil = 'a' (water = uóta, either = íida); fuerte = 'e' (work = uek).
        if (base === 'ER' && brit && !(sig && esVocal(sig))) v = acento === '0' ? 'a' : 'e'; // la tilde la pone el paso de abajo
        // La i larga solo cuando es fuerte (very = véri) y no antes de una r británica (here = jía).
        if (base === 'IY' && (acento === '0' || (brit && sig === 'R' && !(fon[i + 2] && esVocal(fon[i + 2]))))) v = 'i';
        // En británico, la "o" corta de hot, on, stop, job.
        if (base === 'AA' && brit && /o/.test(clave) && !/a/.test(clave)) v = 'o';
        if (acento === '1' && vocales > 1) v = TILDE[v[0]] + v.slice(1);
        out += v;
      } else {
        let c = CONS[base] || '';
        // En británico la r antes de consonante o al final no suena: después de i / e / u queda una vocal suave (here = jía, where = uea).
        if (base === 'R' && brit && !(sig && esVocal(sig))) c = /^(IY|IH|EH|UH|UW)/.test(fon[i - 1] || '') ? 'a' : '';
        if (base === 'JH' && i === fon.length - 1) c = 'ch';
        if (base === 'NG' && sig && /^(K|G)$/.test(sig)) c = 'n';
        out += c;
      }
    });
    // Ortografía castellana para que se lea bien: c / qu / k y g / gu.
    return out.replace(/k(?=[eéií])/g, 'qu').replace(/k(?=[aáoóuú]|[^aáeéiíoóuú]|$)/g, (m, i, s) => (i === s.length - 1 ? 'k' : 'c'))
      .replace(/g(?=[eéií])/g, 'gu');
  }
  function comoSuena(en) {
    return String(en || '').replace(/…/g, ' ').split(/\s+/).map(suenaPalabra).filter(Boolean).join(' ');
  }
  function leyenda(suena) {
    const l = [];
    if (/ii|íi/.test(suena)) l.push('ii = i larga');
    if (/th/.test(suena)) l.push('th = lengua entre los dientes');
    if (/v/.test(suena)) l.push('v = dientes de arriba sobre el labio');
    if (/j/.test(suena)) l.push('j = solo aire, suave');
    if (/dy/.test(suena)) l.push('dy = como una "ch" con voz');
    return l;
  }

  // Panel que se abre debajo de una frase: traducción completa, cómo suena y palabra por palabra.
  function panelHtml(en, esDada) {
    const es = esDada || frase(en);
    const pp = porPalabra(en);
    const suena = comoSuena(en);
    const ley = leyenda(suena);
    return `<div class="trad-panel">
      ${es ? `<div class="trad-es">🇦🇷 ${App.u.esc(es)}</div>` : ''}
      ${suena ? `<div class="trad-suena">🗣️ <span class="chico">Cómo suena:</span> <b>${App.u.esc(suena)}</b></div>${ley.length ? `<div class="chico" style="margin-bottom:8px">${ley.join(' · ')}. Es una ayuda aproximada: lo que vale es el audio.</div>` : ''}` : ''}
      <div class="pxp">${pp.map((x) => `<span class="pxp-par${x.expr ? ' expr' : ''}"><b>${App.u.esc(x.en)}</b>${x.en === '…' ? '' : `<small>${App.u.esc(comoSuena(x.en))}</small>`}<i>${App.u.esc(x.es)}</i></span>`).join('')}</div>
      <div class="chico">Palabra por palabra (aproximado: el sentido exacto es el de la traducción de arriba).</div></div>`;
  }

  return { frase, porPalabra, panelHtml, comoSuena };
})();
