import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Backend } from './backend.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Backend.init()
      .then(() => { if (alive) setUser(Backend.currentUser()); })
      .catch(() => {})
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (u, p) => {
    const usr = await Backend.login(u, p);
    setUser(usr);
    return usr;
  }, []);

  const register = useCallback(async (u, p) => {
    const usr = await Backend.register(u, p);
    setUser(usr);
    return usr;
  }, []);

  const logout = useCallback(() => {
    Backend.logout();
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, ready, login, register, logout, refresh: () => setUser(Backend.currentUser()) }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }
