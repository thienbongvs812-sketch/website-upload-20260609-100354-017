(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHeroSliders();
    initSearchForms();
    initFilters();
    hideMissingImages();
  });

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroSliders() {
    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      if (slides.length <= 1) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
      });
      start();
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
      var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
      var input = root.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-button]'));
      var activeFilters = {};
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var key = button.getAttribute('data-filter-key');
          var value = button.getAttribute('data-filter-value') || '';
          activeFilters[key] = value;
          buttons.filter(function (other) {
            return other.getAttribute('data-filter-key') === key;
          }).forEach(function (other) {
            other.classList.toggle('is-active', other === button);
          });
          applyFilters();
        });
      });
      if (input) {
        input.addEventListener('input', applyFilters);
      }
      applyFilters();
      function applyFilters() {
        var text = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var matchesText = !text || card.getAttribute('data-title').toLowerCase().indexOf(text) !== -1 || card.textContent.toLowerCase().indexOf(text) !== -1;
          var matchesFilters = Object.keys(activeFilters).every(function (key) {
            var filterValue = activeFilters[key];
            if (!filterValue) {
              return true;
            }
            return (card.getAttribute('data-' + key) || '').indexOf(filterValue) !== -1;
          });
          card.style.display = matchesText && matchesFilters ? '' : 'none';
        });
      }
    });
  }

  function hideMissingImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  var hlsLoaderPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }
    hlsLoaderPromise = new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });
    return hlsLoaderPromise;
  }

  window.attachHlsPlayer = function (video, source, button, cover) {
    if (!video || !source) {
      return;
    }
    var prepared = false;
    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }
    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
    function prepare() {
      if (prepared) {
        hideCover();
        playVideo();
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        hideCover();
        playVideo();
        return;
      }
      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            hideCover();
            playVideo();
          });
        } else {
          video.src = source;
          hideCover();
          playVideo();
        }
      });
    }
    if (button) {
      button.addEventListener('click', prepare);
    }
    if (cover) {
      cover.addEventListener('click', prepare);
    }
    video.addEventListener('play', hideCover);
  };
})();
