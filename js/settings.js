/* settings.js —— 设置抽屉：主题色 / 模式 / 背景 / 语言 / 城市 */
window.Settings = (function () {
  const ACCENTS = [
    ['violet', '#7c6cff'], ['blue', '#3b82f6'], ['teal', '#14b8a6'], ['rose', '#f43f5e'],
    ['amber', '#f59e0b'], ['green', '#22c55e'], ['pink', '#ec4899'], ['indigo', '#6366f1']
  ];
  const BGS = ['aurora', 'stars', 'particles', 'gradient', 'image', 'none'];

  function build(drawer) {
    const p = window.Theme.prefs;
    drawer.innerHTML = `
      <div class="drawer-head">
        <h3 data-i18n="settings">${window.t('settings')}</h3>
        <button class="icon-btn" id="set-close">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="set-block">
        <label class="lbl" data-i18n="theme_color">${window.t('theme_color')}</label>
        <div class="swatches" id="set-accent">
          ${ACCENTS.map(([id, c]) => `
            <button class="swatch${p.accent === id ? ' active' : ''}" data-id="${id}" style="--sw:${c}" title="${id}"></button>`).join('')}
        </div>
      </div>

      <div class="set-block">
        <label class="lbl" data-i18n="mode">${window.t('mode')}</label>
        <div class="seg" id="set-mode">
          ${['dark', 'light', 'auto'].map(m => `
            <button class="seg-item${p.mode === m ? ' active' : ''}" data-v="${m}" data-i18n="${m}">${window.t(m)}</button>`).join('')}
        </div>
      </div>

      <div class="set-block">
        <label class="lbl" data-i18n="background">${window.t('background')}</label>
        <div class="seg wrap-seg" id="set-bg">
          ${BGS.map(b => `
            <button class="seg-item${p.background === b ? ' active' : ''}" data-v="${b}" data-i18n="bg_${b === 'image' ? 'image_opt' : b}">${window.t('bg_' + (b === 'image' ? 'image_opt' : b))}</button>`).join('')}
        </div>
        <div style="margin-top:12px">
          <label class="lbl" data-i18n="bg_speed">${window.t('bg_speed')} <span class="muted" id="bg-speed-val">${p.bgSpeed ?? 1}</span></label>
          <input type="range" id="set-bg-speed" min="0.2" max="3" step="0.1" value="${p.bgSpeed ?? 1}">
        </div>
        <div style="margin-top:12px">
          <label class="lbl" data-i18n="bg_image">${window.t('bg_image')}</label>
          <input class="field" id="set-bg-image" value="${p.backgroundImage || ''}" placeholder="https://…">
        </div>
      </div>

      <div class="set-block">
        <label class="lbl" data-i18n="language">${window.t('language')}</label>
        <div class="seg" id="set-lang">
          <button class="seg-item${p.lang === 'zh' ? ' active' : ''}" data-v="zh">中文</button>
          <button class="seg-item${p.lang === 'en' ? ' active' : ''}" data-v="en">English</button>
        </div>
      </div>

      <div class="set-block">
        <label class="lbl" data-i18n="city">${window.t('city')}</label>
        <input class="field" id="set-city" value="${p.city || window.SITE_CONFIG.defaultCity}" placeholder="北京">
      </div>

      <div class="set-block" style="margin-top:26px">
        <button class="btn btn-ghost" id="set-reset" data-i18n="reset">${window.t('reset')}</button>
        <div class="muted small" style="margin-top:10px" data-i18n="local_storage">${window.t('local_storage')}</div>
      </div>`;

    const patch = (over) => {
      const next = { ...window.Theme.prefs, ...over };
      window.Theme.save(next);
    };

    drawer.querySelector('#set-close').onclick = () => close();
    drawer.querySelector('#set-accent').onclick = e => {
      const b = e.target.closest('.swatch'); if (!b) return;
      drawer.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      b.classList.add('active');
      patch({ accent: b.dataset.id });
    };
    drawer.querySelector('#set-mode').onclick = e => {
      const b = e.target.closest('.seg-item'); if (!b) return;
      drawer.querySelectorAll('#set-mode .seg-item').forEach(s => s.classList.remove('active'));
      b.classList.add('active');
      patch({ mode: b.dataset.v });
    };
    drawer.querySelector('#set-bg').onclick = e => {
      const b = e.target.closest('.seg-item'); if (!b) return;
      drawer.querySelectorAll('#set-bg .seg-item').forEach(s => s.classList.remove('active'));
      b.classList.add('active');
      patch({ background: b.dataset.v });
    };
    drawer.querySelector('#set-bg-speed').oninput = e => {
      drawer.querySelector('#bg-speed-val').textContent = e.target.value;
      patch({ bgSpeed: +e.target.value });
    };
    drawer.querySelector('#set-bg-image').onchange = e => patch({ backgroundImage: e.target.value.trim() });
    drawer.querySelector('#set-lang').onclick = e => {
      const b = e.target.closest('.seg-item'); if (!b) return;
      drawer.querySelectorAll('#set-lang .seg-item').forEach(s => s.classList.remove('active'));
      b.classList.add('active');
      patch({ lang: b.dataset.v });
    };
    drawer.querySelector('#set-city').onchange = e => {
      const v = e.target.value.trim();
      // 手动改城市时清除浏览器定位缓存
      patch({ city: v, coords: null });
      if (window.APP_STATE && window.APP_STATE.onCityChange) window.APP_STATE.onCityChange(v);
    };
    drawer.querySelector('#set-reset').onclick = () => {
      if (confirm('Reset all settings?')) {
        window.Theme.reset();
        build(drawer);
        if (window.APP_STATE?.onCityChange) window.APP_STATE.onCityChange(window.SITE_CONFIG.defaultCity);
      }
    };
  }

  function open() {
    const drawer = document.getElementById('settings-drawer');
    const mask = document.getElementById('drawer-mask');
    build(drawer);
    drawer.classList.add('open');
    mask.classList.add('open');
  }

  function close() {
    document.getElementById('settings-drawer').classList.remove('open');
    document.getElementById('drawer-mask').classList.remove('open');
  }

  return { open, close };
})();
