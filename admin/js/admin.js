/* admin.js —— 文章发布站：编辑 / 预览 / 保存 / 导出 / 发布 */
(function () {
  const KEY = 'yao-blog-drafts';
  let list = [];
  let curIdx = -1;

  /* ---------- 数据 ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch (e) { list = []; }
    return list;
  }

  function persist() {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function blank() {
    return {
      slug: '', title: '', date: new Date().toISOString().slice(0, 10),
      tags: [], cover: '#7c6cff', excerpt: '', content: '', status: 'draft'
    };
  }

  function slugify(s) {
    return String(s).trim().toLowerCase()
      .replace(/[^\w一-龥]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || ('post-' + Date.now());
  }

  /* ---------- 渲染 ---------- */
  function renderList() {
    const box = document.getElementById('post-list');
    if (!list.length) {
      box.innerHTML = `<div class="muted small" style="padding:8px 4px">还没有文章，点「新建」开始写作</div>`;
      return;
    }
    box.innerHTML = list.map((p, i) => `
      <button class="post-item${i === curIdx ? ' active' : ''}" data-i="${i}">
        <div class="t">${(p.title || '（无标题）')}</div>
        <div class="d">${p.date || ''} · <span class="status-chip ${p.status === 'published' ? 'published' : 'draft'}">${p.status === 'published' ? '已发布' : '草稿'}</span></div>
      </button>`).join('');
  }

  function fillForm(p) {
    document.getElementById('f-title').value = p.title || '';
    document.getElementById('f-slug').value = p.slug || '';
    document.getElementById('f-date').value = p.date || '';
    document.getElementById('f-tags').value = (p.tags || []).join(', ');
    document.getElementById('f-cover').value = p.cover || '#7c6cff';
    document.getElementById('f-excerpt').value = p.excerpt || '';
    document.getElementById('f-content').value = p.content || '';
    document.getElementById('editor-status').innerHTML = p.status === 'published'
      ? '<span class="status-chip published">已发布</span>'
      : '<span class="status-chip draft">草稿</span>';
    document.getElementById('preview-pane').classList.remove('open');
  }

  function readForm() {
    return {
      title: document.getElementById('f-title').value.trim(),
      slug: document.getElementById('f-slug').value.trim() || slugify(document.getElementById('f-title').value),
      date: document.getElementById('f-date').value,
      tags: document.getElementById('f-tags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
      cover: document.getElementById('f-cover').value,
      excerpt: document.getElementById('f-excerpt').value.trim(),
      content: document.getElementById('f-content').value
    };
  }

  function select(i) {
    curIdx = i;
    if (i < 0) {
      fillForm(blank());
    } else {
      fillForm({ ...blank(), ...list[i] });
    }
    renderList();
  }

  /* ---------- 动作 ---------- */
  function saveDraft(status) {
    const data = readForm();
    if (!data.title) { alert('请先填写标题'); return; }
    data.status = status || 'draft';
    if (curIdx < 0) {
      list.unshift(data);
      curIdx = 0;
    } else {
      list[curIdx] = { ...list[curIdx], ...data, status };
    }
    persist();
    renderList();
    document.getElementById('editor-status').innerHTML = status === 'published'
      ? '<span class="status-chip published">已发布</span>'
      : '<span class="status-chip draft">草稿</span>';
    toast(status === 'published' ? '已标记为发布' : '草稿已保存');
  }

  function delCurrent() {
    if (curIdx < 0) return;
    if (!confirm('确认删除这篇文章？')) return;
    list.splice(curIdx, 1);
    persist();
    select(list.length ? 0 : -1);
  }

  function togglePreview() {
    const pane = document.getElementById('preview-pane');
    const open = !pane.classList.contains('open');
    if (open) {
      pane.innerHTML = `
        <div class="side-title">预览</div>
        <h1 style="font-size:26px;letter-spacing:-.02em;margin-bottom:8px">${window.MiniMD.esc(readForm().title || '（无标题）')}</h1>
        <div class="article-meta" style="margin-bottom:16px">${readForm().date}</div>
        <article class="md">${window.MiniMD.render(readForm().content)}</article>`;
    }
    pane.classList.toggle('open', open);
    document.getElementById('btn-preview').textContent = open ? '收起预览' : '预览';
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function exportJSON() {
    const arr = list.filter(p => p.title).map(p => ({
      slug: p.slug || slugify(p.title),
      title: p.title,
      date: p.date,
      tags: p.tags || [],
      cover: p.cover || '#7c6cff',
      excerpt: p.excerpt || '',
      content: p.content || ''
    }));
    download('posts.json', JSON.stringify(arr, null, 2));
    toast('posts.json 已导出');
  }

  function exportMD() {
    const p = readForm();
    if (!p.title) { alert('请先填写标题'); return; }
    const front = [
      '---',
      `title: ${p.title}`,
      `slug: ${p.slug}`,
      `date: ${p.date}`,
      `tags: [${(p.tags || []).join(', ')}]`,
      `cover: ${p.cover}`,
      `excerpt: ${p.excerpt}`,
      '---',
      ''
    ].join('\n');
    download(`${p.slug}.md`, front + p.content, 'text/markdown;charset=utf-8');
    toast('.md 文件已导出');
  }

  async function publishRemote() {
    const apiBase = window.SITE_CONFIG.apiBase;
    if (!apiBase) {
      toast('未配置 apiBase —— 请使用「导出 posts.json」手动上线');
      return;
    }
    saveDraft('published');
    const data = { ...readForm(), status: 'published' };
    try {
      const res = await fetch(apiBase.replace(/\/$/, '') + '/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(res.status);
      toast('已发布到服务器');
    } catch (e) {
      toast('发布失败：' + e.message);
    }
  }

  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = `
        position:fixed;left:50%;bottom:32px;transform:translateX(-50%);
        z-index:200;padding:12px 22px;border-radius:999px;
        background:rgba(20,24,40,.92);color:#fff;font-size:13.5px;font-weight:600;
        backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.3);
        transition:opacity .3s, transform .3s;opacity:0;pointer-events:none`;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2400);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    // 主题恢复
    try {
      const p = JSON.parse(localStorage.getItem('yao-space-prefs') || '{}');
      if (p.mode === 'light' || p.mode === 'dark') document.documentElement.dataset.mode = p.mode;
      else if (p.mode === 'auto' && matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.dataset.mode = 'light';
      if (p.accent) document.documentElement.dataset.accent = p.accent;
    } catch (e) {}

    load();
    renderList();
    select(list.length ? 0 : -1);

    document.getElementById('post-list').addEventListener('click', e => {
      const b = e.target.closest('.post-item');
      if (b) select(+b.dataset.i);
    });

    document.getElementById('btn-new').onclick = () => select(-1);
    document.getElementById('btn-save').onclick = () => saveDraft('draft');
    document.getElementById('btn-publish').onclick = publishRemote;
    document.getElementById('btn-del').onclick = delCurrent;
    document.getElementById('btn-preview').onclick = togglePreview;
    document.getElementById('btn-export-json').onclick = exportJSON;
    document.getElementById('btn-export-md').onclick = exportMD;

    // 自动补全 slug
    const titleEl = document.getElementById('f-title');
    const slugEl = document.getElementById('f-slug');
    titleEl.addEventListener('input', () => {
      if (!slugEl.dataset.touched) slugEl.value = slugify(titleEl.value);
    });
    slugEl.addEventListener('input', () => { slugEl.dataset.touched = '1'; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
