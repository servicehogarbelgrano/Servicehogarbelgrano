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
    ["Lavavajillas","lavarropas-secarropas-lavavajillas-belgrano.html",["No desagota","No lava bien","Pierde agua","No seca","No prende"]],
    ["Secarropas","lavarropas-secarropas-lavavajillas-belgrano.html",["No gira","Hace ruido","No frena","No prende"]],
    ["Secadora","lavarropas-secarropas-lavavajillas-belgrano.html",["No seca","No gira","Hace ruido","No prende"]],
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

  /* Collage de fotos: subí las fotos a la carpeta trabajos/ como 1.jpg, 2.jpg, 3.jpg... y aparecen solas */
  (function () {
    var c = document.getElementById("collage");
    if (!c) return;
    function abrir(src) {
      var f = el("div", "luz"), im = new Image();
      im.src = src; im.alt = "Trabajo de Service Hogar Belgrano";
      f.appendChild(im);
      f.onclick = function () { f.remove(); };
      document.body.appendChild(f);
    }
    for (var i = 1; i <= 30; i++) (function (n) {
      var im = new Image();
      im.alt = "Trabajo de Service Hogar Belgrano";
      im.onload = function () { c.hidden = false; };
      im.onerror = function () { im.remove(); };
      im.onclick = function () { abrir(im.src); };
      im.src = "trabajos/" + n + ".jpg";
      c.appendChild(im);
    })(i);
  })();
