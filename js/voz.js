// Voz: síntesis (personajes y modelos) y reconocimiento (lo que dice ella), todo con el navegador.
// El turno lo marca ella: escuchar() arranca y la promesa se resuelve recién cuando se llama a detener().
window.App = window.App || {};

App.voz = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const sintesis = window.speechSynthesis;
  let voces = [];

  function cargarVoces() {
    if (!sintesis) return [];
    voces = sintesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    return voces;
  }
  if (sintesis) {
    cargarVoces();
    sintesis.addEventListener?.('voiceschanged', cargarVoces);
  }

  // Ordena las voces: primero las "naturales" (Edge), después Google, después el resto.
  function calidad(v) {
    const n = v.name.toLowerCase();
    let p = 0;
    if (n.includes('natural') || n.includes('neural')) p += 30;
    if (n.includes('online')) p += 5;
    if (n.includes('google')) p += 15;
    if (n.includes('enhanced') || n.includes('premium')) p += 10;
    if (n.includes('novelty') || n.includes('whisper') || n.includes('bad news') || n.includes('bells')) p -= 50;
    return p;
  }
  const norLang = (l) => l.replace('_', '-').toLowerCase();

  function vocesDe(acento) {
    const a = acento.toLowerCase();
    return voces.filter((v) => norLang(v.lang).startsWith(a)).sort((x, y) => calidad(y) - calidad(x));
  }

  // Elige una voz para un acento (en-US, en-GB, en-AU). Si no hay, cae en cualquier voz en inglés.
  function vozPara(acento, indice = 0) {
    if (!voces.length) cargarVoces();
    let lista = vocesDe(acento);
    if (!lista.length) lista = vocesDe('en-us');
    if (!lista.length) lista = voces.slice().sort((x, y) => calidad(y) - calidad(x));
    if (!lista.length) return null;
    return lista[indice % lista.length];
  }

  // Para el laboratorio (HVPT): varias voces distintas, mezclando acentos.
  function vocesVariadas() {
    if (!voces.length) cargarVoces();
    const buenas = voces.filter((v) => calidad(v) > -10);
    return buenas.length ? buenas : voces;
  }

  // ── Voces neuronales de Azure (si están configuradas en Ajustes). Suenan humanas en cualquier equipo;
  // la voz del navegador queda solo como respaldo si no hay Azure o no hay internet.
  const NARRADOR = { 'en-us': 'en-US-AvaNeural', 'en-gb': 'en-GB-SoniaNeural' };
  const VOCES_LAB = ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural', 'en-GB-SoniaNeural', 'en-GB-RyanNeural', 'en-AU-NatashaNeural', 'en-AU-WilliamNeural', 'en-IE-ConnorNeural', 'en-CA-ClaraNeural'];
  function narrador(acento) { return NARRADOR[(acento || App.modelo?.estado?.perfil?.acento || 'en-GB').toLowerCase()] || NARRADOR['en-us']; }
  // Voces disponibles para el laboratorio (muchas voces = mejor entrenamiento del oído).
  const vocesGrabadas = () => (App.azure?.listo() ? VOCES_LAB : []);

  let audioActual = null;
  let hablando = false;
  let turno = 0; // cada decir() nuevo cancela el anterior, aunque esté esperando a Azure
  function reproducirBlob(blob, miTurno, onInicio) {
    return new Promise((resolve) => {
      if (miTurno !== turno) return resolve();
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      audioActual = a; hablando = true;
      let listo = false;
      const fin = () => { if (!listo) { listo = true; hablando = false; if (audioActual === a) audioActual = null; URL.revokeObjectURL(url); resolve(); } };
      a.onended = fin; a.onerror = fin; a.onpause = fin;
      a.onplaying = () => onInicio && onInicio();
      a.play().catch(fin);
    });
  }

  // opciones: neural (voz neuronal, p. ej. la del personaje), acento (para el respaldo), voz (SpeechSynthesisVoice), lento, rapido
  async function decir(texto, { acento, voz, neural, lento = false, rapido = false, onInicio } = {}) {
    callar();
    const miTurno = ++turno;
    if (!voz && App.azure?.configurado()) {
      try {
        const blob = await App.azure.sintetizar(String(texto).trim(), neural || narrador(acento), { lento, rapido });
        return reproducirBlob(blob, miTurno, onInicio);
      } catch (e) {
        App.modelo?.log?.('azure-tts-error', { msj: String(e.message || e) });
        if (miTurno !== turno) return;
      }
    }
    onInicio && onInicio();
    return decirNavegador(texto, { acento, voz, lento, rapido });
  }

  // Precarga frases de esta pantalla: [{ texto, neural? }] (sin neural = la voz narradora).
  function precargar(lista) {
    if (!App.azure?.configurado()) return;
    App.azure.precargar(lista.filter((x) => x && x.texto).map((x) => ({ texto: String(x.texto).trim(), voz: x.neural || narrador(), lento: x.lento })));
  }
  function decirNavegador(texto, { acento, voz, lento = false, rapido = false } = {}) {
    return new Promise((resolve) => {
      if (!sintesis) return resolve();
      try { sintesis.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(texto.replace(/…/g, '...'));
      const pref = App.modelo?.estado?.perfil || {};
      const v = voz || vozPara(acento || pref.acento || 'en-US');
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = acento || 'en-US';
      const base = pref.velocidad || 0.95;
      u.rate = lento ? Math.max(0.55, base * 0.7) : rapido ? Math.min(1.3, base * 1.18) : base;
      let listo = false;
      const fin = () => { if (!listo) { listo = true; hablando = false; resolve(); } };
      u.onend = fin; u.onerror = fin;
      hablando = true;
      sintesis.speak(u);
      // Algunas voces no disparan onend: corte de seguridad según el largo del texto.
      setTimeout(fin, 1500 + texto.length * 110 / (u.rate || 1));
    });
  }
  const callar = () => {
    try { sintesis && sintesis.cancel(); } catch (e) {}
    if (audioActual) { try { audioActual.pause(); } catch (e) {} audioActual = null; }
    turno++;
    hablando = false;
  };
  // ¿Las voces del navegador suenan bien? Las de serie de Windows (David, Zira, Mark) son robóticas.
  function vocesNavegadorBuenas() {
    if (!voces.length) cargarVoces();
    return voces.some((v) => calidad(v) >= 15);
  }

  const hayReconocimiento = () => !!SR || !!App.azure?.listo();

  // Reconocimiento con turno marcado por ella. Devuelve { detener(), resultado: Promise }.
  // resultado → { texto, alternativas[], t0, inicioHabla, finHabla, error }
  // referencia: lo que tenía que decir (activa la evaluación con guion en Azure); '' = libre.
  function escuchar({ onParcial, onListo, continuo = true, maxAlternativas = 3, lang = App.modelo?.estado?.perfil?.acento === 'en-US' ? 'en-US' : 'en-GB', referencia = '' } = {}) {
    if (App.azure?.listo()) { callar(); return App.azure.escuchar({ referencia, onParcial, onListo }); }
    if (!SR) {
      return { detener() {}, resultado: Promise.resolve({ texto: '', alternativas: [], error: 'sin-reconocimiento' }) };
    }
    callar();
    const t0 = performance.now();
    let activo = true, finales = [], parcial = '', alternativas = [], inicioHabla = null, finHabla = null, error = null;
    let rec = null, resolver;
    const resultado = new Promise((r) => (resolver = r));

    function crear() {
      rec = new SR();
      rec.lang = lang;
      rec.continuous = continuo;
      rec.interimResults = true;
      rec.maxAlternatives = maxAlternativas;
      rec.onstart = () => { if (onListo) { onListo(); onListo = null; } };
      rec.onspeechstart = () => { if (inicioHabla == null) inicioHabla = performance.now(); };
      rec.onresult = (ev) => {
        parcial = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i];
          if (inicioHabla == null) inicioHabla = performance.now();
          if (r.isFinal) {
            finales.push(r[0].transcript.trim());
            finHabla = performance.now();
            const alts = [];
            for (let k = 0; k < r.length; k++) alts.push({ t: r[k].transcript.trim(), c: r[k].confidence });
            alternativas.push(alts);
          } else {
            parcial += r[0].transcript;
          }
        }
        onParcial && onParcial((finales.join(' ') + ' ' + parcial).trim());
      };
      rec.onerror = (ev) => {
        if (ev.error === 'no-speech' || ev.error === 'aborted') return;
        error = ev.error;
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed' || ev.error === 'audio-capture') activo = false;
      };
      rec.onend = () => {
        // En Android el modo continuo se corta solo tras un silencio: si ella no terminó, se reanuda.
        if (activo && continuo) { try { crear(); rec.start(); return; } catch (e) {} }
        cerrar();
      };
      return rec;
    }
    function cerrar() {
      if (!resolver) return;
      if (parcial && !finales.length) { finales.push(parcial.trim()); if (finHabla == null) finHabla = performance.now(); }
      const texto = finales.join(' ').replace(/\s+/g, ' ').trim();
      const r = resolver; resolver = null;
      r({ texto, alternativas, t0, inicioHabla, finHabla, error });
    }
    try { crear(); rec.start(); } catch (e) { error = String(e); activo = false; cerrar(); }

    return {
      resultado,
      detener() {
        // Un instante de cola, para no cortar la última palabra.
        setTimeout(() => {
          activo = false;
          try { rec && rec.stop(); } catch (e) { cerrar(); }
          setTimeout(cerrar, 1800); // por si el navegador no avisa el final
        }, 400);
      },
    };
  }

  return { decir, precargar, callar, escuchar, hayReconocimiento, vozPara, vocesDe, vocesVariadas, cargarVoces, vocesGrabadas, vocesNavegadorBuenas, narrador, VOCES_LAB, get voces() { return voces; }, get hablando() { return hablando; } };
})();
