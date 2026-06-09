(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer;

      function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (slide, n) {
          slide.classList.toggle("is-active", n === index);
        });
        dots.forEach(function (dot, n) {
          dot.classList.toggle("is-active", n === index);
        });
      }

      function move(step) {
        show(index + step);
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          move(1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          move(-1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          move(1);
          restart();
        });
      }

      restart();
    }

    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");

    if (input && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }

      function filterCards() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", filterCards);
      filterCards();
    }
  });
})();

function setupPlayer(videoId, overlayId, url) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;

  if (!video || !overlay || !url) {
    return;
  }

  function loadVideo() {
    if (!loaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
      loaded = true;
    }

    overlay.classList.add("hidden");
    var played = video.play();
    if (played && typeof played.catch === "function") {
      played.catch(function () {
        overlay.classList.remove("hidden");
      });
    }
  }

  overlay.addEventListener("click", loadVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      loadVideo();
    } else {
      video.pause();
    }
  });
}
