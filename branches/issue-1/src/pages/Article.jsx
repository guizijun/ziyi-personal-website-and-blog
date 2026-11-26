import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import UserMenu from '../components/UserMenu.jsx';
import { openAuth } from '../components/AuthModal.jsx';
import { MiniMD } from '../lib/markdown.js';
import staticPosts from '../data/posts.json';
import { Backend } from '../lib/backend.js';
import { useAuth } from '../lib/auth.jsx';
import { colorOf } from '../components/UserMenu.jsx';
import { toast } from '../lib/toast.js';

function findPost(slug) {
  let found = null;
  ['yao-articles', 'yao-blog-drafts'].forEach(key => {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      const hit = arr.find(d => d.slug === slug && d.title);
      if (hit && !found) {
        found = {
          slug: hit.slug, title: hit.title, date: hit.date, tags: hit.tags || [],
          cover: hit.cover || '#7c6cff', excerpt: hit.excerpt || '',
          content: hit.content || '', author: hit.author || ''
        };
      }
    } catch (e) { /* ignore */ }
  });
  if (!found) {
    const hit = staticPosts.find(p => p.slug === slug);
    if (hit) found = { ...hit, author: '' };
  }
  return found;
}

export default function Article() {
  const { slug } = useParams();
  const post = useMemo(() => findPost(slug), [slug]);
  const [, force] = useState(0);

  useEffect(() => {
    document.title = (post ? post.title : '文章') + ' · Yao Blog';
  }, [post]);

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

        <main className="article-wrap" id="article-root">
          {!post ? (
            <div className="empty">
              <div className="big">🔍</div>
              <div>文章不存在或已被移动</div>
              <Link className="back-link" to="/blog" style={{ marginTop: 18 }}>← 返回首页</Link>
            </div>
          ) : (
            <>
              <Link className="back-link" to="/blog">← 返回</Link>
              <div className="article-head">
                <h1>{post.title}</h1>
                <div className="article-meta">
                  <span>📅 {post.date || ''}</span>
                  {post.author && <span>✍️ {post.author}</span>}
                  {(post.tags || []).map(x => <span className="tag" key={x}>{x}</span>)}
                </div>
              </div>
              <div className="divider" />
              <article className="md" dangerouslySetInnerHTML={{ __html: MiniMD.render(post.content) }} />
              <div className="divider" />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Link className="back-link" to="/blog">← 全部文章</Link>
                <Link className="back-link" to="/">个人主页 →</Link>
              </div>
            </>
          )}
        </main>

        {post && (
          <section className="article-wrap comments">
            <Comments slug={post.slug} onChange={() => force(x => x + 1)} />
          </section>
        )}

        <footer className="footer">
          <div>© {new Date().getFullYear()} ziyi</div>
        </footer>
      </div>
    </div>
  );
}

function Comments({ slug }) {
  const { user } = useAuth();
  const [list, setList] = useState(() => Backend.getComments(slug));
  const [text, setText] = useState('');
  const [, force] = useState(0);

  const reload = () => setList(Backend.getComments(slug));

  const submit = () => {
    try {
      Backend.addComment(slug, text);
      setText('');
      reload();
      toast('评论已发表');
    } catch (e) {
      toast(e.message || '发表失败', true);
    }
  };

  const del = (id) => {
    if (!confirm('删除这条评论？')) return;
    try {
      Backend.deleteComment(slug, id);
      reload();
      toast('评论已删除');
    } catch (e) {
      toast(e.message || '删除失败', true);
    }
  };

  return (
    <>
      <div className="comments-title">💬 评论 <span className="muted small">({list.length})</span></div>
      {user ? (
        <div className="comment-form">
          <textarea
            maxLength={500}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="写下你的评论（最多 500 字）…"
          />
          <div className="row">
            <span className="muted small">以 <b>{user.username}</b> 的身份发表</span>
            <button className="btn btn-primary btn-sm" onClick={submit}>发表评论</button>
          </div>
        </div>
      ) : (
        <div className="card flat" style={{ padding: 18, marginBottom: 8 }}>
          <div className="row-between">
            <span className="muted small">登录后即可参与评论。</span>
            <button className="btn btn-primary btn-sm" onClick={() => openAuth('login')}>登录 / 注册</button>
          </div>
        </div>
      )}
      <div className="comment-list">
        {list.length === 0 ? (
          <div className="empty" style={{ padding: '34px 10px' }}>还没有评论，来抢沙发～</div>
        ) : list.map(c => {
          const canDel = user && (user.username === c.user || user.role === 'admin');
          return (
            <div className="comment-item" key={c.id}>
              <div className="comment-avatar" style={{ background: colorOf(c.user) }}>
                {(c.user || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-head">
                  <span className="comment-name">{c.user}</span>
                  {c.role === 'admin' && <span className="badge badge-admin">管理员</span>}
                  <span className="comment-time">{new Date(c.time).toLocaleString()}</span>
                  {canDel && <button className="comment-del" onClick={() => del(c.id)}>删除</button>}
                </div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
