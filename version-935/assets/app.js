(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initGlobalSearch() {
    document.querySelectorAll('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = './search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var form = document.querySelector('[data-filter-form]');
    var list = document.querySelector('[data-movie-list]');
    if (!form || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var searchInput = form.querySelector('[data-search-input]');
    var typeSelect = form.querySelector('[data-filter-select="type"]');
    var regionSelect = form.querySelector('[data-filter-select="region"]');
    var yearSelect = form.querySelector('[data-filter-select="year"]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query && searchInput) {
      searchInput.value = query;
    }

    function match(card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.type,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      var keyword = normalize(searchInput ? searchInput.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (type && card.dataset.type !== type) {
        return false;
      }
      if (region && card.dataset.region !== region) {
        return false;
      }
      if (year && card.dataset.year !== year) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    apply();
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.visibility = 'hidden';
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video[data-source]');
      var button = player.querySelector('.play-overlay');
      var hls = null;
      var loaded = false;

      if (!video) {
        return;
      }

      function attachSource() {
        if (loaded) {
          return;
        }
        var source = video.dataset.source;
        if (!source) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function play() {
        attachSource();
        player.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initGlobalSearch();
    initHero();
    initFilters();
    initImages();
    initPlayers();
  });
})();
