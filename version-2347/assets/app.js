(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1 && dots.length) {
        var current = 0;
        var show = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-filter-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');
    var applyFilter = function () {
        if (!cards.length) {
            return;
        }
        var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var genre = (card.getAttribute('data-genre') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardRegion = card.getAttribute('data-region') || '';
            var matched = (!q || title.indexOf(q) > -1 || genre.indexOf(q) > -1) && (!year || cardYear === year) && (!region || cardRegion.indexOf(region) > -1);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    };
    [searchInput, yearSelect, regionSelect].forEach(function (item) {
        if (item) {
            item.addEventListener('input', applyFilter);
            item.addEventListener('change', applyFilter);
        }
    });
})();

function initVideoPlayer(sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    if (!video || !sourceUrl) {
        return;
    }
    var started = false;
    var start = function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = sourceUrl;
        video.play().catch(function () {});
    };
    if (cover) {
        cover.addEventListener('click', start);
    }
    video.addEventListener('click', start);
}
