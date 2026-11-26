/* write.js —— 个人发文 + 我的文章管理 */
(function () {

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(s) {
    return String(s).trim().toLowerCase()
      .replace(/[^\w一-龥]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || ('p-' + Date.now().toString(36));
  }

  let editSlug = null;

  function guard() {
    const user = window.Backend.currentUser();
    const root = document.getElementById('write-root');
    if (!user) {
      root.innerHTML = `
        <div class="empty">
          <div class="big">🔐</div>
          <div>请先登录后再发文</div>
          <button class="btn btn-primary" id="go-login" style="margin-top:18px">登录 / 注册</button>
        </div>`;
      root.querySelector('#go-login').onclick = () => window.Account.open('login');
      return false;
    }
    return true;
  }

  function renderMine() {
    const box = document.getElementById('mine-list');
    const user = window.Backend.currentUser();
    const list = window.Backend.myArticles();
    if (!list.length) {
      box.innerHTML = '<div class="muted small" style="padding:10px 0">还没有发表过文章</div>';
      return;
    }
    box.innerHTML = list.map(a => `
      <div class="post-item-mini">
        <div class="t">
          <a href="article.html?slug=${encodeURIComponent(a.slug)}">${esc(a.title)}</a>
          <div class="muted small">${esc(a.date || '')}</div>
        </div>
        <button class="link-btn" data-edit="${esc(a.slug)}">编辑</button>
        <button class="link-btn danger" data-del="${esc(a.slug)}">删除</button>
      </div>`).join('');

    box.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => {
        const a = window.Backend.myArticles().find(x => x.slug === b.dataset.edit)
          || window.Backend.getArticles().find(x => x.slug === b.dataset.edit);
        if (!a) return;
        editSlug = a.slug;
        document.getElementById('f-title').value = a.title;
        document.getElementById('f-slug').value = a.slug;
        document.getElementById('f-date').value = a.date || '';
        document.getElementById('f-tags').value = (a.tags || []).join(', ');
        document.getElementById('f-cover').value = a.cover || '#7c6cff';
        document.getElementById('f-excerpt').value = a.excerpt || '';
        document.getElementById('f-content').value = a.content || '';
        document.getElementById('form-title').textContent = '编辑文章';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });

    box.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = () => {
        if (!confirm('确认删除这篇文章？')) return;
        try {
          window.Backend.deleteArticle(b.dataset.del);
          window.Account.toast('文章已删除');
          if (editSlug === b.dataset.del) resetForm();
          renderMine();
        } catch (e) {
          window.Account.toast(e.message || '删除失败', true);
        }
      };
    });
  }

  function resetForm() {
    editSlug = null;
    document.getElementById('f-title').value = '';
    document.getElementById('f-slug').value = '';
    document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('f-tags').value = '';
    document.getElementById('f-cover').value = '#7c6cff';
    document.getElementById('f-excerpt').value = '';
    document.getElementById('f-content').value = '';
    document.getElementById('form-title').textContent = '写文章';
  }

  function boot() {
    if (!guard()) return;

    const slugEl = document.getElementById('f-slug');
    const titleEl = document.getElementById('f-title');
    titleEl.addEventListener('input', () => {
      if (!slugEl.dataset.touched) slugEl.value = slugify(titleEl.value);
    });
    slugEl.addEventListener('input', () => { slugEl.dataset.touched = '1'; });

    document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);

    document.getElementById('btn-publish').onclick = () => {
      try {
        const rec = window.Backend.upsertArticle({
          slug: slugEl.dataset.touched && slugEl.value ? slugEl.value : (editSlug || slugify(titleEl.value)),
          title: titleEl.value,
          date: document.getElementById('f-date').value,
          tags: document.getElementById('f-tags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
          cover: document.getElementById('f-cover').value,
          excerpt: document.getElementById('f-excerpt').value,
          content: document.getElementById('f-content').value
        });
        window.Account.toast(editSlug ? '文章已更新' : '文章已发布');
        editSlug = rec.slug;
        renderMine();
        setTimeout(() => { location.href = 'article.html?slug=' + encodeURIComponent(rec.slug); }, 500);
      } catch (e) {
        window.Account.toast(e.message || '发布失败', true);
      }
    };

    document.getElementById('btn-preview').onclick = () => {
      const pane = document.getElementById('preview-pane');
      const open = !pane.classList.contains('open');
      if (open) {
        pane.innerHTML = `
          <div class="side-title" style="margin-bottom:10px">预览</div>
          <h1 style="font-size:25px;letter-spacing:-.02em;margin-bottom:10px">${esc(titleEl.value || '（无标题）')}</h1>
          <article class="md">${window.MiniMD.render(document.getElementById('f-content').value)}</article>`;
      }
      pane.classList.toggle('open', open);
      document.getElementById('btn-preview').textContent = open ? '收起预览' : '预览';
    };

    document.getElementById('btn-reset').onclick = () => resetForm();

    renderMine();

    document.addEventListener('auth:changed', () => {
      if (guard()) renderMine();
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
