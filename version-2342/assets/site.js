(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    const scope = panel.closest('section') || document;
    const list = scope.querySelector('[data-filter-list]');
    const empty = scope.querySelector('[data-empty-state]');
    const search = panel.querySelector('[data-filter-search]');
    const selects = Array.from(panel.querySelectorAll('[data-filter-field]'));
    const items = list ? Array.from(list.children) : [];

    function uniqueValues(field) {
      const set = new Set();
      items.forEach(function (item) {
        const value = item.getAttribute('data-' + field) || '';
        if (value) {
          set.add(value);
        }
      });
      return Array.from(set).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN', { numeric: true });
      });
    }

    selects.forEach(function (select) {
      const field = select.getAttribute('data-filter-field');
      uniqueValues(field).forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && search) {
      search.value = q;
    }

    function applyFilter() {
      const query = search ? search.value.trim().toLowerCase() : '';
      const active = {};
      selects.forEach(function (select) {
        const field = select.getAttribute('data-filter-field');
        active[field] = select.value;
      });
      let visible = 0;
      items.forEach(function (item) {
        const haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-category')
        ].join(' ').toLowerCase();
        let matched = !query || haystack.includes(query);
        Object.keys(active).forEach(function (field) {
          if (active[field] && item.getAttribute('data-' + field) !== active[field]) {
            matched = false;
          }
        });
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
    applyFilter();
  });
})();
