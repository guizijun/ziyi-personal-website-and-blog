import { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config.js';
import { t } from '../lib/i18n.js';
import { toast } from '../lib/toast.js';

const KEY = 'yao-shortcuts';

function loadList() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [...SITE_CONFIG.shortcuts];
  } catch (e) {
    return [...SITE_CONFIG.shortcuts];
  }
}

function initials(name) {
  const s = (name || '?').trim();
  return /^[A-Za-z]/.test(s) ? s.slice(0, 2).toUpperCase() : s[0];
}

export default function ShortcutsGrid() {
  const [list, setList] = useState(loadList);
  const [editing, setEditing] = useState(null); // { index, item }

  const persist = (next) => {
    setList(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <>
      <div className="sc-grid">
        {list.map((s, i) => (
          <a className="sc-card" key={i} href={s.url} target="_blank" rel="noopener">
            <div className="sc-actions">
              <button
                className="sc-act"
                title={t('edit')}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setEditing({ index: i, item: s }); }}
              >✎</button>
              <button
                className="sc-act"
                title={t('del')}
                onClick={e => {
                  e.preventDefault(); e.stopPropagation();
                  if (confirm(t('confirm_del'))) persist(list.filter((_, j) => j !== i));
                }}
              >✕</button>
            </div>
            <div className="sc-icon" style={{ background: s.color || '#7c6cff' }}>{s.icon || initials(s.name)}</div>
            <div className="sc-name">{s.name}</div>
            <div className="sc-url muted small">{(s.url || '').replace(/^https?:\/\//, '').slice(0, 28)}</div>
          </a>
        ))}
        <button className="sc-card sc-add" onClick={() => setEditing({ index: -1, item: { name: '', url: '', icon: '', color: '#7c6cff' } })}>
          <div className="sc-icon sc-icon-add">+</div>
          <div className="sc-name">{t('add_shortcut')}</div>
        </button>
      </div>

      {editing && (
        <ShortcutModal
          data={editing.item}
          isNew={editing.index === -1}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            if (editing.index === -1) persist([...list, item]);
            else persist(list.map((x, j) => (j === editing.index ? item : x)));
            setEditing(null);
            toast(t('save') + ' ✓');
          }}
        />
      )}
    </>
  );
}

function ShortcutModal({ data, isNew, onClose, onSave }) {
  const [item, setItem] = useState(data);
  const set = (k, v) => setItem(prev => ({ ...prev, [k]: v }));

  return (
    <div className="ov-mask open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ov-modal">
        <div className="row-between">
          <h3>{isNew ? t('add_shortcut') : t('edit')}</h3>
          <button className="ov-close" onClick={onClose}>✕</button>
        </div>
        <label className="lbl">{t('name')}</label>
        <input className="field" value={item.name} onChange={e => set('name', e.target.value)} placeholder="GitHub" />
        <label className="lbl" style={{ marginTop: 12 }}>{t('url')}</label>
        <input className="field" value={item.url} onChange={e => set('url', e.target.value)} placeholder="https://" />
        <label className="lbl" style={{ marginTop: 12 }}>{t('icon_text')}</label>
        <input className="field" value={item.icon} onChange={e => set('icon', e.target.value)} maxLength={3} placeholder="GH" />
        <label className="lbl" style={{ marginTop: 12 }}>{t('color')}</label>
        <input className="field" type="color" value={item.color || '#7c6cff'} onChange={e => set('color', e.target.value)} style={{ height: 44, padding: 4 }} />
        <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!item.name.trim() || !item.url.trim()) return;
              onSave({
                ...item,
                url: /^https?:\/\//.test(item.url) ? item.url : 'https://' + item.url
              });
            }}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
