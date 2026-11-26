import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { openAuth } from './AuthModal.jsx';
import { toast } from '../lib/toast.js';

export function colorOf(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 62%, 52%)`;
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (!user) {
    return <button className="btn btn-sm btn-primary" onClick={() => openAuth('login')}>登录</button>;
  }

  return (
    <div className={`user-chip${open ? ' open' : ''}`} ref={ref}>
      <button
        className="user-avatar"
        style={{ '--ua': colorOf(user.username) }}
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >
        {user.username.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <div className="user-menu open" onClick={e => e.stopPropagation()}>
          <div className="user-menu-head">
            <b>{user.username}</b>
            <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
              {user.role === 'admin' ? '管理员' : '访客'}
            </span>
          </div>
          <button className="user-menu-item" onClick={() => navigate('/write')}>✍️ 写文章</button>
          {user.role === 'admin' && (
            <button className="user-menu-item" onClick={() => navigate('/manage')}>⚙️ 管理后台</button>
          )}
          {user.role === 'admin' && (
            <button className="user-menu-item" onClick={() => navigate('/publish')}>📦 发布站(导出)</button>
          )}
          <button className="user-menu-item" onClick={() => { logout(); setOpen(false); toast('已退出登录'); }}>
            🚪 退出登录
          </button>
        </div>
      )}
    </div>
  );
}
