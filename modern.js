/* v7 MODERN WEB PACK — progress bar, kinetic split titles */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll progress bar ---------- */
  var bar = document.createElement('div');
  bar.id = 'fx-progress';
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var h = document.documentElement;
    var max = h.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(updateBar); ticking = true; }
  }, { passive: true });
  updateBar();

  /* ---------- kinetic split-letter titles ---------- */
  function splitLetters(el) {
    if (!el || el.dataset.fxSplit) return;
    el.dataset.fxSplit = '1';
    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(function (line) {
      // wrap each letter of text inside the (possibly nested span) line
      return line.replace(/>([^<]+)</g, function (m, text) {
        return '>' + text.split('').map(function (ch) {
          return ch === ' ' ? ' ' : '<span class="kl">' + ch + '</span>';
        }).join('') + '<';
      }).replace(/^([^<]+)/, function (m) {
        return m.split('').map(function (ch) {
          return ch === ' ' ? ' ' : '<span class="kl">' + ch + '</span>';
        }).join('');
      });
    }).join('<br>');
    var letters = el.querySelectorAll('.kl');
    letters.forEach(function (l, i) {
      l.animate([
        { transform: 'translateY(55px) rotate(6deg) scale(.8)', opacity: 0 },
        { transform: 'none', opacity: 1 }
      ], { duration: 700, delay: 120 + i * 26, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
    });
  }
  if (!reduce) {
    var t = document.querySelector('.hero-title') || document.querySelector('.lg-brand-name');
    if (t) splitLetters(t);
  }
})();
