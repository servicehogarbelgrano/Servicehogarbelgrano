/* Oculta la foto de trabajo de las páginas por barrio si todavía no está subida (fotos/instalacion-aire-split-barrio.jpg) */
(function () {
  document.querySelectorAll("figure.foto img").forEach(function (img) {
    function ocultar() { var f = img.closest("figure"); if (f) f.hidden = true; }
    img.addEventListener("error", ocultar);
    if (img.complete && img.naturalWidth === 0) ocultar();
  });
})();
