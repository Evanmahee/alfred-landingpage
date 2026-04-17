/**
 * Section « Comment ça marche » : remplissage progressif des numéros 01–04 au scroll.
 * La progression 0 → 1 se fait pendant que la zone des étapes traverse l’écran (haut du bloc
 * qui monte du bas au haut du viewport), pour que le « 04 » soit plein avant que la section parte.
 */
(function () {
  var section = document.getElementById('how');
  if (!section) return;

  var fills = section.querySelectorAll('.s-num__fill');
  if (!fills.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Zone à suivre : la grille d’étapes (plus pertinent que toute la section si le titre est haut). */
  var track = section.querySelector('.steps') || section;

  function update() {
    if (reduceMotion) {
      fills.forEach(function (el) {
        el.style.setProperty('--fill', '1');
      });
      return;
    }

    var rect = track.getBoundingClientRect();
    var vh = window.innerHeight;

    // 0 = le haut du bloc est sous l’écran (vient d’entrer par le bas)
    // 1 = le haut du bloc a atteint le haut du viewport → les 4 chiffres sont remplis, le bloc peut encore occuper tout l’écran en dessous
    var progress;
    if (rect.top >= vh) {
      progress = 0;
    } else if (rect.top <= 0) {
      progress = 1;
    } else {
      progress = 1 - rect.top / vh;
    }
    progress = Math.max(0, Math.min(1, progress));

    for (var i = 0; i < fills.length; i++) {
      var segStart = i / fills.length;
      var segEnd = (i + 1) / fills.length;
      var fill = (progress - segStart) / (segEnd - segStart);
      fill = Math.max(0, Math.min(1, fill));
      fills[i].style.setProperty('--fill', String(fill));
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
