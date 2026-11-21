// El modelo de ella: lo que la app sabe y recuerda. Vive en localStorage (no sale del dispositivo).
window.App = window.App || {};

App.modelo = (() => {
  const CLAVE = 'pasaporte.v1';
  const u = App.u;

  const nuevo = () => ({
    version: 1,
    creado: Date.now(),
    perfil: { nombre: '', acento: 'en-GB', velocidad: 0.95, traduccion: true, teclado: false, listo: false },
    animo: [],          // { t, v }
    escenas: {},        // id → { A: {veces, ultima, mejorPistas}, B: {...}, rep: n, proxima }
    mazo: {},           // id → tarjeta de repaso
    sonidos: {},        // id → { perc: [{t, ok}], prod: [{t, res}] }
    arrancar: {},       // id → { nivel: 0..2, racha, intentos, ultima }
    teoria: {},         // id → { vista: t, probalo: n }
    errores: {},        // regla → { n, ultima, ejemplos: [], corregido: [t] }
    sesiones: [],       // resumen de cada escena jugada (métricas)
    registro: [],       // eventos para revisar las pruebas
  });

  let estado = cargar();

  function cargar() {
    try {
      const s = JSON.parse(localStorage.getItem(CLAVE));
      if (s && s.version === 1) return Object.assign(nuevo(), s, { perfil: Object.assign(nuevo().perfil, s.perfil) });
    } catch (e) {}
    return nuevo();
  }
  // Modo "ver el progreso de otra persona" (Owen abre el archivo que ella le mandó): solo lectura.
  let ajeno = null;
  function verAjeno(e, quien) {
    clearTimeout(pendiente);
    ajeno = { quien: quien || e?.perfil?.quien || e?.perfil?.nombre || 'otra persona' };
    estado = Object.assign(nuevo(), e, { perfil: Object.assign(nuevo().perfil, e.perfil || {}) });
  }
  function salirAjeno() { ajeno = null; estado = cargar(); }

  // Recuperar mi progreso desde un archivo exportado (mudar de Safari a la app del inicio, o de teléfono).
  // Se conserva el acceso a Azure de este dispositivo.
  function restaurar(e) {
    const azure = estado.perfil.azure, quien = estado.perfil.quien;
    estado = Object.assign(nuevo(), e, { perfil: Object.assign(nuevo().perfil, e.perfil || {}) });
    if (azure) estado.perfil.azure = azure;
    if (quien && !estado.perfil.quien) estado.perfil.quien = quien;
    estado.perfil.listo = true;
    clearTimeout(pendiente);
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (er) {}
    log('restaurar', { escenas: estado.sesiones.length });
  }

  let pendiente = null;
  function guardar() {
    if (ajeno) return;
    clearTimeout(pendiente);
    pendiente = setTimeout(() => {
      try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { console.warn('No se pudo guardar', e); }
    }, 150);
  }
  function borrarTodo() {
    const azure = estado.perfil.azure, quien = estado.perfil.quien;
    estado = nuevo();
    if (azure) estado.perfil.azure = azure;
    if (quien) estado.perfil.quien = quien;
    localStorage.removeItem(CLAVE);
    guardar();
    App.modelo.estado = estado;
  }

  function log(tipo, datos = {}) {
    if (ajeno) return;
    estado.registro.push({ t: Date.now(), tipo, ...datos });
    if (estado.registro.length > 3000) estado.registro.splice(0, estado.registro.length - 3000);
    guardar();
  }

  // ── Ánimo
  function registrarAnimo(v) { estado.animo.push({ t: Date.now(), v }); log('animo', { v }); guardar(); }
  function animoHoy() {
    const a = estado.animo[estado.animo.length - 1];
    return a && Date.now() - a.t < u.dias(0.5) ? a.v : null;
  }
  const modo = () => { const v = animoHoy(); return v == null ? 'normal' : v <= 2 ? 'suave' : v >= 5 ? 'desafio' : 'normal'; };

  // ── Repaso espaciado (variante simple de SM-2, con la latencia como dato)
  function agregarTarjeta({ id, en, es, origen }) {
    if (estado.mazo[id]) return false;
    estado.mazo[id] = { id, en, es, origen, creada: Date.now(), proxima: Date.now(), intervalo: 0, facilidad: 2.4, reps: 0, lapsos: 0, hist: [] };
    guardar();
    return true;
  }
  function calificar(id, nota, extra = {}) {
    const c = estado.mazo[id]; if (!c) return;
    // nota: 1 no salió · 2 dudé · 3 salió · 4 fácil
    if (nota === 1) { c.lapsos++; c.reps = 0; c.intervalo = 0; c.facilidad = Math.max(1.3, c.facilidad - 0.2); c.proxima = Date.now() + 10 * 60 * 1000; }
    else {
      if (nota === 2) { c.intervalo = Math.max(1, c.intervalo * 1.2); c.facilidad = Math.max(1.3, c.facilidad - 0.15); }
      if (nota === 3) c.intervalo = c.reps === 0 ? 1 : c.reps === 1 ? 3 : c.intervalo * c.facilidad;
      if (nota === 4) { c.intervalo = c.reps === 0 ? 3 : Math.max(4, c.intervalo * c.facilidad * 1.3); c.facilidad += 0.15; }
      c.reps++;
      c.proxima = Date.now() + u.dias(c.intervalo);
    }
    c.hist.push({ t: Date.now(), nota, ...extra });
    log('repaso', { id, nota, ...extra });
    guardar();
  }
  const vencidas = () => Object.values(estado.mazo).filter((c) => c.proxima <= Date.now()).sort((a, b) => a.proxima - b.proxima);

  // ── Escenas
  function estadoEscena(id) { return (estado.escenas[id] = estado.escenas[id] || { A: null, B: null, rep: 0, proxima: null }); }
  function terminarEscena(id, version, res) {
    const e = estadoEscena(id);
    const v = (e[version] = e[version] || { veces: 0, ultima: null, mejorPistas: null, cumplidas: 0 });
    v.veces++; v.ultima = Date.now();
    if (res.cumplida) v.cumplidas++;
    v.mejorPistas = v.mejorPistas == null ? res.pistas : Math.min(v.mejorPistas, res.pistas);
    const saltos = [2, 7, 21, 45];
    e.proxima = Date.now() + u.dias(saltos[Math.min(e.rep, saltos.length - 1)]);
    e.rep++;
    estado.sesiones.push({ t: Date.now(), escena: id, version, ...res.metricas, pistas: res.pistas, reparaciones: res.reparaciones, cumplida: res.cumplida });
    guardar();
  }
  // Qué escena recomendar: la que vence; si no, la primera sin hacer; si no, la B que falte.
  function escenaRecomendada() {
    const lista = App.datos.escenas;
    const m = modo();
    const vence = lista.filter((s) => { const e = estado.escenas[s.id]; return e && e.proxima && e.proxima <= Date.now(); })
      .sort((a, b) => estado.escenas[a.id].proxima - estado.escenas[b.id].proxima)[0];
    const elegir = (s) => {
      const e = estado.escenas[s.id];
      let version = 'A';
      if (e && e.A && e.A.cumplidas > 0 && (e.A.mejorPistas ?? 9) <= 2) version = 'B';
      if (m === 'suave') version = 'A';
      if (m === 'desafio' && e && e.A) version = 'B';
      return { escena: s, version };
    };
    if (vence) return elegir(vence);
    const sinHacer = lista.find((s) => !estado.escenas[s.id] || !estado.escenas[s.id].A);
    if (sinHacer) return { escena: sinHacer, version: 'A' };
    const sinB = lista.find((s) => !estado.escenas[s.id].B);
    if (sinB) return { escena: sinB, version: m === 'suave' ? 'A' : 'B' };
    return elegir(lista.slice().sort((a, b) => (estado.escenas[a.id].proxima || 0) - (estado.escenas[b.id].proxima || 0))[0]);
  }

  // ── Errores recurrentes
  function anotarError(regla, ejemplo) {
    const e = (estado.errores[regla] = estado.errores[regla] || { n: 0, ultima: null, ejemplos: [], corregido: [] });
    e.n++; e.ultima = Date.now();
    e.ejemplos.push(ejemplo); if (e.ejemplos.length > 5) e.ejemplos.shift();
    guardar();
  }
  function anotarCorregido(regla) {
    const e = estado.errores[regla]; if (!e) return;
    e.corregido.push(Date.now()); if (e.corregido.length > 10) e.corregido.shift();
    guardar();
  }
  // ¿Se corrigió en las últimas 2 sesiones de escena? Para no machacar siempre lo mismo.
  function corregidoHacepoco(regla) {
    const e = estado.errores[regla]; if (!e || !e.corregido.length) return false;
    const ses = estado.sesiones.slice(-2);
    const desde = ses.length ? ses[0].t - 60 * 1000 : 0;
    return e.corregido[e.corregido.length - 1] >= desde;
  }

  // ── Sonidos
  function sonido(id) { return (estado.sonidos[id] = estado.sonidos[id] || { perc: [], prod: [] }); }
  function anotarPercepcion(id, ok, datos) { const s = sonido(id); s.perc.push({ t: Date.now(), ok }); if (s.perc.length > 200) s.perc.shift(); log('percepcion', { id, ok, ...datos }); guardar(); }
  function anotarProduccion(id, res, datos) { const s = sonido(id); s.prod.push({ t: Date.now(), res }); if (s.prod.length > 200) s.prod.shift(); log('produccion', { id, res, ...datos }); guardar(); }
  function aciertoPercepcion(id, ultimos = 20) {
    const p = sonido(id).perc.slice(-ultimos); return p.length ? p.filter((x) => x.ok).length / p.length : null;
  }
  function aciertoProduccion(id, ultimos = 12) {
    const p = sonido(id).prod.slice(-ultimos); return p.length ? p.filter((x) => x.res === 'ok').length / p.length : null;
  }
  // El contraste que toca: el primero (por prioridad) que todavía no llega al 85 % al escuchar.
  function sonidoQueToca() {
    const l = App.datos.sonidos;
    return l.find((s) => { const a = aciertoPercepcion(s.id); return a == null || a < 0.85 || sonido(s.id).perc.length < 20; }) || l[0];
  }

  // ── Arrancar
  function arr(id) { return (estado.arrancar[id] = estado.arrancar[id] || { nivel: 0, racha: 0, intentos: 0, ultima: null }); }
  function anotarArrancar(id, ok) {
    const a = arr(id); a.intentos++; a.ultima = Date.now();
    if (ok) { a.racha++; if (a.racha >= 2 && a.nivel < 2) { a.nivel++; a.racha = 0; } }
    else { a.racha = 0; if (a.nivel > 0) a.nivel--; }
    guardar();
  }

  function vistaTeoria(id) { const t = (estado.teoria[id] = estado.teoria[id] || { vista: null, probalo: 0 }); t.vista = Date.now(); guardar(); }
  function probaloTeoria(id) { const t = (estado.teoria[id] = estado.teoria[id] || { vista: null, probalo: 0 }); t.probalo++; guardar(); }

  // Exporta todo menos las credenciales (la clave de Azure nunca sale del teléfono).
  function exportar() {
    const copia = JSON.parse(JSON.stringify(estado));
    if (copia.perfil) delete copia.perfil.azure;
    return JSON.stringify({ tipo: 'pasaporte-progreso', exportado: new Date().toISOString(), quien: estado.perfil.quien || estado.perfil.nombre || '', userAgent: navigator.userAgent, estado: copia }, null, 1);
  }

  // Días en que practicó (algo dicho en voz alta), como 'AAAA-MM-DD'.
  const PRACTICA = new Set(['turno', 'arrancar', 'probalo', 'drill', 'repaso', 'percepcion', 'produccion', 'reintento']);
  function diasPracticados() {
    const dias = new Set();
    for (const e of estado.registro) if (PRACTICA.has(e.tipo)) dias.add(new Date(e.t).toLocaleDateString('sv-SE'));
    return dias;
  }

  return {
    get estado() { return estado; }, set estado(v) { estado = v; },
    guardar, borrarTodo, log, exportar, diasPracticados, verAjeno, salirAjeno, restaurar, get ajeno() { return ajeno; },
    registrarAnimo, animoHoy, modo,
    agregarTarjeta, calificar, vencidas,
    estadoEscena, terminarEscena, escenaRecomendada,
    anotarError, anotarCorregido, corregidoHacepoco,
    sonido, anotarPercepcion, anotarProduccion, aciertoPercepcion, aciertoProduccion, sonidoQueToca,
    arr, anotarArrancar, vistaTeoria, probaloTeoria,
  };
})();
