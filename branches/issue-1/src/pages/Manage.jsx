import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu.jsx';
import { openAuth } from '../components/AuthModal.jsx';
import { Backend } from '../lib/backend.js';
import { useAuth } from '../lib/auth.jsx';
import { toast } from '../lib/toast.js';

export default function Manage() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState('users');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(x => x + 1);

  const isAdmin = ready && user && user.role === 'admin';

  return (
    <div className="blog-bg-wrap">
      <div className="blog-bg" />
      <div className="shell">
        <nav className="nav-bar">
          <Link className="logo" to="/blog">
            <div className="logo-mark">B</div>
            <div>Yao Blog</div>
          </Link>
          <div className="nav-links">
            <Link to="/blog">文章</Link>
            <Link to="/write">写文章</Link>
            <Link to="/">个人主页</Link>
            <UserMenu />
          </div>
        </nav>

        <header className="hero" style={{ padding: '14px 4px 22px' }}>
          <h1 style={{ fontSize: 'clamp(26px,4vw,38px)' }}>管理后台</h1>
          <p style={{ fontSize: 15 }}>管理访客账户、评论发言与用户发布的文章。</p>
        </header>

        {!isAdmin ? (
          <div className="empty">
            <div className="big">🛡</div>
            <div>此页面仅限管理员访问</div>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => openAuth('login')}>以管理员身份登录</button>
          </div>
        ) : (
          <main key={tick}>
            <div className="dash-tabs">
              {[['users', '👥 账户管理'], ['comments', '💬 发言管理'], ['articles', '📄 文章管理']].map(([id, label]) => (
                <button key={id} className={`dash-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
            <div className="editor-card">
              {tab === 'users' && <UsersTab onChange={refresh} />}
              {tab === 'comments' && <CommentsTab onChange={refresh} />}
              {tab === 'articles' && <ArticlesTab onChange={refresh} />}
            </div>
          </main>
        )}

        <footer className="footer">
          <div>© {new Date().getFullYear()} ziyi · <Link to="/blog">博客首页</Link></div>
        </footer>
      </div>
    </div>
  );
}

function UsersTab({ onChange }) {
  const users = Backend.listUsers();
  const act = (fn) => { try { fn(); onChange(); } catch (e) { toast(e.message, true); } };
  return (
    <table className="table">
      <thead>
        <tr><th>用户</th><th>角色</th><th>状态</th><th>注册时间</th><th>操作</th></tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.username}>
            <td><b>{u.username}</b></td>
            <td>
              <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {u.role === 'admin' ? '管理员' : '普通访客'}
              </span>
            </td>
            <td>{u.banned ? <span className="badge badge-ban">已封禁</span> : <span className="badge badge-user">正常</span>}</td>
            <td className="muted small">{u.created ? new Date(u.created).toLocaleString() : '-'}</td>
            <td>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <button className="link-btn" onClick={() => act(() => Backend.setUserRole(u.username, u.role === 'admin' ? 'user' : 'admin'))}>
                  {u.role === 'admin' ? '降为访客' : '设为管理员'}
                </button>
                <button className={`link-btn${u.banned ? ' ok' : ''}`} onClick={() => act(() => Backend.setBanned(u.username, !u.banned))}>
                  {u.banned ? '解除封禁' : '封禁'}
                </button>
                <button className="link-btn danger" onClick={() => {
                  if (confirm(`确认删除用户「${u.username}」？`)) act(() => Backend.deleteUser(u.username));
                }}>删除</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CommentsTab({ onChange }) {
  const list = Backend.allComments();
  if (!list.length) return <div className="empty" style={{ padding: 40 }}>暂无评论</div>;
  return (
    <table className="table">
      <thead>
        <tr><th>文章</th><th>用户</th><th>内容</th><th>时间</th><th>操作</th></tr>
      </thead>
      <tbody>
        {list.map(c => (
          <tr key={c.id}>
            <td className="muted small"><Link to={`/blog/${c.slug}`}>{c.slug}</Link></td>
            <td><b>{c.user}</b>{c.role === 'admin' && <span className="badge badge-admin">管理员</span>}</td>
            <td style={{ maxWidth: 320 }}>{c.text}</td>
            <td className="muted small">{new Date(c.time).toLocaleString()}</td>
            <td>
              <button className="link-btn danger" onClick={() => {
                if (confirm('删除这条评论？')) {
                  try { Backend.deleteComment(c.slug, c.id); onChange(); }
                  catch (e) { toast(e.message, true); }
                }
              }}>删除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ArticlesTab({ onChange }) {
  const list = Backend.allLocalArticles();
  if (!list.length) return <div className="empty" style={{ padding: 40 }}>暂无本地文章（用户发文后出现在这里）</div>;
  return (
    <table className="table">
      <thead>
        <tr><th>标题</th><th>作者</th><th>日期</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
        {list.map(a => (
          <tr key={a.slug + a.store}>
            <td><Link to={`/blog/${a.slug}`}><b>{a.title || '(无标题)'}</b></Link></td>
            <td>{a.author || '-'} {a.store === 'drafts' && <span className="badge badge-user">发布站</span>}</td>
            <td className="muted small">{a.date || ''}</td>
            <td>
              <span className={`badge ${a.status === 'published' ? 'badge-admin' : 'badge-user'}`}>
                {a.status === 'published' ? '已发布' : '草稿'}
              </span>
            </td>
            <td>
              <button className="link-btn danger" onClick={() => {
                if (confirm('确认删除这篇文章？')) {
                  try { Backend.deleteLocalArticle(a.slug, a.store); onChange(); }
                  catch (e) { toast(e.message, true); }
                }
              }}>删除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
