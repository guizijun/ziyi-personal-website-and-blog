import { useEffect, useState, useRef } from 'react';
import { setToastListener } from './lib/toast.js';
import { AuthProvider } from './lib/auth.jsx';
import { Routes, Route, useLocation } from 'react-router-dom';
import { loadPrefs, applyPrefs, savePrefs } from './lib/prefs.js';
import Background from './components/Background.jsx';
import AuthModal from './components/AuthModal.jsx';
import Home from './pages/Home.jsx';
import Blog from './pages/Blog.jsx';
import Article from './pages/Article.jsx';
import Write from './pages/Write.jsx';
import Manage from './pages/Manage.jsx';
import Publish from './pages/Publish.jsx';

function ToastHost() {
  const [state, setState] = useState(null);
  const timer = useRef(null);
  useEffect(() => {
    setToastListener((msg, isErr) => {
      setState({ msg, isErr });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState(null), 2400);
    });
    return () => clearTimeout(timer.current);
  }, []);
  if (!state) return null;
  return <div className={`toast show${state.isErr ? ' err' : ''}`}>{state.msg}</div>;
}

export default function App() {
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const location = useLocation();

  useEffect(() => {
    applyPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const updatePrefs = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(savePrefs(next));
  };

  return (
    <AuthProvider>
      <Background prefs={prefs} />
      <ToastHost />
      <Routes>
        <Route path="/" element={<Home prefs={prefs} updatePrefs={updatePrefs} />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Article />} />
        <Route path="/write" element={<Write />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="*" element={<Blog />} />
      </Routes>
      <AuthModal />
    </AuthProvider>
  );
}
