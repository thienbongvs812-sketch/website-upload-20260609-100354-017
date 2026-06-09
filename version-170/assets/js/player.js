(function() {
  function startPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (!video.getAttribute('data-ready')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
      video.controls = true;
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playResult = video.play();
    if (playResult && playResult.catch) {
      playResult.catch(function() {});
    }
  }

  document.querySelectorAll('[data-player]').forEach(function(box) {
    var cover = box.querySelector('.player-cover');
    var video = box.querySelector('video');
    if (cover) {
      cover.addEventListener('click', function() {
        startPlayer(box);
      });
    }
    if (video) {
      video.addEventListener('click', function() {
        if (!video.getAttribute('data-ready')) {
          startPlayer(box);
        }
      });
    }
  });
})();
