import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, TOKEN_KEY, USER_KEY } from "./api";

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  handle: string;
  role: string;
  phone?: string;
  img?: string | null;
  email_verified_at?: string | null;
  registration_completed?: boolean | number;
  token?: string;
  [k: string]: unknown;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setSession: (user: AuthUser, token: string) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setToken(t);
    if (u) {
      try { setUser(JSON.parse(u)); } catch { /* noop */ }
    }
    setLoading(false);
  }, []);

  const setSession = useCallback((u: AuthUser, t: string) => {
    const clean = t.startsWith("Bearer ") ? t.slice(7) : t;
    localStorage.setItem(TOKEN_KEY, clean);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    setToken(clean);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get("/api/profile");
      // Show Profile returns { data: { user: {...} } }
      // Update Profile returns { data: {...} }
      const data = res.data?.data?.user ?? res.data?.data ?? null;
      if (data) {
        // Normalize any image alias into `img`
        const img =
          data.img ?? data.image ?? data.image_url ?? data.avatar ??
          data.profile_image ?? data.profile_photo ?? data.profile_picture ?? null;
        const merged = { ...data, img };
        setUser(merged);
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/api/logout"); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, loading, setSession, refreshProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
