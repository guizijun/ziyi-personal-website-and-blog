/* account.js —— 登录 / 注册弹层 + 导航用户区（所有博客页共用） */
window.Account = (function () {

  function fmtErr(e) { return (e && e.message) || '操作失败'; }

  function toast(msg, isErr) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = 'toast'; }, 2400);
  }

  /* ---------- 弹层 ---------- */
  function ensureModal() {
    let mask = document.getElementById('auth-mask');
    if (mask) return mask;
    mask = document.createElement('div');
    mask.id = 'auth-mask';
    mask.className = 'ov-mask';
    mask.innerHTML = `
      <div class="ov-modal" id="auth-modal"></div>`;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    document.body.appendChild(mask);
    return mask;
  }

  function renderLogin() {
    const modal = document.getElementById('auth-modal');
    modal.innerHTML = `
      <div class="row-between">
        <h3>登录</h3>
        <button class="ov-close" data-close>✕</button>
      </div>
      <p class="muted small" style="margin:6px 0 16px">登录后可发文、评论并管理自己的内容。</p>
      <label class="lbl">用户名</label>
      <input class="field" id="auth-user" autocomplete="username" placeholder="用户名">
      <label class="lbl" style="margin-top:12px">密码</label>
      <input class="field" id="auth-pass" type="password" autocomplete="current-password" placeholder="密码">
      <div class="auth-err" id="auth-err"></div>
      <div class="row" style="margin-top:18px;justify-content:flex-end">
        <button class="btn btn-ghost" data-switch="register">没有账号？注册</button>
        <button class="btn btn-primary" id="auth-submit">登录</button>
      </div>`;
    modal.querySelector('#auth-submit').onclick = async () => {
      const errEl = modal.querySelector('#auth-err');
      errEl.textContent = '';
      try {
        await window.Backend.login(
          modal.querySelector('#auth-user').value,
          modal.querySelector('#auth-pass').value
        );
        close();
        toast('登录成功');
        renderUser();
        document.dispatchEvent(new CustomEvent('auth:changed'));
      } catch (e) {
        errEl.textContent = fmtErr(e);
      }
    };
    bindCommon(modal);
  }

  function renderRegister() {
    const modal = document.getElementById('auth-modal');
    modal.innerHTML = `
      <div class="row-between">
        <h3>注册</h3>
        <button class="ov-close" data-close>✕</button>
      </div>
      <p class="muted small" style="margin:6px 0 16px">密码经加盐哈希后存储，不会保存明文。</p>
      <label class="lbl">用户名（2–20 字符）</label>
      <input class="field" id="reg-user" placeholder="用户名">
      <label class="lbl" style="margin-top:12px">密码（至少 6 位）</label>
      <input class="field" id="reg-pass" type="password" autocomplete="new-password" placeholder="密码">
      <label class="lbl" style="margin-top:12px">确认密码</label>
      <input class="field" id="reg-pass2" type="password" autocomplete="new-password" placeholder="再次输入密码">
      <div class="auth-err" id="auth-err"></div>
      <div class="row" style="margin-top:18px;justify-content:flex-end">
        <button class="btn btn-ghost" data-switch="login">已有账号？登录</button>
        <button class="btn btn-primary" id="reg-submit">注册并登录</button>
      </div>`;
    modal.querySelector('#reg-submit').onclick = async () => {
      const errEl = modal.querySelector('#auth-err');
      errEl.textContent = '';
      const pass = modal.querySelector('#reg-pass').value;
      if (pass !== modal.querySelector('#reg-pass2').value) {
        errEl.textContent = '两次输入的密码不一致';
        return;
      }
      try {
        await window.Backend.register(modal.querySelector('#reg-user').value, pass);
        close();
        toast('注册成功，已自动登录');
        renderUser();
        document.dispatchEvent(new CustomEvent('auth:changed'));
      } catch (e) {
        errEl.textContent = fmtErr(e);
      }
    };
    bindCommon(modal);
  }

  function bindCommon(modal) {
    modal.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
    modal.querySelectorAll('[data-switch]').forEach(b => {
      b.onclick = () => {
        if (b.dataset.switch === 'register') renderRegister();
        else renderLogin();
      };
    });
    const first = modal.querySelector('input');
    if (first) first.focus();
    modal.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const btn = modal.querySelector('.btn-primary');
          if (btn) btn.click();
        }
      });
    });
  }

  function open(mode) {
    ensureModal();
    if (mode === 'register') renderRegister();
    else renderLogin();
    document.getElementById('auth-mask').classList.add('open');
  }

  function close() {
    const m = document.getElementById('auth-mask');
    if (m) m.classList.remove('open');
  }

  /* ---------- 导航用户区 ---------- */
  function renderUser() {
    const slot = document.getElementById('user-slot');
    if (!slot) return;
    const user = window.Backend.currentUser();
    if (!user) {
      slot.innerHTML = `<button class="btn btn-sm btn-primary" id="btn-login">登录</button>`;
      slot.querySelector('#btn-login').onclick = () => open('login');
      return;
    }
    const isAdmin = user.role === 'admin';
    slot.innerHTML = `
      <div class="user-chip">
        <button class="user-avatar" id="user-avatar" style="--ua:${colorOf(user.username)}">
          ${user.username.slice(0, 1).toUpperCase()}
        </button>
        <div class="user-menu" id="user-menu">
          <div class="user-menu-head">
            <b>${esc(user.username)}</b>
            <span class="badge ${isAdmin ? 'badge-admin' : 'badge-user'}">${isAdmin ? '管理员' : '访客'}</span>
          </div>
          <a class="user-menu-item" href="write.html">✍️ 写文章</a>
          ${isAdmin ? '<a class="user-menu-item" href="manage.html">⚙️ 管理后台</a>' : ''}
          ${isAdmin ? '<a class="user-menu-item" href="../admin/">📦 发布站(导出)</a>' : ''}
          <button class="user-menu-item" id="btn-logout">🚪 退出登录</button>
        </div>
      </div>`;
    const chip = slot.querySelector('.user-chip');
    slot.querySelector('#user-avatar').onclick = e => {
      e.stopPropagation();
      chip.classList.toggle('open');
    };
    slot.querySelector('#btn-logout').onclick = () => {
      window.Backend.logout();
      renderUser();
      toast('已退出登录');
      document.dispatchEvent(new CustomEvent('auth:changed'));
    };
    document.addEventListener('click', () => chip.classList.remove('open'), { once: true });
  }

  function colorOf(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + h + ', 62%, 52%)';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function boot() {
    try {
      await window.Backend.init();
    } catch (e) {
      console.error(e);
    }
    renderUser();
  }

  return { open, close, renderUser, toast, boot, colorOf, esc };
})();

document.addEventListener('DOMContentLoaded', () => window.Account.boot());
