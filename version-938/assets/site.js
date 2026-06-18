(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    function apply() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-tags") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
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

    if (params.get("q")) {
      input.value = params.get("q");
    }

    input.addEventListener("input", apply);
    apply();
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player]");
    var shell = document.querySelector("[data-player-shell]");
    var button = document.querySelector("[data-play-button]");
    var attached = false;
    var hls = null;

    if (!video || !shell || !button || !sourceUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      attached = true;
    }

    function play() {
      attach();
      shell.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
  });
})();
