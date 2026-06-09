(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isOpen = !mobilePanel.hasAttribute('hidden');
            if (isOpen) {
                mobilePanel.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.textContent = '☰';
            } else {
                mobilePanel.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
                menuButton.textContent = '×';
            }
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var searchPages = document.querySelectorAll('[data-search-page]');
    searchPages.forEach(function (page) {
        var params = new URLSearchParams(window.location.search);
        var queryInput = page.querySelector('[data-search-input]');
        var typeSelect = page.querySelector('[data-type-filter]');
        var yearSelect = page.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(page.querySelectorAll('[data-search]'));
        var empty = page.querySelector('.search-empty');
        var incoming = params.get('q') || '';

        if (queryInput && incoming) {
            queryInput.value = incoming;
        }

        function applyFilter() {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var typeMatch = !typeValue || haystack.indexOf(typeValue.toLowerCase()) !== -1;
                var yearMatch = !yearValue || haystack.indexOf(yearValue.toLowerCase()) !== -1;
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var shouldShow = typeMatch && yearMatch && queryMatch;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible === 0 ? 'block' : 'none';
            }
        }

        if (queryInput) {
            queryInput.addEventListener('input', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        applyFilter();
    });

    function attachStream(video) {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== stream) {
                video.src = stream;
            }
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            }
            return Promise.resolve();
        }

        if (video.src !== stream) {
            video.src = stream;
        }
        return Promise.resolve();
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video[data-stream]');
        var cover = shell.querySelector('.player-cover');
        var button = shell.querySelector('.player-button');

        if (!video) {
            return;
        }

        function playVideo() {
            attachStream(video).then(function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
    });
})();
