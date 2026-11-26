import { Link } from 'react-router-dom';
import UserMenu from './UserMenu.jsx';

export default function TopBar({ onOpenSettings, tagline }) {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <div className="brand-logo">Z</div>
        <div>
          <div>ziyi</div>
          {tagline !== false && <div className="tagline">{tagline || '个人空间 · 记录与创造'}</div>}
        </div>
      </Link>
      <div className="topbar-actions">
        <Link className="icon-btn" to="/blog" title="Blog">
          <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM8 9h8M8 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
        </Link>
        <button className="icon-btn" onClick={onOpenSettings} title="Settings">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13a7.7 7.7 0 000-2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 00-1.7-1L14.8 3h-4l-.6 2.6a7.6 7.6 0 00-1.7 1l-2.3-1-2 3.4 2 1.5a7.7 7.7 0 000 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 001.7 1l.6 2.6h4l.6-2.6a7.6 7.6 0 001.7-1l2.3 1 2-3.4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" /></svg>
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
