/* app.js —— 启动、导航切换、页面初始化 */
(function () {
  window.APP_STATE = { lang: 'zh', prefs: null, scGrid: null, onCityChange: null };

  function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.dataset.page === id));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === id));
  }

  function boot() {
    const cfg = window.SITE_CONFIG;

    // 偏好
    window.APP_STATE.prefs = window.Theme.load();
    window.Theme.apply(window.APP_STATE.prefs);

    // 导航
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });

    // 设置入口
    document.querySelectorAll('[data-open-settings]').forEach(b => {
      b.addEventListener('click', () => window.Settings.open());
    });
    document.getElementById('drawer-mask').addEventListener('click', () => window.Settings.close());
    document.getElementById('modal-mask').addEventListener('click', e => {
      if (e.target.id === 'modal-mask') e.target.classList.remove('open');
    });

    // 个人信息卡
    const u = cfg.user;
    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
      if (u.avatar) {
        avatar.innerHTML = `<img src="${u.avatar}" alt="${u.name}">`;
      } else {
        avatar.textContent = u.initials || u.name.slice(0, 1);
      }
    }
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('profile-name', u.name);
    set('profile-role', u.role);
    set('profile-bio', u.bio);
    set('profile-location', u.location);

    const linkWrap = document.getElementById('profile-links');
    if (linkWrap) {
      linkWrap.innerHTML = u.links.map(l => `
        <a class="tag" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('');
    }

    const blogBtn = document.getElementById('go-blog');
    if (blogBtn) blogBtn.href = cfg.blogUrl;
    const adminBtn = document.getElementById('go-admin');
    if (adminBtn) adminBtn.href = cfg.adminUrl;

    // 搜索
    window.SearchBox.init('#search-mount');

    // 天气：优先使用已保存的定位，否则按城市加载
    const prefs = window.APP_STATE.prefs;
    const city = prefs.city || cfg.defaultCity;
    window.APP_STATE.onCityChange = (c) => {
      if (c && c !== window.t('my_location')) {
        window.Weather.load('#weather-card', c || cfg.defaultCity);
      }
    };
    if (prefs.coords && typeof prefs.coords.lat === 'number') {
      window.Weather.loadCoords('#weather-card', prefs.coords.lat, prefs.coords.lon, prefs.city || window.t('my_location'));
    } else {
      window.Weather.load('#weather-card', city);
    }

    // 快捷方式
    window.Shortcuts.init('#shortcuts-grid');

    // 语言/城市切换后重建动态区
    let lastLang = window.APP_STATE.lang;
    document.addEventListener('prefs:applied', () => {
      if (window.APP_STATE.scGrid) window.Shortcuts.render(window.APP_STATE.scGrid);
      if (window.APP_STATE.lang !== lastLang) {
        lastLang = window.APP_STATE.lang;
        const p = window.APP_STATE.prefs;
        if (p.coords && typeof p.coords.lat === 'number') {
          window.Weather.loadCoords('#weather-card', p.coords.lat, p.coords.lon, p.city || window.t('my_location'));
        } else {
          window.Weather.load('#weather-card', p.city || cfg.defaultCity);
        }
      }
    });

    switchPage('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
