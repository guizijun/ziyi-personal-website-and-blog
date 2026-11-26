import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu.jsx';
import { MiniMD } from '../lib/markdown.js';
import { toast } from '../lib/toast.js';

const KEY = 'yao-blog-drafts';

function loadList() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
}
function persist(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

function slugify(s) {
  return String(s).trim().toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || ('post-' + Date.now().toString(36));
}

const blank = () => ({
  slug: '', title: '', date: new Date().toISOString().slice(0, 10),
  tags: '', cover: '#7c6cff', excerpt: '', content: '', status: 'draft'
});

function download(filename, text, type) {
  const blob = new Blob([text], { type: type || 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export default function Publish() {
  const [list, setList] = useState(loadList);
  const [idx, setIdx] = useState(-1);
  const [form, setForm] = useState(blank);
  const [preview, setPreview] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const select = (i) => {
    setIdx(i);
    setForm(i < 0 ? blank() : { ...blank(), ...list[i], tags: (list[i].tags || []).join(', ') });
    setPreview(false);
  };

  const save = (status) => {
    if (!form.title.trim()) { toast('请先填写标题', true); return; }
    const data = {
      ...form,
      slug: form.slug || slugify(form.title),
      tags: form.tags.split(/[,，]/).map(s => s.trim()).filter(Boolean),
      status: status || 'draft'
    };
    const next = idx < 0 ? [data, ...list] : list.map((x, j) => (j === idx ? { ...x, ...data } : x));
    setList(next);
    persist(next);
    if (idx < 0) setIdx(0);
    toast(status === 'published' ? '已标记为发布' : '草稿已保存');
  };

  const del = () => {
    if (idx < 0) return;
    if (!confirm('确认删除这篇文章？')) return;
    const next = list.filter((_, j) => j !== idx);
    setList(next);
    persist(next);
    select(next.length ? 0 : -1);
  };

  const exportJSON = () => {
    const arr = list.filter(p => p.title).map(p => ({
      slug: p.slug || slugify(p.title),
      title: p.title,
      date: p.date,
      tags: p.tags || [],
      cover: p.cover || '#7c6cff',
      excerpt: p.excerpt || '',
      content: p.content || ''
    }));
    download('posts.json', JSON.stringify(arr, null, 2));
    toast('posts.json 已导出');
  };

  const exportMD = () => {
    if (!form.title.trim()) { toast('请先填写标题', true); return; }
    const front = [
      '---', `title: ${form.title}`, `slug: ${form.slug}`,
      `date: ${form.date}`, `tags: [${form.tags}]`,
      `cover: ${form.cover}`, `excerpt: ${form.excerpt}`, '---', ''
    ].join('\n');
    download(`${form.slug || slugify(form.title)}.md`, front + form.content, 'text/markdown;charset=utf-8');
    toast('.md 文件已导出');
  };

  return (
    <div className="blog-bg-wrap">
      <div className="blog-bg" />
      <div className="shell">
        <nav className="nav-bar">
          <Link className="logo" to="/publish">
            <div className="logo-mark">✎</div>
            <div>发布站</div>
          </Link>
          <div className="nav-links">
            <Link to="/">个人主页</Link>
            <Link to="/blog">博客前台</Link>
            <UserMenu />
          </div>
        </nav>

        <header className="hero" style={{ padding: '18px 4px 26px' }}>
          <h1 style={{ fontSize: 'clamp(26px,4vw,38px)' }}>写文章</h1>
          <p style={{ fontSize: 15 }}>Markdown 编辑 · 实时预览 · 一键导出。数据保存在浏览器本地。</p>
        </header>

        <div className="admin-layout">
          <aside className="side-card">
            <div className="row-between" style={{ marginBottom: 12 }}>
              <div className="side-title" style={{ margin: 0 }}>文章</div>
              <button className="btn btn-sm btn-primary" onClick={() => select(-1)}>＋ 新建</button>
            </div>
            <div id="post-list">
              {list.length === 0 ? (
                <div className="muted small" style={{ padding: '8px 4px' }}>还没有文章，点「新建」开始写作</div>
              ) : list.map((p, i) => (
                <button key={i} className={`post-item${i === idx ? ' active' : ''}`} onClick={() => select(i)}>
                  <div className="t">{p.title || '（无标题）'}</div>
                  <div className="d">
                    {p.date || ''} · <span className={`status-chip ${p.status === 'published' ? 'published' : 'draft'}`}>
                      {p.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="hint-box">
              <b>部署提示</b><br />
              导出的 <code>posts.json</code> 放入 <code>src/data/posts.json</code> 重新构建即可上线。
            </div>
          </aside>

          <section className="editor-card">
            <div className="row-between" style={{ marginBottom: 18 }}>
              <div className="row">
                <h2 style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.015em' }}>编辑器</h2>
                <span className={`status-chip ${form.status === 'published' ? 'published' : 'draft'}`}>
                  {form.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
              <div className="row">
                <button className="btn btn-sm" onClick={() => setPreview(v => !v)}>{preview ? '收起预览' : '预览'}</button>
                <button className="btn btn-sm btn-primary" onClick={() => save('published')}>发布</button>
              </div>
            </div>

            <div className="editor-grid">
              <div>
                <label className="lbl">标题</label>
                <input className="field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="文章标题" />
              </div>
              <div>
                <label className="lbl">链接标识 (slug)</label>
                <input className="field" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="my-post" />
              </div>
              <div>
                <label className="lbl">日期</label>
                <input className="field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="lbl">标签（逗号分隔）</label>
                <input className="field" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="前端, 教程" />
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
                <textarea className="md-input" value={form.content} onChange={e => set('content', e.target.value)} placeholder="## 开始写作…" />
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => save('draft')}>保存草稿</button>
              <button className="btn" onClick={exportJSON}>导出 posts.json</button>
              <button className="btn" onClick={exportMD}>导出 .md</button>
              <button className="btn btn-danger" onClick={del}>删除</button>
            </div>

            {preview && (
              <div className="preview-pane open">
                <div className="side-title">预览</div>
                <h1 style={{ fontSize: 26, letterSpacing: '-.02em', margin: '10px 0' }}>{form.title || '（无标题）'}</h1>
                <div className="article-meta" style={{ marginBottom: 16 }}>{form.date}</div>
                <article className="md" dangerouslySetInnerHTML={{ __html: MiniMD.render(form.content) }} />
              </div>
            )}
          </section>
        </div>

        <footer className="footer">
          <div>© {new Date().getFullYear()} ziyi · <Link to="/blog">博客前台</Link></div>
        </footer>
      </div>
    </div>
  );
}
