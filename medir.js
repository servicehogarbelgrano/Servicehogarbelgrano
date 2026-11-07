/* Google Analytics: no cuenta los dispositivos marcados en no-contar.html y registra los contactos.
   Eventos que manda:
   - contacto_whatsapp  -> tecnico (bruno / mauricio), origen (boton, formulario...), pagina, equipo (si se eligio)
   - contacto_telefono  -> cuando tocan un numero para llamar (links tel:)
   - click_redes        -> Instagram / TikTok / Facebook  */
try { if (localStorage.getItem("no-contar")) window["ga-disable-G-54420PDL6K"] = true; } catch (e) {}
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-54420PDL6K");

var NUMEROS = { "5491167489192": "bruno", "5491165711314": "mauricio" };

function quienEs(texto) {
  for (var n in NUMEROS) if (String(texto).indexOf(n) !== -1 || String(texto).replace(/\D/g, "").indexOf(n.slice(3)) !== -1) return NUMEROS[n];
  return "otro";
}

/* datos: { tecnico, origen, equipo } (todos opcionales) */
function contarWhatsApp(datos) {
  datos = typeof datos === "string" ? { tecnico: datos } : (datos || {});
  gtag("event", "contacto_whatsapp", {
    tecnico: datos.tecnico || "otro",
    origen: datos.origen || "boton",
    equipo: datos.equipo || "",
    pagina: location.pathname,
    transport_type: "beacon"
  });
}

document.addEventListener("click", function (e) {
  if (!e.target.closest) return;
  var a = e.target.closest("a[href]");
  if (!a) return;
  var href = a.getAttribute("href") || "";
  var texto = (a.textContent || "").trim().slice(0, 40);
  if (href.indexOf("wa.me/") !== -1) {
    contarWhatsApp({ tecnico: quienEs(href), origen: a.id || a.className || texto || "boton" });
  } else if (href.indexOf("tel:") === 0) {
    gtag("event", "contacto_telefono", { tecnico: quienEs(href), pagina: location.pathname, transport_type: "beacon" });
  } else if (/instagram\.com|tiktok\.com|facebook\.com/.test(href)) {
    gtag("event", "click_redes", { red: (href.match(/instagram|tiktok|facebook/) || ["otra"])[0], pagina: location.pathname, transport_type: "beacon" });
  }
}, true);
