import { firebaseConfig, SDK, TECNICOS, POR_NOMBRE, ALFABETO, LETRAS, EQUIPOS, EQ, ITEMS, DEFAULT_CFG, FRASES, demostrativo, FICHA_URL, esc, normClave, fmtClave, hoyISO, addDias, addMeses, fechaCorta, primerNombre, limpiarTel, verTel, waLink, lista, relleno } from './config.js?v=202611261100';

const { initializeApp } = await import(SDK + 'firebase-app.js');
const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } = await import(SDK + 'firebase-auth.js');
const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, getDocs, onSnapshot, query, where, writeBatch, setDoc, deleteDoc } = await import(SDK + 'firebase-firestore.js');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

const $ = id => document.getElementById(id);
const S = {
  user: null, tec: null, cfg: JSON.parse(JSON.stringify(DEFAULT_CFG)), items: ITEMS,
  clientes: [], equipos: [], avisos: [], hechos: [], cobros: [], cobrosEq: {}, movs: [],
  vista: 'inicio', p: {}, filtro: 'mine', q: '', svcs: [], msg: ''
};
let unsubs = [];

// ---------- apariencia ----------
function aplicarApariencia() {
  const c = S.cfg, r = document.documentElement;
  r.dataset.tema = c.fondo; r.style.setProperty('--color', c.color);
  r.style.fontSize = ({ chica: '15px', normal: '17px', grande: '19px', extra: '22px' })[c.letra] || '17px';
  try { localStorage.setItem('ap', JSON.stringify({ f: c.fondo, c: c.color, l: c.letra })); } catch (_) {}
}
try { const a = JSON.parse(localStorage.getItem('ap') || 'null'); if (a) { S.cfg.fondo = a.f; S.cfg.color = a.c; S.cfg.letra = a.l; aplicarApariencia(); } } catch (_) {}

// ---------- ingreso ----------
$('entrar').onclick = async () => {
  const prov = new GoogleAuthProvider(); prov.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, prov); }
  catch (e) { if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') await signInWithRedirect(auth, prov); else if (e.code !== 'auth/popup-closed-by-user') $('lerr').textContent = 'No se pudo entrar: ' + (e.code || e.message); }
};
onAuthStateChanged(auth, u => {
  unsubs.forEach(f => f()); unsubs = [];
  S.user = u;
  if (!u) { $('login').hidden = false; $('app').hidden = true; $('nav').hidden = true; return; }
  const mail = (u.email || '').toLowerCase();
  S.tec = TECNICOS[mail] || null;
  if (!S.tec) { $('lerr').textContent = 'Este mail (' + mail + ') no está habilitado.'; signOut(auth); return; }
  $('login').hidden = true; $('app').hidden = false; $('nav').hidden = false;
  S.filtro = 'mine'; iniciar();
});

function escuchar(ref, fn) {
  unsubs.push(onSnapshot(ref, snap => { fn(snap); pintar(); }, err => { S.msg = 'Sin permiso o sin conexión: ' + err.code; pintar(); }));
}
function iniciar() {
  escuchar(collection(db, 'clientes'), s => S.clientes = s.docs.map(d => ({ id: d.id, ...d.data() })));
  escuchar(collection(db, 'equipos'), s => S.equipos = s.docs.map(d => ({ id: d.id, ...d.data() })));
  escuchar(query(collection(db, 'avisos'), where('estado', '==', 'pendiente')), s => S.avisos = s.docs.map(d => ({ id: d.id, ...d.data() })));
  escuchar(query(collection(db, 'avisos'), where('estado', 'in', ['enviado', 'descartado'])), s => S.hechos = s.docs.map(d => ({ id: d.id, ...d.data() })));
  unsubs.push(onSnapshot(query(collection(db, 'cobros'), where('fecha', '>=', hoyISO().slice(0, 7) + '-01')), s => { S.cobros = s.docs.map(d => ({ id: d.id, ...d.data() })); pintar(); }, () => {}));
  const mes = hoyISO().slice(0, 7) + '-01';
  escuchar(query(collection(db, 'movimientos'), where('fecha', '>=', mes)), s => S.movs = s.docs.map(d => ({ id: d.id, ...d.data() })));
  escuchar(doc(db, 'config', 't_' + S.tec.nombre), s => { S.cfg = fusion(DEFAULT_CFG, s.exists() ? s.data() : {}); aplicarApariencia(); });
  escuchar(doc(db, 'config', 'items'), s => { S.items = { ...ITEMS, ...(s.exists() ? s.data() : {}) }; });
}
function fusion(base, extra) { const o = JSON.parse(JSON.stringify(base)); for (const k in extra) { if (k === 'textos') o.textos = { ...o.textos, ...extra.textos }; else o[k] = extra[k]; } return o; }
const guardarCfg = patch => { Object.assign(S.cfg, patch); if (patch.textos) S.cfg.textos = { ...S.cfg.textos, ...patch.textos }; setDoc(doc(db, 'config', 't_' + S.tec.nombre), patch, { merge: true }); aplicarApariencia(); };

// ---------- ayudas ----------
const ir = (vista, p = {}, sinHist) => { S.vista = vista; S.p = p; S.msg = ''; if (!sinHist) { try { history.pushState({ vista, p: JSON.parse(JSON.stringify(p)) }, ''); } catch (_) {} } pintar(); window.scrollTo(0, 0); };
try { history.replaceState({ vista: 'inicio', p: {} }, ''); } catch (_) {}
window.addEventListener('popstate', ev => { const st = ev.state || { vista: 'inicio', p: {} }; ir(st.vista, st.p || {}, true); if (st.vista === 'equipo' && st.p && st.p.id) cargarSvcs(st.p.id); });
const clienteDe = e => S.clientes.find(c => c.id === e.clienteId);
const equiposDe = cid => S.equipos.filter(e => e.clienteId === cid);
const ayuda = t => '<details class="ayuda"><summary aria-label="Explicación">?</summary><p>' + esc(t) + '</p></details>';
function claveNueva() {
  const usadas = new Set(S.equipos.map(e => normClave(e.id)));
  for (let i = 0; i < 200; i++) {
    let k = S.tec.letra; const a = crypto.getRandomValues(new Uint8Array(5));
    for (const b of a) k += ALFABETO[b % ALFABETO.length];
    if (!usadas.has(k)) return k;
  }
  throw new Error('No se pudo generar la clave');
}
const tecDe = nombre => POR_NOMBRE[nombre] || S.tec;
function vars(a, extra = {}) {
  const t = tecDe(a.tecnico);
  const eq = EQ[a.equipo] || EQ.otro;
  return { nombre: primerNombre(a.cliente), equipo: eq.art, deEquipo: eq.art.startsWith('el ') ? 'del ' + eq.art.slice(3) : 'de ' + eq.art, tecnico: t.nombre, clave: fmtClave(a.clave), link: FICHA_URL + '#' + normClave(a.clave), contacto: S.cfg.contactoLink ? '\nGuardá mi contacto: ' + t.vcf : '', ...extra };
}
const textoAviso = a => relleno(S.cfg.textos[({ d5: 'd5', resena: 'resena', mant: 'mant', seg: 'seguimiento' })[a.tipo]], vars(a));
const ETIQ = { d5: 'Seguimiento', resena: 'Pedir reseña', mant: 'Mantenimiento', seg: 'Seguimiento' };
const activo = a => ({ d5: S.cfg.seguimiento5, resena: S.cfg.resena, mant: S.cfg.mantAvisos, seg: S.cfg.mantAvisos })[a.tipo] !== false;
const miosONo = a => S.filtro === 'todos' || a.tecnico === S.tec.nombre;

// ---------- pintar ----------
let pend = 0;
function pintar() { if (pend) return; pend = requestAnimationFrame(() => { pend = 0; dibujar(); }); }
function dibujar() {
  if (!S.tec) return;
  document.querySelectorAll('#nav [data-nav]').forEach(b => b.classList.toggle('on', b.dataset.nav === (['cliente', 'nuevoCliente', 'clientes'].includes(S.vista) ? 'clientes' : ['equipo', 'equipos', 'nuevoService', 'clave'].includes(S.vista) ? (S.vista === 'equipos' ? 'equipos' : 'clientes') : S.vista)));
  $('off').hidden = navigator.onLine;
  const V = { inicio: vInicio, clientes: vClientes, cliente: vCliente, nuevoCliente: vNuevoCliente, equipo: vEquipo, nuevoService: vNuevoService, clave: vClave, mant: vMant, cobros: vCobros, enviados: vEnviados, equipos: vEquipos, config: vConfig, info: vInfo };
  $('app').innerHTML = (S.msg ? '<div class="aviso">' + esc(S.msg) + '</div>' : '') + (V[S.vista] || vInicio)();
  if (S.vista === 'nuevoService') actualizarDetalle();
}
window.addEventListener('online', pintar); window.addEventListener('offline', pintar);

const _f = 0;
const filtroHTML = () => '<div class="filtro"><button data-acc="filtro" data-v="mine" class="' + (S.filtro === 'mine' ? 'sel' : '') + '">' + S.tec.nombre + '</button><button data-acc="filtro" data-v="todos" class="' + (S.filtro === 'todos' ? 'sel' : '') + '">Todos</button></div>';

function vInicio() {
  const hoy = hoyISO();
  const av = S.avisos.filter(a => activo(a) && miosONo(a)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const vencen = av.filter(a => a.fecha <= hoy), prox = av.filter(a => a.fecha > hoy).slice(0, 8);
  const movs = S.movs.filter(m => S.filtro === 'todos' || m.tecnico === S.tec.nombre);
  const fila = a => '<div class="fila"><div><b>' + esc(a.cliente) + '</b> · ' + esc((EQ[a.equipo] || EQ.otro).nombre) + '<br><small>' + ETIQ[a.tipo] + (a.fecha < hoy ? ' · atrasado desde ' + fechaCorta(a.fecha) : a.fecha > hoy ? ' · para el ' + fechaCorta(a.fecha) : ' · hoy') + (S.filtro === 'todos' ? ' · ' + esc(a.tecnico) : '') + '</small></div><div class="bts"><button class="prim" data-acc="enviarAviso" data-id="' + a.id + '">Enviar</button><button class="sec" data-acc="noMandar" data-id="' + a.id + '">No mandar</button></div></div>';
  const sig = vencen[0];
  return '<div class="top"><h1>Inicio</h1>' + filtroHTML() + '</div>' +
    '<div class="tarjetas"><div class="tj"><b>' + movs.length + '</b><span>Services del mes</span></div><div class="tj"><b>' + vencen.length + '</b><span>Para hoy</span></div><div class="tj"><b>' + S.clientes.length + '</b><span>Clientes</span></div><div class="tj"><b>' + S.equipos.length + '</b><span>Equipos</span></div></div>' +
    (sig ? '<div class="card tanda"><small>Siguiente aviso (quedan ' + vencen.length + ')</small><h2>' + esc(sig.cliente) + ' · ' + esc((EQ[sig.equipo] || EQ.otro).nombre) + '</h2><p>' + ETIQ[sig.tipo] + '</p><button class="prim grande" data-acc="enviarAviso" data-id="' + sig.id + '">Enviar por WhatsApp</button><button class="sec" data-acc="noMandar" data-id="' + sig.id + '">No mandar</button></div>' : '') +
    '<div class="card"><h2>Para hoy</h2>' + (vencen.length ? vencen.map(fila).join('') : '<p class="vacio">Nada para hoy.</p>') + '</div>' +
    (prox.length ? '<div class="card"><h2>Próximos</h2>' + prox.map(fila).join('') + '</div>' : '') + '<button class="sec grande" data-acc="irEnviados">Ver mensajes enviados</button><button class="sec grande" data-acc="irCobros">Ver cobros del mes</button>';
}

function vCobros() {
  const l = S.cobros.filter(x => S.filtro === 'todos' || x.tecnico === S.tec.nombre).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const tot = l.reduce((t, x) => t + (+x.monto || 0), 0), $$ = n => '$' + Math.round(n).toLocaleString('es-AR');
  return '<div class="top"><h1>Cobros del mes</h1>' + filtroHTML() + '</div><div class="card"><small>Total anotado este mes</small><div class="key" style="font-size:1.8rem;letter-spacing:0">' + $$(tot) + '</div><small>Es solo un recordatorio tuyo: el cliente no lo ve.</small></div><div class="card">' +
    (l.length ? l.map(x => '<div class="fila"><div><b>' + esc(x.cliente) + '</b> · ' + esc((EQ[x.equipo] || EQ.otro).nombre) + '<br><small>' + fechaCorta(x.fecha) + ' · ' + esc(x.tecnico) + (x.nota ? ' · ' + esc(x.nota) : '') + '</small></div><div class="bts"><b>' + $$(x.monto) + '</b><button class="sec chico" data-acc="borrarCobro" data-id="' + x.id + '">Borrar</button></div></div>').join('') : '<p class="vacio">Todavía no anotaste cobros este mes.</p>') + '</div>';
}

function vEnviados() {
  const l = S.hechos.filter(a => S.filtro === 'todos' || a.tecnico === S.tec.nombre).sort((a, b) => (b.enviadoTs || 0) - (a.enviadoTs || 0) || (b.enviado || '').localeCompare(a.enviado || '')).slice(0, 60);
  const hora = a => a.enviadoTs ? new Date(a.enviadoTs).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
  return '<div class="top"><h1>Mensajes</h1>' + filtroHTML() + '</div><small>"Enviado" quiere decir que tocaste Enviar y se abrió WhatsApp. Si no llegaste a mandarlo, tocá "Volver a pendiente".</small><div class="card">' +
    (l.length ? l.map(a => '<div class="fila"><div><b>' + esc(a.cliente) + '</b> · ' + esc((EQ[a.equipo] || EQ.otro).nombre) + '<br><small>' + ETIQ[a.tipo] + ' · ' + (a.estado === 'enviado' ? '✓ Enviado' : 'No mandado') + ' el ' + fechaCorta(a.enviado) + ' ' + hora(a) + (S.filtro === 'todos' ? ' · ' + esc(a.tecnico) : '') + '</small></div><div class="bts"><button class="sec" data-acc="volverPend" data-id="' + a.id + '">Volver a pendiente</button></div></div>').join('') : '<p class="vacio">Todavía no enviaste ningún mensaje.</p>') + '</div>';
}

function vClientes() {
  const q = S.q.toLowerCase();
  const claves = c => equiposDe(c.id).map(e => e.id).join(' ');
  const l = S.clientes.filter(c => !q || [c.nombre, c.telefono, c.direccion, claves(c)].join(' ').toLowerCase().includes(q)).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')).slice(0, 60);
  return '<div class="top"><h1>Clientes</h1></div><input id="buscar" placeholder="Buscar por nombre, teléfono, dirección o clave" value="' + esc(S.q) + '" autocomplete="off"><button class="prim grande" data-acc="irNuevoCliente">+ Nuevo cliente</button>' +
    '<div class="card">' + (l.length ? l.map(c => '<div class="fila clic" data-acc="abrirCliente" data-id="' + c.id + '"><div><b>' + esc(c.nombre) + '</b><br><small>' + equiposDe(c.id).map(e => esc((EQ[e.tipo] || EQ.otro).nombre)).join(', ') + (c.direccion ? ' · ' + esc(c.direccion) : '') + '</small></div><span>›</span></div>').join('') : '<p class="vacio">Sin resultados.</p>') + '</div>';
}

function equipoForm(pref = '', e = {}) {
  return '<label>Electrodoméstico *</label><div class="botones" id="eqbtns">' + EQUIPOS.map(x => '<button type="button" data-acc="pickEq" data-v="' + x.id + '" class="eqb ' + (e.tipo === x.id ? 'sel' : '') + '">' + x.nombre + '</button>').join('') + '</div>' +
    '<div class="dos"><div><label>Marca</label><input id="marca" value="' + esc(e.marca) + '"></div><div><label>Modelo</label><input id="modelo" value="' + esc(e.modelo) + '"></div></div><label>N° de serie</label><input id="serie" value="' + esc(e.serie) + '">';
}
function vNuevoCliente() {
  const c = S.p.cliente;
  return '<div class="top"><h1>' + (c ? 'Agregar equipo' : 'Nuevo cliente') + '</h1></div><div class="card">' +
    (c ? '<p><b>' + esc(c.nombre) + '</b></p>' : '<label>Nombre *</label><input id="nombre" autocomplete="off"><label>Teléfono *</label><input id="tel" type="tel" placeholder="Pegá el número como lo tengas" autocomplete="off"><label>Dirección</label><input id="dir" autocomplete="off">') +
    equipoForm() + '<p class="err" id="err"></p><button class="prim grande" data-acc="crearCliente">' + (c ? 'Crear equipo y clave' : 'Crear cliente y clave') + '</button><button class="sec" data-acc="atras">Cancelar</button></div>';
}

function vCliente() {
  const c = S.clientes.find(x => x.id === S.p.id); if (!c) return '<p class="vacio">Cliente no encontrado.</p>';
  const eqs = equiposDe(c.id);
  return '<div class="top"><h1>' + esc(c.nombre) + '</h1></div><div class="card"><label>Nombre</label><input id="c_nombre" value="' + esc(c.nombre) + '"><label>Teléfono</label><input id="c_tel" type="tel" value="' + esc(verTel(c.telefono)) + '"><label>Dirección</label><input id="c_dir" value="' + esc(c.direccion) + '"><p class="err" id="err"></p><button class="prim" data-acc="guardarCliente" data-id="' + c.id + '">Guardar datos</button></div>' +
    '<div class="card"><h2>Equipos</h2>' + (eqs.length ? eqs.map(e => '<div class="fila clic" data-acc="abrirEquipo" data-id="' + e.id + '"><div><b>' + esc((EQ[e.tipo] || EQ.otro).nombre) + ' ' + esc(e.marca) + '</b>' + (e.baja ? ' <span class="chip">Dado de baja</span>' : '') + '<br><small>Clave ' + fmtClave(e.id) + (e.ultimaFecha ? ' · último service ' + fechaCorta(e.ultimaFecha) + ' (' + esc(e.ultimoTecnico) + ')' : '') + '</small></div><span>›</span></div>').join('') : '<p class="vacio">Sin equipos.</p>') + '<button class="sec" data-acc="irAgregarEquipo" data-id="' + c.id + '">+ Agregar otro equipo</button></div><button class="sec chico" data-acc="borrarCliente" data-id="' + c.id + '">Borrar cliente</button>';
}

async function cargarSvcs(clave) {
  S.svcs = [];
  try { const s = await getDocs(collection(db, 'equipos', clave, 'services')); S.svcs = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.fecha.localeCompare(a.fecha)); } catch (e) { S.msg = 'No se pudo leer el historial: ' + e.code; }
  S.cobrosEq = {};
  try { const c = await getDocs(query(collection(db, 'cobros'), where('clave', '==', clave))); c.docs.forEach(d => S.cobrosEq[d.id] = d.data()); } catch (_) {}
  pintar();
}
function vEquipo() {
  const e = S.equipos.find(x => x.id === S.p.id); if (!e) return '<p class="vacio">Equipo no encontrado.</p>';
  const c = clienteDe(e), eq = EQ[e.tipo] || EQ.otro;
  const m = e.mantenimiento || { tipo: 'ninguno' };
  return '<div class="top"><h1>' + esc(eq.nombre) + ' ' + esc(e.marca) + '</h1><small>' + (c ? esc(c.nombre) : '') + '</small></div>' +
    '<div class="card clave" data-acc="menuClave" data-id="' + e.id + '"><small>Clave del equipo (tocá para reenviar o copiar)</small><div class="key">' + fmtClave(e.id) + '</div></div>' +
    (S.p.menu ? '<div class="card"><button class="prim" data-acc="enviarFicha" data-id="' + e.id + '">Reenviar por WhatsApp</button><button class="sec" data-acc="copiarClave" data-id="' + e.id + '">Copiar clave</button></div>' : '') +
    (e.baja ? '<div class="card baja"><b>Dado de baja por el cliente</b><p>Los avisos están frenados.</p><button class="sec" data-acc="reactivar" data-id="' + e.id + '">Reactivar equipo</button></div>' : '') +
    '<button class="prim grande" data-acc="nuevoService" data-id="' + e.id + '">+ Nuevo service</button>' +
    '<div class="card"><button class="sec" data-acc="enviarFicha" data-id="' + e.id + '">Enviar clave / ficha por WhatsApp</button></div>' +
    '<div class="card"><h2>Mantenimiento</h2><div class="botones">' + ['ninguno', 'seguimiento', 'mantenimiento'].map(t => '<button data-acc="setMant" data-id="' + e.id + '" data-v="' + t + '" class="' + (m.tipo === t ? 'sel' : '') + '">' + t[0].toUpperCase() + t.slice(1) + '</button>').join('') + '</div>' + (m.fecha ? '<small>Próximo aviso: ' + fechaCorta(m.fecha) + '</small>' : '') + '</div>' +
    '<div class="card"><h2>Historial</h2>' + (S.svcs.length ? S.svcs.map(s => '<div class="svc"><b>' + fechaCorta(s.fecha) + '</b> · ' + esc(s.tecnico) + '<br>' + (s.items && s.items.length ? '<small>Ítems: ' + esc(s.items.join(', ')) + '</small><br>' : '') + esc(s.detalle || '') + (s.motivo ? '<br><small>Motivo: ' + esc(s.motivo) + '</small>' : '') + (S.cobrosEq[s.id] ? '<br><small class="priv">Cobrado $' + S.cobrosEq[s.id].monto + (S.cobrosEq[s.id].nota ? ' · ' + esc(S.cobrosEq[s.id].nota) : '') + ' (solo técnicos)</small>' : '<br><button class="sec chico" data-acc="anotarCobro" data-id="' + s.id + '" data-clave="' + e.id + '">Anotar cobro</button>') + '<br><small>Garantía ' + s.garantiaDias + ' días (vence ' + fechaCorta(addDias(s.fecha, +s.garantiaDias || 0)) + ')</small></div>').join('') : '<p class="vacio">Todavía no hay services.</p>') + '</div>' +
    (!e.baja ? '<button class="sec chico" data-acc="baja" data-id="' + e.id + '">Dar de baja el equipo</button> ' : '') + '<button class="sec chico" data-acc="borrarEquipo" data-id="' + e.id + '">Borrar equipo</button>';
}

function vNuevoService() {
  const e = S.equipos.find(x => x.id === S.p.id); if (!e) return '';
  const f = S.p.form, c = S.cfg;
  return '<div class="top"><h1>Nuevo service</h1><small>Clave ' + fmtClave(e.id) + '</small></div><div class="card">' +
    '<div class="fila"><div><b>' + esc((EQ[e.tipo] || EQ.otro).nombre) + ' ' + esc(e.marca) + ' ' + esc(e.modelo) + '</b><br><small>Este service se carga en este equipo. Si es otro equipo, creá uno nuevo desde el cliente.</small></div></div>' +
    '<label>Qué se hizo</label><div class="botones">' + (S.items[f.equipo] || []).concat(['Otro']).map(i => '<button type="button" data-acc="svcItem" data-v="' + esc(i) + '" class="itb ' + (f.items.includes(i) ? 'sel' : '') + '">' + (f.items.includes(i) ? '✓ ' : '') + esc(i) + '</button>').join('') + '</div>' +
    '<label>Detalle</label><textarea id="detalle" rows="3">' + esc(f.detalle) + '</textarea>' +
    '<label>Motivo / falla</label><input id="motivo" value="' + esc(f.motivo) + '" placeholder="Ej: el horno no prendía">' +
    '<div class="dos"><div><label>Garantía (días)</label><input id="gar" type="number" value="' + f.garantia + '"></div><div><label>Fecha</label><input id="fecha" type="date" value="' + f.fecha + '"></div></div>' +
    '<label>Cobrado (solo para vos, el cliente no lo ve) ' + ayuda('Anotá lo que cobraste como recordatorio. No aparece en la ficha del cliente. Después lo ves todo junto en Mantenimiento > Cobros, desde Inicio.') + '</label><div class="dos"><input id="cobro" type="number" inputmode="decimal" placeholder="$ monto" value="' + esc(f.cobro) + '"><input id="cobroNota" placeholder="Nota (ej: efectivo, debe)" value="' + esc(f.cobroNota) + '"></div>' +
    '<label>Mantenimiento ' + ayuda('Ninguno: no se avisa. Seguimiento: un aviso corto para preguntar cómo anda. Mantenimiento: aviso para volver a hacer el service (aires, lavarropas con abono, etc.).') + '</label><div class="botones">' + ['ninguno', 'seguimiento', 'mantenimiento'].map(t => '<button type="button" data-acc="svcMant" data-v="' + t + '" class="' + (f.mant === t ? 'sel' : '') + '">' + t[0].toUpperCase() + t.slice(1) + '</button>').join('') + '</div>' +
    (f.mant === 'mantenimiento' ? '<label>Avisar dentro de</label><div class="botones">' + [3, 6, 12].map(m => '<button type="button" data-acc="svcMeses" data-v="' + m + '" class="' + (f.meses === m ? 'sel' : '') + '">' + m + ' meses</button>').join('') + '</div>' : '') +
    '<label>Reseña ' + ayuda('Sí: a los ' + c.resenaDias + ' días te aparece el aviso para pedir la reseña de Google. No: no se crea ningún aviso.') + '</label><div class="botones"><button type="button" data-acc="svcResena" data-v="1" class="' + (f.resena ? 'sel' : '') + '">Sí</button><button type="button" data-acc="svcResena" data-v="0" class="' + (!f.resena ? 'sel' : '') + '">No</button></div>' +
    '<label>Realizado por</label><div class="botones">' + Object.values(TECNICOS).map(t => '<button type="button" data-acc="svcTec" data-v="' + t.nombre + '" class="' + (f.tecnico === t.nombre ? 'sel' : '') + '">' + t.nombre + '</button>').join('') + '</div>' +
    '<p class="err" id="err"></p><button class="prim grande" data-acc="guardarService">Guardar service</button><button class="sec" data-acc="atras">Cancelar</button></div>';
}
function actualizarDetalle() {
  const f = S.p.form; if (!f || f.detalleEditado) return;
  const e = S.equipos.find(x => x.id === S.p.id), eq = EQ[(e && e.tipo) || f.equipo] || EQ.otro;
  const d = f.items.filter(i => i !== 'Otro').map(i => FRASES[((e && e.tipo) || f.equipo) + ':' + i.toLowerCase()] || FRASES[i.toLowerCase()] || 'el servicio de ' + i.toLowerCase());
  const t = d.length ? 'En ' + demostrativo(eq.art) + ' se realizó ' + lista(d) + '.' : '';
  f.detalle = t; const el = $('detalle'); if (el) el.value = t;
}

function vClave() {
  const e = S.equipos.find(x => x.id === S.p.id); if (!e) return '';
  return '<div class="top"><h1>' + (S.p.listo || 'Equipo creado') + '</h1></div><div class="card clave"><small>Escribí esta clave a mano en el sticker</small><div class="key grande">' + fmtClave(e.id) + '</div></div>' +
    (S.cfg.fichaMsg ? '<button class="prim grande" data-acc="enviarFicha" data-id="' + e.id + '">Enviar ficha por WhatsApp</button>' : '') +
    (S.p.listo ? '' : '<button class="sec" data-acc="nuevoService" data-id="' + e.id + '">Cargar el primer service</button>') + '<button class="sec" data-acc="abrirEquipo" data-id="' + e.id + '">Ver el equipo</button>';
}

function vMant() {
  const av = S.avisos.filter(a => (a.tipo === 'mant' || a.tipo === 'seg') && activo(a) && miosONo(a)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  return '<div class="top"><h1>Mantenimiento</h1>' + filtroHTML() + '</div><div class="card">' + (av.length ? av.map(a => '<div class="fila"><div><b>' + esc(a.cliente) + '</b> · ' + esc((EQ[a.equipo] || EQ.otro).nombre) + '<br><small>' + ETIQ[a.tipo] + ' · ' + fechaCorta(a.fecha) + '</small></div><div class="bts"><button class="prim" data-acc="enviarAviso" data-id="' + a.id + '">Avisar</button><button class="sec" data-acc="noMandar" data-id="' + a.id + '">No mandar</button></div></div>').join('') : '<p class="vacio">No hay avisos de mantenimiento ni seguimiento.</p>') + '</div>';
}

function vEquipos() {
  const q = S.q.toLowerCase();
  const l = S.equipos.filter(e => { const c = clienteDe(e) || {}; return (S.filtro === 'todos' || e.tecnicoAlta === S.tec.nombre) && (!q || [e.id, c.nombre, c.telefono, c.direccion, e.marca, e.modelo, e.tipo].join(' ').toLowerCase().includes(q)); }).sort((a, b) => (b.creado || '').localeCompare(a.creado || '')).slice(0, 80);
  return '<div class="top"><h1>Equipos</h1>' + filtroHTML() + '</div><input id="buscar" placeholder="Buscar por clave, cliente, marca…" value="' + esc(S.q) + '" autocomplete="off"><button class="sec" data-acc="excel">Pasar a Excel</button>' +
    '<div class="card">' + (l.length ? l.map(e => { const c = clienteDe(e) || {}; return '<div class="fila clic" data-acc="abrirEquipo" data-id="' + e.id + '"><div><b>' + fmtClave(e.id) + '</b> · ' + esc((EQ[e.tipo] || EQ.otro).nombre) + ' ' + esc(e.marca) + '<br><small>' + esc(c.nombre) + (e.baja ? ' · dado de baja' : '') + '</small></div><span>›</span></div>'; }).join('') : '<p class="vacio">Sin resultados.</p>') + '</div>';
}

function vConfig() {
  const c = S.cfg, t = c.textos;
  const sw = (k, tit, ay) => '<div class="fila"><div>' + tit + ' ' + ayuda(ay) + '</div><div class="botones"><button data-acc="sw" data-k="' + k + '" data-v="1" class="' + (c[k] ? 'sel' : '') + '">Sí</button><button data-acc="sw" data-k="' + k + '" data-v="0" class="' + (!c[k] ? 'sel' : '') + '">No</button></div></div>';
  const num = (k, tit, ay) => '<label>' + tit + ' ' + ayuda(ay) + '</label><input type="number" data-cfg="' + k + '" value="' + c[k] + '">';
  const op = (k, tit, ay, vals) => '<label>' + tit + ' ' + ayuda(ay) + '</label><div class="botones">' + vals.map(([v, n]) => '<button data-acc="opt" data-k="' + k + '" data-v="' + v + '" class="' + (c[k] === v ? 'sel' : '') + '">' + n + '</button>').join('') + '</div>';
  const eqSel = S.p.cfgEq || 'lavarropas';
  return '<div class="top"><h1>Configuración</h1><small>' + S.tec.nombre + ' (cada técnico tiene la suya)</small></div>' +
    '<div class="card"><h2>Avisos</h2>' +
    sw('fichaMsg', 'Mensaje con la ficha (día 0)', 'Después de cargar un service te muestra el botón para mandar la ficha y la clave por WhatsApp.') +
    sw('seguimiento5', 'Seguimiento a los ' + c.d5Dias + ' días', 'Mensaje para preguntar cómo le fue con la reparación y recordarle los otros equipos que arreglamos.') + num('d5Dias', 'Días para el seguimiento', 'Cuántos días después del service aparece el aviso.') +
    sw('resena', 'Reseña de Google', 'Pedido de reseña por WhatsApp. En cada service podés poner No.') + num('resenaDias', 'Días para la reseña', 'Cuántos días después del service aparece el aviso.') +
    sw('mantAvisos', 'Avisos de mantenimiento', 'Si lo apagás, no te aparecen los avisos de mantenimiento ni de seguimiento largo.') +
    sw('contactoLink', 'Link para guardar mi contacto', 'Agrega al mensaje de la ficha un link para que el cliente te agende.') + '</div>' +
    '<div class="card"><h2>Valores por defecto</h2>' + num('garantia', 'Garantía (días)', 'Se completa sola en cada service; se puede cambiar en cada uno.') + op('mantDefault', 'Mantenimiento', 'Qué viene marcado al cargar un service.', [['ninguno', 'Ninguno'], ['seguimiento', 'Seguimiento'], ['mantenimiento', 'Mantenimiento']]) + '</div>' +
    '<div class="card"><h2>Textos de los mensajes</h2><small>Podés usar {nombre} {equipo} {tecnico} {clave} {link}</small>' + [['ficha', 'Ficha (día 0)'], ['d5', 'Seguimiento'], ['resena', 'Reseña'], ['mant', 'Mantenimiento'], ['seguimiento', 'Seguimiento largo']].map(([k, n]) => '<label>' + n + '</label><textarea rows="4" data-txt="' + k + '">' + esc(t[k]) + '</textarea>').join('') + '<button class="prim" data-acc="guardarTextos">Guardar textos</button> <button class="sec" data-acc="textosOrig">Volver a los originales</button></div>' +
    '<div class="card"><h2>Ítems de cada equipo (comunes para los dos)</h2><div class="botones">' + EQUIPOS.filter(x => x.id !== 'otro').map(x => '<button data-acc="cfgEq" data-v="' + x.id + '" class="eqb ' + (eqSel === x.id ? 'sel' : '') + '">' + x.nombre + '</button>').join('') + '</div>' +
    (S.items[eqSel] || []).map((i, n) => '<div class="fila"><div>' + esc(i) + '</div><div class="bts"><button class="sec" data-acc="itemUp" data-n="' + n + '">↑</button><button class="sec" data-acc="itemDel" data-n="' + n + '">Quitar</button></div></div>').join('') + '<div class="dos"><input id="nuevoItem" placeholder="Nuevo ítem"><button class="prim" data-acc="itemAdd">Agregar</button></div></div>' +
    '<div class="card"><h2>Apariencia</h2>' + op('fondo', 'Fondo', 'Claro, oscuro o automático según el celular.', [['claro', 'Claro'], ['oscuro', 'Oscuro'], ['auto', 'Automático']]) + op('letra', 'Tamaño de letra', 'Cambia el tamaño de todo el panel.', [['chica', 'Chica'], ['normal', 'Normal'], ['grande', 'Grande'], ['extra', 'Extra grande']]) +
    '<label>Color de los botones</label><div class="botones">' + [['#0b57d0', 'Azul'], ['#0f766e', 'Verde azulado'], ['#b45309', 'Naranja'], ['#9d174d', 'Fucsia'], ['#4338ca', 'Violeta']].map(([v, n]) => '<button data-acc="opt" data-k="color" data-v="' + v + '" class="' + (c.color === v ? 'sel' : '') + '">' + n + '</button>').join('') + '</div><button class="sec" data-acc="apOrig">Volver al original</button></div>' +
    '<div class="card"><h2>Ayuda</h2><button class="sec" data-acc="irInfo">Info: cómo funciona cada cosa</button><div class="fila"><div>Stickers (hoja A3)</div><small>Pendiente: falta cargar el archivo final.</small></div></div>' +
    (S.user.email.toLowerCase() === 'mauricio.d.bustos@gmail.com' ? '<div class="card"><h2>Técnicos habilitados (solo dueño)</h2><small>Bruno y Mauricio ya están. Para sumar a alguien más hay que agregar su mail acá y sumarlo en la app.</small><div class="dos"><input id="nuevoTec" type="email" placeholder="mail@gmail.com"><button class="sec" data-acc="addTec">Habilitar</button></div></div>' : '') +
    '<button class="sec" data-acc="salir">Cerrar sesión</button>';
}

function vInfo() {
  const it = [['Clave del equipo', 'Es del equipo, no de cada service. Se crea una sola vez, cuando das de alta el equipo. Empieza con la letra del técnico (M o B). Escribila a mano en el sticker.'], ['Enviar la ficha por WhatsApp', 'Abre WhatsApp con el mensaje armado y el link con la clave. Vos solo tocás enviar. Está al crear el equipo, arriba en cada equipo y tocando la clave.'], ['Para hoy', 'En Inicio aparecen los avisos de hoy y los atrasados. Tocás Enviar, se abre WhatsApp, enviás y pasa al siguiente. "No mandar" lo descarta.'], ['Seguimiento y reseña', 'Se crean solos al guardar un service (a los días que configures). En cada service podés poner reseña Sí o No.'], ['Mantenimiento', 'Ninguno, seguimiento o mantenimiento. Arranca en Ninguno. Podés cambiarlo al cargar el service o después, desde el equipo.'], ['Garantía', 'Por defecto 90 días. En cada service podés cambiarla. La ficha del cliente calcula sola el vencimiento.'], ['Sin internet', 'Todo lo que cargues se guarda en el celu y se sube solo cuando vuelve la señal. Si ves el cartel de sin conexión, seguí trabajando normal.'], ['Dos técnicos', 'Cada service dice quién lo hizo. Si lo hicieron los dos, se ponen de acuerdo y lo anota uno solo.'], ['Dado de baja', 'Si el cliente saca un equipo de Mis equipos porque ya no lo tiene, acá figura como dado de baja y se frenan los avisos. Se puede reactivar.'], ['Pasar a Excel', 'En Equipos, baja un archivo con la lista que estés viendo.']];
  return '<div class="top"><h1>Info</h1></div>' + it.map(([t, d]) => '<div class="card"><h2>' + t + '</h2><p>' + d + '</p></div>').join('') + '<button class="sec" data-acc="atras">Volver</button>';
}

// ---------- acciones ----------
function abrirWA(tel, texto) { window.open(waLink(tel, texto), '_blank'); }
function marcarAviso(id, estado) { setDoc(doc(db, 'avisos', id), { estado, enviado: hoyISO(), enviadoTs: Date.now() }, { merge: true }); }
const lee = id => { const el = $(id); return el ? el.value.trim() : ''; };
let pickEq = '';

const ACC = {
  filtro: el => { S.filtro = el.dataset.v; pintar(); },
  enviarAviso: el => { const a = S.avisos.find(x => x.id === el.dataset.id); if (!a) return; abrirWA(a.telefono, textoAviso(a)); marcarAviso(a.id, 'enviado'); },
  volverPend: el => setDoc(doc(db, 'avisos', el.dataset.id), { estado: 'pendiente' }, { merge: true }),
  irEnviados: () => ir('enviados'),
  irCobros: () => ir('cobros'),
  anotarCobro: el => {
    const v = prompt('¿Cuánto se cobró? (solo vos lo ves)'); if (v == null) return; const m = +String(v).replace(/[^\d.,]/g, '').replace(',', '.'); if (!(m > 0)) return;
    const e = S.equipos.find(x => x.id === el.dataset.clave), c = e && clienteDe(e), sv = S.svcs.find(x => x.id === el.dataset.id); if (!sv) return;
    const d = { fecha: sv.fecha, tecnico: sv.tecnico, clave: el.dataset.clave, cliente: c ? c.nombre : '', equipo: sv.tipo, monto: m, nota: '' };
    S.cobrosEq[el.dataset.id] = d; pintar();
    setDoc(doc(db, 'cobros', el.dataset.id), d).catch(() => { delete S.cobrosEq[el.dataset.id]; S.msg = 'No se pudo anotar el cobro.'; pintar(); });
  },
  borrarCobro: el => { if (confirm('¿Borrar este cobro?')) deleteDoc(doc(db, 'cobros', el.dataset.id)); },
  borrarEquipo: async el => {
    const e = S.equipos.find(x => x.id === el.dataset.id); if (!e) return;
    if (!confirm('¿Borrar el equipo ' + fmtClave(e.id) + ' con todo su historial? No se puede deshacer.')) return;
    try { await borrarEquipoDatos(e.id); S.equipos = S.equipos.filter(x => x.id !== e.id); ir('clientes'); S.msg = 'Equipo borrado.'; pintar(); } catch (er) { S.msg = 'No se pudo borrar: ' + (er.code || er.message); pintar(); }
  },
  borrarCliente: async el => {
    const c = S.clientes.find(x => x.id === el.dataset.id); if (!c) return;
    const eqs = equiposDe(c.id);
    if (!confirm('¿Borrar a ' + c.nombre + ' con ' + eqs.length + ' equipo(s) y todo su historial? No se puede deshacer.')) return;
    try { for (const e of eqs) await borrarEquipoDatos(e.id); const b = writeBatch(db); b.delete(doc(db, 'clientes', c.id)); await b.commit(); S.clientes = S.clientes.filter(x => x.id !== c.id); S.equipos = S.equipos.filter(x => x.clienteId !== c.id); ir('clientes'); S.msg = 'Cliente borrado.'; pintar(); } catch (er) { S.msg = 'No se pudo borrar: ' + (er.code || er.message); pintar(); }
  },
  noMandar: el => marcarAviso(el.dataset.id, 'descartado'),
  irNuevoCliente: () => { pickEq = ''; ir('nuevoCliente'); },
  abrirCliente: el => ir('cliente', { id: el.dataset.id }),
  irAgregarEquipo: el => { pickEq = ''; ir('nuevoCliente', { cliente: S.clientes.find(c => c.id === el.dataset.id) }); },
  atras: () => history.back(),
  pickEq: el => { pickEq = el.dataset.v; document.querySelectorAll('#app .eqb').forEach(b => b.classList.toggle('sel', b.dataset.v === pickEq)); },
  crearCliente: () => {
    const c0 = S.p.cliente; let nombre, telefono, dir;
    if (!c0) { nombre = lee('nombre'); telefono = limpiarTel(lee('tel')); dir = lee('dir'); }
    const err = m => { $('err').textContent = m; };
    if (!c0 && !nombre) return err('Falta el nombre.');
    if (!c0 && !lee('tel')) return err('Falta el teléfono.');
    if (!c0 && !telefono) return err('El teléfono no parece válido. Revisalo.');
    if (!pickEq) return err('Elegí el electrodoméstico.');
    let cid = c0 && c0.id;
    if (!c0) {
      const dup = S.clientes.find(c => c.telefono === telefono);
      if (dup && confirm('Ya existe ' + dup.nombre + ' con ese teléfono. ¿Agregar el equipo a ese cliente?')) { cid = dup.id; nombre = dup.nombre; }
    }
    const b = writeBatch(db);
    if (!cid) { const r = doc(collection(db, 'clientes')); cid = r.id; b.set(r, { nombre, telefono, direccion: dir, creado: hoyISO() }); }
    const clave = claveNueva();
    b.set(doc(db, 'equipos', clave), { clienteId: cid, clienteNombre: nombre || (c0 && c0.nombre) || '', tipo: pickEq, marca: lee('marca'), modelo: lee('modelo'), serie: lee('serie'), creado: hoyISO(), tecnicoAlta: S.tec.nombre, baja: false, mantenimiento: { tipo: 'ninguno' } });
    b.commit().catch(e => { S.msg = 'No se pudo guardar: ' + e.code; pintar(); });
    S.equipos.push({ id: clave, clienteId: cid, clienteNombre: nombre || (c0 && c0.nombre) || '', tipo: pickEq, marca: lee('marca'), modelo: lee('modelo'), tecnicoAlta: S.tec.nombre, mantenimiento: { tipo: 'ninguno' } });
    ir('clave', { id: clave });
  },
  guardarCliente: el => {
    const tel = limpiarTel(lee('c_tel')); if (!lee('c_nombre')) return $('err').textContent = 'Falta el nombre.'; if (!tel) return $('err').textContent = 'El teléfono no parece válido.';
    const id = el.dataset.id, b = writeBatch(db);
    b.set(doc(db, 'clientes', id), { nombre: lee('c_nombre'), telefono: tel, direccion: lee('c_dir') }, { merge: true });
    equiposDe(id).forEach(e => b.set(doc(db, 'equipos', e.id), { clienteNombre: lee('c_nombre') }, { merge: true }));
    b.commit().catch(e => { S.msg = 'No se pudo guardar: ' + e.code; pintar(); });
    S.msg = 'Datos guardados.'; pintar();
  },
  abrirEquipo: el => { ir('equipo', { id: el.dataset.id }); cargarSvcs(el.dataset.id); },
  menuClave: () => { S.p.menu = !S.p.menu; pintar(); },
  copiarClave: el => { navigator.clipboard && navigator.clipboard.writeText(fmtClave(el.dataset.id)); S.msg = 'Clave copiada.'; pintar(); },
  enviarFicha: el => {
    const e = S.equipos.find(x => x.id === el.dataset.id), c = clienteDe(e); if (!c) return;
    const a = { cliente: c.nombre, equipo: e.tipo, clave: e.id, tecnico: S.tec.nombre };
    abrirWA(c.telefono, relleno(S.cfg.textos.ficha, vars(a)));
  },
  setMant: el => {
    const e = S.equipos.find(x => x.id === el.dataset.id), t = el.dataset.v;
    const m = t === 'ninguno' ? { tipo: 'ninguno' } : { tipo: t, fecha: t === 'seguimiento' ? addDias(hoyISO(), 30) : addMeses(hoyISO(), 6) };
    e.mantenimiento = m; setDoc(doc(db, 'equipos', e.id), { mantenimiento: m }, { merge: true });
    if (t !== 'ninguno') { const c = clienteDe(e); if (c) setDoc(doc(db, 'avisos', 'm_' + e.id), { tipo: t === 'seguimiento' ? 'seg' : 'mant', fecha: m.fecha, estado: 'pendiente', tecnico: S.tec.nombre, clave: e.id, equipo: e.tipo, cliente: c.nombre, telefono: c.telefono }, { merge: true }); }
    else setDoc(doc(db, 'avisos', 'm_' + e.id), { estado: 'descartado' }, { merge: true });
    pintar();
  },
  baja: el => { if (!confirm('¿Dar de baja este equipo? Se frenan los avisos.')) return; const e = S.equipos.find(x => x.id === el.dataset.id); e.baja = true; setDoc(doc(db, 'equipos', e.id), { baja: true, bajaFecha: hoyISO() }, { merge: true }); S.avisos.filter(a => a.clave === e.id).forEach(a => marcarAviso(a.id, 'descartado')); pintar(); },
  reactivar: el => { const e = S.equipos.find(x => x.id === el.dataset.id); e.baja = false; setDoc(doc(db, 'equipos', e.id), { baja: false }, { merge: true }); pintar(); },
  nuevoService: el => {
    const e = S.equipos.find(x => x.id === el.dataset.id);
    ir('nuevoService', { id: e.id, form: { equipo: e.tipo, items: [], detalle: '', detalleEditado: false, motivo: '', garantia: S.cfg.garantia, fecha: hoyISO(), mant: S.cfg.mantDefault, meses: 6, resena: S.cfg.resena, tecnico: S.tec.nombre, cobro: '', cobroNota: '' } });
  },
  svcEq: el => { guardarForm(); S.p.form.equipo = el.dataset.v; S.p.form.items = []; S.p.form.detalleEditado = false; pintar(); },
  svcItem: el => { guardarForm(); const f = S.p.form, i = el.dataset.v; f.items = f.items.includes(i) ? f.items.filter(x => x !== i) : f.items.concat(i); pintar(); },
  svcMant: el => { guardarForm(); S.p.form.mant = el.dataset.v; pintar(); },
  svcMeses: el => { guardarForm(); S.p.form.meses = +el.dataset.v; pintar(); },
  svcResena: el => { guardarForm(); S.p.form.resena = el.dataset.v === '1'; pintar(); },
  svcTec: el => { guardarForm(); S.p.form.tecnico = el.dataset.v; pintar(); },
  guardarService: async () => {
    try {
    guardarForm(); const f = S.p.form, e = S.equipos.find(x => x.id === S.p.id), c = clienteDe(e);
    if (!f.fecha) return $('err').textContent = 'Indicá la fecha.';
    if (!f.equipo) return $('err').textContent = 'Elegí el equipo.';
    const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3), b = writeBatch(db), tec = f.tecnico;
    const svc = { fecha: f.fecha, tecnico: tec, tipo: f.equipo, items: f.items, detalle: f.detalle, motivo: f.motivo, garantiaDias: +f.garantia || 0, resena: f.resena, mantenimiento: f.mant };
    b.set(doc(db, 'equipos', e.id, 'services', id), svc);
    b.set(doc(db, 'movimientos', id), { fecha: f.fecha, tecnico: tec, clave: e.id, equipo: f.equipo, items: f.items });
    const upd = { ultimaFecha: f.fecha, ultimoTecnico: tec, garantiaHasta: addDias(f.fecha, +f.garantia || 0) };
    const base = { estado: 'pendiente', tecnico: tec, clave: e.id, equipo: f.equipo, cliente: c ? c.nombre : '', telefono: c ? c.telefono : '', serviceId: id };
    if (S.cfg.seguimiento5) b.set(doc(db, 'avisos', id + '_d5'), { ...base, tipo: 'd5', fecha: addDias(f.fecha, +S.cfg.d5Dias || 5) });
    if (f.resena && S.cfg.resena) b.set(doc(db, 'avisos', id + '_r'), { ...base, tipo: 'resena', fecha: addDias(f.fecha, +S.cfg.resenaDias || 10) });
    if (f.mant !== 'ninguno') { const fm = f.mant === 'seguimiento' ? addDias(f.fecha, 30) : addMeses(f.fecha, f.meses); upd.mantenimiento = { tipo: f.mant, fecha: fm }; b.set(doc(db, 'avisos', 'm_' + e.id), { ...base, tipo: f.mant === 'seguimiento' ? 'seg' : 'mant', fecha: fm }); }
    else upd.mantenimiento = { tipo: 'ninguno' };
    b.set(doc(db, 'equipos', e.id), upd, { merge: true });
    if (+f.cobro > 0) setDoc(doc(db, 'cobros', id), { fecha: f.fecha, tecnico: tec, clave: e.id, cliente: c ? c.nombre : '', equipo: f.equipo, monto: +f.cobro, nota: f.cobroNota || '' }).catch(() => { S.msg = 'El service se guardó, pero el cobro no (falta habilitar los cobros en Firebase).'; pintar(); });
    const r = await Promise.race([b.commit().then(() => 'ok'), new Promise(res => setTimeout(() => res('lento'), 5000))]);
    Object.assign(e, upd);
    ir('equipo', { id: e.id }); cargarSvcs(e.id);
    S.msg = r === 'ok' ? 'Service guardado.' : 'Sin conexión: el service quedó guardado en el celu y se sube solo.'; pintar();
    } catch (er) { const x = $('err'); if (x) x.textContent = 'No se pudo guardar: ' + (er.code || er.message); console.error(er); }
  },
  excel: () => {
    const q = S.q.toLowerCase(); const filas = [['Clave', 'Cliente', 'Teléfono', 'Dirección', 'Equipo', 'Marca', 'Modelo', 'Último service', 'Técnico']];
    S.equipos.filter(e => { const c = clienteDe(e) || {}; return (S.filtro === 'todos' || e.tecnicoAlta === S.tec.nombre) && (!q || [e.id, c.nombre, c.telefono, e.marca].join(' ').toLowerCase().includes(q)); }).forEach(e => { const c = clienteDe(e) || {}; filas.push([fmtClave(e.id), c.nombre, verTel(c.telefono), c.direccion, (EQ[e.tipo] || EQ.otro).nombre, e.marca, e.modelo, fechaCorta(e.ultimaFecha), e.ultimoTecnico]); });
    const csv = '﻿' + filas.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'equipos-' + hoyISO() + '.csv'; a.click();
  },
  sw: el => { guardarCfg({ [el.dataset.k]: el.dataset.v === '1' }); pintar(); },
  opt: el => { guardarCfg({ [el.dataset.k]: el.dataset.v }); pintar(); },
  guardarTextos: () => { const t = {}; document.querySelectorAll('[data-txt]').forEach(x => t[x.dataset.txt] = x.value); guardarCfg({ textos: t }); S.msg = 'Textos guardados.'; pintar(); },
  textosOrig: () => { if (confirm('¿Volver a los textos originales?')) { guardarCfg({ textos: DEFAULT_CFG.textos }); pintar(); } },
  cfgEq: el => { S.p.cfgEq = el.dataset.v; pintar(); },
  itemAdd: () => { const v = lee('nuevoItem'); if (!v) return; const k = S.p.cfgEq || 'lavarropas'; S.items = { ...S.items, [k]: (S.items[k] || []).concat(v) }; setDoc(doc(db, 'config', 'items'), { [k]: S.items[k] }, { merge: true }); pintar(); },
  itemDel: el => { const k = S.p.cfgEq || 'lavarropas'; S.items = { ...S.items, [k]: S.items[k].filter((_, i) => i !== +el.dataset.n) }; setDoc(doc(db, 'config', 'items'), { [k]: S.items[k] }, { merge: true }); pintar(); },
  itemUp: el => { const k = S.p.cfgEq || 'lavarropas', n = +el.dataset.n; if (!n) return; const a = S.items[k].slice(); [a[n - 1], a[n]] = [a[n], a[n - 1]]; S.items = { ...S.items, [k]: a }; setDoc(doc(db, 'config', 'items'), { [k]: a }, { merge: true }); pintar(); },
  apOrig: () => { guardarCfg({ fondo: 'auto', color: '#0b57d0', letra: 'normal' }); pintar(); },
  irInfo: () => ir('info'),
  addTec: () => { const m = lee('nuevoTec').toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(m)) return; setDoc(doc(db, 'tecnicos', m), { alta: hoyISO() }); S.msg = 'Mail habilitado en la base: ' + m; pintar(); },
  salir: () => signOut(auth)
};
async function borrarEquipoDatos(clave) {
  const sv = await getDocs(collection(db, 'equipos', clave, 'services'));
  const av = await getDocs(query(collection(db, 'avisos'), where('clave', '==', clave)));
  const refs = [...sv.docs.map(d => d.ref), ...av.docs.map(d => d.ref), ...sv.docs.map(d => doc(db, 'movimientos', d.id)), doc(db, 'avisos', 'm_' + clave), doc(db, 'equipos', clave)];
  for (let i = 0; i < refs.length; i += 400) { const b = writeBatch(db); refs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit(); }
}
function guardarForm() { const f = S.p.form; if (!f) return; const d = $('detalle'); if (d && d.value !== f.detalle) { f.detalle = d.value; f.detalleEditado = true; } f.motivo = lee('motivo'); const g = $('gar'); if (g) f.garantia = g.value; const fe = $('fecha'); if (fe) f.fecha = fe.value; const co = $('cobro'); if (co) f.cobro = co.value; const cn = $('cobroNota'); if (cn) f.cobroNota = cn.value.trim(); }

document.addEventListener('click', ev => {
  const nav = ev.target.closest('[data-nav]'); if (nav && S.tec) { S.q = ''; const v = nav.dataset.nav; if (v === 'nuevo') { pickEq = ''; ir('nuevoCliente'); } else ir(v); return; }
  const el = ev.target.closest('[data-acc]'); if (!el || el.closest('details')) return;
  const f = ACC[el.dataset.acc]; if (f) f(el);
});
document.addEventListener('input', ev => {
  if (ev.target.id === 'buscar') { S.q = ev.target.value; const pos = ev.target.selectionStart; dibujar(); const b = $('buscar'); if (b) { b.focus(); b.setSelectionRange(pos, pos); } }
});
document.addEventListener('change', ev => { const k = ev.target.dataset && ev.target.dataset.cfg; if (k) guardarCfg({ [k]: +ev.target.value || 0 }); });
if ('serviceWorker' in navigator) { /* sin service worker por ahora: Firestore ya guarda los datos en el celu */ }
