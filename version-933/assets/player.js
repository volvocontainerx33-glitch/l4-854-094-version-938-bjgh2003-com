(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('.js-video-player');
    var button = shell.querySelector('.js-play-button');
    var status = shell.querySelector('.js-player-status');
    var source = video ? video.getAttribute('data-src') : '';
    var loaded = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function loadSource() {
      if (loaded) {
        return true;
      }

      setStatus('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return true;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放加载失败，请刷新后重试');
          }
        });

        loaded = true;
        return true;
      }

      setStatus('当前浏览器不支持该播放格式');
      return false;
    }

    function startPlayback() {
      if (!loadSource()) {
        return;
      }

      shell.classList.add('is-ready');
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          setStatus('点击播放器继续播放');
        });
      }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('playing', function () {
      shell.classList.add('is-ready');
      setStatus('');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-ready');
      setStatus('播放结束');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.js-video-shell').forEach(setupPlayer);
})();
