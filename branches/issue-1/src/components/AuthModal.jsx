import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { toast } from '../lib/toast.js';

/* 打开方式：window.dispatchEvent(new CustomEvent('auth:open', { detail: { mode: 'login' } })) */
export function openAuth(mode = 'login') {
  window.dispatchEvent(new CustomEvent('auth:open', { detail: { mode } }));
}

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');
  const userRef = useRef(null);
  const { login, register } = useAuth();

  useEffect(() => {
    const handler = e => {
      setMode(e.detail?.mode || 'login');
      setErr('');
      setOpen(true);
    };
    window.addEventListener('auth:open', handler);
    return () => window.removeEventListener('auth:open', handler);
  }, []);

  const submit = async () => {
    setErr('');
    try {
      const form = document.getElementById('auth-form');
      const u = form.querySelector('[name=user]').value;
      const p = form.querySelector('[name=pass]').value;
      if (mode === 'login') {
        await login(u, p);
        toast('登录成功');
      } else {
        const p2 = form.querySelector('[name=pass2]')?.value;
        if (p !== p2) { setErr('两次输入的密码不一致'); return; }
        await register(u, p);
        toast('注册成功，已自动登录');
      }
      setOpen(false);
    } catch (e) {
      setErr(e.message || '操作失败');
    }
  };

  const onKey = e => { if (e.key === 'Enter') submit(); };

  return (
    <div className={`ov-mask${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="ov-modal" id="auth-form">
        <div className="row-between">
          <h3>{mode === 'login' ? '登录' : '注册'}</h3>
          <button className="ov-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <p className="muted small" style={{ margin: '6px 0 16px' }}>
          {mode === 'login' ? '登录后可发文、评论并管理自己的内容。' : '密码经加盐哈希后存储，不会保存明文。'}
        </p>
        <label className="lbl">用户名</label>
        <input className="field" name="user" ref={userRef} placeholder="用户名" onKeyDown={onKey} />
        <label className="lbl" style={{ marginTop: 12 }}>密码{mode === 'register' && '（至少 6 位）'}</label>
        <input className="field" name="pass" type="password" placeholder="密码" onKeyDown={onKey} />
        {mode === 'register' && (
          <>
            <label className="lbl" style={{ marginTop: 12 }}>确认密码</label>
            <input className="field" name="pass2" type="password" placeholder="再次输入密码" onKeyDown={onKey} />
          </>
        )}
        <div className="auth-err">{err}</div>
        <div className="row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
            {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
          </button>
          <button className="btn btn-primary" onClick={submit}>
            {mode === 'login' ? '登录' : '注册并登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
