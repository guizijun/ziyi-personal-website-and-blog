/**
 * backend.js —— 博客本地“后端”数据层
 * 密码一律以 SHA-256(盐 + 密码) 加盐哈希存储，绝不保存明文。
 * 数据存放于浏览器 localStorage（纯静态站点的演示实现；正式环境请接真实后端）。
 */
import { SITE_CONFIG } from '../config.js';

export const Backend = (function () {
  const K_USERS = 'yao-users';
  const K_SESSION = 'yao-session';
  const K_COMMENTS = 'yao-comments';
  const K_ARTICLES = 'yao-articles';
  const K_DRAFTS = 'yao-blog-drafts';
  const SESSION_DAYS = 7;

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  /* ---------- 密码学 ---------- */
  async function hashPassword(password, salt) {
    if (!(window.crypto && crypto.subtle && crypto.subtle.digest)) {
      throw new Error('当前环境不支持加密（请通过 http://127.0.0.1 或 https 访问）');
    }
    const data = new TextEncoder().encode('yao::' + salt + '::' + password);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function randomSalt() {
    const arr = new Uint8Array(16);
    if (crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- 用户 ---------- */
  function getUsers() { return read(K_USERS, []); }
  function saveUsers(list) { write(K_USERS, list); }

  /* 首次运行：用 config.js 的引导账号创建管理员（只要管理员不存在就会补建） */
  async function init() {
    const cfg = SITE_CONFIG.auth || {};
    if (!cfg.adminUser || !cfg.adminPass) return getUsers();
    const users = getUsers();
    const exists = users.find(u => u.username.toLowerCase() === cfg.adminUser.toLowerCase());
    if (!exists) {
      const salt = randomSalt();
      const hash = await hashPassword(cfg.adminPass, salt);
      users.push({
        username: cfg.adminUser, salt, hash,
        role: 'admin', banned: false, created: Date.now()
      });
      saveUsers(users);
    }
    return users;
  }

  async function register(username, password) {
    username = (username || '').trim();
    if (!/^[A-Za-z0-9_一-龥-]{2,20}$/.test(username)) {
      throw new Error('用户名需 2–20 个字符（中英文、数字、_-）');
    }
    if (!password || password.length < 6) throw new Error('密码至少 6 位');
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('用户名已存在');
    }
    const salt = randomSalt();
    const hash = await hashPassword(password, salt);
    users.push({ username, salt, hash, role: 'user', banned: false, created: Date.now() });
    saveUsers(users);
    return login(username, password);
  }

  async function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === (username || '').trim().toLowerCase());
    if (!user) throw new Error('用户不存在');
    if (user.banned) throw new Error('该账号已被封禁');
    const hash = await hashPassword(password || '', user.salt);
    if (hash !== user.hash) throw new Error('密码错误');
    write(K_SESSION, { username: user.username, exp: Date.now() + SESSION_DAYS * 864e5 });
    return user;
  }

  function logout() { localStorage.removeItem(K_SESSION); }

  function currentUser() {
    const s = read(K_SESSION, null);
    if (!s || s.exp < Date.now()) {
      if (s) localStorage.removeItem(K_SESSION);
      return null;
    }
    const user = getUsers().find(u => u.username === s.username);
    if (!user || user.banned) return null;
    return user;
  }

  function isAdmin() {
    const u = currentUser();
    return !!u && u.role === 'admin';
  }

  /* 账户管理（管理员）—— 输出不包含盐/哈希 */
  function listUsers() {
    return getUsers().map(u => ({
      username: u.username, role: u.role,
      banned: !!u.banned, created: u.created
    }));
  }

  function setUserRole(username, role) {
    const users = getUsers();
    const u = users.find(x => x.username === username);
    if (!u) throw new Error('用户不存在');
    if (u.role === 'admin' && role !== 'admin') {
      const admins = users.filter(x => x.role === 'admin' && !x.banned);
      if (admins.length <= 1) throw new Error('至少保留一名管理员');
    }
    u.role = role;
    saveUsers(users);
  }

  function setBanned(username, banned) {
    const users = getUsers();
    const u = users.find(x => x.username === username);
    if (!u) throw new Error('用户不存在');
    if (u.role === 'admin' && banned) throw new Error('不能封禁管理员');
    u.banned = !!banned;
    saveUsers(users);
    if (banned) {
      const s = read(K_SESSION, null);
      if (s && s.username === username) localStorage.removeItem(K_SESSION);
    }
  }

  function deleteUser(username) {
    const me = currentUser();
    if (me && me.username === username) throw new Error('不能删除自己的账号');
    let users = getUsers();
    const u = users.find(x => x.username === username);
    if (!u) throw new Error('用户不存在');
    if (u.role === 'admin') {
      const admins = users.filter(x => x.role === 'admin');
      if (admins.length <= 1) throw new Error('至少保留一名管理员');
    }
    users = users.filter(x => x.username !== username);
    saveUsers(users);
  }

  async function changePassword(oldPass, newPass) {
    const me = currentUser();
    if (!me) throw new Error('请先登录');
    if (!newPass || newPass.length < 6) throw new Error('新密码至少 6 位');
    const users = getUsers();
    const u = users.find(x => x.username === me.username);
    const oldHash = await hashPassword(oldPass || '', u.salt);
    if (oldHash !== u.hash) throw new Error('原密码错误');
    u.salt = randomSalt();
    u.hash = await hashPassword(newPass, u.salt);
    saveUsers(users);
  }

  /* ---------- 评论（发言） ---------- */
  function getComments(slug) {
    const all = read(K_COMMENTS, {});
    return all[slug] || [];
  }

  function addComment(slug, text) {
    const user = currentUser();
    if (!user) throw new Error('请先登录后再评论');
    text = (text || '').trim();
    if (!text) throw new Error('评论内容不能为空');
    if (text.length > 500) throw new Error('评论最多 500 字');
    const all = read(K_COMMENTS, {});
    all[slug] = all[slug] || [];
    all[slug].push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      user: user.username, role: user.role, text, time: Date.now()
    });
    write(K_COMMENTS, all);
  }

  function deleteComment(slug, id) {
    const user = currentUser();
    if (!user) throw new Error('请先登录');
    const all = read(K_COMMENTS, {});
    const list = all[slug] || [];
    const idx = list.findIndex(c => c.id === id);
    if (idx < 0) return;
    const target = list[idx];
    if (target.user !== user.username && user.role !== 'admin') {
      throw new Error('无权删除该评论');
    }
    list.splice(idx, 1);
    all[slug] = list;
    write(K_COMMENTS, all);
  }

  function allComments() {
    const all = read(K_COMMENTS, {});
    const out = [];
    Object.keys(all).forEach(slug => {
      (all[slug] || []).forEach(c => out.push({
        id: c.id, slug, user: c.user, role: c.role, text: c.text, time: c.time
      }));
    });
    return out.sort((a, b) => b.time - a.time);
  }

  /* ---------- 文章（用户发文） ---------- */
  function getArticles() { return read(K_ARTICLES, []); }

  function upsertArticle(data) {
    const user = currentUser();
    if (!user) throw new Error('请先登录后再发文');
    if (!data.title || !data.title.trim()) throw new Error('请填写标题');
    if (!data.content || !data.content.trim()) throw new Error('正文不能为空');
    const list = getArticles();
    const slug = data.slug || ('p-' + Date.now().toString(36));
    const idx = list.findIndex(a => a.slug === slug);
    const record = {
      slug,
      title: data.title.trim(),
      date: data.date || new Date().toISOString().slice(0, 10),
      tags: data.tags || [],
      cover: data.cover || '#7c6cff',
      excerpt: (data.excerpt || '').trim(),
      content: data.content,
      author: user.username,
      status: 'published',
      updated: Date.now()
    };
    // 只能改自己的文章（管理员除外）
    if (idx >= 0 && list[idx].author !== user.username && user.role !== 'admin') {
      throw new Error('无权修改他人的文章');
    }
    if (idx >= 0) list[idx] = { ...list[idx], ...record };
    else list.unshift(record);
    write(K_ARTICLES, list);
    return record;
  }

  function myArticles() {
    const user = currentUser();
    if (!user) return [];
    return getArticles().filter(a => a.author === user.username);
  }

  function deleteArticle(slug) {
    const user = currentUser();
    if (!user) throw new Error('请先登录');
    let list = getArticles();
    const target = list.find(a => a.slug === slug);
    if (!target) throw new Error('文章不存在');
    if (target.author !== user.username && user.role !== 'admin') {
      throw new Error('无权删除他人的文章');
    }
    list = list.filter(a => a.slug !== slug);
    write(K_ARTICLES, list);
  }

  /* 管理员可管理的全部本地文章（含发布站草稿库） */
  function allLocalArticles() {
    const a = getArticles().map(x => ({ ...x, store: 'articles' }));
    const b = read(K_DRAFTS, []).map(x => ({
      ...x,
      author: x.author || '(发布站)',
      status: x.status || 'draft',
      store: 'drafts'
    }));
    return [...a, ...b];
  }

  function deleteLocalArticle(slug, store) {
    if (store === 'drafts') {
      const list = read(K_DRAFTS, []).filter(a => a.slug !== slug);
      write(K_DRAFTS, list);
    } else {
      deleteArticle(slug);
    }
  }

  return {
    init, register, login, logout, currentUser, isAdmin,
    listUsers, setUserRole, setBanned, deleteUser, changePassword,
    getComments, addComment, deleteComment, allComments,
    getArticles, upsertArticle, myArticles, deleteArticle,
    allLocalArticles, deleteLocalArticle
  };
})();
