// Azure AI Speech: voces neuronales (TTS) y evaluación de pronunciación por palabra y por sonido.
// La clave y la región se cargan en Ajustes y quedan solo en este dispositivo (localStorage).
// Plan gratis F0: 5 h/mes de audio evaluado y 0,5 M caracteres/mes de voz. Los audios se cachean.
window.App = window.App || {};

App.azure = (() => {
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.53.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js';
  let cargando = null;
  let ultimoError = null;

  const cred = () => App.modelo.estado.perfil.azure || {};
  const idioma = () => (App.modelo.estado.perfil.acento === 'en-US' ? 'en-US' : 'en-GB');
  const configurado = () => !!(cred().clave && cred().region);
  const listo = () => configurado() && !!window.SpeechSDK && !cred().desactivado;

  function cargarSDK() {
    if (window.SpeechSDK) return Promise.resolve(true);
    if (cargando) return cargando;
    cargando = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = SDK_URL; s.async = true;
      s.onload = () => resolve(!!window.SpeechSDK);
      s.onerror = () => { ultimoError = 'No se pudo cargar el SDK de Azure (¿sin internet?)'; cargando = null; resolve(false); };
      document.head.appendChild(s);
    });
    return cargando;
  }
  async function iniciar() {
    if (configurado()) await cargarSDK();
    const ok = listo();
    if (ok) { try { sintetizador(); } catch (e) {} } // deja la conexión abierta de antemano
    return ok;
  }

  function speechConfig() {
    const S = window.SpeechSDK;
    const c = S.SpeechConfig.fromSubscription(cred().clave, cred().region);
    // Se evalúa contra el inglés que eligió (británico por defecto): si no, penalizaría su acento modelo.
    c.speechRecognitionLanguage = idioma();
    return c;
  }

  // ── Caché de audios (IndexedDB) para no gastar cuota repitiendo frases.
  let db = null;
  function abrirDB() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve) => {
      const r = indexedDB.open('pasaporte-audio', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('tts');
      r.onsuccess = () => { db = r.result; resolve(db); };
      r.onerror = () => resolve(null);
    });
  }
  async function cacheGet(k) {
    const d = await abrirDB(); if (!d) return null;
    return new Promise((res) => { const q = d.transaction('tts').objectStore('tts').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); });
  }
  async function cacheSet(k, blob) {
    const d = await abrirDB(); if (!d) return;
    try { d.transaction('tts', 'readwrite').objectStore('tts').put(blob, k); } catch (e) {}
  }

  const xml = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

  // Un solo sintetizador con la conexión abierta: abrir una conexión nueva por frase era lo que demoraba.
  let synth = null;
  function sintetizador() {
    if (synth) return synth;
    const S = window.SpeechSDK;
    const cfg = speechConfig();
    cfg.speechSynthesisOutputFormat = S.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
    synth = new S.SpeechSynthesizer(cfg, null);
    try { S.Connection.fromSynthesizer(synth).openConnection(); } catch (e) {}
    return synth;
  }
  function cerrarSintetizador() { try { synth && synth.close(); } catch (e) {} synth = null; }

  const memoria = new Map();   // clave → Blob (más rápido que IndexedDB)
  const enCurso = new Map();   // clave → Promise (si se pide dos veces la misma frase, se espera la misma)

  // Devuelve un Blob mp3 con la frase dicha por la voz neuronal pedida (desde la caché si ya existe).
  function sintetizar(texto, voz, { lento = false, rapido = false } = {}) {
    const rate = lento ? '-28%' : rapido ? '+12%' : '0%';
    const k = `${voz}|${rate}|${texto}`;
    if (memoria.has(k)) return Promise.resolve(memoria.get(k));
    if (enCurso.has(k)) return enCurso.get(k);
    const p = (async () => {
      const enCache = await cacheGet(k);
      if (enCache) { memoria.set(k, enCache); return enCache; }
      if (!(await iniciar())) throw new Error(ultimoError || 'Azure no configurado');
      const S = window.SpeechSDK;
      const lang = voz.slice(0, 5);
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${voz}"><prosody rate="${rate}">${xml(texto.replace(/…/g, '...'))}</prosody></voice></speak>`;
      const blob = await new Promise((resolve, reject) => {
        sintetizador().speakSsmlAsync(ssml, (r) => {
          if (r.reason === S.ResultReason.SynthesizingAudioCompleted) resolve(new Blob([r.audioData], { type: 'audio/mpeg' }));
          else { cerrarSintetizador(); reject(new Error(r.errorDetails || 'Falló la síntesis')); }
        }, (e) => { cerrarSintetizador(); reject(new Error(String(e))); });
      });
      memoria.set(k, blob);
      cacheSet(k, blob);
      App.modelo.log('azure-tts', { voz, caracteres: texto.length });
      return blob;
    })();
    enCurso.set(k, p);
    p.finally(() => enCurso.delete(k)).catch(() => {});
    return p;
  }

  // Precarga en segundo plano lo que probablemente se va a escuchar en esta pantalla, de a una frase,
  // para que al tocar ▶ suene enseguida. Lo ya guardado no gasta cuota.
  const colaPrecarga = [];
  let precargando = false;
  function precargar(items) {
    if (!configurado() || cred().desactivado) return;
    for (const it of items) if (it && it.texto && it.voz) colaPrecarga.push(it);
    if (!precargando) siguientePrecarga();
  }
  async function siguientePrecarga() {
    const it = colaPrecarga.shift();
    if (!it) { precargando = false; return; }
    precargando = true;
    try { await sintetizar(String(it.texto).trim(), it.voz, { lento: !!it.lento }); } catch (e) { colaPrecarga.length = 0; precargando = false; return; }
    setTimeout(siguientePrecarga, 30);
  }
  const vaciarPrecarga = () => { colaPrecarga.length = 0; };

  // ── Micrófono: se pide UNA vez y se reutiliza en todas las grabaciones (antes cada grabación lo pedía de
  // nuevo). Se suelta cuando la app pasa a segundo plano, para que no quede encendido de fondo.
  const COLA = 600;
  let flujo = null;
  async function microfono() {
    if (flujo && flujo.active && flujo.getAudioTracks().some((t) => t.readyState === 'live')) return flujo;
    flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    return flujo;
  }
  function soltarMicrofono() { if (flujo) { flujo.getTracks().forEach((t) => t.stop()); flujo = null; } }
  document.addEventListener('visibilitychange', () => { if (document.hidden) soltarMicrofono(); });

  // ── Captura propia del micrófono: se graba desde el instante del toque y el audio se va guardando en un
  // "push stream" que Azure lee cuando termina de conectarse. Así no se pierde lo que dice apenas toca.
  let ctxAudio = null;
  function contextoAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctxAudio || ctxAudio.state === 'closed') ctxAudio = new AC();
    if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(() => {});
    return ctxAudio;
  }
  // Toma el audio del micrófono, lo pasa a 16 kHz / 16 bits (lo que espera Azure) y lo entrega en trozos.
  function capturar(flujoMic, alDatos) {
    const ac = contextoAudio();
    if (!ac) return null;
    const src = ac.createMediaStreamSource(flujoMic);
    const proc = ac.createScriptProcessor(4096, 1, 1);
    const ratio = ac.sampleRate / 16000;
    proc.onaudioprocess = (ev) => {
      const ent = ev.inputBuffer.getChannelData(0);
      const n = Math.floor(ent.length / ratio);
      const out = new Int16Array(n);
      for (let i = 0; i < n; i++) {
        const a = Math.floor(i * ratio), b = Math.min(ent.length, Math.floor((i + 1) * ratio));
        let s = 0; for (let k = a; k < b; k++) s += ent[k];
        const v = Math.max(-1, Math.min(1, s / Math.max(1, b - a)));
        out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
      }
      alDatos(out.buffer);
    };
    src.connect(proc);
    proc.connect(ac.destination); // en Safari tiene que estar conectado para que procese (sale silencio)
    return () => { proc.onaudioprocess = null; try { proc.disconnect(); src.disconnect(); } catch (e) {} };
  }

  // ── Reconocimiento + evaluación de pronunciación, con turno marcado por ella.
  // referencia: el texto que tenía que decir ('' = modo libre, sin guion).
  // onListo: avisa cuando ya se está grabando (casi inmediato; la primera vez espera el permiso del micrófono).
  function escuchar({ referencia = '', onParcial, onListo } = {}) {
    let resolver;
    const resultado = new Promise((r) => (resolver = r));
    const t0 = performance.now();
    let rec = null, push = null, soltar = null, tInicio = null, arrancado = false;
    const segmentos = [];
    let detenido = false, terminado = false, error = null;
    let parcialPendiente = ''; // lo que Azure venía transcribiendo y todavía no confirmó
    contextoAudio(); // dentro del toque: iOS solo deja activar el audio en respuesta a un gesto

    (async () => {
      if (!(await iniciar())) { resolver({ texto: '', alternativas: [], error: ultimoError || 'azure-no-listo' }); return; }
      const S = window.SpeechSDK;
      let flujoMic;
      try { flujoMic = await microfono(); }
      catch (e) { resolver({ texto: '', alternativas: [], error: e && e.name === 'NotAllowedError' ? 'not-allowed' : 'audio-capture' }); return; }
      // 1) Empieza a grabar YA, y avisa que puede hablar.
      push = S.AudioInputStream.createPushStream(S.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1));
      try { soltar = capturar(flujoMic, (buf) => { if (!terminado) push.write(buf); }); }
      catch (e) { soltar = null; App.modelo.log('captura-error', { msj: String(e) }); } // si falla, se usa el micrófono directo
      tInicio = performance.now();
      const audio = soltar ? S.AudioConfig.fromStreamInput(push) : S.AudioConfig.fromStreamInput(flujoMic);
      if (!soltar) tInicio = null; // sin Web Audio, se usa el micrófono directo (como antes)
      if (soltar) onListo && onListo();
      // 2) Mientras tanto, conecta con Azure; lo grabado espera en el stream.
      const cfg = speechConfig();
      cfg.setProperty(S.PropertyId.Speech_SegmentationSilenceTimeoutMs, '1500');
      cfg.setProperty(S.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '15000');
      cfg.outputFormat = S.OutputFormat.Detailed;
      rec = new S.SpeechRecognizer(cfg, audio);
      const pa = new S.PronunciationAssessmentConfig(referencia || '', S.PronunciationAssessmentGradingSystem.HundredMark, S.PronunciationAssessmentGranularity.Phoneme, !!referencia);
      pa.phonemeAlphabet = 'IPA';
      pa.nbestPhonemeCount = 5;
      // La evaluación de entonación (prosodia) solo existe para en-US.
      if (idioma() === 'en-US') pa.enableProsodyAssessment = true;
      pa.applyTo(rec);
      rec.recognizing = (_, e) => { parcialPendiente = e.result.text || ''; onParcial && onParcial((segmentos.map((x) => x.DisplayText).join(' ') + ' ' + parcialPendiente).trim()); };
      rec.recognized = (_, e) => {
        if (e.result.reason !== S.ResultReason.RecognizedSpeech) return;
        parcialPendiente = '';
        try { segmentos.push(JSON.parse(e.result.properties.getProperty(S.PropertyId.SpeechServiceResponse_JsonResult))); } catch (er) {}
        onParcial && onParcial(segmentos.map((x) => x.DisplayText).join(' '));
      };
      rec.canceled = (_, e) => { if (e.reason === S.CancellationReason.Error) { error = e.errorDetails || 'cancelado'; ultimoError = error; } cerrar(); };
      rec.sessionStopped = () => cerrar();
      rec.startContinuousRecognitionAsync(() => {
        arrancado = true;
        if (!soltar) { tInicio = performance.now(); onListo && onListo(); }
        if (detenido) finalizar();
      }, (e) => { error = String(e); cerrar(); });
    })();

    // Cierra la grabación: deja de mandar audio, avisa el fin del stream (Azure entrega lo último) y para.
    function finalizar() {
      if (terminado) return;
      terminado = true;
      try { soltar && soltar(); } catch (e) {}
      try { push && push.close(); } catch (e) {}
      // Con el stream cerrado, Azure termina solo; si no, se lo para igual.
      setTimeout(() => { if (resolver && rec) rec.stopContinuousRecognitionAsync(() => setTimeout(cerrar, 350), () => cerrar()); }, soltar ? 2500 : 0);
    }
    function cerrar() {
      if (!resolver) return;
      const r = resolver; resolver = null;
      terminado = true;
      try { soltar && soltar(); } catch (e) {}
      try { rec && rec.close(); } catch (e) {}
      const pron = combinar(segmentos, referencia);
      // Si la última frase no llegó a confirmarse, se usa lo que se venía transcribiendo (sin puntaje para esa parte).
      const texto = [...segmentos.map((s) => s.DisplayText || ''), parcialPendiente].join(' ').replace(/\s+/g, ' ').trim();
      if (parcialPendiente) App.modelo.log('azure-parcial', { texto: parcialPendiente });
      const base = tInicio ?? t0;
      const p = pron?.palabras || [];
      const habladas = p.filter((w) => w.offset != null && w.error !== 'Omission');
      const inicioHabla = habladas.length ? base + habladas[0].offset : null;
      const finHabla = habladas.length ? base + habladas[habladas.length - 1].offset + habladas[habladas.length - 1].dur : null;
      App.modelo.log('azure-stt', { segundos: finHabla && inicioHabla ? Math.round((finHabla - inicioHabla) / 100) / 10 : null, referencia: !!referencia, texto: !!texto, error: error || undefined, captura: !!soltar });
      r({ texto, alternativas: [], t0, inicioHabla, finHabla, error: !texto ? error : null, pron, azure: true });
    }
    return {
      resultado,
      // Al tocar "listo" se sigue grabando un instante (COLA): si se corta en seco, se pierde la última palabra.
      detener() {
        if (detenido) return;
        detenido = true;
        setTimeout(() => { if (arrancado || soltar) finalizar(); }, COLA);
        setTimeout(cerrar, 9000); // corte de seguridad
      },
    };
  }

  // Une los segmentos que devuelve Azure en un solo resultado: puntajes globales, palabras y sonidos.
  function combinar(segmentos, referencia) {
    const nb = segmentos.map((s) => s.NBest && s.NBest[0]).filter(Boolean);
    if (!nb.length) return null;
    const palabras = [];
    for (const n of nb) {
      for (const w of n.Words || []) {
        const pa = w.PronunciationAssessment || {};
        palabras.push({
          w: w.Word,
          precision: pa.AccuracyScore ?? null,
          error: pa.ErrorType || 'None',
          offset: w.Offset != null ? w.Offset / 10000 : null,
          dur: w.Duration != null ? w.Duration / 10000 : null,
          prosodia: pa.Feedback?.Prosody || null,
          fonemas: (w.Phonemes || []).map((f) => ({
            f: f.Phoneme,
            precision: f.PronunciationAssessment?.AccuracyScore ?? null,
            oidos: (f.PronunciationAssessment?.NBestPhonemes || []).map((x) => ({ f: x.Phoneme, p: x.Score })),
          })),
        });
      }
    }
    const pesos = nb.map((n) => (n.Words || []).length || 1);
    const prom = (campo) => {
      const xs = nb.map((n, i) => [n.PronunciationAssessment?.[campo], pesos[i]]).filter(([v]) => v != null);
      if (!xs.length) return null;
      return Math.round(xs.reduce((s, [v, p]) => s + v * p, 0) / xs.reduce((s, [, p]) => s + p, 0));
    };
    // Fluidez medida con los tiempos de cada palabra: ritmo y pausas largas (≥ 0,5 s) entre palabras.
    const hab = palabras.filter((p) => p.offset != null && p.error !== 'Omission');
    let pausas = 0;
    for (let i = 1; i < hab.length; i++) if (hab[i].offset - (hab[i - 1].offset + hab[i - 1].dur) >= 500) pausas++;
    const span = hab.length > 1 ? (hab[hab.length - 1].offset + hab[hab.length - 1].dur - hab[0].offset) / 1000 : null;
    return {
      total: prom('PronScore'), precision: prom('AccuracyScore'), fluidez: prom('FluencyScore'),
      completitud: referencia ? prom('CompletenessScore') : null, prosodia: prom('ProsodyScore'),
      palabras, pausasLargas: pausas, ppm: span && hab.length > 1 ? Math.round((hab.length / span) * 60) : null,
    };
  }

  async function probar() {
    try {
      cargando = null;
      cerrarSintetizador(); memoria.clear();
      if (!(await cargarSDK())) return { ok: false, msj: ultimoError };
      const b = await sintetizar('Hello! Your pronunciation coach is ready.', App.voz.narrador());
      return { ok: !!b, blob: b };
    } catch (e) { return { ok: false, msj: String(e.message || e) }; }
  }

  return { configurado, listo, iniciar, sintetizar, precargar, vaciarPrecarga, escuchar, combinar, probar, get error() { return ultimoError; } };
})();
