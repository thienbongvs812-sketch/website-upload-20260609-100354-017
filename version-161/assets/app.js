const rootPath = document.body.dataset.rootPath || '';
const Hls = window.Hls;
const makePath = (path) => `${rootPath}${path}`;

function setupMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
}

function setupSearch() {
    const inputs = document.querySelectorAll('[data-site-search]');
    const index = window.SITE_SEARCH_INDEX || [];
    inputs.forEach((input) => {
        const panel = input.parentElement.querySelector('[data-search-panel]');
        if (!panel) return;
        const render = () => {
            const query = input.value.trim().toLowerCase();
            if (!query) {
                panel.classList.remove('is-open');
                panel.innerHTML = '';
                return;
            }
            const results = index.filter((item) => {
                const text = `${item.title} ${item.genre} ${item.region} ${item.type} ${item.year}`.toLowerCase();
                return text.includes(query);
            }).slice(0, 10);
            if (!results.length) {
                panel.innerHTML = '<p class="search-empty">没有找到匹配影片</p>';
                panel.classList.add('is-open');
                return;
            }
            panel.innerHTML = results.map((item) => `
                <a class="search-result" href="${makePath(item.url)}">
                    <img src="${makePath(item.image)}" alt="${item.title}">
                    <span>
                        <h3>${item.title}</h3>
                        <p>${item.region} · ${item.type} · ${item.year}</p>
                    </span>
                </a>
            `).join('');
            panel.classList.add('is-open');
        };
        input.addEventListener('input', render);
        input.addEventListener('focus', render);
        document.addEventListener('click', (event) => {
            if (!input.parentElement.contains(event.target)) {
                panel.classList.remove('is-open');
            }
        });
    });
}

function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    let current = 0;
    const show = (next) => {
        current = (next + slides.length) % slides.length;
        slides.forEach((slide, index) => slide.classList.toggle('is-active', index === current));
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
    };
    dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
    window.setInterval(() => show(current + 1), 5200);
}

function setupFilters() {
    const lists = document.querySelectorAll('[data-card-list]');
    lists.forEach((list) => {
        const scope = list.closest('section') || document;
        const cards = Array.from(list.querySelectorAll('[data-movie-card]'));
        const search = scope.querySelector('[data-card-search]');
        const filters = Array.from(scope.querySelectorAll('[data-card-filter]'));
        const empty = scope.querySelector('[data-empty-state]');
        const apply = () => {
            const query = search ? search.value.trim().toLowerCase() : '';
            let visible = 0;
            cards.forEach((card) => {
                const text = `${card.dataset.title} ${card.dataset.genre} ${card.dataset.region} ${card.dataset.type} ${card.dataset.year}`.toLowerCase();
                const matchesQuery = !query || text.includes(query);
                const matchesFilters = filters.every((filter) => {
                    const value = filter.value;
                    if (!value) return true;
                    const key = filter.dataset.cardFilter;
                    return (card.dataset[key] || '').includes(value);
                });
                const show = matchesQuery && matchesFilters;
                card.classList.toggle('is-hidden', !show);
                if (show) visible += 1;
            });
            if (empty) empty.classList.toggle('is-visible', visible === 0);
        };
        if (search) search.addEventListener('input', apply);
        filters.forEach((filter) => filter.addEventListener('change', apply));
        apply();
    });
}

function setupPlayers() {
    const players = document.querySelectorAll('[data-player]');
    players.forEach((box) => {
        const video = box.querySelector('video');
        const trigger = box.querySelector('[data-play-trigger]');
        if (!video || !trigger) return;
        let attached = false;
        const attach = () => {
            if (attached) return;
            attached = true;
            const stream = video.dataset.play;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (Hls && Hls.isSupported()) {
                const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = stream;
            }
        };
        const start = async () => {
            attach();
            box.classList.add('is-playing');
            video.controls = true;
            try {
                await video.play();
            } catch (error) {
                box.classList.remove('is-playing');
            }
        };
        trigger.addEventListener('click', start);
        video.addEventListener('click', () => {
            if (!attached) start();
        });
    });
}

setupMenu();
setupSearch();
setupHero();
setupFilters();
setupPlayers();
