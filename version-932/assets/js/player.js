
function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var ready = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('hidden');
    }
  });

  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
