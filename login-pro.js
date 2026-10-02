// ULTRA LUXURY PRO MAX — login enhancement layer
// Purely additive visuals; never touches submit/redirect logic.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    var stage = document.querySelector('.lg-stage') || document.body;

    // 1. Aurora mesh blobs
    var au = document.createElement('div');
    au.className = 'lg-aurora';
    au.innerHTML = '<i></i><i></i><i></i>';
    stage.insertBefore(au, stage.firstChild);

    // 2. Gold-dust particle canvas
    var cv = document.createElement('canvas');
    cv.className = 'lg-dust';
    stage.appendChild(cv);
    var ctx = cv.getContext('2d');
    var W, H, dots = [];
    var accent = getComputedStyle(stage).getPropertyValue('--p2').trim() || '#f5b942';
    function hexRgb(h) {
      h = h.replace('#', '');
      if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
      var n = parseInt(h, 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    var rgb = hexRgb(accent);
    function resize() {
      W = cv.width = window.innerWidth; H = cv.height = window.innerHeight;
    }
    resize(); window.addEventListener('resize', resize);
    for (var i = 0; i < 42; i++) dots.push({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6,
      s: 0.06 + Math.random() * 0.28, o: 0.15 + Math.random() * 0.5, t: Math.random() * 6.28
    });
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y -= d.s / H * 60; d.t += 0.02;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        var a = d.o * (0.6 + 0.4 * Math.sin(d.t));
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, 6.28);
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
        ctx.fill();
      }
      requestAnimationFrame(loop);
    })();

    // 3. Staggered blur-in of card contents
    var kids = document.querySelectorAll('.lg-card > *:not(.lg-halo)');
    Array.prototype.forEach.call(kids, function (el, i) {
      el.classList.add('lg-pro-in');
      el.style.animationDelay = (0.12 + i * 0.08) + 's';
      requestAnimationFrame(function () { el.classList.add('lg-pro-go'); });
    });

    // 4. Title decode / scramble effect
    var title = document.querySelector('.lg-title');
    if (title && !reduce) {
      var final = title.textContent, CH = 'AEIOUXYZ#<>/*—+',
          fr = 0, q = [];
      for (var j = 0; j < final.length; j++) q.push({ start: 6 + j * 2, end: 18 + j * 2, ch: final[j] });
      (function tick() {
        var out = '', done = 0;
        for (var k = 0; k < q.length; k++) {
          if (fr >= q[k].end) { out += q[k].ch; done++; }
          else if (fr >= q[k].start) out += CH[Math.floor(Math.random() * CH.length)];
          else out += q[k].ch;
        }
        title.textContent = out; fr++;
        if (done < q.length) requestAnimationFrame(tick);
      })();
    }

    // 5. 3D tilt on the card + magnetic CTA
    var card = document.getElementById('lgCard'), cta = document.getElementById('lgCta'),
        zone = document.querySelector('.lg-center') || stage;
    if (card && !reduce) {
      card.classList.add('lg-tilt');
      zone.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        card.style.transform = 'perspective(950px) rotateX(' + (-dy * 4.5).toFixed(2) + 'deg) rotateY(' + (dx * 6.5).toFixed(2) + 'deg)';
      });
      zone.addEventListener('mouseleave', function () { card.style.transform = ''; });
    }
    if (cta && !reduce) {
      cta.addEventListener('mousemove', function (e) {
        var r = cta.getBoundingClientRect();
        cta.style.transform = 'translate(' + ((e.clientX - (r.left + r.width / 2)) * 0.16).toFixed(1) + 'px,' + ((e.clientY - (r.top + r.height / 2)) * 0.22).toFixed(1) + 'px)';
      });
      cta.addEventListener('mouseleave', function () { cta.style.transform = ''; });
    }
  } catch (e) { /* enhancement layer never breaks the login */ }
})();
