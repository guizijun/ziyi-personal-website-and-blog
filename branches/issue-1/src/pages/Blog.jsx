import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu.jsx';
import { MiniMD } from '../lib/markdown.js';
import staticPosts from '../data/posts.json';
import { t } from '../lib/i18n.js';

function collectPosts() {
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
    } catch (e) { /* ignore */ }
  });
  staticPosts.forEach(p => {
    if (!slugs.has(p.slug)) { slugs.add(p.slug); out.push({ ...p, author: '' }); }
  });
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function highlight(text, q) {
  const safe = MiniMD.esc(text || '');
  if (!q) return { __html: safe };
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return { __html: safe.replace(re, '<mark>$1</mark>') };
}

export default function Blog() {
  const [posts] = useState(collectPosts);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    document.title = 'Yao Blog · 文章';
  }, []);

  const tags = useMemo(() => {
    const set = new Set();
    posts.forEach(p => (p.tags || []).forEach(x => set.add(x)));
    return [...set];
  }, [posts]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return posts.filter(p => {
      if (tag && !(p.tags || []).includes(tag)) return false;
      if (!key) return true;
      return [p.title, p.excerpt, (p.tags || []).join(' '), p.content]
        .join(' ').toLowerCase().includes(key);
    });
  }, [posts, q, tag]);

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
            <Link to="/write">写文章</Link>
            <Link to="/">个人主页</Link>
            <UserMenu />
          </div>
        </nav>

        <header className="hero">
          <h1>写作、思考与记录</h1>
          <p>这里是 ziyi 的博客。关于前端开发、设计、工具与生活里那些值得被记住的瞬间。</p>
          <div className="search-bar">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={t('search_posts')}
              onKeyDown={e => { if (e.key === 'Enter') { /* 实时过滤 */ } }}
            />
            <button>搜索</button>
          </div>
          <div className="tag-row">
            <button className={`tag${tag === '' ? ' active' : ''}`} onClick={() => setTag('')}>全部</button>
            {tags.map(x => (
              <button key={x} className={`tag${tag === x ? ' active' : ''}`} onClick={() => setTag(x)}>{x}</button>
            ))}
          </div>
        </header>

        <main className="post-grid">
          {filtered.length === 0 ? (
            <div className="empty" style={{ gridColumn: '1 / -1' }}>
              <div className="big">📭</div>
              <div>{t('no_posts')}</div>
            </div>
          ) : filtered.map(p => (
            <Link className="post-card" key={p.slug} to={`/blog/${p.slug}`}>
              <div className="post-cover" style={{ background: `linear-gradient(90deg, ${p.cover || '#7c6cff'}, ${p.cover || '#7c6cff'}88)` }} />
              <div className="post-date">{p.date || ''}{p.author ? ` · ${p.author}` : ''}</div>
              <h2 dangerouslySetInnerHTML={highlight(p.title, q)} />
              <div className="post-excerpt" dangerouslySetInnerHTML={highlight(p.excerpt, q)} />
              <div className="post-foot">
                <div className="post-tags">{(p.tags || []).map(x => <span key={x}>{x}</span>)}</div>
                <span className="read-more">阅读全文 →</span>
              </div>
            </Link>
          ))}
        </main>

        <footer className="footer">
          <div>© {new Date().getFullYear()} ziyi · <Link to="/">个人主页</Link></div>
          <div style={{ marginTop: 8 }} className="muted">Built with React + Vite · Deployed on Cloudflare</div>
        </footer>
      </div>
    </div>
  );
}
