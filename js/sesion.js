// Sesión de hoy: arma el plan según lo que vence y el ánimo, y encadena los módulos.
window.App = window.App || {};

App.sesion = (() => {
  const M = App.modelo;
  let pasos = [], i = 0, activa = false, contexto = {};

  function plan() {
    const modo = M.modo();
    const p = [];
    const venc = M.vencidas().length;
    if (venc) p.push({ tipo: 'repaso', titulo: `Calentamiento: ${Math.min(venc, 6)} frases`, params: { max: 6 } });
    p.push({ tipo: 'arrancar', titulo: 'Arrancar a hablar: 3 preguntas', params: { cantidad: 3 } });
    const rec = M.escenaRecomendada();
    p.push({ tipo: 'escena', titulo: `Escena: ${rec.escena.emoji} ${rec.escena.titulo} (${rec.version})`, params: { id: rec.escena.id, version: rec.version } });
    if (modo !== 'suave') p.push({ tipo: 'sonido', titulo: 'Un minuto de sonidos', params: {}, dinamico: true });
    return p;
  }

  function empezar() {
    pasos = plan(); i = 0; activa = true; contexto = {};
    M.log('sesion-inicio', { plan: pasos.map((p) => p.tipo), modo: M.modo() });
    abrir();
  }
  function abrir() {
    const p = pasos[i];
    if (!p) return cerrar();
    if (p.tipo === 'sonido') {
      // Si en la escena se confundió un sonido, ese; si no, el que toca.
      const conf = (contexto.problemas || []).find((x) => x.tipo === 'sonido');
      p.params = { id: conf ? conf.contraste : M.sonidoQueToca().id, rondas: 8 };
    }
    App.ui.ir(p.tipo, { ...p.params, sesion: true }, { reemplazar: i > 0 });
  }
  function siguiente(datos = {}) {
    Object.assign(contexto, datos);
    i++;
    abrir();
  }
  function cerrar() {
    activa = false;
    M.log('sesion-fin', { pasos: pasos.length });
    App.ui.ir('cierre', { pasos: pasos.map((p) => p.titulo) }, { reemplazar: true });
  }
  function cancelar() { activa = false; M.log('sesion-cancelada', { en: i }); }

  return { plan, empezar, siguiente, cancelar, get activa() { return activa; }, get pasos() { return pasos; }, get indice() { return i; } };
})();
