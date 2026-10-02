/* v4 KINETIC — count-up numbers, cursor spotlight, avatar eye tracking */
(function () {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. KINETIC COUNT-UP (reacts to any value change) ---------- */
  function parseNum(s) {
    var m = String(s).match(/-?[\d,]*\.?\d+/);
    return m ? parseFloat(m[0].replace(/,/g, '')) : null;
  }
  function decOf(s) {
    var m = String(s).match(/\.(\d+)/);
    return m ? m[1].length : 0;
  }
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (reduce) return;
    var busy = false;
    var prev = parseNum(el.textContent) || 0;
    var obs = new MutationObserver(function () {
      if (busy) return;
      var final = el.textContent;
      var end = parseNum(final);
      if (end === null) return;
      var start = prev;
      var d = decOf(final);
      busy = true;
      var t0 = performance.now(), dur = 650;
      (function step(now) {
        var p = Math.min((now - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        var v = start + (end - start) * e;
        el.textContent = final.replace(/-?[\d,]*\.?\d+/, v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }));
        if (p < 1) requestAnimationFrame(step);
        else { busy = false; prev = end; }
      })(t0);
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
  });

  /* ---------- 2. CURSOR SPOTLIGHT (luxury flashlight) ---------- */
  if (fine && !reduce) {
    var spot = document.createElement('div');
    spot.style.cssText = 'position:fixed;left:0;top:0;width:520px;height:520px;margin:-260px 0 0 -260px;' +
      'pointer-events:none;z-index:1;border-radius:50%;mix-blend-mode:screen;opacity:.5;' +
      'background:radial-gradient(circle, rgba(129,140,248,0.16), rgba(129,140,248,0.05) 45%, transparent 70%);' +
      'transition:opacity .3s;will-change:transform;';
    document.body.appendChild(spot);
    var sx = -600, sy = -600, px = -600, py = -600;
    window.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
    }, { passive: true });
    (function loop() {
      sx += (px - sx) * .08; sy += (py - sy) * .08;
      spot.style.transform = 'translate(' + sx + 'px,' + sy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 3. READBUDDY: pupils that track the cursor ---------- */
  var le = document.getElementById('leftEye'), re = document.getElementById('rightEye');
  if (le && re && fine && !reduce) {
    [le, re].forEach(function (eye) {
      var pupil = document.createElement('div');
      pupil.style.cssText = 'position:absolute;left:50%;top:50%;width:38%;height:38%;' +
        'margin:-19% 0 0 -19%;border-radius:50%;background:#1c1333;' +
        'transition:transform .08s linear;';
      eye.appendChild(pupil);
    });
    window.addEventListener('pointermove', function (e) {
      [le, re].forEach(function (eye) {
        var r = eye.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = e.clientX - cx, dy = e.clientY - cy;
        var ang = Math.atan2(dy, dx);
        var dist = Math.min(Math.hypot(dx, dy) / 40, 1) * (r.width * 0.16);
        var pupil = eye.firstChild;
        pupil.style.transform = 'translate(' + (Math.cos(ang) * dist) + 'px,' + (Math.sin(ang) * dist) + 'px)';
      });
    }, { passive: true });
  }
})();
