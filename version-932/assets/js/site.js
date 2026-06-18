
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var index = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var input = searchPage.querySelector('[data-filter-input]');
    var region = searchPage.querySelector('[data-filter-region]');
    var year = searchPage.querySelector('[data-filter-year]');
    var items = Array.prototype.slice.call(searchPage.querySelectorAll('.searchable-item'));
    var empty = searchPage.querySelector('.empty-result');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var shown = 0;

      items.forEach(function (item) {
        var text = normalize(item.getAttribute('data-text'));
        var itemRegion = item.getAttribute('data-region') || '';
        var itemYear = item.getAttribute('data-year') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || itemRegion.indexOf(regionValue) !== -1;
        var matchYear = !yearValue || itemYear === yearValue;
        var visible = matchKeyword && matchRegion && matchYear;
        item.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
