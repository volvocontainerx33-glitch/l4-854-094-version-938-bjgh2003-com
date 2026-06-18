
import { H as Hls } from './hls-dru42stk.js';

function initPlayer(root) {
  var video = root.querySelector('video');
  var playButton = root.querySelector('[data-play-button]');
  var hlsSource = root.getAttribute('data-hls');
  var mp4Source = root.getAttribute('data-mp4');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !hlsSource) {
    return;
  }

  function markPlaying() {
    root.classList.add('is-playing');
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (window.location.protocol === 'file:' && mp4Source) {
      video.src = mp4Source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hlsInstance.loadSource(hlsSource);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && mp4Source) {
          hlsInstance.destroy();
          hlsInstance = null;
          video.src = mp4Source;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSource;
    } else if (mp4Source) {
      video.src = mp4Source;
    }
  }

  function play() {
    loadSource();
    markPlaying();

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        root.classList.remove('is-playing');
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', play);
  }

  video.addEventListener('play', markPlaying);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initPlayer);
});
