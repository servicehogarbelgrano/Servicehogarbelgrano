import { firebaseConfig, SDK, POR_NOMBRE, NEGOCIO, esc, fechaCorta, addDias, waLink } from './config.js';
const { initializeApp } = await import(SDK + 'firebase-app.js');
const { getFirestore, doc, getDoc, updateDoc } = await import(SDK + 'firebase-firestore.js');
const db = getFirestore(initializeApp(firebaseConfig));
const $ = id => document.getElementById(id);
const id = (location.hash || '').replace('#', '').replace(/[^a-zA-Z0-9]/g, '');
const $$ = n => '$' + Math.round(+n || 0).toLocaleString('es-AR');
let ref = null, p = null;

function ver(msg) {
  const hasta = addDias(p.fecha, +p.validez || 0), venc = hasta < new Date().toISOString().slice(0, 10);
  const tec = POR_NOMBRE[p.tecnico] || POR_NOMBRE.Mauricio;
  const det = (p.texto || '').split('\n').filter(x => x.trim()).map(x => '<p>' + esc(x) + '</p>').join('');
  const mat = (p.mat || []).length ? '<h4>' + (p.eq && p.eq !== 'aire' ? 'Repuestos incluidos' : 'Materiales incluidos') + '</h4><ul>' + p.mat.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul>' : '';
  const resp = p.estado === 'aceptado' ? '<div class="cubre">✓ Aceptaste este presupuesto. Gracias, ' + esc(tec.nombre) + ' se comunica con vos.</div>' : p.estado === 'pensando' ? '<div class="cubre">Marcaste que lo estás pensando. Cuando quieras, podés aceptarlo desde acá.</div>' : '';
  $('app').innerHTML = '<div class="card" id="pcard"><div style="display:flex;align-items:center;gap:10px;border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:8px"><img src="logo.png" alt="" style="width:44px;height:44px" onerror="this.remove()"><div><b>Service Hogar Belgrano</b><br><small>Servicio técnico de electrodomésticos y aires acondicionados</small></div></div><h2>Presupuesto N° ' + esc(p.numero) + '</h2><small>Para ' + esc(p.cliente || '') + ' · ' + fechaCorta(p.fecha) + ' · válido hasta el ' + fechaCorta(hasta) + '</small>' +
    '<div style="margin:12px 0">' + det + mat + '</div><div class="key" style="font-size:1.6rem;letter-spacing:0">Total: ' + $$(p.precio) + '</div>' +
    '<p><small>' + esc(p.notas || '') + '</small></p><p><small>' + esc(NEGOCIO.direccion) + ' · WhatsApp: Mauricio 11 6571-1314 · Bruno 11 6748-9192<br>Este documento es un presupuesto y no es una factura.</small></p></div>' + (msg ? '<div class="cubre">' + msg + '</div>' : '') + resp +
    (venc ? '<p class="err">Este presupuesto ya venció. Escribinos si querés que lo actualicemos.</p>' : (p.estado === 'aceptado' ? '' : '<button class="btn" id="si" style="width:100%">Aceptar presupuesto</button>' + (p.estado === 'pensando' ? '' : '<button class="btn sec" id="pen" style="width:100%;margin-top:8px">Lo voy a pensar</button>'))) +
    '<button class="btn sec" id="pdf" style="width:100%;margin-top:8px">Descargar PDF</button>' +
    '<a class="btn sec" style="width:100%;margin-top:8px;text-align:center;box-sizing:border-box" href="' + waLink(tec.tel, 'Hola ' + tec.nombre + ', consulto por el presupuesto ' + p.numero + '.') + '">Escribirle a ' + esc(tec.nombre) + ' por WhatsApp</a>';
  const si = $('si'), pen = $('pen');
  if ($('pdf')) $('pdf').onclick = bajarPdf;
  if (si) si.onclick = () => responder('aceptado');
  if (pen) pen.onclick = () => responder('pensando');
}
const cargarJs = src => new Promise((ok, ko) => { if (document.querySelector('script[data-lib="' + src + '"]')) return ok(); const t = document.createElement('script'); t.src = src; t.dataset.lib = src; t.onload = ok; t.onerror = () => ko(new Error('lib')); document.head.appendChild(t); });
async function bajarPdf() {
  const b = $('pdf'); b.disabled = true; b.textContent = 'Preparando PDF…';
  try {
    await cargarJs('panel-nuevo/vendor/html2canvas.min.js?v=1'); await cargarJs('panel-nuevo/vendor/jspdf.umd.min.js?v=1');
    const cv = await window.html2canvas($('pcard'), { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' }), W = 190; let w = W, h = cv.height * W / cv.width; if (h > 277) { w = W * 277 / h; h = 277; }
    pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', (210 - w) / 2, 10, w, h);
    const a = document.createElement('a'); a.href = URL.createObjectURL(pdf.output('blob')); a.download = 'Presupuesto-' + p.numero + '.pdf'; document.body.appendChild(a); a.click(); a.remove();
    b.textContent = 'Descargar PDF';
  } catch (_) { b.textContent = 'No se pudo armar el PDF'; }
  b.disabled = false;
}
async function responder(estado) {
  const tec = POR_NOMBRE[p.tecnico] || POR_NOMBRE.Mauricio;
  $('app').querySelectorAll('button').forEach(b => b.disabled = true);
  try { await updateDoc(ref, { estado, respuestaTs: Date.now() }); } catch (_) { return ver('No se pudo registrar tu respuesta. Probá de nuevo o escribile por WhatsApp.'); }
  p.estado = estado;
  if (estado === 'pensando') return ver('Listo, avisamos que lo estás pensando. Cuando quieras, podés aceptarlo desde acá.');
  const link = waLink(tec.tel, 'Hola ' + tec.nombre + ', acepto el presupuesto ' + p.numero + '. ¿Cuándo coordinamos?');
  ver('¡Gracias! Registramos que aceptaste el presupuesto.');
  const b = document.createElement('a'); b.className = 'btn'; b.style.cssText = 'width:100%;display:block;margin-top:8px;text-align:center;box-sizing:border-box'; b.href = link; b.textContent = 'Avisar por WhatsApp a ' + tec.nombre; $('app').appendChild(b);
  setTimeout(() => { location.href = link; }, 1500);
}
(async () => {
  if (window.top !== window.self) { try { window.top.location = window.location.href; } catch (_) { document.body.innerHTML = ''; return; } }
  if (!id || !/^[a-z0-9]{6,20}$/i.test(id)) return ($('app').innerHTML = '<p class="err">Link incompleto. Pedinos que te lo mandemos de nuevo.</p>');
  ref = doc(db, 'presupuestos_pub', id);
  try { const s = await getDoc(ref); if (!s.exists()) return ($('app').innerHTML = '<p class="err">No encontramos este presupuesto. Escribinos por WhatsApp y lo vemos.</p>'); p = s.data(); }
  catch (_) { return ($('app').innerHTML = '<p class="err">No se pudo cargar. Revisá tu internet.</p>'); }
  ver('');
  if (!p.vistoTs) updateDoc(ref, { vistoTs: Date.now() }).catch(() => {});
})();
