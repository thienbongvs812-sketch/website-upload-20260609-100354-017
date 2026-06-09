(function () {
  window.MoviePlayer = {
    init: function (options) {
      var video = document.querySelector(options.selector);
      var overlay = document.querySelector(options.overlay);
      var button = document.querySelector(options.button);
      var source = options.source;
      var hls = null;
      var loaded = false;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = source;
        }
      }

      function start() {
        attachSource();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          start();
        });
      }
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }
  };
})();
