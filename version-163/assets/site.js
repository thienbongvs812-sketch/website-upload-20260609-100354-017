(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }
    function go(step) {
      show(current + step);
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        go(1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        go(1);
        start();
      });
    }
    var hero = document.querySelector(".hero-slider");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function initGlobalSearch() {
    var input = document.getElementById("globalSearchInput");
    var results = document.getElementById("globalSearchResults");
    var data = window.SEARCH_INDEX || [];
    if (!input || !results || !data.length) {
      return;
    }
    function render(items) {
      results.innerHTML = "";
      results.hidden = false;
      if (!items.length) {
        var empty = document.createElement("div");
        empty.className = "empty-result";
        empty.textContent = "没有匹配影片";
        results.appendChild(empty);
        return;
      }
      items.slice(0, 12).forEach(function (item) {
        var link = document.createElement("a");
        link.href = item.url;
        var image = document.createElement("img");
        image.src = item.cover;
        image.alt = item.title;
        var text = document.createElement("span");
        var title = document.createElement("strong");
        title.textContent = item.title;
        var meta = document.createElement("span");
        meta.textContent = item.meta;
        text.appendChild(title);
        text.appendChild(meta);
        link.appendChild(image);
        link.appendChild(text);
        results.appendChild(link);
      });
    }
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      var found = data.filter(function (item) {
        return item.query.indexOf(q) !== -1;
      });
      render(found);
    });
    document.addEventListener("click", function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.hidden = true;
      }
    });
  }

  function initLocalFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var input = document.querySelector(".local-filter-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".local-filter-select"));
    var empty = document.querySelector(".filter-empty");
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter-field")] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && String(card.dataset[key] || "") !== filters[key]) {
            matched = false;
          }
        });
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  function initLibrarySearch() {
    var input = document.querySelector(".library-filter-input");
    var scope = document.querySelector("[data-library-scope]");
    if (!input || !scope) {
      return;
    }
    var items = Array.prototype.slice.call(scope.querySelectorAll("li"));
    var empty = document.querySelector(".filter-empty");
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var matched = !keyword || item.textContent.toLowerCase().indexOf(keyword) !== -1;
        item.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      if (!video || !stream) {
        return;
      }
      function start() {
        player.classList.add("is-active");
        if (player.getAttribute("data-ready") !== "1") {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
          player.setAttribute("data-ready", "1");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilters();
    initLibrarySearch();
    initPlayers();
  });
})();
