(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5600);
  }

  var input = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-filter]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  var empty = document.querySelector('[data-empty-state]');
  var activeTerm = '';

  var textOf = function (element) {
    return [
      element.getAttribute('data-title') || '',
      element.getAttribute('data-region') || '',
      element.getAttribute('data-genre') || '',
      element.getAttribute('data-year') || '',
      element.getAttribute('data-tags') || '',
      element.textContent || ''
    ].join(' ').toLowerCase();
  };

  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var term = activeTerm.toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = textOf(card);
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedTerm = !term || haystack.indexOf(term) !== -1;
      var show = matchedKeyword && matchedTerm;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  };

  if (input) {
    input.addEventListener('input', applyFilter);
  }

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (input) {
        input.value = '';
      }
      activeTerm = '';
      chips.forEach(function (chip) {
        chip.classList.toggle('active', (chip.getAttribute('data-filter-value') || '') === '');
      });
      applyFilter();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeTerm = chip.getAttribute('data-filter-value') || '';
      chips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      applyFilter();
    });
  });
})();
