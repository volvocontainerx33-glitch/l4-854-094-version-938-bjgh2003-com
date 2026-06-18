(function () {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var cover = shell.querySelector('.player-cover');
  var button = shell.querySelector('.play-button');
  var status = shell.querySelector('.player-status');
  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var setStatus = function (message) {
    if (status) {
      status.textContent = message;
    }
  };

  var hideCover = function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  };

  var showCover = function () {
    if (cover) {
      cover.classList.remove('is-hidden');
    }
  };

  var playVideo = function () {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setStatus('点击播放器继续观看');
      });
    }
  };

  if (stream) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('准备就绪');
      });
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络波动，正在重连');
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('播放恢复中');
          hls.recoverMediaError();
        } else {
          setStatus('视频暂时无法加载');
        }
      });
      window.addEventListener('beforeunload', function () {
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      setStatus('准备就绪');
    } else {
      setStatus('浏览器无法加载该视频');
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
  }

  if (cover) {
    cover.addEventListener('click', function () {
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    hideCover();
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    showCover();
    setStatus('暂停');
  });

  video.addEventListener('ended', function () {
    showCover();
    setStatus('播放结束');
  });
})();
