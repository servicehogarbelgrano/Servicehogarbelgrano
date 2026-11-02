/* Google Analytics: no cuenta los dispositivos marcados en no-contar.html y registra los toques en WhatsApp */
try { if (localStorage.getItem("no-contar")) window["ga-disable-G-54420PDL6K"] = true; } catch (e) {}
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-54420PDL6K");

function contarWhatsApp() { gtag("event", "contacto_whatsapp"); }
document.addEventListener("click", function (e) {
  if (e.target.closest && e.target.closest('a[href*="wa.me/"]')) contarWhatsApp();
}, true);
