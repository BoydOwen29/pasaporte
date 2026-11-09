// Utilidades generales: texto, fechas, azar, DOM.
window.App = window.App || {};

App.u = (() => {
  const DIA = 24 * 60 * 60 * 1000;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Normaliza lo que devuelve el reconocedor: minúsculas, apóstrofos rectos, sin puntuación.
  function norm(t) {
    return String(t || '')
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/wi-?fi/g, 'wifi')
      .replace(/[^a-z0-9'\s-]/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const CONTR = {
    "i'm": 'i am', "it's": 'it is', "that's": 'that is', "i'd": 'i would', "don't": 'do not', "doesn't": 'does not',
    "didn't": 'did not', "can't": 'cannot', "what's": 'what is', "where's": 'where is', "i've": 'i have', "we're": 'we are',
    "you're": 'you are', "they're": 'they are', "isn't": 'is not', "aren't": 'are not', "haven't": 'have not', "there's": 'there is',
    "let's": 'let us', "i'll": 'i will', "won't": 'will not', "name's": 'name is', "he's": 'he is', "she's": 'she is',
  };
  // Versión con contracciones expandidas, para que "i'm" y "i am" se comparen igual.
  function expandir(t) {
    return norm(t).split(' ').map((w) => CONTR[w] || w).join(' ');
  }
  const tokens = (t) => norm(t).split(' ').filter(Boolean);

  function lev(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  // Similitud entre dos frases (0 a 1), por subsecuencia común de palabras.
  function similitud(a, b) {
    const x = expandir(a).split(' ').filter(Boolean), y = expandir(b).split(' ').filter(Boolean);
    if (!x.length || !y.length) return 0;
    const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
    for (let i = 1; i <= x.length; i++)
      for (let j = 1; j <= y.length; j++)
        dp[i][j] = cerca(x[i - 1], y[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return (2 * dp[x.length][y.length]) / (x.length + y.length);
  }
  // Dos palabras "son la misma" si coinciden, difieren en plural o en una letra (palabras largas).
  function cerca(p, q) {
    if (p === q) return true;
    if (p + 's' === q || q + 's' === p) return true;
    if (p.length >= 5 && q.length >= 5 && lev(p, q) <= 1) return true;
    return false;
  }

  // ¿Aparece el término (una o varias palabras) en el texto?
  function contiene(texto, termino) {
    const t = ' ' + norm(texto) + ' ', e = ' ' + expandir(texto) + ' ';
    const term = norm(termino), termE = expandir(termino);
    if (!term) return false;
    if (t.includes(' ' + term + ' ') || e.includes(' ' + termE + ' ')) return true;
    if (!term.includes(' ')) {
      return tokens(texto).some((w) => cerca(w, term));
    }
    return false;
  }

  const hoy = () => Date.now();
  const dias = (n) => n * DIA;
  const fecha = (t) => new Date(t).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  const fechaHora = (t) => new Date(t).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const mezclar = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const promedio = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
  const redondear = (x, d = 0) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
  const capital = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  return { DIA, esc, norm, expandir, tokens, lev, similitud, cerca, contiene, hoy, dias, fecha, fechaHora, azar, mezclar, espera, promedio, redondear, capital };
})();
