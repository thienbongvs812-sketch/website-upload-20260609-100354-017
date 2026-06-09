(function() {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  qsa('[data-hero]').forEach(function(hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });

    show(0);
    if (slides.length > 1) {
      window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }
  });

  qsa('[data-filter-scope]').forEach(function(scope) {
    var input = qs('[data-filter-input]', scope);
    var selects = qsa('[data-filter-select]', scope);
    var cards = qsa('.movie-card', scope);
    var empty = qs('[data-no-results]', scope);

    function norm(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matchCard(card) {
      var text = norm([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var keyword = input ? norm(input.value) : '';
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      for (var i = 0; i < selects.length; i += 1) {
        var select = selects[i];
        var key = select.getAttribute('data-filter-select');
        var selected = norm(select.value);
        if (selected && norm(card.getAttribute('data-' + key)) !== selected) {
          return false;
        }
      }
      return true;
    }

    function applyFilter() {
      var visible = 0;
      cards.forEach(function(card) {
        var matched = matchCard(card);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    selects.forEach(function(select) {
      select.addEventListener('change', applyFilter);
    });
  });
})();
