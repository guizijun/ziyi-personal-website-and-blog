/* search.js —— 多引擎搜索框 */
window.SearchBox = (function () {
  let engines = [], current = null;

  function init(rootSel) {
    const root = document.querySelector(rootSel);
    if (!root) return;
    engines = window.SITE_CONFIG.searchEngines;
    current = engines.find(e => e.id === localStorage.getItem('yao-search-engine')) || engines[0];

    root.innerHTML = `
      <div class="search-wrap">
        <div class="search-shell">
          <button class="engine-btn" id="engine-btn" type="button">
            <span class="engine-dot" style="background:${current.color}"></span>
            <span class="engine-name">${current.name}</span>
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <input class="search-input" id="search-input" type="text"
                 data-i18n-ph="search_ph" placeholder="${window.t('search_ph')}" autocomplete="off" />
          <button class="search-go" id="search-go" type="button" aria-label="search">
            <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" stroke-width="2"/><path d="M20 20l-3.2-3.2" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="engine-menu" id="engine-menu"></div>
      </div>`;

    const menu = root.querySelector('#engine-menu');
    menu.innerHTML = engines.map(e => `
      <button class="engine-item${e.id === current.id ? ' active' : ''}" data-id="${e.id}" type="button">
        <span class="engine-dot" style="background:${e.color}"></span>
        <span>${e.name}</span>
        <span class="muted small">${e.hint}</span>
      </button>`).join('');

    root.querySelector('#engine-btn').addEventListener('click', () => menu.classList.toggle('open'));
    menu.addEventListener('click', ev => {
      const btn = ev.target.closest('.engine-item');
      if (!btn) return;
      current = engines.find(e => e.id === btn.dataset.id);
      localStorage.setItem('yao-search-engine', current.id);
      root.querySelector('.engine-name').textContent = current.name;
      root.querySelector('.engine-dot').style.background = current.color;
      menu.querySelectorAll('.engine-item').forEach(i => i.classList.toggle('active', i.dataset.id === current.id));
      menu.classList.remove('open');
      // 切换引擎时的高斯模糊脉冲
      const shell = root.querySelector('.search-shell');
      shell.classList.remove('switching');
      void shell.offsetWidth; // 重启动画
      shell.classList.add('switching');
    });
    document.addEventListener('click', ev => {
      if (!root.contains(ev.target)) menu.classList.remove('open');
    });

    const input = root.querySelector('#search-input');
    const go = () => {
      const q = input.value.trim();
      if (!q) { input.focus(); return; }
      window.open(current.url.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener');
    };
    root.querySelector('#search-go').addEventListener('click', go);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  return { init };
})();
