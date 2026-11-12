  const TECNICOS = { bruno: "5491167489192", mauricio: "5491165711314" };

  document.querySelectorAll("[data-tecnico]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const equipo = document.getElementById("equipo");
      const error = document.getElementById("error");
      const marca = document.getElementById("marca").value.trim();
      const falla = document.getElementById("falla").value.trim();

      if (!equipo.value) {
        error.textContent = "Elegí qué equipo querés reparar.";
        equipo.focus();
        return;
      }
      error.textContent = "";

      let mensaje = "Hola, quiero pedir un presupuesto.\nEquipo: " + equipo.value;
      if (marca) mensaje += "\nMarca: " + marca;
      if (falla) mensaje += "\nProblema: " + falla;

      const url = "https://wa.me/" + TECNICOS[boton.dataset.tecnico] + "?text=" + encodeURIComponent(mensaje);
      if (window.contarWhatsApp) contarWhatsApp({ tecnico: boton.dataset.tecnico, origen: "formulario", equipo: equipo.value });
      /* Se abre sin "noopener" para saber si el navegador bloqueó la ventana; se corta el vínculo apenas se abre */
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (e) {} } else { location.href = url; }
    });
  });

  /* Instagram: se carga solo cuando el cliente llega a la sección */
  (function () {
    var sec = document.getElementById("trabajos");
    var cargado = false;
    function cargar() {
      if (cargado) return;
      cargado = true;
      var sc = document.createElement("script");
      sc.async = true;
      sc.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(sc);
    }
    if (sec && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e, o) {
        if (e[0].isIntersecting) { cargar(); o.disconnect(); }
      }, { rootMargin: "400px" }).observe(sec);
    } else {
      cargar();
    }
  })();


  /* Botones que eligen el equipo y llevan al presupuesto */
  document.querySelectorAll("[data-eq]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.getElementById("equipo").value = b.dataset.eq;
      document.getElementById("error").textContent = "";
      document.getElementById("presupuesto").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { document.getElementById("marca").focus({ preventScroll: true }); }, 500);
    });
  });

  /* Estado: abierto de lunes a viernes de 10 a 18 h (hora de Buenos Aires) */
  (function () {
    var el = document.getElementById("estado");
    try {
      var p = {};
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "numeric", hour12: false })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var h = parseInt(p.hour, 10) % 24;
      var abierto = p.weekday !== "Sat" && p.weekday !== "Sun" && h >= 10 && h < 18;
      el.classList.toggle("abierto", abierto);
      el.querySelector("span").textContent = abierto ? "Abierto ahora: escribinos por WhatsApp" : "Cerrado ahora: escribinos y te respondemos al abrir (lun a vie, 10 a 18 h)";
    } catch (e) {}
  })();

  /* Portada: si existe hero.jpg en el repo, se usa como foto de fondo */
  (function () {
    var img = new Image();
    img.onload = function () {
      var h = document.querySelector(".hero");
      if (h) h.classList.add("con-foto");
    };
    img.src = "hero.jpg";
  })();

  /* ===== Reseñas de Google. Formato: ["Nombre","resenas/foto.jpg","Texto de la reseña"] ===== */
  var RESENAS = [
    ["Claudio Singer", "", "Excelente servicio, fui atendido por Bruno en 2 oportunidades por la reparacion de 2 heladeras y la ultima vez por la reparacion de un aire acondicionado, destaco su honestidad, profesionalismo, rapides en la reparacion. Recomendable 100%."],
    ["Santiago Marini", "resenas/santiago.jpg", "Muy buena atención. Mauricio muy dispuesto y capaz. Soluciona inconvenientes donde otros se rinden. Recomendable 100x100"],
    ["Guillermo Thoss", "", "Llame a Bruno por problemas con mi lavarrropa Whirlpool, un ruido terrible al centrifugar. Vino, lo revisó, consiguió el repuesto y lo dejo funcionando a un precio más que razonable. Muy recomendable!"],
    ["Nora Bell", "resenas/nora.png", "Excelente servicio. Mauricio verificó varias veces , una vez hecho el trabajo , que todo estuviera ok con respecto a la cocina . Lo recomiendo"],
    ["Nazarena Muzzio", "", "Mi heladera había dejado de enfriar y, por recomendación de un amigo, contacté a Bruno. Coordinamos una visita para esa misma semana y la experiencia fue excelente. Trabajó de manera muy profesional, solucionó el problema y dejó la heladera impecable. ¡Súper recomendable! Muchas gracias, Bruno."],
    ["Francisco Santiago", "", "Mauricio es muy profesional. Tiene mucha experiencia y es diligente y práctico. Labura muy bien! Muy recomendable"],
    ["Adriana Forti", "", "Muy buen servicio. Reparacion heladera y cambio de burletes. Coordinamos fácil vinieron en horario. Lo mejor de todo fue la honestidad “esto no esta para cambiar todavia”. No lo podia creer!! Bruno, super recomendable"],
    ["Sofía L", "resenas/sofia.jpg", "Muy buena atención de Bruno, arregló mis aires acondicionados."],
    ["Andrés Djordjalian", "", "En la familia, desde hace años recurrimos a Bruno para todo tema técnico con un aire acondicionado o una heladera. Nos instaló en total 6 equipos de aire que andan fenómeno. Lo recomiendo sin dudar."],
    ["Gabriela Ferreyra", "", "Muy conforme, por todo el trabajo hecho en el arreglo de la botonera del calefon. Muchas Gracias Mauri por todo!"],
    ["Karina Chera", "", "Bruno es muy profesional , ha trabajado varias veces en mi casa , tanto en Lavarropas ,como tmb en Refrigeración . Lo recomiendo ."],
    ["Graciela Salas", "resenas/graciela.jpg", "Súper confiable y de rápida respuesta al llamado. Excelente trabajo."],
    ["Ricardo Roma", "", "Impecable la reparación de placa y el motor, anda perfecto todo. Gracias Bruno"],
    ["Anabella", "", "Un genio Mauri ,super confiable ,transparente y eficiente ! Muchas gracias !"],
    ["Claudia Ramasso", "", "El Sr. Bruno fue puntual, preciso y no tuve ningún inconveniente luego de la reparación. Para recomendar, de 10!"],
    ["Ana Zappelli", "", "Muy conforme con el arreglo del Calefon"],
    ["María Sol Maragliano", "", "Bruno me arregló todo: lavarropas, calefon, extractor de cocina. Super de confianza!"],
    ["Carlos", "", "Muy buena atención de Mauri, la reparación quedo perfecta."],
    ["Matias Ramos", "", "Bruno y su equipo, me instalaron el Aire acondicionado, trabajo de calidad y técnicos responsables. Recomiendo sus servicios."],
    ["Ernesto Yevara", "resenas/ernesto.png", "Un trabajo rápido y preciso. Trato amable y cordial. Super recomendado. Saludos"],
    ["Lilia Miguelez", "", "Excelente gente muy profesional, cumplidores y los precios son completamente razonables. Recomendables cien por ciento."],
    ["Rocio Velurtas", "", "Bruno vino a solucionar un problema que teníamos con el aire acondicionado y la verdad que quedamos muy conformes. Muy buena atención y excelente predisposición. Es muy profesional y responsable, trabaja con mucha prolijidad y se nota que sabe lo que hace. Lo recomiendo sin dudas"],
    ["Agustina Gonzalez Oliva", "", "Inmejorable experiencia! Bruno es muy profesional, responsable y de confianza. Hace muchísimos años que repara aires heladera y lavarropas en casa y siempre soluciono el problema de la mejor manera y muy rápido. Y como si fuera poco, es puntual ! Gracias x existir !"]
  ];
  var RESENAS_URL = "https://maps.app.goo.gl/c3rx3zzUeSsJWMx27";

  var MARCAS = [["Ariston","ariston"],["BGH","bgh"],["Candy","candy"],["Drean","drean"],["Electra","electra"],["Electrolux","electrolux"],["Gafa","gafa"],["GE","ge"],["LG","lg"],["Patrick","patrik"],["Samsung","samsung"],["Surrey","surrey"],["Whirlpool","whirlpool"]];

  function marq(id, list, mk) {
    var t = document.querySelector("#" + id + " .marq-t");
    if (!t || !list.length) return false;
    list.forEach(function (x) { t.appendChild(mk(x)); });
    return true;
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  /* Marcas con logo (subí los logos como marcas/samsung.jpg, etc.; si falta uno se muestra el nombre) */
  marq("marcas-m", MARCAS, function (m) {
    var d = el("div", "lg"), im = new Image();
    im.alt = m[0]; im.loading = "lazy";
    im.onerror = function () { d.replaceChildren(el("span", "", m[0])); };
    im.src = "marcas/" + m[1] + ".jpg";
    d.appendChild(im);
    return d;
  });

  /* Reseñas: corren solas en bucle; se frenan al pasar el mouse o tocarlas, y se deslizan con el dedo */
  if (marq("resenas-m", RESENAS, function (r) {
    var c = el("article", "rv"), h = el("div", "rv-h"), a = el("div", "rv-a", r[0].charAt(0).toUpperCase()), w = el("div"), im = new Image(), l = el("a", "rv-l", "Ver en Google");
    im.alt = ""; im.width = 40; im.height = 40;
    if (r[1]) { im.onload = function () { a.replaceChildren(im); }; im.src = r[1]; }
    w.appendChild(el("b", "", r[0])); w.appendChild(el("small", "", "Reseña de Google"));
    h.appendChild(a); h.appendChild(w);
    l.href = RESENAS_URL; l.target = "_blank"; l.rel = "noopener";
    c.appendChild(h); c.appendChild(el("div", "rv-s", "★★★★★")); c.appendChild(el("p", "", r[2])); c.appendChild(l);
    return c;
  })) {
    document.getElementById("resenas-m").hidden = false;
    bucle("resenas-m");
  }
  bucle("marcas-m");

  /* Hace correr un carrusel en bucle; se frena al pasar el mouse o tocarlo, y se desliza con el dedo */
  function bucle(id) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var m = document.getElementById(id), t = m.querySelector(".marq-t"), n = t.children.length;
    /* Copia de los elementos para que el bucle no tenga corte */
    Array.prototype.slice.call(t.children).forEach(function (c) {
      var d = c.cloneNode(true), a = d.querySelector("a");
      d.setAttribute("aria-hidden", "true");
      if (a) a.tabIndex = -1;
      t.appendChild(d);
    });
    var mouse = false, foco = false, dedo = false, seguir, pos = 0, antes = 0;
    function ancho() { return t.children[n].offsetLeft - t.children[0].offsetLeft; }
    m.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") mouse = true; });
    m.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") mouse = false; });
    /* Solo frena el foco de teclado: un clic no lo deja detenido */
    m.addEventListener("focusin", function (e) { foco = e.target.matches(":focus-visible"); });
    m.addEventListener("focusout", function () { foco = false; });
    m.addEventListener("touchstart", function () { clearTimeout(seguir); dedo = true; }, { passive: true });
    m.addEventListener("touchend", function () { seguir = setTimeout(function () { dedo = false; }, 2500); }, { passive: true });
    function paso(ahora) {
      var dt = Math.min(ahora - antes, 100), w = ancho();
      antes = ahora;
      if (mouse || foco || dedo) pos = m.scrollLeft;
      else pos += dt * 0.035;
      if (w > 0 && pos >= w) pos -= w;
      if (Math.abs(m.scrollLeft - pos) >= 0.5) m.scrollLeft = pos;
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(function (a) { antes = a; paso(a); });
  }
var EQP = [
    ["Aire acondicionado","aires-acondicionados-belgrano.html",["No enfría","Pierde agua","Hace ruido","No prende","Se congela","Carga de gas","Placa electrónica"]],
    ["Lavarropas","lavarropas-belgrano.html",["No centrifuga","No desagota","Pierde agua","No prende","Hace ruido","No calienta"]],
    ["Lavavajillas","lavavajillas-belgrano.html",["No desagota","No lava bien","Pierde agua","No seca","No prende"]],
    ["Secarropas","secarropas-belgrano.html",["No gira","Hace ruido","No frena","No prende"]],
    ["Secadora","secarropas-belgrano.html",["No seca","No gira","Hace ruido","No prende"]],
    ["Heladera","heladeras-belgrano.html",["No enfría","Hace hielo","Pierde agua","Hace ruido","Burletes a medida"]],
    ["Heladera no frost","heladeras-belgrano.html",["No enfría","Hace hielo","Pierde agua","Hace ruido","Burletes a medida"]],
    ["Heladera vinera","heladeras-belgrano.html",["No enfría","Hace ruido","Burlete gastado","No prende"]],
    ["Cocina","cocinas-hornos-calefones-belgrano.html",["Hornalla que no prende","Horno que no calienta","Perillas","Encendido"]],
    ["Horno eléctrico","cocinas-hornos-calefones-belgrano.html",["No calienta","Termostato","Resistencia","Puerta"]],
    ["Calefón","calefones-belgrano.html",["No enciende","No calienta","Pierde agua","Piloto"]],
    ["Estufa","cocinas-hornos-calefones-belgrano.html",["No enciende","Llama débil","Piloto"]]
  ];
  var CODES = { "Aire acondicionado": "aire", "Lavarropas": "lavarropas", "Lavavajillas": "lavavajillas", "Heladera": "heladera", "Heladera no frost": "heladera", "Heladera vinera": "heladera" };

  /* Selector de equipo con fallas */
  (function () {
    var chips = document.getElementById("eq-chips"), p = document.getElementById("eq-p"), btns = [];
    function ver(i) {
      var e = EQP[i];
      btns.forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      p.replaceChildren();
      p.appendChild(el("h3", "", e[0]));
      p.appendChild(el("p", "nota", "Fallas más comunes (tocá una para ver la guía):"));
      var ul = el("ul", "fallas"); e[2].forEach(function (f) { var li = el("li"), l = el("a", "", f); l.href = "servicios/" + e[1] + "#fallas"; li.appendChild(l); ul.appendChild(li); }); p.appendChild(ul);
      if (CODES[e[0]]) { var c = el("p", "nota", "¿Te tira un código? "), cl = el("a", "", "Mirá qué significa"); cl.href = "codigos-de-error.html?equipo=" + CODES[e[0]]; c.appendChild(cl); p.appendChild(c); }
      var a = el("div", "acc"), b1 = el("button", "btn oro", "Pedir presupuesto"), b2 = el("a", "btn borde", "Ver guía completa");
      b1.type = "button";
      b1.onclick = function () { document.getElementById("equipo").value = e[0]; document.getElementById("presupuesto").scrollIntoView({ behavior: "smooth" }); };
      b2.href = "servicios/" + e[1];
      a.appendChild(b1); a.appendChild(b2); p.appendChild(a);
    }
    EQP.forEach(function (e, i) {
      var b = el("button", "", e[0]); b.type = "button"; b.onclick = function () { ver(i); };
      chips.appendChild(b); btns.push(b);
    });
    ver(0);
  })();

  /* Chat de la portada: cambia de equipo solo */
  (function () {
    var EQ = [["el aire acondicionado", "aire acondicionado", "Aire acondicionado"], ["la heladera", "heladera", "Heladera"], ["el lavarropas", "lavarropas", "Lavarropas"], ["la cocina", "cocina", "Cocina"], ["el calefón", "calefón", "Calefón"], ["el lavavajillas", "lavavajillas", "Lavavajillas"], ["el horno eléctrico", "horno eléctrico", "Horno eléctrico"]];
    var b = document.getElementById("chatb"), r = document.getElementById("rot"), i = 0;
    var quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function esc(c) { var d = el("div", "bur " + c + " esc"); d.innerHTML = "<i></i><i></i><i></i>"; b.appendChild(d); return d; }
    function paso() {
      var e = EQ[i % EQ.length]; i++;
      b.replaceChildren(); r.classList.add("out");
      setTimeout(function () { r.textContent = e[1] + "?"; r.classList.remove("out"); }, 300);
      var t = esc("cli");
      setTimeout(function () { t.remove(); b.appendChild(el("div", "bur cli", "Hola, tengo " + e[0] + " que no está funcionando o funciona mal.")); t = esc("nos"); }, 1200);
      setTimeout(function () { t.remove(); b.appendChild(el("div", "bur nos", "¡Hola! Contanos la marca y qué le pasa, y te pasamos el presupuesto por acá.")); }, 2800);
      if (!quieto) setTimeout(paso, 6500);
    }
    var cf = document.querySelector(".chat-f");
    if (cf) cf.addEventListener("click", function () { var s = document.getElementById("equipo"); if (s && !s.value) s.value = EQ[(i - 1) % EQ.length][2]; });
    paso();
  })();

  /* Efecto de onda al tocar botones */
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".btn, .pick-g button, .chips button, .solapa");
    if (!b) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 1.2, o = document.createElement("span");
    o.className = "ripple";
    o.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    b.appendChild(o);
    setTimeout(function () { o.remove(); }, 650);
  });

  /* Las secciones aparecen suavemente al llegar a ellas */
  (function () {
    var l = document.querySelectorAll("main > section > .wrap");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    l.forEach(function (w, i) { if (i > 0) { w.classList.add("rev"); io.observe(w); } });
  })();

  /* Cinta de fotos: subí las fotos a la carpeta trabajos/ como 1.jpg, 2.jpg, 3.jpg... (hasta la 30) y aparecen solas.
     Pasan en bucle, la del medio se ve más grande; al pasar el mouse o tocar una, frena y se agranda.
     Con el mouse (o el dedo) en los extremos se mueve para ese lado, y con el dedo también se desliza. */
  (function () {
    var c = document.getElementById("collage");
    if (!c) return;
    var t = c.querySelector(".cinta-t");
    if (!t) { c.className = "cinta"; c.textContent = ""; t = el("div", "cinta-t"); c.appendChild(t); } /* por si quedó guardada la página vieja */
    var MAX = 30, listas = 0, reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches, ultimoArrastre = 0;
    var FLECHA = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    /* Foto grande: la flecha (o tocar la foto, la tecla Esc o el botón "atrás" del celular) la achica y volvés a donde estabas */
    function abrir(src) {
      var f = el("div", "luz"), im = new Image(), b = el("button", "luz-v"), cerrado = false;
      im.src = src; im.alt = "Trabajo de Service Hogar Belgrano";
      b.type = "button"; b.setAttribute("aria-label", "Volver"); b.innerHTML = FLECHA;
      f.appendChild(im); f.appendChild(b);
      function quitar() {
        if (cerrado) return;
        cerrado = true;
        document.removeEventListener("keydown", tecla);
        window.removeEventListener("popstate", quitar);
        f.classList.add("sale");
        setTimeout(function () { f.remove(); }, 200);
      }
      function volver() {
        if (history.state && history.state.luz) history.back(); else quitar();
      }
      function tecla(e) { if (e.key === "Escape") volver(); }
      f.onclick = volver;
      b.onclick = function (e) { e.stopPropagation(); volver(); };
      document.addEventListener("keydown", tecla);
      try { history.pushState({ luz: 1 }, ""); window.addEventListener("popstate", quitar); } catch (x) {}
      document.body.appendChild(f);
      b.focus({ preventScroll: true });
    }

    function medir() {
      var W = c.clientWidth, n = W >= 900 ? 7 : W >= 600 ? 5 : 3.2;
      if (W < 50) return;
      c.style.setProperty("--w", ((W - 10 * (n - 1)) / n) + "px");
    }
    t.addEventListener("click", function (e) {
      if (Date.now() - ultimoArrastre < 400) return; /* si venías deslizando, no abrir la foto */
      var im = e.target.closest && e.target.closest(".it img");
      if (im) abrir(im.src);
    });

    function arrancar() {
      var orig = Array.prototype.slice.call(t.children), n = orig.length;
      if (!n) { c.hidden = true; return; }
      if (c.clientWidth < 50) { setTimeout(arrancar, 300); return; }
      medir();
      if (reducido) { c.classList.add("quieta"); return; }
      function ciclo() { return t.children[n].offsetLeft - t.children[0].offsetLeft; }
      function clonar() {
        orig.forEach(function (it) {
          var d = it.cloneNode(true);
          d.setAttribute("aria-hidden", "true"); d.querySelector("img").alt = "";
          t.appendChild(d);
        });
      }
      clonar();
      for (var k = 0; k < 6 && t.scrollWidth < c.clientWidth + ciclo(); k++) clonar();

      var pos = 0, antes = 0, vel = 38, w = ciclo(), parado = false, dedo = false, visible = true;
      var borde = 0, arrastre = null, seguir, soltar, activo = null, aplicado = null, ZONA = 0.17, MAXV = 460;
      window.addEventListener("resize", function () { medir(); w = ciclo(); });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(c);

      function zoom(it) {
        if (activo && activo !== it) activo.classList.remove("zoom");
        activo = it;
        if (it) it.classList.add("zoom");
      }
      function ajustar() { while (pos < 0) pos += w; while (pos >= w) pos -= w; }
      /* Cuánto empuja el extremo: 0 en el medio, hasta 1 pegado al borde (negativo = izquierda) */
      function zonaBorde(e) {
        var r = c.getBoundingClientRect(), f = (e.clientX - r.left) / r.width;
        if (f < ZONA) return -(1 - f / ZONA);
        if (f > 1 - ZONA) return (f - (1 - ZONA)) / ZONA;
        return 0;
      }

      /* Mouse */
      c.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        borde = zonaBorde(e);
        if (borde) { parado = false; zoom(null); }
      });
      c.addEventListener("pointerleave", function (e) {
        if (e.pointerType !== "mouse") return;
        borde = 0; parado = false; zoom(null);
      });
      t.addEventListener("pointerover", function (e) {
        if (e.pointerType !== "mouse" || borde) return;
        var it = e.target.closest(".it"); if (it) { parado = true; zoom(it); }
      });
      t.addEventListener("pointerout", function (e) {
        if (e.pointerType !== "mouse") return;
        var a = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".it");
        if (a) return;
        parado = false; zoom(null);
      });

      /* Dedo: tocar frena y agranda, mantener en un extremo mueve para ese lado, deslizar mueve las fotos */
      c.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse") return;
        clearTimeout(seguir); clearTimeout(soltar);
        dedo = true; borde = zonaBorde(e);
        arrastre = { x: e.clientX, pos: pos, mov: false };
        var it = e.target.closest(".it");
        if (it && !borde) zoom(it); else zoom(null);
      });
      c.addEventListener("pointermove", function (e) {
        if (e.pointerType === "mouse" || !arrastre) return;
        var dx = e.clientX - arrastre.x;
        if (!arrastre.mov && Math.abs(dx) > 8) { arrastre.mov = true; borde = 0; zoom(null); }
        if (arrastre.mov) { pos = arrastre.pos - dx; ajustar(); t.style.transform = "translate3d(" + (-pos) + "px,0,0)"; ultimoArrastre = Date.now(); }
      });
      function levantar(e) {
        if (e.pointerType === "mouse") return;
        if (arrastre && arrastre.mov) ultimoArrastre = Date.now();
        arrastre = null; borde = 0;
        soltar = setTimeout(function () { zoom(null); }, 700);
        seguir = setTimeout(function () { dedo = false; }, 1600);
      }
      c.addEventListener("pointerup", levantar);
      c.addEventListener("pointercancel", levantar);

      /* La foto del medio crece un poco; las de los costados quedan en su tamaño */
      function enfatizar() {
        var W = c.clientWidth, mitad = W / 2, its = t.children;
        for (var i = 0; i < its.length; i++) {
          var it = its[i], x = it.offsetLeft - pos + it.offsetWidth / 2;
          if (x < -it.offsetWidth || x > W + it.offsetWidth) { if (it.style.transform) it.style.transform = ""; continue; }
          var q = Math.max(0, 1 - Math.abs(x - mitad) / mitad * 2.6);
          it.style.transform = q > 0.01 ? "scale(" + (1 + 0.3 * q * q).toFixed(3) + ")" : "";
        }
      }
      function paso(ahora) {
        var dt = Math.min(ahora - antes, 100) / 1000;
        antes = ahora;
        if (visible && !document.hidden) {
          if (!(arrastre && arrastre.mov)) {
            var v = borde ? borde * MAXV : (parado || dedo ? 0 : vel);
            if (v) { pos += v * dt; ajustar(); }
          }
          if (pos !== aplicado) { t.style.transform = "translate3d(" + (-pos) + "px,0,0)"; aplicado = pos; }
          enfatizar();
        }
        requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }

    for (var i = 1; i <= MAX; i++) (function (n) {
      var it = el("div", "it"), im = new Image();
      im.alt = "Trabajo de Service Hogar Belgrano"; im.draggable = false;
      im.onload = function () { if (c.hidden) { c.hidden = false; medir(); } if (++listas === MAX) arrancar(); };
      im.onerror = function () { it.remove(); if (++listas === MAX) arrancar(); };
      im.src = "trabajos/" + n + ".jpg";
      it.appendChild(im);
      t.appendChild(it);
    })(i);
  })();
