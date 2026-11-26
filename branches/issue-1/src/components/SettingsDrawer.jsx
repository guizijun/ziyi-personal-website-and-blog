import { useState } from 'react';
import { t } from '../lib/i18n.js';
import { SITE_CONFIG } from '../config.js';

const ACCENTS = [
  ['violet', '#7c6cff'], ['blue', '#3b82f6'], ['teal', '#14b8a6'], ['rose', '#f43f5e'],
  ['amber', '#f59e0b'], ['green', '#22c55e'], ['pink', '#ec4899'], ['indigo', '#6366f1']
];
const BGS = [
  ['aurora', 'bg_aurora'], ['stars', 'bg_stars'], ['particles', 'bg_particles'],
  ['gradient', 'bg_gradient'], ['image', 'bg_image_opt'], ['none', 'bg_none']
];

export default function SettingsDrawer({ open, onClose, prefs, updatePrefs, onCityChange }) {
  const [img, setImg] = useState(prefs.backgroundImage || '');
  const [city, setCity] = useState(prefs.city || SITE_CONFIG.defaultCity);

  const patch = updatePrefs;

  return (
    <>
      <div className={`drawer-mask${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <h3>{t('settings')}</h3>
          <button className="icon-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="set-block">
          <label className="lbl">{t('theme_color')}</label>
          <div className="swatches">
            {ACCENTS.map(([id, c]) => (
              <button
                key={id}
                className={`swatch${prefs.accent === id ? ' active' : ''}`}
                style={{ '--sw': c }}
                onClick={() => patch({ accent: id })}
                title={id}
              />
            ))}
          </div>
        </div>

        <div className="set-block">
          <label className="lbl">{t('mode')}</label>
          <div className="seg">
            {['dark', 'light', 'auto'].map(m => (
              <button key={m} className={`seg-item${prefs.mode === m ? ' active' : ''}`} onClick={() => patch({ mode: m })}>
                {t(m)}
              </button>
            ))}
          </div>
        </div>

        <div className="set-block">
          <label className="lbl">{t('background')}</label>
          <div className="seg wrap-seg">
            {BGS.map(([id, key]) => (
              <button key={id} className={`seg-item${prefs.background === id ? ' active' : ''}`} onClick={() => patch({ background: id })}>
                {t(key)}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="lbl">{t('bg_speed')} <span className="muted">{prefs.bgSpeed ?? 1}</span></label>
            <input
              type="range" min="0.2" max="3" step="0.1"
              value={prefs.bgSpeed ?? 1}
              onChange={e => patch({ bgSpeed: +e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="lbl">{t('bg_image')}</label>
            <input className="field" value={img} placeholder="https://…" onChange={e => setImg(e.target.value)} />
            <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => patch({ backgroundImage: img.trim() })}>
              {t('save')}
            </button>
          </div>
        </div>

        <div className="set-block">
          <label className="lbl">{t('language')}</label>
          <div className="seg">
            {[['zh', '中文'], ['en', 'English']].map(([id, label]) => (
              <button key={id} className={`seg-item${prefs.lang === id ? ' active' : ''}`} onClick={() => patch({ lang: id })}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="set-block">
          <label className="lbl">{t('city')}</label>
          <input
            className="field" value={city}
            onChange={e => setCity(e.target.value)}
            onBlur={() => {
              patch({ city: city.trim(), coords: null });
              if (onCityChange) onCityChange(city.trim());
            }}
          />
        </div>

        <div className="set-block" style={{ marginTop: 26 }}>
          <button
            className="btn btn-ghost"
            onClick={() => {
              localStorage.removeItem('yao-space-prefs');
              const d = { ...SITE_CONFIG.defaults };
              patch(d);
              setCity(SITE_CONFIG.defaultCity);
              setImg('');
              if (onCityChange) onCityChange(SITE_CONFIG.defaultCity);
            }}
          >
            {t('reset')}
          </button>
          <div className="muted small" style={{ marginTop: 10 }}>数据保存在浏览器本地</div>
        </div>
      </aside>
    </>
  );
}
