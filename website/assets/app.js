/* sharkfin — website behavior
   Static front-end that pulls the latest ISO from the public GitHub API.
   No secrets, no tracking, no frameworks. All text is inserted via textContent. */

(function () {
  "use strict";

  var REPO = "floatingskies/sharkfin";
  var API = "https://api.github.com/repos/" + REPO;

  function $id(id) { return document.getElementById(id); }

  function fetchJSON(url) {
    return fetch(url, { headers: { Accept: "application/vnd.github+json" } }).then(
      function (res) {
        if (!res.ok) {
          var err = new Error("HTTP " + res.status);
          err.status = res.status;
          return err;
        }
        return res.json();
      }
    );
  }

  function fmtBytes(n) {
    if (!n && n !== 0) return "";
    var units = ["B", "kB", "MB", "GB", "TB"];
    var i = 0;
    var v = n;
    while (v >= 1000 && i < units.length - 1) { v /= 1000; i++; }
    return v.toFixed(v >= 10 || i === 0 ? 0 : 1) + " " + units[i];
  }

  /* --- Markdown-lite renderer (DOM-only, XSS-safe) ---------------------- */

  function addInline(parent, s) {
    var re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    var m, last = 0;
    while ((m = re.exec(s))) {
      if (m.index > last) parent.appendChild(document.createTextNode(s.slice(last, m.index)));
      if (m[1].charAt(0) === "`") {
        var code = document.createElement("code");
        code.textContent = m[1].slice(1, -1);
        parent.appendChild(code);
      } else {
        var b = document.createElement("strong");
        b.textContent = m[1].slice(2, -2);
        parent.appendChild(b);
      }
      last = re.lastIndex;
    }
    if (last < s.length) parent.appendChild(document.createTextNode(s.slice(last)));
  }

  function renderNotes(body) {
    var box = $id("release-notes");
    box.textContent = "";
    if (!body) return;
    var ul = null;
    body.split("\n").forEach(function (raw) {
      var line = raw.replace(/\s+$/, "");
      var t = line.trim();
      if (!t) { ul = null; return; }
      if (t.indexOf("## ") === 0) {
        ul = null;
        var h = document.createElement("h3");
        addInline(h, t.slice(3));
        box.appendChild(h);
      } else if (t.indexOf("- ") === 0) {
        if (!ul) { ul = document.createElement("ul"); box.appendChild(ul); }
        var li = document.createElement("li");
        addInline(li, t.slice(2));
        ul.appendChild(li);
      } else {
        ul = null;
        var p = document.createElement("p");
        addInline(p, line);
        box.appendChild(p);
      }
    });
  }

  /* --- Download panel ---------------------------------------------------- */

  function editionInfo(name) {
    var parts = name.split("-");
    var key = parts[1] || "";
    var map = { bluefin: "Bluefin" };
    return { edition: map[key] || key, tag: parts[2] || "" };
  }

  function renderIsoRow(release, asset) {
    var tpl = $id("tpl-iso");
    var node = document.importNode(tpl.content, true);
    var info = editionInfo(asset.name);

    node.querySelector(".iso-name").textContent = asset.name;
    node.querySelector(".iso-edition").textContent = info.edition;
    node.querySelector(".iso-tag").textContent = info.tag;
    node.querySelector(".iso-size").textContent = fmtBytes(asset.size);

    var dl = node.querySelector(".iso-download");
    dl.href = asset.browser_download_url;
    dl.setAttribute("download", asset.name);
    dl.textContent = "Download (" + fmtBytes(asset.size) + ")";

    var sha = node.querySelector(".iso-checksum");
    var viaRelease = asset.browser_download_url.split(/[/?#]/).pop();
    var checksum = release.assets.filter(function (a) {
      return a.name === asset.name + "-CHECKSUM" || a.name === viaRelease + "-CHECKSUM";
    })[0];
    if (checksum) sha.href = checksum.browser_download_url;
    else sha.style.display = "none";

    return node;
  }

  function renderRelease(release) {
    var panel = $id("release-panel");
    panel.textContent = "";
    if (!release || !release.assets) { showNoRelease(); return; }

    var isos = release.assets.filter(function (a) { return /\.iso$/i.test(a.name); });
    if (!isos.length) { showNoRelease(); return; }

    var meta = document.createElement("p");
    meta.className = "hint";
    meta.textContent = "Published " + new Date(release.published_at).toDateString() +
      " · release " + (release.tag_name || "") + " · " + isos.length + " ISO" + (isos.length > 1 ? "s" : "");
    panel.appendChild(meta);

    isos.forEach(function (a) { panel.appendChild(renderIsoRow(release, a)); });
  }

  function showNoRelease() {
    $id("release-panel").setAttribute("hidden", "");
    $id("release-empty").removeAttribute("hidden");
  }

  function showReleaseError(msg) {
    var panel = $id("release-panel");
    panel.textContent = "";
    var p = document.createElement("p");
    p.className = "error";
    p.textContent = msg;
    panel.appendChild(p);
  }

  /* --- Boot ----------------------------------------------------------------- */

  function loadRelease() {
    fetchJSON(API + "/releases/latest").then(function (data) {
      if (data instanceof Error) {
        if (data.status === 404) showNoRelease();
        else showReleaseError("Could not reach the release feed right now (" + data.message + ").");
      } else {
        renderRelease(data);
        renderNotes(data.body);
      }
    }).catch(function () {
      showReleaseError("Could not reach GitHub right now. Check your connection and try again.");
    });
  }

  function loadCommits() {
    var list = $id("commits");
    fetchJSON(API + "/commits?sha=main&per_page=6").then(function (data) {
      if (data instanceof Error || !data.length) {
        list.textContent = "Could not load commits right now.";
        return;
      }
      list.textContent = "";
      data.forEach(function (c) {
        var li = document.createElement("li");
        var sha = document.createElement("span");
        sha.className = "commit-sha";
        sha.textContent = c.sha.slice(0, 7);

        var msg = document.createElement("span");
        msg.className = "commit-msg";
        var a = document.createElement("a");
        a.textContent = (c.commit.message.split("\n")[0] || "").trim();
        a.href = c.html_url;
        a.title = "by " + (c.commit.author && c.commit.author.name ? c.commit.author.name : "?");
        msg.appendChild(a);

        li.appendChild(sha);
        li.appendChild(msg);
        list.appendChild(li);
      });
    }).catch(function () {
      list.textContent = "Could not reach GitHub right now.";
    });
  }

  /* --- Reveal on scroll ------------------------------------------------------- */

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* --- Light / dark mode ------------------------------------------------------- */

  function initTheme() {
    var root = document.documentElement;
    var btn = $id("theme-toggle");
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var chosen = null;
    try { chosen = localStorage.getItem("sharkfin-theme"); } catch (e) { /* private mode */ }

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (btn) btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }

    function current() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }

    if (chosen) apply(chosen);
    else apply(mq.matches ? "light" : "dark");

    if (btn) {
      btn.addEventListener("click", function () {
        var next = current() === "light" ? "dark" : "light";
        chosen = next;
        apply(next);
        try { localStorage.setItem("sharkfin-theme", next); } catch (e) { /* ignore */ }
      });
    }
    if (mq.addEventListener) {
      mq.addEventListener("change", function (ev) {
        if (!chosen) apply(ev.matches ? "light" : "dark");
      });
    }
  }

  loadRelease();
  loadCommits();
  initReveal();
  initTheme();
})();