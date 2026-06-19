(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var isHidden = menu.hasAttribute('hidden');
      if (isHidden) {
        menu.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        menu.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-pressed', dotIndex === current ? 'true' : 'false');
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var panels = document.querySelectorAll('.filter-panel');
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-target') || '.movie-grid';
      var scope = document.querySelector(scopeSelector);
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var input = panel.querySelector('.filter-input');
      var select = panel.querySelector('.filter-select');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('.filter-chip'));
      var emptyState = document.querySelector(panel.getAttribute('data-empty') || '.empty-state');
      var activeGenre = 'all';

      function normalized(value) {
        return String(value || '').toLowerCase();
      }

      function sortCards() {
        if (!select) {
          return;
        }
        var mode = select.value;
        cards.sort(function (a, b) {
          if (mode === 'rating') {
            return Number(b.dataset.rating) - Number(a.dataset.rating);
          }
          if (mode === 'views') {
            return Number(b.dataset.views) - Number(a.dataset.views);
          }
          if (mode === 'year') {
            return Number(b.dataset.year) - Number(a.dataset.year);
          }
          return normalized(a.dataset.title).localeCompare(normalized(b.dataset.title), 'zh-Hans-CN');
        });
        cards.forEach(function (card) {
          scope.appendChild(card);
        });
      }

      function applyFilter() {
        var keyword = input ? normalized(input.value.trim()) : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.category,
            card.dataset.genre,
            card.textContent
          ].map(normalized).join(' ');
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchGenre = activeGenre === 'all' || normalized(card.dataset.genre).indexOf(activeGenre) !== -1;
          var isVisible = matchKeyword && matchGenre;
          card.classList.toggle('hidden-by-filter', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (select) {
        select.addEventListener('change', function () {
          sortCards();
          applyFilter();
        });
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          activeGenre = normalized(chip.getAttribute('data-genre') || 'all');
          applyFilter();
        });
      });
      sortCards();
      applyFilter();
    });
  }

  function setupSearchPage() {
    var searchInput = document.querySelector('[data-search-page-input]');
    if (!searchInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input'));
    }
  }

  function attachStream(video, streamUrl) {
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }
    video.dataset.ready = 'true';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }
    return Promise.reject(new Error('unsupported'));
  }

  function setupPlayer() {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.hls-player');
      var overlay = shell.querySelector('.player-overlay');
      var button = shell.querySelector('.player-start');
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream');
      if (!streamUrl) {
        return;
      }

      function startPlayback() {
        attachStream(video, streamUrl).then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          video.controls = true;
          var playAttempt = video.play();
          if (playAttempt && typeof playAttempt.catch === 'function') {
            playAttempt.catch(function () {});
          }
        }).catch(function () {
          if (button) {
            button.textContent = '请稍后重试';
          }
        });
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }
      if (overlay) {
        overlay.addEventListener('click', function (event) {
          if (event.target === overlay) {
            startPlayback();
          }
        });
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
