  const TECNICOS = { bruno: "5491167489192", mauricio: "5491165711314" };
  /* Calculadora de frigorías */
  (function () {
    var $ = function (x) { return document.getElementById(x); };
    var TAM = [2250, 3000, 4500, 5500, 6000];
    function calc() {
      var l = parseFloat($("cl").value), a = parseFloat($("ca").value), h = parseFloat($("cal").value) || 2.6;
      var n = Math.max(0, parseInt($("cn").value, 10) || 0), q = Math.max(0, parseInt($("ce").value, 10) || 0);
      if (!(l > 0 && a > 0)) { $("cr-n").textContent = "—"; $("cr-t").textContent = "Completá el largo y el ancho del ambiente."; $("cr-w").hidden = true; return; }
      var fg = l * a * (h / 2.6) * 110 * $("co").value * $("cp").value * $("cv").value + n * 100 + q * 150;
      fg = Math.round(fg / 50) * 50;
      var t = TAM.filter(function (x) { return x >= fg; })[0], m2 = Math.round(l * a * 10) / 10;
      $("cr-n").textContent = fg.toLocaleString("es-AR");
      $("cr-t").textContent = "Ambiente de " + m2 + " m². " + (t ? "Te conviene un equipo de " + t.toLocaleString("es-AR") + " frigorías." : "Es un ambiente grande: consultanos para armar la mejor opción.");
      var msg = "Hola, usé la calculadora: ambiente de " + m2 + " m², necesito unas " + fg + " frigorías" + (t ? " (equipo de " + t + ")" : "") + ". Quiero consultar por la instalación.";
      $("cw-b").href = "https://wa.me/" + TECNICOS.bruno + "?text=" + encodeURIComponent(msg);
      $("cw-m").href = "https://wa.me/" + TECNICOS.mauricio + "?text=" + encodeURIComponent(msg);
      $("cr-w").hidden = false;
    }
    ["cl", "ca", "cal", "cn", "ce", "co", "cp", "cv"].forEach(function (id) { $(id).addEventListener("input", calc); });
    calc();
  })();
