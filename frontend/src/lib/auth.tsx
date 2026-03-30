"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearStoredTokens,
  login as apiLogin,
  register as apiRegister,
  setStoredTokens,
  userFromAccessToken,
} from "./api";
import type { AuthTokens, User } from "./types";

const USER_KEY = "note_user";

interface AuthContextValue {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = readStoredUser();
    const access = localStorage.getItem("note_access");
    const refresh = localStorage.getItem("note_refresh");
    if (access && refresh) {
      setTokens({ access, refresh });
      if (storedUser) setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const t = await apiLogin(email, password);
    setStoredTokens(t);
    setTokens(t);
    const u = userFromAccessToken(t.access, email);
    if (!u) throw new Error("Could not read session");
    setUser(u);
    writeStoredUser(u);
    router.replace("/dashboard");
  }, [router]);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await apiRegister(email, password);
    const t = { access: res.access, refresh: res.refresh };
    setStoredTokens(t);
    setTokens(t);
    setUser(res.user);
    writeStoredUser(res.user);
    router.replace("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    clearStoredTokens();
    writeStoredUser(null);
    setUser(null);
    setTokens(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(user && tokens),
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, tokens, isLoading, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
