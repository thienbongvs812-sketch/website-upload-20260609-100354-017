(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-nav-toggle]');
  var panel = qs('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  if (slides.length > 1) {
    var current = 0;
    var setSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        setSlide(idx);
      });
    });
    window.setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  var grids = qsa('[data-filter-scope]');
  grids.forEach(function (scope) {
    var input = qs('[data-local-search]', scope);
    var typeSelect = qs('[data-type-filter]', scope);
    var yearSelect = qs('[data-year-filter]', scope);
    var sortSelect = qs('[data-sort]', scope);
    var list = qs('[data-card-list]', scope);
    var empty = qs('[data-empty]', scope);
    if (!list) {
      return;
    }
    var cards = qsa('.movie-card', list);
    var params = new URLSearchParams(window.location.search);
    var initialQ = params.get('q') || '';
    if (input && initialQ) {
      input.value = initialQ;
    }
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var match = true;
        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (type && cardType !== type) {
          match = false;
        }
        if (year && cardYear !== year) {
          match = false;
        }
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    var sortCards = function () {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year-asc') {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        }
        if (mode === 'score-desc') {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        }
        if (mode === 'title-asc') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      apply();
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    sortCards();
    apply();
  });
})();
