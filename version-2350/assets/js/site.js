(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('[data-poster-img]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function restartSlider() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartSlider();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartSlider();
    });
  });

  restartSlider();

  function inYearRange(year, range) {
    if (range === 'recent') {
      return year >= 2025;
    }

    if (range === '2020s') {
      return year >= 2020 && year <= 2024;
    }

    if (range === '2010s') {
      return year >= 2010 && year <= 2019;
    }

    if (range === 'classic') {
      return year <= 2009;
    }

    return true;
  }

  document.querySelectorAll('.catalog-filter').forEach(function (panel) {
    var queryInput = panel.querySelector('[data-filter-query]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var scope = panel.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var yearValue = yearSelect ? yearSelect.value : 'all';
      var typeValue = typeSelect ? typeSelect.value : 'all';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var year = Number(card.getAttribute('data-year')) || 0;
        var type = card.getAttribute('data-type') || '';
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesYear = inYearRange(year, yearValue);
        var matchesType = typeValue === 'all' || type.indexOf(typeValue) !== -1;

        card.classList.toggle('is-hidden', !(matchesQuery && matchesYear && matchesType));
      });
    }

    [queryInput, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  });


  function escapeText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var searchForm = document.querySelector('[data-site-search]');
  var searchBox = document.querySelector('[data-search-results]');

  if (searchForm && searchBox && window.MovieSearchData) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var formData = new FormData(searchForm);
      var query = String(formData.get('q') || '').trim().toLowerCase();

      if (!query) {
        searchBox.classList.remove('is-open');
        searchBox.innerHTML = '';
        return;
      }

      var matches = window.MovieSearchData.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 12);

      if (!matches.length) {
        searchBox.innerHTML = '<p class="movie-line">没有找到匹配影片</p>';
        searchBox.classList.add('is-open');
        return;
      }

      searchBox.innerHTML = matches.map(function (item) {
        return [
          '<a class="search-result-item" href="' + escapeText(item.url) + '">',
          '<img src="' + escapeText(item.poster) + '" alt="' + escapeText(item.title) + '">',
          '<span><strong>' + escapeText(item.title) + '</strong><span>' + escapeText(item.year) + ' · ' + escapeText(item.region) + ' · ' + escapeText(item.genre) + '</span></span>',
          '</a>'
        ].join('');
      }).join('');
      searchBox.classList.add('is-open');
    });
  }
})();
