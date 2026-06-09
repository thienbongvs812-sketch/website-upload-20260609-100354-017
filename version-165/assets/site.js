(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
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
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        if (!lists.length) {
            return;
        }
        var searchInput = document.querySelector('[data-local-search]');
        var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
        var selectedYear = 'all';
        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            lists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = (card.getAttribute('data-search') || '').toLowerCase();
                    var year = card.getAttribute('data-year') || '';
                    var matchQuery = !query || searchText.indexOf(query) !== -1;
                    var matchYear = selectedYear === 'all' || year === selectedYear;
                    var show = matchQuery && matchYear;
                    card.classList.toggle('is-hidden-card', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                var empty = document.querySelector('[data-empty-state]');
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            });
        }
        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                selectedYear = button.getAttribute('data-filter-year') || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-player-start]');
            if (!video || !button) {
                return;
            }
            var src = video.getAttribute('data-src');
            var initialized = false;
            function playVideo() {
                if (!src) {
                    return;
                }
                button.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');
                if (initialized) {
                    video.play().catch(function () {});
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = src;
                video.play().catch(function () {});
            }
            button.addEventListener('click', playVideo);
            player.addEventListener('click', function (event) {
                if (event.target === player) {
                    playVideo();
                }
            });
        });
    }

    function setupSearchPage() {
        var input = document.querySelector('[data-search-page-input]');
        var results = document.querySelector('[data-search-results]');
        if (!input || !results || !window.MovieSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;
        function render() {
            var query = input.value.trim().toLowerCase();
            var items = window.MovieSearchIndex;
            if (query) {
                items = items.filter(function (item) {
                    return item.search.toLowerCase().indexOf(query) !== -1;
                });
            }
            items = items.slice(0, 120);
            if (!items.length) {
                results.innerHTML = '<div class="empty-state is-visible">没有找到匹配的影片</div>';
                return;
            }
            results.innerHTML = items.map(function (item) {
                return '<article class="search-result-card">' +
                    '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>' +
                    '<div><h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
                    '<p>' + escapeHtml(item.line) + '</p>' +
                    '<span>' + escapeHtml(item.meta) + '</span></div>' +
                    '</article>';
            }).join('');
        }
        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[char];
            });
        }
        input.addEventListener('input', render);
        render();
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
})();
