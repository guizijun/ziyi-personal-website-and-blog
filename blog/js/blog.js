/* blog.js —— 博客列表 / 搜索 / 文章页 */
(function () {
  let POSTS = [];

  /* 也读取本地文章（发布站草稿库 + 用户发文），方便预览 */
  function mergeLocal(list) {
    const out = [];
    const slugs = new Set();
    ['yao-blog-drafts', 'yao-articles'].forEach(key => {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.forEach(d => {
          if (d.status === 'published' && d.slug && d.title && !slugs.has(d.slug)) {
            slugs.add(d.slug);
            out.push({
              slug: d.slug, title: d.title, date: d.date, tags: d.tags || [],
              cover: d.cover || '#7c6cff', excerpt: d.excerpt || '',
              content: d.content || '', author: d.author || ''
            });
          }
        });
      } catch (e) { /* 忽略损坏数据 */ }
    });
    list.forEach(p => {
      if (!slugs.has(p.slug)) {
        slugs.add(p.slug);
        out.push(p);
      }
    });
    return out;
  }

  async function loadPosts() {
    const candidates = ['posts/posts.json', './posts/posts.json', '../blog/posts/posts.json'];
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          POSTS = mergeLocal(await res.json());
          break;
        }
      } catch (e) { /* 尝试下一个路径 */ }
    }
    POSTS.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return POSTS;
  }

  function highlight(text, q) {
    const safe = window.MiniMD.esc(text);
    if (!q) return safe;
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return safe.replace(re, '<mark>$1</mark>');
  }

  function renderList(grid, list, q) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <div class="big">📭</div>
          <div>${window.MiniMD.esc('没有找到匹配的文章')}</div>
        </div>`;
      return;
    }
    grid.innerHTML = list.map(p => `
      <a class="post-card" href="article.html?slug=${encodeURIComponent(p.slug)}">
        <div class="post-cover" style="background:linear-gradient(90deg, ${p.cover || '#7c6cff'}, ${p.cover || '#7c6cff'}88)"></div>
        <div class="post-date">${window.MiniMD.esc(p.date || '')}${p.author ? ' · ' + window.MiniMD.esc(p.author) : ''}</div>
        <h2>${highlight(p.title, q)}</h2>
        <div class="post-excerpt">${highlight(p.excerpt || '', q)}</div>
        <div class="post-foot">
          <div class="post-tags">${(p.tags || []).map(t => `<span>${window.MiniMD.esc(t)}</span>`).join('')}</div>
          <span class="read-more">阅读全文 →</span>
        </div>
      </a>`).join('');
  }

  function filter(q, tag) {
    const key = (q || '').trim().toLowerCase();
    return POSTS.filter(p => {
      const okTag = !tag || (p.tags || []).includes(tag);
      if (!okTag) return false;
      if (!key) return true;
      const hay = [p.title, p.excerpt, (p.tags || []).join(' '), p.content]
        .join(' ').toLowerCase();
      return hay.includes(key);
    });
  }

  function allTags() {
    const set = new Set();
    POSTS.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return [...set];
  }

  /* ---------- 列表页 ---------- */
  async function initList() {
    await loadPosts();
    const grid = document.getElementById('post-grid');
    const input = document.getElementById('post-search');
    const tagRow = document.getElementById('tag-row');
    if (!grid) return;

    let curTag = '';

    const draw = () => {
      const q = input ? input.value.trim() : '';
      renderList(grid, filter(q, curTag), q);
    };

    if (tagRow) {
      tagRow.innerHTML = `<button class="tag active" data-tag="">全部</button>` +
        allTags().map(t => `<button class="tag" data-tag="${window.MiniMD.esc(t)}">${window.MiniMD.esc(t)}</button>`).join('');
      tagRow.addEventListener('click', e => {
        const b = e.target.closest('.tag');
        if (!b) return;
        curTag = b.dataset.tag;
        tagRow.querySelectorAll('.tag').forEach(x => x.classList.toggle('active', x === b));
        draw();
      });
    }

    if (input) {
      input.addEventListener('input', draw);
      const btn = document.getElementById('post-search-btn');
      if (btn) btn.addEventListener('click', draw);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') draw(); });
    }

    draw();
  }

  /* ---------- 文章页 ---------- */
  async function initArticle() {
    await loadPosts();
    const slug = new URLSearchParams(location.search).get('slug');
    const post = POSTS.find(p => p.slug === slug);
    const root = document.getElementById('article-root');
    if (!root) return;

    if (!post) {
      root.innerHTML = `
        <div class="empty">
          <div class="big">🔍</div>
          <div>文章不存在或已被移动</div>
          <a class="back-link" href="index.html" style="margin-top:18px">← 返回首页</a>
        </div>`;
      return;
    }

    document.title = post.title + ' · Yao Blog';
    root.innerHTML = `
      <a class="back-link" href="index.html">← 返回</a>
      <div class="article-head">
        <h1>${window.MiniMD.esc(post.title)}</h1>
        <div class="article-meta">
          <span>📅 ${window.MiniMD.esc(post.date || '')}</span>
          ${post.author ? '<span>✍️ ' + window.MiniMD.esc(post.author) + '</span>' : ''}
          ${(post.tags || []).map(t => `<span class="tag">${window.MiniMD.esc(t)}</span>`).join('')}
        </div>
      </div>
      <div class="divider"></div>
      <article class="md">${window.MiniMD.render(post.content)}</article>
      <div class="divider"></div>
      <div class="row" style="justify-content:space-between">
        <a class="back-link" href="index.html">← 全部文章</a>
        <a class="back-link" href="../index.html">个人主页 →</a>
      </div>`;

    // 评论区
    if (window.Comments) {
      const cRoot = document.getElementById('comments-root');
      if (cRoot) {
        window.Comments.render(cRoot, post.slug);
        document.addEventListener('auth:changed', () => window.Comments.render(cRoot, post.slug));
      }
    }
  }

  window.Blog = { initList, initArticle, loadPosts };
})();
