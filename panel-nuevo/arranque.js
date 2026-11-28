// Arranque: sin zoom con dos dedos y chequeo de versión (archivo externo porque la política de seguridad no permite scripts dentro de la página)
["gesturestart","gesturechange","gestureend"].forEach(function (e) { document.addEventListener(e, function (x) { x.preventDefault(); }); });
["touchstart", "touchmove"].forEach(function (e) { document.addEventListener(e, function (x) { if (x.touches && x.touches.length > 1) x.preventDefault(); }, { passive: false }); });
document.addEventListener("dblclick", function (x) { x.preventDefault(); });
(function () {
  try {
    var s = document.querySelector('script[src^="app.js"]');
    var cur = (s.getAttribute("src").match(/v=(\d+)/) || [])[1];
    window.__ver = cur;
    fetch(location.pathname + "?c=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (x) {
      var m = x.match(/app\.js\?v=(\d+)/);
      if (m && cur && m[1] !== cur && !sessionStorage.getItem("upd" + m[1])) { sessionStorage.setItem("upd" + m[1], 1); location.replace(location.pathname + "?r=" + Date.now()); }
    }).catch(function () {});
  } catch (e) {}
})();
