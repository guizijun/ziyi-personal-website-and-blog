import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config.js';
import { t } from '../lib/i18n.js';
import TopBar from '../components/TopBar.jsx';
import SettingsDrawer from '../components/SettingsDrawer.jsx';
import WeatherCard from '../components/WeatherCard.jsx';
import SearchBox from '../components/SearchBox.jsx';
import ShortcutsGrid from '../components/ShortcutsGrid.jsx';

const TABS = [
  { id: 'home', icon: <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" />, key: 'nav_home' },
  { id: 'search', icon: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></>, key: 'nav_search' },
  { id: 'shortcuts', icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>, key: 'nav_shortcuts' }
];

export default function Home({ prefs, updatePrefs }) {
  const [tab, setTab] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [city, setCity] = useState(prefs.city || SITE_CONFIG.defaultCity);
  const u = SITE_CONFIG.user;

  useEffect(() => {
    setCity(prefs.city || SITE_CONFIG.defaultCity);
  }, [prefs.city]);

  const onLocated = ({ label }) => {
    updatePrefs({ coords: undefined, city: label });
    // 经纬度持久化
    const next = { ...prefs, city: label };
    updatePrefs(next);
  };

  return (
    <div className="app">
      <div className="wrap">
        <TopBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* ========== 第一页：个人信息 ========== */}
        {tab === 'home' && (
          <section className="page active">
            <div className="hero">
              <div className="card profile-card">
                <div className="profile-head">
                  <div className="profile-avatar">
                    {u.avatar ? <img src={u.avatar} alt={u.name} /> : (u.initials || u.name.slice(0, 1))}
                  </div>
                  <div>
                    <div className="profile-name">{u.name}</div>
                    <div className="profile-role">{u.role}</div>
                  </div>
                </div>
                <p className="profile-bio">{u.bio}</p>
                <div className="row small muted">📍 {u.location}</div>
                <div className="row">
                  {u.links.map(l => (
                    <a className="tag" key={l.label} href={l.url} target="_blank" rel="noopener">{l.label}</a>
                  ))}
                </div>
                <div className="profile-cta">
                  <Link className="btn btn-primary" to="/blog">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 5h16v14H4zM8 9h8M8 13h6" /></svg>
                    <span>{t('visit_blog')}</span>
                  </Link>
                  <Link className="btn" to="/publish">{t('open_admin')}</Link>
                </div>
              </div>

              <div className="card">
                <div className="card-title"><span className="dot" />{t('about')}</div>
                <div className="stat-grid">
                  <div className="stat"><div className="n">3+</div><div className="l">YEARS CODING</div></div>
                  <div className="stat"><div className="n">20+</div><div className="l">PROJECTS</div></div>
                  <div className="stat"><div className="n">∞</div><div className="l">CURIOSITY</div></div>
                  <div className="stat"><div className="n">24/7</div><div className="l">CREATING</div></div>
                </div>
                <div className="card-title" style={{ marginTop: 22 }}><span className="dot" />{t('skills')}</div>
                <div className="skill-list">
                  {['JavaScript', 'TypeScript', 'Vue', 'React', 'Node.js', 'Python', 'UI Design', 'Three.js'].map(s => (
                    <div className="skill" key={s}><i />{s}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lower">
              <div className="card">
                <div className="card-title"><span className="dot" />Recent</div>
                <p className="muted small">{t('recent_text')}</p>
                <div className="row" style={{ marginTop: 16 }}>
                  <Link className="tag" to="/blog">Blog</Link>
                  <Link className="tag" to="/publish">Admin</Link>
                  <span className="tag muted">v1.0</span>
                </div>
              </div>
              <div className="card">
                <div className="card-title"><span className="dot" />Now</div>
                <p className="muted small">{t('now_text')}</p>
                <div className="row" style={{ marginTop: 16 }}>
                  <span className="tag">Web</span>
                  <span className="tag">Music</span>
                  <span className="tag">AI</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========== 第二页：搜索 ========== */}
        {tab === 'search' && (
          <section className="page active">
            <div className="search-layout">
              <WeatherCard city={city} onLocated={onLocated} />
              <div>
                <SearchBox />
                <div className="search-hint">
                  {[['今日热点', '🔥 今日热点'], ['JS 教程', 'JS 教程'], ['天气', '天气'], ['音乐', '音乐'], ['前端', '前端'], ['AI', 'AI']].map(([q, label]) => (
                    <button key={q} className="hint-chip" onClick={() => {
                      window.dispatchEvent(new CustomEvent('search:setQuery', { detail: q }));
                      const input = document.querySelector('.search-input');
                      if (input) input.focus();
                    }}>{label}</button>
                  ))}
                </div>
                <div className="card" style={{ marginTop: 18 }}>
                  <div className="card-title"><span className="dot" />Tips</div>
                  <p className="muted small">{t('tips_text')}</p>
                  <div className="row" style={{ marginTop: 14 }}>
                    <button className="btn btn-sm" onClick={() => setSettingsOpen(true)}>{t('settings')}</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========== 第三页：快捷方式 ========== */}
        {tab === 'shortcuts' && (
          <section className="page active">
            <div className="card flat" style={{ marginBottom: 18 }}>
              <div className="row-between">
                <div>
                  <div className="card-title"><span className="dot" />{t('shortcuts')}</div>
                  <p className="muted small">点击「+」添加你常用的网站。悬停卡片可编辑或删除，数据保存在浏览器本地。</p>
                </div>
                <button className="btn btn-sm" onClick={() => setSettingsOpen(true)}>{t('settings')}</button>
              </div>
            </div>
            <ShortcutsGrid />
          </section>
        )}
      </div>

      {/* 底部导航 */}
      <div className="nav-wrap">
        <nav className="nav">
          {TABS.map(tb => (
            <button key={tb.id} className={`nav-item${tab === tb.id ? ' active' : ''}`} onClick={() => setTab(tb.id)}>
              <svg viewBox="0 0 24 24">{tb.icon}</svg>
              <span className="label">{t(tb.key)}</span>
            </button>
          ))}
        </nav>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        updatePrefs={updatePrefs}
        onCityChange={c => setCity(c || SITE_CONFIG.defaultCity)}
      />
    </div>
  );
}
