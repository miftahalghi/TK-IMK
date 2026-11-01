/**
 * Status login untuk seluruh aplikasi. Halaman login dibuat oleh fitur auth;
 * context ini sudah berfungsi sejak awal supaya sidebar dan settings bisa
 * dikembangkan tanpa menunggu.
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as authService from "./authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSession());

  const login = useCallback(async (email, password) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @returns {{
 *   user: { name: string, email: string } | null,
 *   login: (email: string, password: string) => Promise<{ name: string, email: string }>,
 *   logout: () => Promise<void>
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}
