/**
 * Avis : défilement auto (boucle) + drag horizontal + curseur « Drag ».
 * La position est tenue en float pour éviter que le navigateur n’ignore les micro-incréments sur scrollLeft.
 */
(function () {
  var strip = document.querySelector('.feedback-strip');
  var cursor = document.getElementById('fb-drag-cursor');
  if (!strip) return;

  var marquees = strip.querySelectorAll('.feedback-marquee');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Durée pour parcourir une moitié de piste (une boucle sans couture), en ms — lisible tout en doux */
  var DURATION_MS = 55000;

  function setupMarquee(el) {
    var isDown = false;
    var startX = 0;
    var startScroll = 0;
    var reverse = el.classList.contains('feedback-marquee--rev');
    var last = performance.now();
    /** Position logique de défilement (float — ne pas arrondir via scrollLeft seul) */
    var scrollPos = 0;

    function loopWidth() {
      return el.scrollWidth / 2;
    }

    function canScroll() {
      return el.scrollWidth > el.clientWidth + 2;
    }

    function wrapPos(pos, w) {
      if (!w) return pos;
      var p = pos;
      while (p >= w) p -= w;
      while (p < 0) p += w;
      return p;
    }

    function applyScrollPos() {
      var w = loopWidth();
      if (!w || !canScroll()) return;
      scrollPos = wrapPos(scrollPos, w);
      el.scrollLeft = scrollPos;
    }

    function syncFromElement() {
      var w = loopWidth();
      if (!w) return;
      scrollPos = wrapPos(el.scrollLeft, w);
    }

    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isDown = true;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      scrollPos = wrapPos(startScroll, loopWidth());
      el.classList.add('is-dragging');
      document.body.classList.add('fb-drag-active');
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
      document.body.classList.remove('fb-drag-active');
      syncFromElement();
      last = performance.now();
    }

    document.addEventListener('mouseup', endDrag);

    document.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      el.scrollLeft = startScroll - (e.pageX - startX);
      scrollPos = el.scrollLeft;
    });

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      isDown = true;
      startX = e.touches[0].pageX;
      startScroll = el.scrollLeft;
      scrollPos = wrapPos(startScroll, loopWidth());
      el.classList.add('is-dragging');
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (!isDown || e.touches.length !== 1) return;
      el.scrollLeft = startScroll - (e.touches[0].pageX - startX);
      scrollPos = el.scrollLeft;
    }, { passive: true });

    el.addEventListener('touchend', endDrag);
    el.addEventListener('touchcancel', endDrag);

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        var w = loopWidth();
        if (!w || !canScroll()) return;
        scrollPos = wrapPos(scrollPos, w);
        el.scrollLeft = scrollPos;
      });
      ro.observe(el);
    }

    function tick(now) {
      var w = loopWidth();
      var dt = Math.min(now - last, 64);
      last = now;

      if (!reduceMotion && !isDown && w > 0 && canScroll()) {
        var pxPerMs = w / DURATION_MS;
        scrollPos += reverse ? -pxPerMs * dt : pxPerMs * dt;
        scrollPos = wrapPos(scrollPos, w);
        el.scrollLeft = scrollPos;
      }

      requestAnimationFrame(tick);
    }

    function boot() {
      syncFromElement();
      applyScrollPos();
      last = performance.now();
      requestAnimationFrame(tick);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot);
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(boot);
      });
    }
  }

  marquees.forEach(setupMarquee);

  if (cursor && finePointer) {
    strip.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    strip.addEventListener('mouseenter', function () {
      cursor.classList.add('is-visible');
    });
    strip.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
    });
  }
})();
