(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-filter-year]');
            var type = scope.querySelector('[data-filter-type]');
            var reset = scope.querySelector('[data-filter-reset]');
            var list = document.querySelector('[data-filter-list]');
            var count = document.querySelector('[data-filter-count]');

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' ').toLowerCase();
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesYear = !yearValue || card.dataset.year === yearValue;
                    var matchesType = !typeValue || card.dataset.type === typeValue;
                    var isVisible = matchesKeyword && matchesYear && matchesType;
                    card.style.display = isVisible ? '' : 'none';
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部';
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function setupSearchPage() {
        var resultBox = document.querySelector('[data-search-results]');
        if (!resultBox || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-title]');
        var count = document.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();

        if (input) {
            input.value = query;
        }

        function render(items) {
            resultBox.innerHTML = items.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '    <a class="poster-link" href="' + item.url + '">',
                    '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '        <span class="poster-gradient"></span>',
                    '        <span class="year-badge">' + item.year + '</span>',
                    '        <span class="play-hover">▶ 立即播放</span>',
                    '    </a>',
                    '    <div class="card-body">',
                    '        <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
                    '        <p>' + escapeHtml(item.oneLine || '') + '</p>',
                    '        <div class="meta-row">',
                    '            <a href="' + item.categoryUrl + '">' + escapeHtml(item.categoryName) + '</a>',
                    '            <span>' + escapeHtml(item.region) + '</span>',
                    '            <span>' + escapeHtml(item.type) + '</span>',
                    '        </div>',
                    '        <div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[character];
            });
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        var results;
        if (query) {
            var normalizedQuery = normalize(query);
            results = window.MOVIE_SEARCH_DATA.filter(function (item) {
                return normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags.join(' '),
                    item.oneLine
                ].join(' ')).indexOf(normalizedQuery) !== -1;
            });
        } else {
            results = window.MOVIE_SEARCH_DATA.slice(0, 80);
        }

        results = results.slice(0, 120);
        render(results);

        if (title) {
            title.textContent = query ? '“' + query + '” 的搜索结果' : '热门影片';
        }

        if (count) {
            count.textContent = results.length + ' 部';
        }
    }

    function setupPlayer() {
        var video = document.getElementById('video-player');
        var playButton = document.querySelector('[data-play-button]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var initialized = false;

        function initAndPlay() {
            if (!source) {
                return;
            }

            if (!initialized) {
                initialized = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            if (playButton) {
                playButton.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener('click', initAndPlay);
        }

        video.addEventListener('play', initAndPlay, { once: true });
    }

    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
}());
