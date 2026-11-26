/* comments.js —— 文章评论区 */
window.Comments = (function () {

  function fmtTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function render(root, slug) {
    const user = window.Backend.currentUser();
    const list = window.Backend.getComments(slug);

    root.innerHTML = `
      <div class="comments-title">💬 评论 <span class="muted small">(${list.length})</span></div>
      ${user ? `
        <div class="comment-form">
          <textarea id="c-text" maxlength="500" placeholder="写下你的评论（最多 500 字）…"></textarea>
          <div class="row">
            <span class="muted small">以 <b>${window.Account.esc(user.username)}</b> 的身份发表</span>
            <button class="btn btn-primary btn-sm" id="c-submit">发表评论</button>
          </div>
        </div>`
        : `
        <div class="card flat" style="padding:18px;margin-bottom:8px">
          <div class="row-between">
            <span class="muted small">登录后即可参与评论。</span>
            <button class="btn btn-primary btn-sm" id="c-login">登录 / 注册</button>
          </div>
        </div>`}
      <div class="comment-list" id="c-list">
        ${list.length ? list.map(c => itemHTML(c, user)).join('') :
        '<div class="empty" style="padding:34px 10px">还没有评论，来抢沙发～</div>'}
      </div>`;

    const loginBtn = root.querySelector('#c-login');
    if (loginBtn) loginBtn.onclick = () => window.Account.open('login');

    const submit = root.querySelector('#c-submit');
    if (submit) {
      submit.onclick = () => {
        const ta = root.querySelector('#c-text');
        try {
          window.Backend.addComment(slug, ta.value);
          window.Account.toast('评论已发表');
          render(root, slug);
        } catch (e) {
          window.Account.toast(e.message || '发表失败', true);
        }
      };
    }

    root.querySelectorAll('.comment-del').forEach(btn => {
      btn.onclick = () => {
        if (!confirm('删除这条评论？')) return;
        try {
          window.Backend.deleteComment(slug, btn.dataset.id);
          window.Account.toast('评论已删除');
          render(root, slug);
        } catch (e) {
          window.Account.toast(e.message || '删除失败', true);
        }
      };
    });
  }

  function itemHTML(c, user) {
    const canDel = user && (user.username === c.user || user.role === 'admin');
    return `
      <div class="comment-item">
        <div class="comment-avatar" style="background:${window.Account.colorOf(c.user)}">
          ${window.Account.esc(c.user.slice(0, 1).toUpperCase())}
        </div>
        <div class="comment-body">
          <div class="comment-head">
            <span class="comment-name">${window.Account.esc(c.user)}</span>
            ${c.role === 'admin' ? '<span class="badge badge-admin">管理员</span>' : ''}
            <span class="comment-time">${fmtTime(c.time)}</span>
            ${canDel ? `<button class="comment-del" data-id="${c.id}">删除</button>` : ''}
          </div>
          <div class="comment-text">${window.Account.esc(c.text).replace(/\n/g, '<br>')}</div>
        </div>
      </div>`;
  }

  return { render };
})();
