/* Askew's weekly flyer embed for askewsfoods.com/flyer.
 * Squarespace Code Block:  <div id="askews-flyer"></div>
 *                          <script src="https://askewsfoods.github.io/flyer/embed.js" defer></script>
 * The flyer robot updates flyers.json every week. Each flyer shows from its "show_from" time
 * (Friday 5:00 AM before it starts) until its "show_until" time (end of its Saturday).
 */
(function () {
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/embed\.js.*$/, "") : "https://askewsfoods.github.io/flyer/";

  var CSS = [
    ".askf-flyer{margin:0 0 48px}",
    ".askf-flyer:last-child{margin-bottom:0}",
    ".askf-btnwrap{text-align:center;margin:0 0 17px}",
    /* Squarespace's own button classes style the button on the live site; this is the fallback */
    ".askf-btn{display:block;box-sizing:border-box;width:100%;padding:21px 34px;border:2px solid #009877;border-radius:3px;",
    "  background:transparent;color:#009877;font-family:din-condensed-web,'DIN Condensed','Oswald',Arial Narrow,sans-serif;",
    "  font-size:24px;letter-spacing:.8px;text-transform:uppercase;text-decoration:none;line-height:1.2;transition:opacity .15s}",
    ".askf-btn:hover{opacity:.75}",
    ".askf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0}",
    ".askf-cell{position:relative;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;cursor:zoom-in;",
    "  padding:6%;box-sizing:border-box;background:transparent;border:0;margin:0}",
    ".askf-cell img{max-width:100%;max-height:100%;width:auto;height:auto;display:block;transition:opacity .15s}",
    ".askf-cell:hover img{opacity:.85}",
    ".askf-msg{text-align:center;font-size:16px;color:#555;padding:20px 0}",
    ".askf-lb{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center}",
    ".askf-lb.open{display:flex}",
    ".askf-lb img{max-width:94vw;max-height:88vh;box-shadow:0 4px 30px rgba(0,0,0,.5);background:#fff}",
    ".askf-lb button{position:absolute;background:transparent;border:0;color:#fff;cursor:pointer;font:300 44px/1 Arial,sans-serif;padding:16px;opacity:.8}",
    ".askf-lb button:hover{opacity:1}",
    ".askf-close{top:6px;right:10px}",
    ".askf-prev{left:6px;top:50%;transform:translateY(-50%)}",
    ".askf-next{right:6px;top:50%;transform:translateY(-50%)}",
    ".askf-count{position:absolute;bottom:14px;left:0;right:0;text-align:center;color:#ccc;font:14px Arial,sans-serif}"
  ].join("\n");

  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    return e;
  }

  // ---------- lightbox
  var lb, lbImg, lbCount, lbList = [], lbIndex = 0;
  function buildLightbox() {
    lb = el("div", "askf-lb", { role: "dialog", "aria-label": "Flyer page" });
    lbImg = el("img", "", { alt: "" });
    var close = el("button", "askf-close", { "aria-label": "Close" }); close.innerHTML = "&times;";
    var prev = el("button", "askf-prev", { "aria-label": "Previous page" }); prev.innerHTML = "&#8249;";
    var next = el("button", "askf-next", { "aria-label": "Next page" }); next.innerHTML = "&#8250;";
    lbCount = el("div", "askf-count");
    lb.append(lbImg, close, prev, next, lbCount);
    document.body.appendChild(lb);
    close.onclick = hide;
    prev.onclick = function (e) { e.stopPropagation(); show(lbIndex - 1); };
    next.onclick = function (e) { e.stopPropagation(); show(lbIndex + 1); };
    lb.onclick = function (e) { if (e.target === lb) hide(); };
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(lbIndex - 1);
      if (e.key === "ArrowRight") show(lbIndex + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(lbIndex + (dx < 0 ? 1 : -1));
    });
  }
  function show(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
    lbCount.textContent = (lbIndex + 1) + " / " + lbList.length;
    lb.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }
  function hide() {
    lb.classList.remove("open");
    document.documentElement.style.overflow = "";
  }

  // ---------- render
  function pick(flyers, now) {
    var live = flyers.filter(function (f) { return Date.parse(f.show_from) <= now && now < Date.parse(f.show_until); });
    if (!live.length) {
      // Nothing scheduled right now (e.g. a late flyer) - show the most recent one that has started
      var started = flyers.filter(function (f) { return Date.parse(f.show_from) <= now; });
      started.sort(function (a, b) { return Date.parse(b.show_from) - Date.parse(a.show_from); });
      live = started.slice(0, 1);
    }
    live.sort(function (a, b) { return Date.parse(a.show_from) - Date.parse(b.show_from); }); // current week first
    return live;
  }

  function render(root, data) {
    var flyers = pick(data.flyers || [], Date.now());
    root.innerHTML = "";
    if (!flyers.length) {
      root.appendChild(el("p", "askf-msg")).textContent = "This week's flyer is coming soon.";
      return;
    }
    flyers.forEach(function (f) {
      var box = el("div", "askf-flyer");
      var wrap = el("div", "askf-btnwrap sqs-block-button-container sqs-block-button-container--center");
      var a = el("a", "askf-btn sqs-block-button-element--medium sqs-button-element--primary sqs-block-button-element",
                 { href: f.pdf, target: "_blank", rel: "noopener" });
      a.textContent = f.button;
      wrap.appendChild(a);
      var grid = el("div", "askf-grid");
      f.images.forEach(function (src, i) {
        var cell = el("button", "askf-cell", { type: "button", "aria-label": "View page " + (i + 1) + " full size" });
        var img = el("img", "", { src: src, alt: f.button.replace(" (.PDF)", "") + " flyer, page " + (i + 1),
                                  loading: "lazy", decoding: "async" });
        cell.appendChild(img);
        cell.onclick = function () { lbList = f.images; show(i); };
        grid.appendChild(cell);
      });
      box.append(wrap, grid);
      root.appendChild(box);
    });
  }

  function start() {
    var root = document.getElementById("askews-flyer");
    if (!root || root.dataset.askfDone) return;
    root.dataset.askfDone = "1";
    var style = el("style"); style.textContent = CSS; document.head.appendChild(style);
    buildLightbox();
    root.appendChild(el("p", "askf-msg")).textContent = "Loading this week's flyer…";
    // cache-bust every 5 minutes so the Friday switch-over shows promptly
    fetch(BASE + "flyers.json?t=" + Math.floor(Date.now() / 300000))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { render(root, data); })
      .catch(function () {
        root.innerHTML = "";
        root.appendChild(el("p", "askf-msg")).textContent = "Sorry, the flyer couldn't load. Please refresh the page.";
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
