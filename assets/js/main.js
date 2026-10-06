/* ==========================================================================
   main.js — Menü, tema, sayfa içi içindekiler, tablo sarmalayıcı, yazdır
   Harici kütüphane kullanmaz.
   ========================================================================== */
(function () {
  "use strict";
  var kok = document.documentElement;

  /* Mobil menü */
  var menuDugme = document.querySelector(".menu-dugme");
  var menu = document.getElementById("ana-menu");
  if (menuDugme && menu) {
    menuDugme.addEventListener("click", function () {
      var acik = menuDugme.getAttribute("aria-expanded") === "true";
      menuDugme.setAttribute("aria-expanded", String(!acik));
      menu.classList.toggle("acik", !acik);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("acik")) {
        menuDugme.setAttribute("aria-expanded", "false");
        menu.classList.remove("acik");
        menuDugme.focus();
      }
    });
  }

  /* Tema: açık / koyu (seçim tarayıcıda hatırlanır) */
  var temaDugme = document.querySelector("[data-tema-dugme]");
  function etkinTema() {
    var t = kok.getAttribute("data-tema");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "koyu" : "acik";
  }
  function etiketGuncelle() {
    if (!temaDugme) return;
    temaDugme.setAttribute("aria-label", etkinTema() === "koyu" ? "Açık temaya geç" : "Koyu temaya geç");
  }
  if (temaDugme) {
    etiketGuncelle();
    temaDugme.addEventListener("click", function () {
      var yeni = etkinTema() === "koyu" ? "acik" : "koyu";
      kok.setAttribute("data-tema", yeni);
      try { localStorage.setItem("tema", yeni); } catch (e) {}
      etiketGuncelle();
    });
  }

  /* Geniş ekranda bölüm menüsünü açık tut */
  var genis = window.matchMedia("(min-width: 861px)");
  function bolumlerAyar() {
    document.querySelectorAll("details[data-genis-acik]").forEach(function (d) {
      if (genis.matches) d.setAttribute("open", "");
      else if (!d.dataset.kullanici) d.removeAttribute("open");
    });
  }
  bolumlerAyar();
  if (genis.addEventListener) genis.addEventListener("change", bolumlerAyar);
  document.querySelectorAll("details[data-genis-acik] summary").forEach(function (s) {
    s.addEventListener("click", function () { s.parentElement.dataset.kullanici = "1"; });
  });

  /* Tabloları yatay kaydırılabilir kaba sar */
  document.querySelectorAll(".metin table").forEach(function (t) {
    if (t.parentElement.classList.contains("tablo-kap")) return;
    var kap = document.createElement("div");
    kap.className = "tablo-kap";
    kap.setAttribute("tabindex", "0");
    kap.setAttribute("role", "region");
    kap.setAttribute("aria-label", "Tablo");
    t.parentNode.insertBefore(kap, t);
    kap.appendChild(t);
  });

  /* "Bu sayfada": h2 ve h3 başlıklarından otomatik içindekiler */
  var toc = document.querySelector("[data-sayfa-ici]");
  var basliklar = document.querySelectorAll(".metin h2[id], .metin h3[id]");
  if (toc && basliklar.length > 1) {
    var liste = toc.querySelector("ol");
    var baglar = [];
    basliklar.forEach(function (h) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      if (h.tagName === "H3") a.className = "alt-baslik";
      li.appendChild(a);
      liste.appendChild(li);
      baglar.push(a);
    });
    toc.hidden = false;

    if ("IntersectionObserver" in window) {
      var gorunen = new Map();
      var gozlemci = new IntersectionObserver(function (girdiler) {
        girdiler.forEach(function (g) { gorunen.set(g.target.id, g.isIntersecting); });
        var etkin = null;
        basliklar.forEach(function (h) { if (!etkin && gorunen.get(h.id)) etkin = h.id; });
        if (etkin) baglar.forEach(function (a) { a.classList.toggle("etkin", a.getAttribute("href") === "#" + etkin); });
      }, { rootMargin: "-80px 0px -60% 0px" });
      basliklar.forEach(function (h) { gozlemci.observe(h); });
    }
  }

  /* Satır numaralı kod blokları: <div class="satir-numarali" markdown="1"> */
  document.querySelectorAll(".satir-numarali pre code").forEach(function (kod) {
    var satirlar = kod.innerHTML.replace(/\n$/, "").split("\n");
    kod.innerHTML = satirlar.map(function (s) { return '<span class="satir">' + (s || " ") + "</span>"; }).join("");
  });

  /* Yazdır düğmesi */
  document.querySelectorAll("[data-yazdir]").forEach(function (d) {
    d.addEventListener("click", function () { window.print(); });
  });
})();
