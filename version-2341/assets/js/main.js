(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var keyword = input ? input.value.trim() : "";
            var target = "./search.html";

            if (keyword) {
                target += "?q=" + encodeURIComponent(keyword);
            }

            window.location.href = target;
        });
    });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener("mouseenter", stopHero);
        hero.addEventListener("mouseleave", startHero);
        showSlide(0);
        startHero();
    }

    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (panel && cards.length) {
        var searchInput = panel.querySelector("[data-local-search]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var genreSelect = panel.querySelector("[data-filter-genre]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        function fillSelect(select, values) {
            if (!select) {
                return;
            }

            values.forEach(function (value) {
                if (!value) {
                    return;
                }

                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function uniqueValues(attribute) {
            var set = new Set();

            cards.forEach(function (card) {
                var value = card.getAttribute(attribute) || "";
                value.split(/[\/，,、]+/).forEach(function (part) {
                    var item = part.trim();

                    if (item) {
                        set.add(item);
                    }
                });
            });

            return Array.prototype.slice.call(set).sort(function (a, b) {
                return String(a).localeCompare(String(b), "zh-Hans-CN");
            });
        }

        fillSelect(yearSelect, uniqueValues("data-year"));
        fillSelect(regionSelect, uniqueValues("data-region"));
        fillSelect(genreSelect, uniqueValues("data-genre"));

        if (query && searchInput) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var year = yearSelect ? yearSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";

            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + Array.prototype.map.call(card.attributes, function (attribute) {
                    return attribute.value;
                }).join(" "));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || (card.getAttribute("data-year") || "") === year;
                var matchRegion = !region || (card.getAttribute("data-region") || "").indexOf(region) !== -1;
                var matchGenre = !genre || (card.getAttribute("data-genre") || "").indexOf(genre) !== -1;
                card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchRegion && matchGenre));
            });
        }

        [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();
