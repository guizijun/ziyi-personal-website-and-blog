import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu.jsx';
import { openAuth } from '../components/AuthModal.jsx';
import { MiniMD } from '../lib/markdown.js';
import { Backend } from '../lib/backend.js';
import { useAuth } from '../lib/auth.jsx';
import { toast } from '../lib/toast.js';

const blank = () => ({
  slug: '', title: '', date: new Date().toISOString().slice(0, 10),
  tags: '', cover: '#7c6cff', excerpt: '', content: ''
});

function slugify(s) {
  return String(s).trim().toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || ('p-' + Date.now().toString(36));
}

export default function Write() {
  const { user, ready } = useAuth();
  const [form, setForm] = useState(blank);
  const [editSlug, setEditSlug] = useState(null);
  const [preview, setPreview] = useState(false);
  const [mine, setMine] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setMine(Backend.myArticles());
  }, [user]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const publish = () => {
    try {
      const rec = Backend.upsertArticle({
        slug: editSlug || (form.slug || slugify(form.title)),
        title: form.title,
        date: form.date,
        tags: form.tags.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        cover: form.cover,
        excerpt: form.excerpt,
        content: form.content
      });
      toast(editSlug ? '文章已更新' : '文章已发布');
      setTimeout(() => navigate(`/blog/${rec.slug}`), 400);
    } catch (e) {
      toast(e.message || '发布失败', true);
    }
  };

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
            <Link to="/">个人主页</Link>
            <UserMenu />
          </div>
        </nav>

        <header className="hero" style={{ padding: '14px 4px 22px' }}>
          <h1 style={{ fontSize: 'clamp(26px,4vw,38px)' }}>写文章</h1>
          <p style={{ fontSize: 15 }}>登录后即可发表你的文章，支持 Markdown 排版与实时预览。</p>
        </header>

        {!ready ? null : !user ? (
          <div className="empty">
            <div className="big">🔐</div>
            <div>请先登录后再发文</div>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => openAuth('login')}>登录 / 注册</button>
          </div>
        ) : (
          <>
            <div className="editor-card">
              <div className="row-between" style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 19, fontWeight: 750 }}>{editSlug ? '编辑文章' : '写文章'}</h2>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => setPreview(v => !v)}>{preview ? '收起预览' : '预览'}</button>
                  <button className="btn btn-sm btn-primary" onClick={publish}>发布文章</button>
                </div>
              </div>

              <div className="editor-grid">
                <div>
                  <label className="lbl">标题</label>
                  <input className="field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="文章标题" />
                </div>
                <div>
                  <label className="lbl">链接标识 (slug)</label>
                  <input className="field" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder={slugify(form.title) || 'my-post'} />
                </div>
                <div>
                  <label className="lbl">日期</label>
                  <input className="field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                  <label className="lbl">标签（逗号分隔）</label>
                  <input className="field" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="随笔, 技术" />
                </div>
                <div>
                  <label className="lbl">封面色</label>
                  <input className="field" type="color" value={form.cover} onChange={e => set('cover', e.target.value)} style={{ height: 44, padding: 4 }} />
                </div>
                <div>
                  <label className="lbl">摘要</label>
                  <input className="field" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="一两句话介绍这篇文章" />
                </div>
                <div className="full">
                  <label className="lbl">正文 (Markdown)</label>
                  <textarea className="md-input" value={form.content} onChange={e => set('content', e.target.value)} placeholder={'## 开始写作\n\n支持标题、列表、代码块、引用、表格、粗斜体、链接、图片……'} />
                </div>
              </div>

              <div className="btn-row">
                <button className="btn btn-ghost" onClick={() => { setForm(blank()); setEditSlug(null); setPreview(false); }}>清空 / 新建</button>
              </div>

              {preview && (
                <div className="preview-pane open">
                  <div className="side-title" style={{ marginBottom: 10 }}>预览</div>
                  <h1 style={{ fontSize: 25, letterSpacing: '-.02em', marginBottom: 10 }}>{form.title || '（无标题）'}</h1>
                  <article className="md" dangerouslySetInnerHTML={{ __html: MiniMD.render(form.content) }} />
                </div>
              )}
            </div>

            <div className="editor-card" style={{ marginTop: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 750, marginBottom: 8 }}>我的文章</h2>
              {mine.length === 0 ? (
                <div className="muted small" style={{ padding: '10px 0' }}>还没有发表过文章</div>
              ) : mine.map(a => (
                <div className="post-item-mini" key={a.slug}>
                  <div className="t">
                    <Link to={`/blog/${a.slug}`}>{a.title}</Link>
                    <div className="muted small">{a.date || ''}</div>
                  </div>
                  <button
                    className="link-btn"
                    onClick={() => {
                      setEditSlug(a.slug);
                      setForm({
                        slug: a.slug, title: a.title, date: a.date || '',
                        tags: (a.tags || []).join(', '), cover: a.cover || '#7c6cff',
                        excerpt: a.excerpt || '', content: a.content || ''
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >编辑</button>
                  <button
                    className="link-btn danger"
                    onClick={() => {
                      if (!confirm('确认删除这篇文章？')) return;
                      try {
                        Backend.deleteArticle(a.slug);
                        setMine(Backend.myArticles());
                        toast('文章已删除');
                      } catch (e) { toast(e.message, true); }
                    }}
                  >删除</button>
                </div>
              ))}
            </div>
          </>
        )}

        <footer className="footer">
          <div>© {new Date().getFullYear()} ziyi · <Link to="/blog">博客首页</Link></div>
        </footer>
      </div>
    </div>
  );
}
