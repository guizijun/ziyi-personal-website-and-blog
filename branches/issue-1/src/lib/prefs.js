/* prefs.js —— 主题偏好持久化 */
import { SITE_CONFIG } from '../config.js';
import { setLang } from './i18n.js';

const KEY = 'yao-space-prefs';

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...SITE_CONFIG.defaults, ...JSON.parse(raw) } : { ...SITE_CONFIG.defaults };
  } catch (e) {
    return { ...SITE_CONFIG.defaults };
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
  applyPrefs(prefs);
  return prefs;
}

export function applyPrefs(prefs) {
  const root = document.documentElement;
  let mode = prefs.mode;
  if (mode === 'auto') {
    mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-accent', prefs.accent || 'violet');
  setLang(prefs.lang || 'zh');
}
