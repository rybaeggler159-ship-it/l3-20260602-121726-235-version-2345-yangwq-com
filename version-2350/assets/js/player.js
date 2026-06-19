(function () {
  function attachStream(video, stream) {
    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1200);
      });
    }

    video.src = stream;
    return Promise.resolve();
  }

  document.querySelectorAll('[data-player-card]').forEach(function (card) {
    var video = card.querySelector('video[data-stream]');
    var button = card.querySelector('[data-player-button]');

    if (!video || !button) {
      return;
    }

    function startPlayback() {
      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      button.hidden = true;
      video.controls = true;

      attachStream(video, stream).then(function () {
        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            button.hidden = false;
          });
        }
      });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  });
})();
