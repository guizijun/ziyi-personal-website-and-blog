/* theme.js —— 偏好设置的持久化与应用 */
(function () {
  const KEY = 'yao-space-prefs';
  const cfg = window.SITE_CONFIG;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...cfg.defaults, ...JSON.parse(raw) } : { ...cfg.defaults };
    } catch (e) {
      return { ...cfg.defaults };
    }
  }

  function save(prefs) {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    window.APP_STATE.prefs = prefs;
    apply(prefs);
  }

  function apply(prefs) {
    const root = document.documentElement;

    // 模式
    let mode = prefs.mode;
    if (mode === 'auto') {
      mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-accent', prefs.accent || 'violet');

    // 语言
    window.APP_STATE.lang = prefs.lang || 'zh';

    // 背景
    if (window.BgEngine) window.BgEngine.set(prefs.background, {
      speed: prefs.bgSpeed ?? 1,
      image: prefs.backgroundImage || ''
    });

    // 文案刷新
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = window.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = window.t(el.getAttribute('data-i18n-ph'));
    });
    document.dispatchEvent(new CustomEvent('prefs:applied', { detail: prefs }));
  }

  window.Theme = {
    get prefs() { return window.APP_STATE.prefs; },
    load, save, apply,
    reset() {
      localStorage.removeItem(KEY);
      save({ ...cfg.defaults });
    }
  };
})();
