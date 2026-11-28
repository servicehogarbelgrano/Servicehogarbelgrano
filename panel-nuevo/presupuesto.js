import { firebaseConfig, SDK, POR_NOMBRE, NEGOCIO, esc, fechaCorta, addDias, waLink } from './config.js';
const { initializeApp } = await import(SDK + 'firebase-app.js');
const { getFirestore, doc, getDoc, updateDoc } = await import(SDK + 'firebase-firestore.js');
const db = getFirestore(initializeApp(firebaseConfig));
const $ = id => document.getElementById(id);
const id = (location.hash || '').replace('#', '').replace(/[^a-zA-Z0-9]/g, '');
const $$ = n => '$' + Math.round(+n || 0).toLocaleString('es-AR');
let ref = null, p = null;

function docHTML() {
  const hasta = addDias(p.fecha, +p.validez || 0), F = 'font-family:Barlow,Arial,sans-serif;', T = "font-family:'Barlow Condensed',Barlow,Arial,sans-serif;font-weight:800;";
  const det = (p.texto || '').split('\n').filter(x => x.trim()).map(x => '<p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:#1A1D21">' + esc(x) + '</p>').join('');
  const mat = (p.mat || []).length ? '<div style="margin-top:14px"><div style="' + T + 'font-size:18px;color:#262B30;letter-spacing:.04em;text-transform:uppercase">' + (p.eq && p.eq !== 'aire' ? 'Repuestos incluidos' : 'Materiales incluidos') + '</div><ul style="margin:6px 0 0;padding-left:20px;font-size:15px;line-height:1.55;color:#1A1D21">' + p.mat.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul></div>' : '';
  const col = (k, v) => '<div style="flex:1;min-width:0"><div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#565C63;font-weight:700">' + k + '</div><div style="font-size:17px;font-weight:700;color:#1A1D21;margin-top:2px">' + v + '</div></div>';
  return '<div style="' + F + 'background:#fff;color:#1A1D21;overflow:hidden">' +
    '<div style="background:#262B30;border-bottom:6px solid #F26A1B;padding:22px 26px;display:flex;align-items:center;gap:16px"><img src="logo.png" alt="" style="width:66px;height:66px;border-radius:50%;background:#fff;padding:3px;border:2px solid #F26A1B;object-fit:contain" onerror="this.remove()"><div style="flex:1;min-width:0"><div style="' + T + 'font-size:30px;line-height:1;color:#fff">Service Hogar Belgrano</div><div style="font-size:14px;color:#cfd3d7;margin-top:4px">Servicio técnico de electrodomésticos y aires acondicionados</div></div><div style="text-align:right"><div style="' + T + 'font-size:15px;letter-spacing:.14em;color:#F26A1B">PRESUPUESTO</div><div style="' + T + 'font-size:28px;line-height:1;color:#fff;margin-top:2px">N° ' + esc(p.numero) + '</div></div></div>' +
    '<div style="padding:22px 26px">' +
    '<div style="display:flex;gap:14px;background:#EEF0F1;border-radius:10px;padding:14px 16px">' + col('Cliente', esc(p.cliente || '—')) + col('Fecha', fechaCorta(p.fecha)) + col('Válido hasta', fechaCorta(hasta)) + '</div>' +
    '<div style="margin-top:20px;border-left:6px solid #F26A1B;padding-left:14px"><div style="' + T + 'font-size:20px;color:#262B30;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px">Detalle del trabajo</div>' + det + mat + '</div>' +
    '<div style="margin-top:22px;background:#262B30;border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between"><div style="' + T + 'font-size:20px;letter-spacing:.1em;color:#fff">TOTAL</div><div style="' + T + 'font-size:40px;line-height:1;color:#F26A1B">' + $$(p.precio) + '</div></div>' +
    (p.notas ? '<div style="margin-top:16px;border:1.5px solid #CFD3D7;border-radius:10px;padding:12px 14px;font-size:13.5px;line-height:1.5;color:#565C63">' + esc(p.notas) + '</div>' : '') +
    '</div>' +
    '<div style="background:#EEF0F1;border-top:4px solid #F26A1B;padding:14px 26px;font-size:13px;line-height:1.55;color:#262B30;text-align:center"><b>' + esc(NEGOCIO.direccion) + '</b><br>WhatsApp: Mauricio 11 6571-1314 · Bruno 11 6748-9192<br>' + esc(NEGOCIO.web) + ' · ' + esc(NEGOCIO.instagram) + '<br><span style="color:#565C63">Este documento es un presupuesto y no es una factura.</span></div></div>';
}

function ver(msg) {
  const hasta = addDias(p.fecha, +p.validez || 0), venc = hasta < new Date().toISOString().slice(0, 10);
  const tec = POR_NOMBRE[p.tecnico] || POR_NOMBRE.Mauricio;
  const det = (p.texto || '').split('\n').filter(x => x.trim()).map(x => '<p>' + esc(x) + '</p>').join('');
  const mat = (p.mat || []).length ? '<h4>' + (p.eq && p.eq !== 'aire' ? 'Repuestos incluidos' : 'Materiales incluidos') + '</h4><ul>' + p.mat.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul>' : '';
  const resp = p.estado === 'aceptado' ? '<div class="cubre">✓ Aceptaste este presupuesto. Gracias, ' + esc(tec.nombre) + ' se comunica con vos.</div>' : p.estado === 'pensando' ? '<div class="cubre">Marcaste que lo estás pensando. Cuando quieras, podés aceptarlo desde acá.</div>' : '';
  $('app').innerHTML = '<div class="card" id="pcard" style="padding:0;overflow:hidden">' + docHTML() + '</div>' + (msg ? '<div class="cubre">' + msg + '</div>' : '') + resp +
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
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff'; host.innerHTML = docHTML(); document.body.appendChild(host);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise(r => setTimeout(r, 250));
    const cv = await window.html2canvas(host, { scale: 2, backgroundColor: '#ffffff', useCORS: true, width: 794 }); host.remove();
    const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' }), ph = Math.floor(cv.width * 297 / 210);
    for (let y = 0, n = 0; y < cv.height; y += ph, n++) { const c = document.createElement('canvas'); c.width = cv.width; c.height = Math.min(ph, cv.height - y); c.getContext('2d').drawImage(cv, 0, y, cv.width, c.height, 0, 0, cv.width, c.height); if (n) pdf.addPage(); pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, c.height * 210 / cv.width); }
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
