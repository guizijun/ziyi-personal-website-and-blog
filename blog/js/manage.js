/* manage.js —— 管理员后台：账户 / 发言(评论) / 文章 */
(function () {

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  let tab = 'users';

  function guard() {
    const root = document.getElementById('manage-root');
    const user = window.Backend.currentUser();
    if (!user || user.role !== 'admin') {
      root.innerHTML = `
        <div class="empty">
          <div class="big">🛡</div>
          <div>此页面仅限管理员访问</div>
          <button class="btn btn-primary" id="go-login" style="margin-top:18px">以管理员身份登录</button>
        </div>`;
      const b = root.querySelector('#go-login');
      if (b) b.onclick = () => window.Account.open('login');
      return false;
    }
    return true;
  }

  function renderUsers() {
    const users = window.Backend.listUsers();
    return `
      <table class="table">
        <thead>
          <tr><th>用户</th><th>角色</th><th>状态</th><th>注册时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><b>${esc(u.username)}</b></td>
              <td>
                <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                  ${u.role === 'admin' ? '管理员' : '普通访客'}
                </span>
              </td>
              <td>${u.banned ? '<span class="badge badge-ban">已封禁</span>' : '<span class="badge badge-user">正常</span>'}</td>
              <td class="muted small">${u.created ? fmtTime(u.created) : '-'}</td>
              <td>
                <div class="row" style="gap:6px;flex-wrap:wrap">
                  <button class="link-btn" data-role="${esc(u.username)}">
                    ${u.role === 'admin' ? '降为访客' : '设为管理员'}
                  </button>
                  <button class="link-btn ${u.banned ? 'ok' : ''}" data-ban="${esc(u.username)}">
                    ${u.banned ? '解除封禁' : '封禁'}
                  </button>
                  <button class="link-btn danger" data-deluser="${esc(u.username)}">删除</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function renderComments() {
    const list = window.Backend.allComments();
    if (!list.length) return '<div class="empty" style="padding:40px">暂无评论</div>';
    return `
      <table class="table">
        <thead>
          <tr><th>文章</th><th>用户</th><th>内容</th><th>时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${list.map(c => `
            <tr>
              <td class="muted small"><a href="article.html?slug=${encodeURIComponent(c.slug)}">${esc(c.slug)}</a></td>
              <td>
                <b>${esc(c.user)}</b>
                ${c.role === 'admin' ? '<span class="badge badge-admin">管理员</span>' : ''}
              </td>
              <td style="max-width:320px">${esc(c.text)}</td>
              <td class="muted small">${fmtTime(c.time)}</td>
              <td>
                <button class="link-btn danger" data-delc="${esc(c.id)}" data-cslug="${esc(c.slug)}">删除</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function renderArticles() {
    const list = window.Backend.allLocalArticles();
    if (!list.length) return '<div class="empty" style="padding:40px">暂无本地文章（用户发文后出现在这里）</div>';
    return `
      <table class="table">
        <thead>
          <tr><th>标题</th><th>作者</th><th>日期</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${list.map(a => `
            <tr>
              <td><a href="article.html?slug=${encodeURIComponent(a.slug)}"><b>${esc(a.title || '(无标题)')}</b></a></td>
              <td>${esc(a.author || '-')} ${a.store === 'drafts' ? '<span class="badge badge-user">发布站</span>' : ''}</td>
              <td class="muted small">${esc(a.date || '')}</td>
              <td>
                <span class="badge ${a.status === 'published' ? 'badge-admin' : 'badge-user'}">
                  ${a.status === 'published' ? '已发布' : '草稿'}
                </span>
              </td>
              <td>
                <button class="link-btn danger" data-dela="${esc(a.slug)}" data-store="${esc(a.store)}">删除</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function render() {
    const root = document.getElementById('manage-root');
    if (!guard()) return;
    root.innerHTML = `
      <div class="dash-tabs">
        <button class="dash-tab${tab === 'users' ? ' active' : ''}" data-tab="users">👥 账户管理</button>
        <button class="dash-tab${tab === 'comments' ? ' active' : ''}" data-tab="comments">💬 发言管理</button>
        <button class="dash-tab${tab === 'articles' ? ' active' : ''}" data-tab="articles">📄 文章管理</button>
      </div>
      <div class="editor-card" id="tab-body"></div>`;

    const body = root.querySelector('#tab-body');
    body.innerHTML = tab === 'users' ? renderUsers()
      : tab === 'comments' ? renderComments()
      : renderArticles();

    root.querySelectorAll('.dash-tab').forEach(b => {
      b.onclick = () => { tab = b.dataset.tab; render(); };
    });

    /* 账户操作 */
    body.querySelectorAll('[data-role]').forEach(b => {
      b.onclick = () => {
        try {
          const u = window.Backend.listUsers().find(x => x.username === b.dataset.role);
          window.Backend.setUserRole(u.username, u.role === 'admin' ? 'user' : 'admin');
          window.Account.toast('角色已更新');
          render();
        } catch (e) { window.Account.toast(e.message, true); }
      };
    });
    body.querySelectorAll('[data-ban]').forEach(b => {
      b.onclick = () => {
        try {
          const u = window.Backend.listUsers().find(x => x.username === b.dataset.ban);
          window.Backend.setBanned(u.username, !u.banned);
          window.Account.toast(u.banned ? '已解除封禁' : '已封禁');
          render();
        } catch (e) { window.Account.toast(e.message, true); }
      };
    });
    body.querySelectorAll('[data-deluser]').forEach(b => {
      b.onclick = () => {
        if (!confirm('确认删除用户「' + b.dataset.deluser + '」？其账号将无法恢复。')) return;
        try {
          window.Backend.deleteUser(b.dataset.deluser);
          window.Account.toast('用户已删除');
          render();
        } catch (e) { window.Account.toast(e.message, true); }
      };
    });

    /* 评论操作 */
    body.querySelectorAll('[data-delc]').forEach(b => {
      b.onclick = () => {
        if (!confirm('删除这条评论？')) return;
        try {
          window.Backend.deleteComment(b.dataset.cslug, b.dataset.delc);
          window.Account.toast('评论已删除');
          render();
        } catch (e) { window.Account.toast(e.message, true); }
      };
    });

    /* 文章操作 */
    body.querySelectorAll('[data-dela]').forEach(b => {
      b.onclick = () => {
        if (!confirm('确认删除这篇文章？')) return;
        try {
          window.Backend.deleteLocalArticle(b.dataset.dela, b.dataset.store);
          window.Account.toast('文章已删除');
          render();
        } catch (e) { window.Account.toast(e.message, true); }
      };
    });
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('auth:changed', render);
})();
