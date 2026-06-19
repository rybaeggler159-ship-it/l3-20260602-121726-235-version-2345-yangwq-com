(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
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

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = Number(thumb.getAttribute('data-hero-thumb') || 0);
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
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

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function populateSelect(select, values) {
    if (!select) {
      return;
    }

    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initListingFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (!panel || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var reset = panel.querySelector('[data-filter-reset]');
    var count = panel.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-empty-state]');

    var years = [];
    var regions = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute('data-year');
      var region = card.getAttribute('data-region');
      var type = card.getAttribute('data-type');
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    populateSelect(yearSelect, years);
    populateSelect(regionSelect, regions);
    populateSelect(typeSelect, types);

    function apply() {
      var keyword = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchType = !type || card.getAttribute('data-type') === type;
        var shouldShow = matchKeyword && matchYear && matchRegion && matchType;

        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function movieResultCard(movie) {
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="poster-link" href="' + movie.detail + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initGlobalSearch() {
    var input = document.querySelector('[data-global-search-input]');
    var form = document.querySelector('[data-global-search-form]');
    var results = document.querySelector('[data-global-search-results]');
    var count = document.querySelector('[data-global-search-count]');
    var empty = document.querySelector('[data-global-search-empty]');

    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function search() {
      var keyword = normalize(input.value);
      if (!keyword) {
        results.innerHTML = '';
        if (count) {
          count.textContent = '请输入关键词开始搜索';
        }
        if (empty) {
          empty.textContent = '输入关键词后将显示匹配影片。';
          empty.hidden = false;
        }
        return;
      }

      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category
        ].join(' '));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = matches.map(movieResultCard).join('');
      if (count) {
        count.textContent = matches.length + ' 条结果';
      }
      if (empty) {
        empty.textContent = '没有找到匹配影片，请更换关键词。';
        empty.hidden = matches.length !== 0;
      }
    }

    input.addEventListener('input', search);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set('q', input.value);
        window.history.replaceState(null, '', url.toString());
        search();
      });
    }
    search();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var status = player.querySelector('[data-player-status]');
      var source = video ? video.getAttribute('data-src') : '';
      var hls = null;
      var initialized = false;

      if (!video || !cover || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initialize() {
        if (initialized) {
          return;
        }
        initialized = true;
        setStatus('正在初始化播放源，请稍候…');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪，正在播放。');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面或更换浏览器后重试。');
              if (hls) {
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('使用浏览器原生 HLS 播放。');
        } else {
          setStatus('当前浏览器不支持 HLS 播放，请联网加载 HLS.js 或使用 Safari 浏览器。');
        }
      }

      function play() {
        initialize();
        cover.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            cover.classList.remove('is-hidden');
            setStatus('浏览器阻止自动播放，请再次点击播放按钮。');
          });
        }
      }

      cover.addEventListener('click', play);
      video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('播放已暂停，可通过视频控件继续播放。');
        }
      });
      video.addEventListener('ended', function () {
        cover.classList.remove('is-hidden');
        setStatus('播放结束，可重新点击播放。');
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initListingFilters();
    initGlobalSearch();
    initPlayers();
  });
}());
