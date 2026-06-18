(function () {
  var loadingHls = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (loadingHls) {
      return loadingHls;
    }

    loadingHls = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return loadingHls;
  }

  window.setupCinemaPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.querySelector(options.buttonSelector);
    var shell = video ? video.closest(".player-shell") : null;
    var source = options.source;
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function markPlaying() {
      if (shell) {
        shell.classList.add("is-playing");
      }
    }

    function markPaused() {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    }

    function attachSource() {
      if (attached) {
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        attached = true;
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              attached = false;
            }
          });
          attached = true;
        } else {
          video.src = source;
          attached = true;
        }
      });
    }

    function start() {
      attachSource().then(function () {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            markPaused();
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", markPlaying);
    video.addEventListener("pause", markPaused);
    video.addEventListener("ended", markPaused);

    attachSource();

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
}());
