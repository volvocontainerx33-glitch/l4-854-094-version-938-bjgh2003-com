
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    initHero();
    initSearch();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length === 0) {
      return;
    }

    var index = 0;
    var timer = null;

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(target);
        start();
      });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector('[data-page-search]');
    var list = document.querySelector('[data-card-list]');

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden-by-search', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }
})();
