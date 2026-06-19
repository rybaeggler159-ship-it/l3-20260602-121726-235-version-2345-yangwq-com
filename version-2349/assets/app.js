(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function decadeMatches(year, filterYear) {
    if (!filterYear) {
      return true;
    }
    var numericYear = Number(year || 0);
    var numericFilter = Number(filterYear || 0);
    if (numericFilter >= 2020) {
      return numericYear === numericFilter;
    }
    if (numericFilter === 2010) {
      return numericYear >= 2010 && numericYear <= 2019;
    }
    if (numericFilter === 2000) {
      return numericYear >= 2000 && numericYear <= 2009;
    }
    if (numericFilter === 1990) {
      return numericYear < 2000;
    }
    return true;
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    if (!input && !yearSelect && !typeSelect && !categorySelect) {
      return;
    }

    function getCards() {
      var cards = [];
      scopes.forEach(function (scope) {
        cards = cards.concat(Array.prototype.slice.call(scope.querySelectorAll("[data-title]")));
      });
      return cards;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visibleCount = 0;
      getCards().forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = decadeMatches(card.getAttribute("data-year"), year);
        var matchesType = !type || String(card.getAttribute("data-type") || "").indexOf(type) !== -1;
        var matchesCategory = !category || card.getAttribute("data-category") === category;
        var isVisible = matchesKeyword && matchesYear && matchesType && matchesCategory;
        card.classList.toggle("is-hidden-by-filter", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });
      var empty = document.querySelector("[data-empty-state]");
      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    [input, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("[data-player-video]");
      var button = shell.querySelector("[data-player-button]");
      var source = shell.getAttribute("data-src");
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }

      function hideButton() {
        if (button) {
          button.classList.add("is-hidden");
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function startPlayback() {
        hideButton();
        if (shell.getAttribute("data-ready") === "1") {
          playVideo();
          return;
        }
        shell.setAttribute("data-ready", "1");
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        } else {
          video.src = source;
          playVideo();
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && shell.getAttribute("data-ready") === "1") {
          return;
        }
        startPlayback();
      });
      video.addEventListener("play", hideButton);
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
