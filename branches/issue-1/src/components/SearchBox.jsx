import { useState, useRef, useEffect } from 'react';
import { SITE_CONFIG } from '../config.js';
import { t } from '../lib/i18n.js';

export default function SearchBox() {
  const engines = SITE_CONFIG.searchEngines;
  const [curId, setCurId] = useState(() => localStorage.getItem('yao-search-engine') || engines[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const [switching, setSwitching] = useState(false);
  const wrapRef = useRef(null);
  const cur = engines.find(e => e.id === curId) || engines[0];

  useEffect(() => {
    const close = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    const setQFromPage = e => setQ(e.detail || '');
    document.addEventListener('click', close);
    window.addEventListener('search:setQuery', setQFromPage);
    return () => {
      document.removeEventListener('click', close);
      window.removeEventListener('search:setQuery', setQFromPage);
    };
  }, []);

  const pick = (id) => {
    setCurId(id);
    localStorage.setItem('yao-search-engine', id);
    setMenuOpen(false);
    setSwitching(false);
    requestAnimationFrame(() => setSwitching(true));
    setTimeout(() => setSwitching(false), 420);
  };

  const go = () => {
    const query = q.trim();
    if (!query) return;
    window.open(cur.url.replace('{q}', encodeURIComponent(query)), '_blank', 'noopener');
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className={`search-shell${switching ? ' switching' : ''}`}>
        <button className="engine-btn" type="button" onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}>
          <span className="engine-dot" style={{ background: cur.color }} />
          <span className="engine-name">{cur.name}</span>
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <input
          className="search-input"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') go(); }}
          placeholder={t('search_ph')}
          autoComplete="off"
        />
        <button className="search-go" type="button" onClick={go} aria-label="search">
          <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" strokeWidth="2" /><path d="M20 20l-3.2-3.2" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      {menuOpen && (
        <div className="engine-menu open">
          {engines.map(e => (
            <button key={e.id} className={`engine-item${e.id === curId ? ' active' : ''}`} onClick={() => pick(e.id)}>
              <span className="engine-dot" style={{ background: e.color }} />
              <span>{e.name}</span>
              <span className="muted small">{e.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
