import qrcode from './qrcode.mjs';
import { firebaseConfig, SDK, TECNICOS, POR_NOMBRE, EQ, GARANTIA_TEXTO, NEGOCIO, FICHA_URL, esc, normClave, fmtClave, addDias, fechaCorta, waLink, BASE } from './config.js';
const { initializeApp } = await import(SDK + 'firebase-app.js');
const { getFirestore, doc, getDoc, getDocs, collection } = await import(SDK + 'firebase-firestore.js');
const db = getFirestore(initializeApp(firebaseConfig));
const $ = id => document.getElementById(id);
const hoy = () => new Date().toISOString().slice(0, 10);
const guardadas = () => { try { return JSON.parse(localStorage.getItem('claves') || '[]'); } catch (_) { return []; } };
const guardar = l => { try { localStorage.setItem('claves', JSON.stringify(l)); } catch (_) {} };
const tecPorNombre = n => POR_NOMBRE[n] || POR_NOMBRE.Mauricio;
let actual = null, todos = false;

async function cargar(clave) {
  const k = normClave(clave);
  if (k.length !== 6) return null;
  let e;
  try { e = await getDoc(doc(db, 'equipos', k)); } catch (_) { throw new Error('No se pudo conectar. Revisá tu internet.'); }
  if (!e.exists()) return null;
  const s = await getDocs(collection(db, 'equipos', k, 'services'));
  return { clave: k, e: e.data(), svcs: s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.fecha.localeCompare(a.fecha)) };
}

function vLogin(msg) {
  $('app').innerHTML = '<div class="card"><h1>Ficha de tu equipo</h1><p>Mirá el historial de service y la garantía. Ingresá la clave que escribimos a mano en el sticker.</p><label>Clave</label><input id="cl" placeholder="Ej: M7K-4X9" autocomplete="off" autocapitalize="characters"><button id="ver">Ver ficha</button><p class="err">' + esc(msg || '') + '</p></div>' + misEquipos(true);
  $('ver').onclick = () => abrir($('cl').value, true);
  $('cl').onkeydown = ev => { if (ev.key === 'Enter') $('ver').click(); };
}
function misEquipos(soloLista) {
  const l = guardadas(); if (!l.length) return '';
  return '<div class="card"><h2>Mis equipos</h2>' + l.map(k => '<div class="fila"><span><b>' + fmtClave(k) + '</b></span><span><button class="chico sec" data-abrir="' + k + '">Ver</button> <button class="chico sec" data-quitar="' + k + '">Quitar</button></span></div>').join('') + '</div>';
}

async function abrir(clave, recordar) {
  $('app').innerHTML = '<p class="cargando">Cargando…</p>';
  try {
    const f = await cargar(clave);
    if (!f) return vLogin('Clave no encontrada. Revisá cómo está escrita en el sticker.');
    if (recordar) { const l = guardadas(); if (!l.includes(f.clave)) { l.push(f.clave); guardar(l); } }
    actual = f; todos = false; history.replaceState(null, '', location.pathname); vFicha();
  } catch (e) { vLogin(e.message); }
}

function vFicha() {
  const { e, svcs, clave } = actual, eq = EQ[e.tipo] || EQ.otro, ult = svcs[0];
  const vigente = s => addDias(s.fecha, +s.garantiaDias || 0) >= hoy();
  const any = svcs.some(vigente);
  const tec = e.tipo === 'heladera' ? POR_NOMBRE.Bruno : tecPorNombre(ult ? ult.tecnico : e.tecnicoAlta);
  const lst = todos ? svcs : svcs.slice(0, 5);
  const svcHTML = s => { const v = addDias(s.fecha, +s.garantiaDias || 0), ok = vigente(s); return '<div class="svc"><b>' + fechaCorta(s.fecha) + '</b> · Service realizado por ' + esc(s.tecnico) + '<br>' + (s.items && s.items.length ? '<div class="cubre">Cubre: ' + esc(s.items.join(', ')) + '</div>' : '') + (s.detalle ? '<div>' + esc(s.detalle) + '</div>' : '') + (s.motivo ? '<small>Motivo: ' + esc(s.motivo) + '</small><br>' : '') + '<span class="' + (ok ? 'ok' : 'mal') + '">Garantía ' + (ok ? 'vigente' : 'vencida') + ' · ' + s.garantiaDias + ' días · vence ' + fechaCorta(v) + '</span><button class="sec chico" data-comp="' + s.id + '">Comprobante (imprimir o guardar PDF)</button><details><summary>Ver condiciones de la garantía</summary><p>' + esc(GARANTIA_TEXTO.replace('{dias}', s.garantiaDias)) + '</p></details></div>'; };
  const cal = e.mantenimiento && e.mantenimiento.fecha;
  const otros = guardadas().filter(k => k !== clave);
  $('app').innerHTML =
    '<div class="card"><h1>' + esc(eq.nombre) + ' ' + esc(e.marca || '') + ' ' + esc(e.modelo || '') + '</h1>' + (e.clienteNombre ? '<small>Cliente: ' + esc(e.clienteNombre) + '</small><br>' : '') + '<small>Clave ' + fmtClave(clave) + '</small><br>' +
    (svcs.length ? '<span class="badge ' + (any ? '' : 'mal') + '">' + (any ? '✔ Garantía vigente' : 'Garantía vencida') + '</span>' : '<small>Sin services registrados.</small>') +
    (e.baja ? '<p class="mal">Este equipo figura dado de baja.</p>' : '') + '</div>' +
    '<div class="card"><a class="btn wa" href="' + waLink(tec.tel, 'Hola ' + tec.nombre + ', consulto por mi ' + eq.nombre.toLowerCase() + ' (clave ' + fmtClave(clave) + ').') + '">Pedir un service a ' + tec.nombre + '</a>' +
    (cal ? '<button class="sec" id="bcal">Agregar recordatorio al calendario</button>' : '') + '</div>' +
    (svcs.length ? '<div class="card"><h2>Historial</h2>' + lst.map(svcHTML).join('') + (svcs.length > 5 && !todos ? '<button class="sec" id="vtodos">Ver lista completa (' + svcs.length + ')</button>' : '') + '</div>' : '') +
    '<div class="card"><h2>Guardá nuestro contacto</h2><a class="btn sec" href="' + tec.vcf + '">Guardar contacto de ' + tec.nombre + '</a><button class="sec" id="brec">Recomendanos</button></div>' +
    '<div class="card"><h2>También arreglamos</h2><div class="tipos">' + ['Aires', 'Lavarropas', 'Secarropas', 'Heladeras', 'Hornos', 'Cocinas', 'Estufas', 'Calefones'].map(t => { const t2 = t === 'Heladeras' ? POR_NOMBRE.Bruno : tec; return '<a href="' + waLink(t2.tel, 'Hola ' + t2.nombre + ', tengo un problema con mi ' + t.toLowerCase().replace(/s$/, '') + '.') + '">' + t + '</a>'; }).join('') + '</div><a class="btn sec" href="' + waLink(tec.tel, 'Hola ' + tec.nombre + ', tengo otro equipo con problemas.') + '">Tengo otro equipo con problemas</a></div>' +
    '<div class="card"><h2>Mis equipos</h2>' + (otros.length ? otros.map(k => '<div class="fila"><b>' + fmtClave(k) + '</b><span><button class="chico sec" data-abrir="' + k + '">Ver</button> <button class="chico sec" data-quitar="' + k + '">Quitar</button></span></div>').join('') : '<small>Acá aparecen los equipos que agregues con su clave.</small>') +
    '<label>Agregar otro equipo</label><input id="otra" placeholder="Clave del otro sticker" autocomplete="off" autocapitalize="characters"><button class="sec" id="bagregar">Agregar</button><p class="err" id="err"></p></div>' +
    '<button class="sec" id="bsalir">← Volver</button>';
  const b = id => $(id);
  if (b('vtodos')) b('vtodos').onclick = () => { todos = true; vFicha(); };
  if (b('bcal')) b('bcal').onclick = () => {
    const f = cal.replace(/-/g, ''), ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:' + clave + f + '@servicehogarbelgrano\r\nDTSTAMP:' + hoy().replace(/-/g, '') + 'T120000Z\r\nDTSTART;VALUE=DATE:' + f + '\r\nSUMMARY:Service de ' + eq.nombre + ' (Service Hogar Belgrano)\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'recordatorio-service.ics'; a.click();
  };
  b('brec').onclick = () => { const url = 'https://servicehogarbelgrano.com.ar/?t=' + tec.nombre.toLowerCase(), txt = 'Te recomiendo a ' + tec.nombre + ' de Service Hogar Belgrano, arreglan electrodomésticos y aires. ' + url; if (navigator.share) navigator.share({ text: txt }).catch(() => {}); else window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank'); };
  b('bagregar').onclick = async () => { const k = normClave($('otra').value); if (k.length !== 6) return $('err').textContent = 'La clave tiene 6 caracteres.'; if (guardadas().includes(k)) return $('err').textContent = 'Ya está en tus equipos.'; try { const f = await cargar(k); if (!f) return $('err').textContent = 'Clave no encontrada.'; const l = guardadas(); l.push(k); guardar(l); vFicha(); } catch (er) { $('err').textContent = er.message; } };
  b('bsalir').onclick = () => { actual = null; vLogin(); };
}

document.addEventListener('click', ev => {
  const a = ev.target.closest('[data-abrir]'); if (a) return abrir(a.dataset.abrir, false);
  const q = ev.target.closest('[data-quitar]'); if (q) { const k = q.dataset.quitar; if (!confirm('¿Quitar este equipo de tu lista? (El historial no se borra.)')) return; guardar(guardadas().filter(x => x !== k)); if (actual) vFicha(); else vLogin(); }
});

const h = normClave(location.hash);
if (h.length === 6) abrir(h, true); else vLogin();

document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-comp]'); if (!b || !actual) return;
  const s = actual.svcs.find(x => x.id === b.dataset.comp); if (!s) return;
  const e = actual.e, eq = EQ[e.tipo] || EQ.otro, t = tecPorNombre(s.tecnico), v = addDias(s.fecha, +s.garantiaDias || 0);
  let d = document.getElementById('comp'); if (d) d.remove();
  d = document.createElement('div'); d.id = 'comp';
  const fila = (k, x) => x ? '<tr><th>' + k + '</th><td>' + esc(x) + '</td></tr>' : '';
  d.innerHTML = '<div class="ch"><img src="' + NEGOCIO.logo + '" alt="" onerror="this.remove()"><div><h1>' + NEGOCIO.nombre + '</h1><p>' + esc(NEGOCIO.direccion) + '<br>WhatsApp: Mauricio ' + '11 6571-1314' + ' · Bruno ' + '11 6748-9192' + '<br>' + NEGOCIO.web + ' · ' + NEGOCIO.instagram + '</p></div></div>' +
    '<h2>Comprobante de service</h2><table>' + fila('Fecha', fechaCorta(s.fecha)) + fila('Cliente', e.clienteNombre) + fila('Equipo', (eq.nombre + ' ' + (e.marca || '') + ' ' + (e.modelo || '')).trim()) + fila('Clave del equipo', fmtClave(actual.clave)) + fila('Técnico', s.tecnico) + fila('Trabajo realizado', (s.items && s.items.length ? s.items.join(', ') + '. ' : '') + (s.detalle || '')) + fila('Motivo / falla', s.motivo) + fila('Garantía', s.garantiaDias + ' días, vence el ' + fechaCorta(v)) + '</table>' +
    '<div class="qrb">' + qrSvg(FICHA_URL + '#' + normClave(actual.clave)) + '<p>Escaneá este código para ver el historial y la garantía de tu equipo online.</p></div>' + '<h3>Condiciones de la garantía</h3><p class="cg">' + esc(GARANTIA_TEXTO.replace('{dias}', s.garantiaDias)) + '</p><p class="pie">Este comprobante acredita el servicio realizado y no es una factura. Ficha online: ' + NEGOCIO.web + '/ficha.html (clave ' + fmtClave(actual.clave) + ').</p>';
  d.insertAdjacentHTML('afterbegin', '<div class="barra"><button id="cimp">Imprimir o guardar PDF</button><button class="sec" id="ccer">Cerrar</button></div>');
  document.body.appendChild(d); document.body.classList.add('vcomp'); window.scrollTo(0, 0);
  document.getElementById('ccer').onclick = () => { d.remove(); document.body.classList.remove('vcomp'); };
  document.getElementById('cimp').onclick = () => window.print();
});

function qrSvg(txt) { try { const q = qrcode(0, 'M'); q.addData(txt); q.make(); return q.createSvgTag({ cellSize: 3, margin: 0, scalable: true }); } catch (_) { return ''; } }
