(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-list]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        if (!input || !cards.length) {
            return;
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.style.display = haystack.indexOf(keyword) >= 0 ? '' : 'none';
            });
        });
    });

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderSearchResults(items, keyword) {
        if (!searchResults) {
            return;
        }

        if (!keyword) {
            searchResults.innerHTML = '';
            return;
        }

        if (!items.length) {
            searchResults.innerHTML = '<div class="content-card"><h2>暂无匹配影片</h2><p>可以尝试输入年份、地区、类型或更短的关键词。</p></div>';
            return;
        }

        var cards = items.slice(0, 80).map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-frame" href="' + escapeHtml(movie.url) + '">',
                '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '</a>',
                '<div class="movie-card-body">',
                '<a class="movie-card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
                '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<p>' + escapeHtml(movie.intro) + '</p>',
                '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');

        searchResults.innerHTML = '<div class="section-heading"><div><span class="section-kicker">搜索结果</span><h2>' + escapeHtml(keyword) + '</h2></div></div><div class="movie-grid compact-grid">' + cards + '</div>';
    }

    function runSearch() {
        if (!searchInput || !window.SEARCH_MOVIES) {
            return;
        }
        var keyword = searchInput.value.trim().toLowerCase();
        var matches = window.SEARCH_MOVIES.filter(function (movie) {
            return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.intro].join(' ').toLowerCase().indexOf(keyword) >= 0;
        });
        renderSearchResults(matches, searchInput.value.trim());
    }

    if (searchForm && searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q');
        if (initialKeyword) {
            searchInput.value = initialKeyword;
            runSearch();
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });

        searchInput.addEventListener('input', function () {
            runSearch();
        });
    }
})();
