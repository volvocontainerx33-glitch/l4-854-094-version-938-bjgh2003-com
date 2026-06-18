import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initNavigation() {
  const toggle = $('[data-nav-toggle]');
  const panel = $('[data-nav-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function initHero() {
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');

  if (slides.length <= 1) {
    return;
  }

  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(active + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  const carousel = $('.hero-carousel');

  if (carousel) {
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
  }

  show(0);
  start();
}

function initPageFiltering() {
  const searchInput = $('[data-card-search]');
  const sortSelect = $('[data-card-sort]');
  const grid = $('[data-card-grid]');
  const empty = $('[data-empty-state]');

  if (!grid) {
    return;
  }

  const filterCards = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const cards = $$('.movie-card', grid);
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.dataset.search || '').toLowerCase();
      const matched = !keyword || text.includes(keyword);
      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  const sortCards = () => {
    if (!sortSelect) {
      return;
    }

    const cards = $$('.movie-card', grid);
    const mode = sortSelect.value;

    cards.sort((left, right) => {
      if (mode === 'title') {
        return (left.dataset.title || '').localeCompare(right.dataset.title || '', 'zh-Hans-CN');
      }

      const leftYear = parseInt(left.dataset.year || '0', 10) || 0;
      const rightYear = parseInt(right.dataset.year || '0', 10) || 0;
      return rightYear - leftYear;
    });

    cards.forEach((card) => grid.appendChild(card));
    filterCards();
  };

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }

  sortCards();
  filterCards();
}

function initPlayer() {
  const video = $('[data-player]');
  const button = $('[data-play-button]');

  if (!video || !button) {
    return;
  }

  const source = video.dataset.src;
  let initialized = false;
  let hlsInstance = null;

  const bindSource = () => {
    if (initialized || !source) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      window.__movieHlsPlayer = hlsInstance;
      return;
    }

    video.src = source;
  };

  button.addEventListener('click', async () => {
    bindSource();
    video.controls = true;
    button.classList.add('is-hidden');

    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
    }
  });

  video.addEventListener('play', () => {
    button.classList.add('is-hidden');
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

function initGlobalSearch() {
  const results = $('[data-search-results]');

  if (!results || !window.MOVIE_INDEX) {
    return;
  }

  const keywordInput = $('[data-global-keyword]');
  const regionSelect = $('[data-global-region]');
  const typeSelect = $('[data-global-type]');
  const yearSelect = $('[data-global-year]');
  const empty = $('[data-global-empty]');
  const movies = window.MOVIE_INDEX;

  const fillOptions = (select, values) => {
    if (!select) {
      return;
    }

    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  fillOptions(regionSelect, [...new Set(movies.map((movie) => movie.region).filter(Boolean))].sort());
  fillOptions(typeSelect, [...new Set(movies.map((movie) => movie.type).filter(Boolean))].sort());
  fillOptions(yearSelect, [...new Set(movies.map((movie) => movie.year).filter(Boolean))].sort((a, b) => b.localeCompare(a)));

  const card = (movie) => `
    <article class="movie-card" data-year="${movie.year}" data-title="${movie.title}">
      <a class="poster-wrap" href="${movie.url}">
        <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
        <span class="poster-glow"></span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <a href="${movie.categoryUrl}">${movie.category}</a>
          <span>${movie.year}</span>
        </div>
        <h3><a href="${movie.url}">${movie.title}</a></h3>
        <p>${movie.oneLine}</p>
        <div class="tag-row">
          ${movie.tags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    </article>`;

  const render = () => {
    const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    const region = regionSelect ? regionSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    const year = yearSelect ? yearSelect.value : '';

    const filtered = movies.filter((movie) => {
      const text = movie.searchText.toLowerCase();
      return (!keyword || text.includes(keyword)) &&
        (!region || movie.region === region) &&
        (!type || movie.type === type) &&
        (!year || movie.year === year);
    }).slice(0, 120);

    results.innerHTML = filtered.map(card).join('');

    if (empty) {
      empty.classList.toggle('is-visible', filtered.length === 0);
    }
  };

  [keywordInput, regionSelect, typeSelect, yearSelect].forEach((element) => {
    if (element) {
      element.addEventListener('input', render);
      element.addEventListener('change', render);
    }
  });

  render();
}

initNavigation();
initHero();
initPageFiltering();
initPlayer();
initGlobalSearch();
