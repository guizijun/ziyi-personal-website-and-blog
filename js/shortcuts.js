/* shortcuts.js —— 快捷方式（本地存储，自由增删改） */
window.Shortcuts = (function () {
  const KEY = 'yao-shortcuts';
  let list = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      list = raw ? JSON.parse(raw) : [...window.SITE_CONFIG.shortcuts];
    } catch (e) {
      list = [...window.SITE_CONFIG.shortcuts];
    }
    return list;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function initials(name) {
    const s = (name || '?').trim();
    if (/^[A-Za-z]/.test(s)) return s.slice(0, 2).toUpperCase();
    return s[0];
  }

  function render(gridEl) {
    gridEl.innerHTML = list.map((s, i) => `
      <a class="sc-card" href="${s.url}" target="_blank" rel="noopener" data-i="${i}">
        <div class="sc-actions">
          <button class="sc-act" data-act="edit" title="${window.t('edit')}">✎</button>
          <button class="sc-act" data-act="del" title="${window.t('del')}">✕</button>
        </div>
        <div class="sc-icon" style="background:${s.color || '#7c6cff'}">${s.icon || initials(s.name)}</div>
        <div class="sc-name">${s.name}</div>
        <div class="sc-url muted small">${s.url.replace(/^https?:\/\//, '').slice(0, 28)}</div>
      </a>`).join('') + `
      <button class="sc-card sc-add" id="sc-add">
        <div class="sc-icon sc-icon-add">+</div>
        <div class="sc-name">${window.t('add_shortcut')}</div>
      </button>`;
  }

  function openEditor(mask, body, item, index) {
    body.innerHTML = `
      <h3 style="margin-bottom:16px">${index == null ? window.t('add_shortcut') : window.t('edit')}</h3>
      <label class="lbl">${window.t('name')}</label>
      <input class="field" id="sc-name" value="${item?.name || ''}" placeholder="GitHub">
      <label class="lbl" style="margin-top:12px">${window.t('url')}</label>
      <input class="field" id="sc-url" value="${item?.url || ''}" placeholder="https://">
      <label class="lbl" style="margin-top:12px">${window.t('icon_text')}</label>
      <input class="field" id="sc-icon" value="${item?.icon || ''}" maxlength="3" placeholder="GH">
      <label class="lbl" style="margin-top:12px">${window.t('color')}</label>
      <input class="field" id="sc-color" type="color" value="${item?.color || '#7c6cff'}" style="height:44px;padding:4px">
      <div class="row" style="margin-top:20px;justify-content:flex-end">
        <button class="btn btn-ghost" id="sc-cancel">${window.t('cancel')}</button>
        <button class="btn btn-primary" id="sc-save">${window.t('save')}</button>
      </div>`;
    mask.classList.add('open');
    body.querySelector('#sc-cancel').onclick = () => mask.classList.remove('open');
    body.querySelector('#sc-save').onclick = () => {
      const name = body.querySelector('#sc-name').value.trim();
      const url = body.querySelector('#sc-url').value.trim();
      if (!name || !url) return;
      const payload = {
        name,
        url: /^https?:\/\//.test(url) ? url : 'https://' + url,
        icon: body.querySelector('#sc-icon').value.trim(),
        color: body.querySelector('#sc-color').value
      };
      if (index == null) list.push(payload);
      else list[index] = payload;
      save();
      mask.classList.remove('open');
      render(window.APP_STATE.scGrid);
    };
  }

  function init(gridSel) {
    const grid = typeof gridSel === 'string' ? document.querySelector(gridSel) : gridSel;
    if (!grid) return;
    window.APP_STATE.scGrid = grid;
    load();
    render(grid);

    const mask = document.getElementById('modal-mask');
    const body = document.getElementById('modal-body');

    grid.addEventListener('click', e => {
      const actBtn = e.target.closest('.sc-act');
      const card = e.target.closest('.sc-card');
      if (e.target.closest('#sc-add')) { openEditor(mask, body, null, null); return; }
      if (!card || !actBtn) return;
      e.preventDefault();
      const i = +card.dataset.i;
      if (actBtn.dataset.act === 'edit') openEditor(mask, body, list[i], i);
      if (actBtn.dataset.act === 'del') {
        if (confirm(window.t('confirm_del'))) {
          list.splice(i, 1); save(); render(grid);
        }
      }
    });
  }

  return { init, load, render };
})();
