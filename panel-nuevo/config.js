// Configuración compartida del panel nuevo y de la ficha de prueba.
export const firebaseConfig = {
  apiKey: "AIzaSyB4VpPLrpSc43mX-ExPav2_kHStRpqV1cw",
  authDomain: "service-hogar-panel.firebaseapp.com",
  projectId: "service-hogar-panel",
  storageBucket: "service-hogar-panel.firebasestorage.app",
  messagingSenderId: "1097895166410",
  appId: "1:1097895166410:web:6ca805cf0b6fb690bc8f33"
};

export const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
export const BASE = 'https://servicehogarbelgrano.com.ar/panel-nuevo/';
export const FICHA_URL = BASE + 'ficha-nueva.html';
export const LINK_RESENA = 'https://g.page/r/CW5oeg1aJJDeEBE/review';
export const INSTAGRAM = 'https://www.instagram.com/servicehogarbelgrano';

// Técnicos habilitados (la base de datos también los controla con sus reglas).
export const TECNICOS = {
  'mauricio.d.bustos@gmail.com': { nombre: 'Mauricio', letra: 'M', tel: '5491165711314', vcf: BASE + 'contacto-mauricio.vcf' },
  'poggidoga1912@gmail.com':     { nombre: 'Bruno',    letra: 'B', tel: '5491167489192', vcf: BASE + 'contacto-bruno.vcf' }
};
export const POR_NOMBRE = Object.fromEntries(Object.values(TECNICOS).map(t => [t.nombre, t]));

// Clave: 6 caracteres. Sin 0, O, 1, I, L, S, 5.
export const LETRAS = 'ABCDEFGHJKMNPQRTUVWXYZ';
export const ALFABETO = LETRAS + '2346789';

export const EQUIPOS = [
  { id: 'lavarropas',  nombre: 'Lavarropas',  art: 'el lavarropas' },
  { id: 'heladera',    nombre: 'Heladera',    art: 'la heladera' },
  { id: 'cocina',      nombre: 'Cocina',      art: 'la cocina' },
  { id: 'horno',       nombre: 'Horno',       art: 'el horno' },
  { id: 'calefon',     nombre: 'Calefón',     art: 'el calefón' },
  { id: 'aire',        nombre: 'Aire',        art: 'el aire acondicionado' },
  { id: 'secarropas',  nombre: 'Secarropas',  art: 'el secarropas' },
  { id: 'estufa',      nombre: 'Estufa',      art: 'la estufa' },
  { id: 'lavavajillas',nombre: 'Lavavajillas',art: 'el lavavajillas' },
  { id: 'otro',        nombre: 'Otro',        art: 'el equipo' }
];
export const EQ = Object.fromEntries(EQUIPOS.map(e => [e.id, e]));

// Listas iniciales (propuesta). Se pueden editar desde Configuración.
export const ITEMS = {
  lavarropas: ['Bomba de desagote', 'Soportes con rodamiento', 'Cambio de fuelle', 'Carga de agua', 'Mantenimiento'],
  heladera:   ['Cambio de resistencia', 'Carga de gas', 'Burlete'],
  cocina:     ['Bisagra', 'Termocupla', 'Chispero', 'Quemador', 'Válvula', 'Perillas', 'Mantenimiento'],
  horno:      ['Termocupla', 'Chispero', 'Resistencia', 'Bisagra', 'Mantenimiento'],
  calefon:    ['Mantenimiento de calefón', 'Cambio de termocupla', 'Piloto', 'Camisa', 'Serpentina'],
  aire:       ['Instalación con caño', 'Limpieza unidad interior', 'Limpieza unidad exterior', 'Carga de gas', 'Mantenimiento'],
  secarropas: ['Correa', 'Rodamientos', 'Resistencia', 'Mantenimiento'],
  estufa:     ['Termocupla', 'Piloto', 'Válvula', 'Mantenimiento'],
  lavavajillas:['Bomba', 'Mantenimiento'],
  otro:       []
};

export const DEFAULT_CFG = {
  seguimiento5: true, d5Dias: 5,
  resena: true, resenaDias: 10,
  mantAvisos: true, mantDefault: 'ninguno',
  fichaMsg: true, contactoLink: true,
  garantia: 90,
  fondo: 'auto', color: '#0b57d0', letra: 'normal',
  textos: {
    ficha: 'Hola {nombre}, soy {tecnico} de Service Hogar Belgrano.\nTe dejo la ficha {deEquipo}: ahí ves lo que hicimos, la garantía y podés pedir un service cuando lo necesites.\n{link}\nGuardá este mensaje; también podés escanear el QR del sticker y escribir la clave {clave}.{contacto}',
    d5: 'Hola {nombre}, ¿cómo te fue con {equipo} después de la reparación? Nos importa saber si todo anda bien y cómo te atendimos. Contestanos por acá, lo leemos nosotros. Y te recuerdo que también arreglamos aires, heladeras, hornos, cocinas, calefones y secarropas. Si alguien cerca necesita, pasale mi contacto.',
    resena: 'Hola {nombre}, gracias por confiar en Service Hogar Belgrano.\n¿Cómo te fue con {equipo}? Si quedaste conforme, ¿nos dejás una reseña en Google?\nContanos qué equipo te reparamos (ej: lavarropas, aire, heladera) y en qué zona o barrio vivís. Con las estrellas y un comentario alcanza:\n' + LINK_RESENA + '\n\nY seguinos en Instagram para ver nuestros trabajos:\n' + INSTAGRAM,
    mant: 'Hola {nombre}, soy {tecnico} de Service Hogar Belgrano. Ya pasó el tiempo desde el service {deEquipo} y toca el mantenimiento ¿Coordinamos una visita? Cualquier duda escribime por acá.',
    seguimiento: 'Hola {nombre}, soy {tecnico} de Service Hogar Belgrano. ¿Cómo anda {equipo} después de la reparación? Si notás algo raro, escribime y lo vemos.'
  }
};

export const GARANTIA_TEXTO =
  'La garantía cubre el trabajo realizado y los repuestos cambiados en este service, durante {dias} días desde la fecha. No cubre golpes o caídas, mal uso, humedad o líquidos, variaciones de tensión o descargas eléctricas (como rayos), intervención de otro técnico, ni fallas distintas a la reparada.\n\n' +
  'En aires acondicionados, la garantía de una carga de gas cubre solo el trabajo realizado: no cubre pérdidas de gas originadas en otras partes del equipo o de la instalación (caños, uniones, serpentinas) que no hayan sido reparadas en este service, ni las causadas por golpes, roturas o intervenciones de terceros.\n\n' +
  'Ante cualquier duda, escribinos.';

// ---------- utilidades ----------
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const normClave = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const fmtClave = k => { k = normClave(k); return k.length === 6 ? k.slice(0, 3) + '-' + k.slice(3) : k; };
export const hoyISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const addDias = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const addMeses = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const fechaCorta = iso => iso ? String(iso).split('-').reverse().join('/') : '';
export const primerNombre = n => String(n || '').trim().split(/\s+/)[0] || '';

// Teléfono: limpia caracteres raros, acepta 0 / 15 / +54 9 y devuelve 549XXXXXXXXXX (o '' si no sirve).
export function limpiarTel(t) {
  let d = String(t || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('54')) { d = d.slice(2); if (d.startsWith('9') && d.length === 11) d = d.slice(1); }
  d = d.replace(/^0+/, '');
  const m = d.match(/^(\d{2,4})15(\d{6,8})$/);
  if (m && m[1].length + m[2].length === 10) d = m[1] + m[2];
  return d.length === 10 ? '549' + d : '';
}
export function verTel(t) {
  const d = String(t || '');
  return d.length === 13 && d.startsWith('549') ? '+54 9 ' + d.slice(3, 5) + ' ' + d.slice(5, 9) + '-' + d.slice(9) : d;
}
export const waLink = (tel, texto) => 'https://wa.me/' + tel + '?text=' + encodeURIComponent(texto);
export const lista = arr => arr.length > 1 ? arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1] : (arr[0] || '');
export const relleno = (txt, v) => String(txt).replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? '' : v[k]));

// Frases para el detalle automático del service (clave: ítem en minúsculas)
export const FRASES = {
  'bomba de desagote': 'el cambio de la bomba de desagote',
  'bomba': 'el cambio de la bomba',
  'soportes con rodamiento': 'el cambio de los soportes con rodamientos',
  'cambio de fuelle': 'el cambio del fuelle',
  'carga de agua': 'la reparación del sistema de carga de agua',
  'mantenimiento': 'el mantenimiento general',
  'cambio de resistencia': 'el cambio de la resistencia',
  'carga de gas': 'la reparación de la pérdida y la carga de gas',
  'burlete': 'el cambio del burlete',
  'bisagra': 'el cambio de la bisagra',
  'termocupla': 'el cambio de la termocupla',
  'chispero': 'el cambio del chispero',
  'quemador': 'la reparación del quemador',
  'válvula': 'el cambio de la válvula',
  'perillas': 'el cambio de las perillas',
  'resistencia': 'el cambio de la resistencia',
  'mantenimiento de calefón': 'el mantenimiento completo del calefón',
  'cambio de termocupla': 'el cambio de la termocupla',
  'piloto': 'la reparación del piloto',
  'camisa': 'el cambio de la camisa',
  'serpentina': 'la reparación de la serpentina',
  'instalación con caño': 'la instalación con caño',
  'limpieza unidad interior': 'la limpieza de la unidad interior',
  'limpieza unidad exterior': 'la limpieza de la unidad exterior',
  'correa': 'el cambio de la correa',
  'rodamientos': 'el cambio de los rodamientos',
  'plaqueta': 'la reparación de la plaqueta',
  'instalación': 'la instalación'
};
export const demostrativo = art => art.startsWith('el ') ? 'este ' + art.slice(3) : art.startsWith('la ') ? 'esta ' + art.slice(3) : 'este equipo';
