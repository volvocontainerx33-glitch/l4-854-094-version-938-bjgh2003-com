(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileNavigation() {
        var toggle = document.querySelector('.mobile-toggle');
        var menu = document.querySelector('#mobileNav');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            menu.classList.toggle('open', !expanded);
        });
    }

    function initHeroSlider() {
        var hero = document.querySelector('[data-hero-slider]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function initFilterLayouts() {
        selectAll('.filter-layout').forEach(function (layout) {
            var input = layout.querySelector('.js-filter-input');
            var sort = layout.querySelector('.js-sort-select');
            var cards = selectAll('.movie-card', layout);
            var countOutput = layout.querySelector('.js-result-count');
            var buttons = selectAll('.view-button', layout);
            var originalOrder = cards.slice();

            function updateCount() {
                if (!countOutput) {
                    return;
                }
                var visible = cards.filter(function (card) {
                    return !card.classList.contains('hidden-card');
                }).length;
                countOutput.textContent = String(visible);
            }

            function filterCards() {
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                    card.classList.toggle('hidden-card', query && keywords.indexOf(query) === -1);
                });
                updateCount();
            }

            function sortCards() {
                if (!sort) {
                    return;
                }
                var value = sort.value;
                var sorted = cards.slice();
                if (value === 'year-desc') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    });
                } else if (value === 'year-asc') {
                    sorted.sort(function (a, b) {
                        return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                    });
                } else if (value === 'title-asc') {
                    sorted.sort(function (a, b) {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
                    });
                } else {
                    sorted = originalOrder.slice();
                }
                var grid = layout.querySelector('.card-grid, .search-results, .rank-list');
                if (grid) {
                    sorted.forEach(function (card) {
                        grid.appendChild(card);
                    });
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
                input.addEventListener('input', filterCards);
            }
            if (sort) {
                sort.addEventListener('change', function () {
                    sortCards();
                    filterCards();
                });
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    button.classList.add('active');
                    layout.classList.toggle('list-view', button.getAttribute('data-view') === 'list');
                });
            });
            sortCards();
            filterCards();
        });
    }

    window.initMoviePlayer = function (options) {
        var video = document.querySelector(options.videoSelector);
        var triggers = selectAll(options.triggerSelector || '');
        var streamUrl = options.streamUrl;
        if (!video || !streamUrl) {
            return;
        }
        var bound = false;
        var hlsInstance = null;

        function bindStream() {
            if (bound) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            }
            bound = true;
        }

        function hideTriggers() {
            triggers.forEach(function (trigger) {
                trigger.classList.add('is-hidden');
            });
        }

        function startPlayback() {
            bindStream();
            hideTriggers();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', startPlayback);
        });
        video.addEventListener('play', hideTriggers);
        video.addEventListener('click', function () {
            if (!bound && video.paused) {
                startPlayback();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHeroSlider();
        initFilterLayouts();
    });
})();
