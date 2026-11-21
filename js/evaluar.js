// Evaluación sin IA: qué intención cumplió, qué errores típicos hubo y si algún sonido se confundió.
window.App = window.App || {};

App.evaluar = (() => {
  const u = App.u;

  // ── Intenciones del diálogo
  function cumpleGrupo(texto, grupo) { return grupo.some((term) => u.contiene(texto, term)); }
  function cumple(texto, ideas) { return ideas.every((g) => cumpleGrupo(texto, g)); }

  function plantilla(s, slots) {
    return String(s).replace(/\{(\w+)\}/g, (_, k) => (slots[k] != null && slots[k] !== '' ? slots[k] : k === 'nombre' ? slots.yo || 'friend' : k === 'yo' ? 'Ana' : '…'));
  }

  function intencion(nodo, texto, slots) {
    for (const esp of nodo.espera || []) {
      const ideas = esp.ideas.map((g) => g.map((t) => plantilla(t, slots).toLowerCase()));
      if (cumple(texto, ideas)) {
        let captura = null;
        if (esp.captura) {
          const m = u.norm(texto).match(new RegExp(esp.captura.re));
          const propio = ['nombre', 'pais', 'destino'].includes(esp.captura.slot);
          if (m && m[1]) captura = { slot: esp.captura.slot, valor: propio ? limpiarCaptura(m[1]) : m[1].trim() };
        }
        return { ...esp, captura };
      }
    }
    return null;
  }
  const NO_NOMBRES = new Set(['a', 'an', 'the', 'from', 'here', 'very', 'so', 'not', 'fine', 'good', 'okay', 'ok', 'sorry', 'free', 'it', 'is']);
  function limpiarCaptura(v) {
    const p = v.trim().split(' ').filter((w) => !NO_NOMBRES.has(w));
    if (!p.length) return null;
    return p.map(u.capital).join(' ');
  }

  // ¿Pidió que le repitan? Es una estrategia buena: no cuenta como error.
  const PIDE_REPETIR = ['repeat', 'again', 'pardon', 'slowly', 'slower', "didn't catch", "didn't understand", 'did not understand', "don't understand", 'what did you say', 'say that again'];
  const pideRepetir = (texto) => PIDE_REPETIR.some((t) => u.contiene(texto, t)) || /^(sorry|what|excuse me|pardon)\??$/.test(u.norm(texto));

  // ── Errores típicos de hispanohablantes (reglas). Cada una va atada a una ficha de teoría.
  // gravedad: 3 = puede no entenderse · 2 = se entiende pero suena mal · 1 = detalle
  const COMP = { cheap: 'cheaper', big: 'bigger', small: 'smaller', fast: 'faster', easy: 'easier', near: 'nearer', close: 'closer', nice: 'nicer', quick: 'quicker', good: 'better', bad: 'worse', far: 'farther', cold: 'colder', hot: 'hotter' };
  const PASADO = { go: 'went', arrive: 'arrived', take: 'took', have: 'had', see: 'saw', visit: 'visited', eat: 'ate', buy: 'bought', lose: 'lost', walk: 'walked', stay: 'stayed', get: 'got', do: 'did', is: 'was', are: 'were' };
  const TERCERA = { live: 'lives', work: 'works', have: 'has', want: 'wants', need: 'needs', cost: 'costs', go: 'goes', like: 'likes', leave: 'leaves', start: 'starts', open: 'opens', close: 'closes', include: 'includes', do: 'does', speak: 'speaks' };

  function base(v) {
    if (v === 'has') return 'have';
    if (v === 'goes') return 'go';
    if (v === 'does') return 'do';
    if (/(ch|sh|ss|x)es$/.test(v)) return v.slice(0, -2);
    return v.replace(/s$/, '');
  }
  function basePasado(v) {
    const k = Object.keys(PASADO).find((x) => PASADO[x] === v);
    if (k) return k;
    return { liked: 'like', arrived: 'arrive', visited: 'visit' }[v] || v.replace(/ed$/, '');
  }

  // Lo que sigue al fragmento del error, para mostrar la frase corregida completa.
  const resto = (m, p) => { const r = p.slice(m.index + m[0].length).trim().split(' ').slice(0, 6).join(' '); return r ? ' ' + r : ''; };

  const REGLAS = [
    { id: 'agree', re: /\bi am agree\b/, mejor: () => 'I agree.', ficha: 'oracion', grav: 2,
      porque: '"Agree" ya es un verbo: no lleva "am". I agree / I don\'t agree.' },
    { id: 'edad', re: /\bi have (\d+|twenty|thirty|forty|fifty|sixty)( years)?\b/, mejor: (m) => `I'm ${m[1]} (years old).`, ficha: 'oracion', grav: 2,
      porque: 'La edad se dice con be: I\'m 30. "I have 30 years" no se usa.' },
    { id: 'sin-sujeto', re: /^(is|was) (very|so|really|a|an|the|my|not|good|nice|great|beautiful|expensive|cheap|fine|ok|okay|far|near|close|cold|hot|late|early|delicious|amazing|too)\b/, mejor: (m, t) => 'It ' + t.replace(/^(is|was)/, '$1') + '.', ficha: 'oracion', grav: 2,
      porque: 'En inglés no se puede arrancar con el verbo: siempre va "it" o la persona. It\'s very nice.' },
    { id: 'pregunta-sin-do', re: /^(where|what|how|when|why|what time) (you|they|we) (live|work|go|want|like|need|do|have|come|stay|leave|arrive|think|eat|speak|study)\b/, mejor: (m, p) => `${u.capital(m[1])} do ${m[2]} ${m[3]}${resto(m, p)}?`, ficha: 'preguntas-do', grav: 2, soloPregunta: false,
      porque: 'Con los verbos comunes, la pregunta necesita "do" o "does" antes de la persona: Where do you live?' },
    { id: 'pregunta-sin-does', re: /^(where|what|how|when|why|what time) (he|she|it|the \w+) (lives|works|goes|wants|likes|needs|has|leaves|opens|closes|starts|costs|live|work|go|leave|open|close|start|cost)\b/, mejor: (m, p) => `${u.capital(m[1])} does ${m[2]} ${base(m[3])}${resto(m, p)}?`, ficha: 'preguntas-do', grav: 2,
      porque: 'Para una cosa o he/she, la pregunta lleva "does" y el verbo va sin -s: What time does it open?' },
    { id: 'pregunta-be-orden', re: /^(where|what|how|who|how much|how far|what time) (you|he|she|it|this|that|they|the \w+) (are|is)\b/, mejor: (m, p) => `${u.capital(m[1])} ${m[3]} ${m[2]}${resto(m, p)}?`, ficha: 'preguntas-be', grav: 2,
      porque: 'En la pregunta, is/are pasa adelante de la persona o la cosa: Where are you from? Where is the gate?' },
    { id: 'people-is', re: /\bpeople is\b/, mejor: () => 'people are', ficha: 'oracion', grav: 1, porque: '"People" es plural: people are.' },
    { id: 'explain-me', re: /\bexplain me\b/, mejor: () => 'explain to me', ficha: 'pedir', grav: 1, porque: 'Se dice "explain to me" o "could you explain…?".' },
    { id: 'repeat-me', re: /\brepeat me\b/, mejor: () => 'Could you repeat that?', ficha: 'ganar-tiempo', grav: 1, porque: '"Repeat me" no se usa: Could you repeat that?' },
    { id: 'is-possible', re: /^is possible\b/, mejor: () => 'Is it possible…?', ficha: 'oracion', grav: 2, porque: 'Falta el "it": Is it possible to…?' },
    { id: 'more-adj', re: /\bmore (cheap|big|small|fast|easy|near|close|nice|quick|good|bad|far|cold|hot)\b/, mejor: (m) => COMP[m[1]], ficha: 'oracion', grav: 1,
      porque: 'Con adjetivos cortos, el comparativo es con -er: cheaper, bigger. (Good → better).' },
    { id: 'tercera-s', re: /\b(he|she|it) (live|work|want|need|cost|go|like|leave|start|open|close|include|speak)\b(?! to\b)/, mejor: (m) => `${m[1]} ${TERCERA[m[2]]}`, ficha: 'presente-simple', grav: 1, noSiPrev: /(does|did|can|will|would|could|should|to|not|n't)\s*$/,
      porque: 'Con he / she / it, el verbo en presente lleva -s: it costs, she lives.' },
    { id: 'it-dont', re: /\b(it|he|she) (do not|don't)\b/, mejor: (m) => `${m[1]} doesn't`, ficha: 'presente-simple', grav: 1, porque: 'Con it / he / she el negativo es doesn\'t: It doesn\'t work.' },
    { id: 'cosa-dont', re: /\bthe (\w+ )?(\w+) do not (work|have|include|open|close|come|turn)\b/, mejor: (m) => `the ${m[1] || ''}${m[2]} doesn't ${m[3]}`, ficha: 'presente-simple', grav: 1,
      porque: 'Una cosa (the shower, the air conditioning) es "it": el negativo es doesn\'t. The shower doesn\'t work.' },
    { id: 'does-s', re: /\b(does|doesn't|does not) (it|he|she|the \w+) (includes|works|costs|opens|closes|leaves|has|lives|goes|wants|needs)\b/, mejor: (m) => `${m[1]} ${m[2]} ${base(m[3])}`, ficha: 'preguntas-do', grav: 1,
      porque: 'Después de "does", el verbo va sin -s: Does it include…?' },
    { id: 'ayer-presente', re: /\byesterday (i|we) (go|arrive|take|have|see|visit|eat|buy|lose|walk|stay|get|do)\b/, mejor: (m) => `yesterday ${m[1]} ${PASADO[m[2]]}`, ficha: 'pasado', grav: 2,
      porque: 'Si decís "yesterday", el verbo va en pasado: Yesterday I went…' },
    { id: 'pasado-did-ed', re: /\bdid (you|i|we|they|he|she) (went|ate|saw|took|bought|lost|liked|visited|arrived)\b/, mejor: (m) => `did ${m[1]} ${basePasado(m[2])}`, ficha: 'pasado', grav: 1,
      porque: 'Con "did" el verbo vuelve a la forma normal: Did you go? (no "did you went").' },
    { id: 'how-called', re: /\bhow (is|it is) (it )?called\b/, mejor: () => 'What is it called?', ficha: 'preguntas-be', grav: 1, porque: 'Se pregunta con what: What is it called? / What\'s the word for…?' },
    { id: 'depend-of', re: /\bdepends? of\b/, mejor: () => 'depends on', ficha: 'oracion', grav: 1, porque: 'Se dice "depends on" (no "of").' },
    { id: 'married-with', re: /\bmarried with\b/, mejor: () => 'married to', ficha: 'oracion', grav: 1, porque: 'Se dice "married to".' },
    { id: 'i-want', re: /^(i want|give me)\b/, mejor: (m, t) => 'Could I get ' + t.replace(/^(i want|give me)\s*/, '') + ', please?', ficha: 'pedir', grav: 1, soloPedir: true,
      porque: '"I want" se entiende, pero suena brusco. Para pedir: Could I get…? / I\'d like…' },
  ];

  function errores(texto, nodo = {}) {
    const t = u.expandir(texto);
    const out = [];
    // Se evalúa el texto entero y también cada tramo que arranca con una palabra de pregunta
    // (el reconocedor no pone puntos y a veces junta dos oraciones).
    const partes = [...new Set([t, ...t.split(/\s+(?=(?:where|what|how|why|when|is it|is possible|could you|can you|yesterday)\b)/)])];
    const vistos = new Set();
    for (const r of REGLAS) {
      if (r.soloPedir && !nodo.pedir) continue;
      for (const p of partes) {
        const m = p.match(r.re);
        if (!m) continue;
        if (r.noSiPrev && r.noSiPrev.test(p.slice(0, m.index))) continue;
        if (vistos.has(r.id)) continue;
        vistos.add(r.id);
        out.push({ tipo: 'gramatica', regla: r.id, dijo: texto, fragmento: m[0], mejor: r.mejor(m, p), ficha: r.ficha, grav: r.grav, porque: r.porque });
      }
    }
    return out;
  }

  // ── Pronunciación dentro del diálogo: si en vez de la palabra esperada aparece su par mínimo.
  let PARES = null;
  function pares() {
    if (PARES) return PARES;
    PARES = {};
    for (const s of App.datos.sonidos)
      for (const [a, b] of s.pares) {
        const x = a.toLowerCase(), y = b.toLowerCase();
        (PARES[x] = PARES[x] || []).push({ otra: y, contraste: s.id });
        (PARES[y] = PARES[y] || []).push({ otra: x, contraste: s.id });
      }
    return PARES;
  }
  function confusiones(texto, nodo) {
    const tks = new Set(u.tokens(texto));
    const esperadas = new Set();
    for (const esp of nodo.espera || []) for (const g of esp.ideas) for (const term of g) if (!term.includes(' ')) esperadas.add(term.toLowerCase());
    for (const w of u.tokens(nodo.modelo || '')) esperadas.add(w);
    const out = [];
    const P = pares();
    for (const w of esperadas) {
      if (tks.has(w)) continue;
      for (const { otra, contraste } of P[w] || []) {
        if (tks.has(otra)) out.push({ tipo: 'sonido', esperada: w, oida: otra, contraste, grav: 3 });
      }
    }
    return out;
  }

  // ── Métricas de un turno
  function metricas(res, desde) {
    const palabras = u.tokens(res.texto).length;
    const lat = res.inicioHabla != null ? (res.inicioHabla - (desde ?? res.t0)) / 1000 : null;
    const dur = res.inicioHabla != null && res.finHabla != null ? Math.max(0.3, (res.finHabla - res.inicioHabla) / 1000) : null;
    const ppm = dur && palabras > 1 ? (palabras / dur) * 60 : null;
    return { palabras, latencia: lat != null ? u.redondear(lat, 1) : null, duracion: dur != null ? u.redondear(dur, 1) : null, ppm: ppm != null ? Math.round(ppm) : null };
  }

  // ── Devolución: de todos los problemas, a lo sumo N, priorizados y sin repetir lo corregido hace poco.
  function elegirDevolucion(problemas, max = 3) {
    const porClave = new Map();
    for (const p of problemas) {
      const k = p.tipo === 'sonido' ? 'son:' + p.contraste : p.tipo === 'gramatica' ? 'gra:' + p.regla : p.tipo === 'pronunciacion' ? 'pro:' + p.fonema : 'otro:' + (p.nodo || '');
      const prev = porClave.get(k);
      if (prev) prev.veces++; else porClave.set(k, { ...p, clave: k, veces: 1 });
    }
    const lista = [...porClave.values()].map((p) => {
      const reciente = p.tipo === 'gramatica' && App.modelo.corregidoHacepoco(p.regla);
      const recur = p.tipo === 'gramatica' ? (App.modelo.estado.errores[p.regla]?.n || 0) : 0;
      return { ...p, puntaje: p.grav * 10 + p.veces * 3 + Math.min(recur, 5) - (reciente ? 15 : 0) };
    });
    lista.sort((a, b) => b.puntaje - a.puntaje);
    return lista.slice(0, max);
  }

  // ── ¿Dijo exactamente la frase modelo? (independiente de cómo sonó)
  // Compara palabra por palabra: I'm = I am, 2 = two; ignora muletillas (eh, um). Si el modelo tiene "…",
  // lo que va después es libre (por ejemplo "I work as a…"): solo se exigen las palabras fijas.
  const NUMEROS = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 15: 'fifteen', 20: 'twenty', 30: 'thirty' };
  const MULETILLAS = new Set(['um', 'uh', 'eh', 'er', 'erm', 'hmm', 'mm', 'ah']);
  const palabras = (t) => u.expandir(String(t).replace(/…/g, ' ')).split(' ').filter(Boolean).map((w) => NUMEROS[w] || w).filter((w) => !MULETILLAS.has(w));
  function comparar(dicho, modelo) {
    const abierto = /…/.test(modelo);
    const fijo = abierto ? modelo.split('…')[0] : modelo;
    const m = palabras(fijo), d = palabras(dicho);
    // Subsecuencia común más larga: alinea las dos frases en operaciones (igual, falta, sobra) y después
    // junta "falta + sobra" seguidas en un cambio de palabra (dijo go en vez de went).
    const dp = Array.from({ length: m.length + 1 }, () => new Array(d.length + 1).fill(0));
    for (let i = m.length - 1; i >= 0; i--) for (let j = d.length - 1; j >= 0; j--)
      dp[i][j] = m[i] === d[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const ops = [];
    let i = 0, j = 0;
    while (i < m.length || j < d.length) {
      if (i < m.length && j < d.length && m[i] === d[j]) { ops.push({ t: 'eq', w: m[i] }); i++; j++; }
      else if (j >= d.length || (i < m.length && dp[i + 1][j] >= dp[i][j + 1])) { ops.push({ t: 'falta', w: m[i] }); i++; }
      else { ops.push({ t: 'sobra', w: d[j] }); j++; }
    }
    const marcas = [], faltan = [], sobran = [], cambios = [];
    // Se recorre por tramos entre palabras iguales: dentro de cada tramo, lo que falta y lo que sobra se
    // emparejan en orden como cambios (have en vez de get, the en vez de a); lo que queda suelto falta o sobra.
    let k = 0;
    while (k < ops.length) {
      if (ops[k].t === 'eq') { marcas.push({ w: ops[k].w, ok: true }); k++; continue; }
      const f = [], so = [];
      while (k < ops.length && ops[k].t !== 'eq') { (ops[k].t === 'falta' ? f : so).push(ops[k].w); k++; }
      const final = k >= ops.length;
      f.forEach((w, n) => {
        if (n < so.length) { cambios.push({ era: w, dijo: so[n] }); marcas.push({ w, ok: false, dijo: so[n] }); }
        else { faltan.push(w); marcas.push({ w, ok: false }); }
      });
      const resto = so.slice(f.length);
      if (!(abierto && final)) sobran.push(...resto); // en un modelo abierto, lo agregado al final es su parte libre
    }
    const exacto = !faltan.length && !cambios.length && !sobran.length;
    return { exacto, faltan, sobran, cambios, marcas, abierto };
  }

  // Muestra el modelo con las palabras que no coinciden marcadas, y qué dijo en su lugar.
  function diferenciasHtml(c) {
    if (!c || c.exacto) return '';
    const frase = c.marcas.map((x) => (x.ok ? u.esc(x.w) : `<b class="marca-no" style="text-decoration:underline">${u.esc(x.w)}</b>`)).join(' ') + (c.abierto ? ' …' : '');
    const notas = [
      ...c.cambios.map((x) => `dijiste <b>${u.esc(x.dijo)}</b> en vez de <b>${u.esc(x.era)}</b>`),
      c.faltan.length ? `te faltó: <b>${c.faltan.map(u.esc).join(' ')}</b>` : '',
      c.sobran.length ? `sobró: <b>${c.sobran.map(u.esc).join(' ')}</b>` : '',
    ].filter(Boolean);
    return `<div class="tarjeta sello" style="margin:8px 0;padding:10px 14px"><b>No es la misma frase.</b><div style="margin:4px 0">${frase}</div><div class="chico">${notas.join(' · ')}</div></div>`;
  }

  // ── Arrancar: ¿usó el eco y agregó un dato?
  function evaluarArrancar(item, texto) {
    const n = u.tokens(texto).length;
    const eco = cumpleGrupo(texto, item.eco_req[0]);
    const ecoPalabras = u.tokens(item.eco.split('/')[0].replace(/…/g, '')).length;
    const dato = n >= Math.max(3, ecoPalabras + 1);
    const extra = n >= ecoPalabras + 5 || /\b(and|because|but|so|also|too)\b/.test(u.norm(texto)) || u.contiene(texto, 'and you') || u.contiene(texto, 'what about you');
    return { eco, dato, extra, ok: eco && dato, palabras: n, errores: errores(texto) };
  }

  // ── Probalo (fichas de teoría): ¿dijo la idea y usó la forma de la ficha?
  function evaluarProbalo(item, texto) {
    const idea = item.ideas.every((g) => cumpleGrupo(texto, g));
    const forma = item.forma.every((g) => cumpleGrupo(texto, g));
    return { idea, forma, ok: idea && forma, similitud: u.similitud(texto, item.en), errores: errores(texto) };
  }

  return { intencion, plantilla, pideRepetir, errores, confusiones, metricas, elegirDevolucion, evaluarArrancar, evaluarProbalo, cumple, comparar, diferenciasHtml, REGLAS };
})();
