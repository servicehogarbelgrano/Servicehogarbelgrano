  /* Buscador: filtra las listas de arriba. Sin JavaScript se ve la guía completa. */
  (function () {
    var $ = function (x) { return document.getElementById(x); };
    var fe = $("fe"), fm = $("fm"), fc = $("fc");
    var grupos = [].slice.call(document.querySelectorAll(".grupo"));
    /* En el display se confunden 0 con O, 1 con I y 5 con S */
    function norm(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/0/g, "O").replace(/1/g, "I").replace(/5/g, "S"); }
    grupos.forEach(function (g) {
      g.items = [].slice.call(g.querySelectorAll("li")).map(function (li) {
        var crudo = li.getAttribute("data-c").split(",");
        return { el: li, crudo: crudo, cod: crudo.map(norm) };
      });
    });
    function aplicar() {
      var q = norm(fc.value), total = 0;
      function pasa(g) { return (!fe.value || g.getAttribute("data-e") === fe.value) && (!fm.value || g.getAttribute("data-m").split(",").indexOf(fm.value) > -1); }
      /* Si el código coincide completo se muestra solo eso; si no, lo que lo contenga (OE no debe traer 40E) */
      var exacto = q && grupos.some(function (g) { return pasa(g) && g.items.some(function (i) { return i.cod.indexOf(q) > -1; }); });
      grupos.forEach(function (g) {
        var ver = 0, ok = pasa(g);
        g.items.forEach(function (i) {
          /* Sin código no se muestra nada: la lista aparece recién al elegirlo */
          var si = ok && !!q && (exacto ? i.cod.indexOf(q) > -1 : i.cod.some(function (c) { return c.indexOf(q) > -1; }));
          i.el.hidden = !si; if (si) ver++;
        });
        g.hidden = !ver; total += ver;
      });
      /* Las sugerencias del campo Código siguen al equipo y la marca elegidos */
      var vistos = {}, fl = $("fl");
      fl.replaceChildren();
      grupos.filter(pasa).forEach(function (g) {
        g.items.forEach(function (i) { i.crudo.forEach(function (c) { vistos[c] = 1; }); });
      });
      Object.keys(vistos).sort().forEach(function (c) { var o = document.createElement("option"); o.value = c; fl.appendChild(o); });
      $("cuenta").textContent = !q ? "Escribí o elegí el código para ver qué significa." : total > 1 ? "Este código aparece en " + total + " equipos o marcas. Elegí equipo y marca para ver solo el tuyo." : "";
      $("nada").hidden = !q || total > 0;
      var eq = fe.value ? fe.options[fe.selectedIndex].text.toLowerCase() : "equipo";
      var msg = "Hola, mi " + eq + (fm.value ? " " + fm.value : "") + " muestra " + (fc.value.trim() ? "el código " + fc.value.trim() : "un código de error") + ".";
      var txt = "?text=" + encodeURIComponent(msg);
      [].forEach.call(document.querySelectorAll("[data-tel]"), function (a) { a.href = "https://wa.me/" + a.getAttribute("data-tel") + txt; });
      $("nadaw").href = "https://wa.me/5491165711314" + txt;
    }
    /* Los enlaces de otras páginas pueden traer ?equipo=heladera */
    var p = new URLSearchParams(location.search), e = p.get("equipo");
    if ([].some.call(fe.options, function (o) { return o.value === e; })) fe.value = e;
    fe.onchange = fm.onchange = aplicar; fc.oninput = aplicar;
    aplicar();
  })();
