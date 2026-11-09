// Acceso con código: la clave de Azure viaja cifrada dentro de la app (js/datos/acceso.js, generado con
// tools/crear_acceso.mjs). Cada persona tiene su código; con él, la app descifra la clave en el propio
// teléfono. Sin el código, lo publicado es ilegible.
// Cifrado: PBKDF2-SHA256 (muchas iteraciones) → AES-GCM 256, con la Web Crypto del navegador.
window.App = window.App || {};

App.acceso = (() => {
  const datos = () => window.App.accesoDatos || { v: 1, iter: 0, entradas: [] };
  const hayCodigos = () => (datos().entradas || []).length > 0;
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const normalizar = (c) => String(c || '').trim().toLowerCase().replace(/\s+/g, '-');

  async function probar(codigo, entrada, iter) {
    const sub = crypto.subtle;
    const base = await sub.importKey('raw', new TextEncoder().encode(normalizar(codigo)), 'PBKDF2', false, ['deriveKey']);
    const clave = await sub.deriveKey({ name: 'PBKDF2', salt: b64(entrada.sal), iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plano = await sub.decrypt({ name: 'AES-GCM', iv: b64(entrada.iv) }, clave, b64(entrada.datos));
    return JSON.parse(new TextDecoder().decode(plano));
  }

  // Devuelve { quien, clave, region } o null si el código no corresponde a nadie.
  async function abrir(codigo) {
    if (!codigo || !hayCodigos() || !window.crypto?.subtle) return null;
    const d = datos();
    for (const e of d.entradas) {
      try { return await probar(codigo, e, d.iter); } catch (er) { /* no es este */ }
    }
    return null;
  }

  // Aplica el acceso al perfil: Azure queda configurado y se recuerda quién es.
  async function entrar(codigo) {
    const r = await abrir(codigo);
    if (!r) return null;
    const p = App.modelo.estado.perfil;
    p.azure = { clave: r.clave, region: r.region, desactivado: false };
    p.quien = r.quien || p.nombre || '';
    if (!p.nombre && r.quien) p.nombre = r.quien;
    App.modelo.guardar();
    guardarRespaldo();
    App.modelo.log('acceso', { quien: p.quien });
    App.azure.iniciar();
    return r;
  }

  // ── El acceso queda guardado en el teléfono, aparte del progreso y por duplicado (localStorage e IndexedDB),
  // para no tener que volver a escribir el código. Si uno de los dos se pierde, se recupera del otro al abrir.
  const CLAVE_R = 'pasaporte.acceso';
  function idb() {
    return new Promise((resolve) => {
      try {
        const r = indexedDB.open('pasaporte-acceso', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('acceso');
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }
  async function guardarRespaldo() {
    const p = App.modelo.estado.perfil;
    if (App.modelo.ajeno || !p.azure || !p.azure.clave) return;
    const dato = { azure: { clave: p.azure.clave, region: p.azure.region }, quien: p.quien || '' };
    try { localStorage.setItem(CLAVE_R, JSON.stringify(dato)); } catch (e) {}
    const db = await idb();
    if (db) try { db.transaction('acceso', 'readwrite').objectStore('acceso').put(dato, 'acceso'); } catch (e) {}
  }
  async function leerRespaldo() {
    try { const d = JSON.parse(localStorage.getItem(CLAVE_R)); if (d && d.azure && d.azure.clave) return d; } catch (e) {}
    const db = await idb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const q = db.transaction('acceso').objectStore('acceso').get('acceso');
        q.onsuccess = () => resolve(q.result && q.result.azure && q.result.azure.clave ? q.result : null);
        q.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }
  // Al abrir: si el perfil no tiene el acceso pero hay respaldo, se recupera sin pedir nada. Si el perfil lo
  // tiene, se asegura el respaldo. Devuelve true si recuperó algo (para refrescar la pantalla).
  async function recuperar() {
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {} // que el teléfono no lo borre
    const p = App.modelo.estado.perfil;
    if (p.azure && p.azure.clave) { guardarRespaldo(); return false; }
    const d = await leerRespaldo();
    if (!d) return false;
    p.azure = { clave: d.azure.clave, region: d.azure.region, desactivado: false };
    if (d.quien && !p.quien) p.quien = d.quien;
    App.modelo.guardar();
    guardarRespaldo();
    App.modelo.log('acceso-recuperado', {});
    return true;
  }

  return { hayCodigos, entrar, normalizar, guardarRespaldo, recuperar };
})();
