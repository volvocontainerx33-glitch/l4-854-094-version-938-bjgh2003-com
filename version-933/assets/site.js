(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('.js-menu-toggle');
    var panel = qs('.js-mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupGlobalSearch() {
    qsa('.js-global-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';

        if (!query) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function setupHero() {
    var hero = qs('.js-hero');

    if (!hero) {
      return;
    }

    var slides = qsa('.hero__slide', hero);
    var dots = qsa('.hero__dot', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var selects = qsa('[data-filter-select]', scope);
      var cards = qsa('.movie-card, .ranking-row', scope);
      var count = qs('[data-result-count]', scope);
      var empty = qs('.empty-state', scope);

      if (!cards.length) {
        return;
      }

      function currentSelectValue(name) {
        var found = selects.filter(function (select) {
          return select.getAttribute('data-filter-select') === name;
        })[0];

        return found ? normalize(found.value) : '';
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var year = currentSelectValue('year');
        var type = currentSelectValue('type');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || cardYear === year;
          var matchesType = !type || cardType.indexOf(type) !== -1;
          var show = matchesQuery && matchesYear && matchesType;

          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '已显示 ' + visible + ' 部';
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      qsa('[data-quick-filter]', scope).forEach(function (button) {
        button.addEventListener('click', function () {
          if (input) {
            input.value = button.getAttribute('data-quick-filter') || '';
          }
          selects.forEach(function (select) {
            select.value = '';
          });
          apply();
        });
      });

      if (document.body.getAttribute('data-page') === 'search' && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      apply();
    });
  }

  setupMobileMenu();
  setupGlobalSearch();
  setupHero();
  setupFilters();
})();
