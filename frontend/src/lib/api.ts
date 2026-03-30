import type { AuthTokens, Category, Note, User } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_KEY = "note_access";
const REFRESH_KEY = "note_refresh";

export function getStoredAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setStoredTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function decodeJwtUserId(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const data = JSON.parse(json) as { user_id?: number };
    return typeof data.user_id === "number" ? data.user_id : null;
  } catch {
    return null;
  }
}

export function userFromAccessToken(
  access: string,
  email: string
): User | null {
  const id = decodeJwtUserId(access);
  if (id === null) return null;
  return { id, email };
}

async function parseJsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return text;
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const headers = new Headers(options.headers);
  const access = getStoredAccess();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !retried && typeof window !== "undefined") {
    const refresh = getStoredRefresh();
    const isRefreshCall = endpoint.includes("/api/auth/refresh/");
    if (refresh && !isRefreshCall) {
      try {
        const nextAccess = await refreshTokenRequest(refresh);
        localStorage.setItem(ACCESS_KEY, nextAccess);
        return apiFetch<T>(endpoint, options, true);
      } catch {
        clearStoredTokens();
      }
    }
  }

  const data = await parseJsonOrThrow(res);

  if (!res.ok) {
    const err = data as Record<string, unknown>;
    const detail = err?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : JSON.stringify(err?.non_field_errors ?? err ?? res.statusText);
    throw new Error(msg || `Request failed (${res.status})`);
  }

  return data as T;
}

async function refreshTokenRequest(refresh: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  const data = (await parseJsonOrThrow(res)) as { access?: string };
  if (!res.ok || !data.access) {
    throw new Error("Refresh failed");
  }
  return data.access;
}

export async function refreshToken(): Promise<string> {
  const refresh = getStoredRefresh();
  if (!refresh) throw new Error("No refresh token");
  const access = await refreshTokenRequest(refresh);
  localStorage.setItem(ACCESS_KEY, access);
  return access;
}

async function authPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonOrThrow(res);
  if (!res.ok) {
    const err = data as Record<string, unknown>;
    const detail = err?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : typeof err?.email === "object"
          ? JSON.stringify(err.email)
          : JSON.stringify(err?.non_field_errors ?? err ?? res.statusText);
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function register(
  email: string,
  password: string
): Promise<{ user: User } & AuthTokens> {
  return authPost<{ user: User } & AuthTokens>("/api/auth/", {
    email,
    password,
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthTokens> {
  return authPost<AuthTokens>("/api/auth/login/", {
    username: email,
    password,
  });
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories/");
}

export async function getNotes(): Promise<Note[]> {
  return apiFetch<Note[]>("/api/notes/");
}

export async function getNote(id: number): Promise<Note> {
  return apiFetch<Note>(`/api/notes/${id}/`);
}

export async function createNote(data: {
  title?: string;
  body?: string;
  category?: number | null;
}): Promise<Note> {
  return apiFetch<Note>("/api/notes/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateNote(
  id: number,
  data: { title?: string; body?: string; category?: number | null }
): Promise<Note> {
  return apiFetch<Note>(`/api/notes/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id: number): Promise<void> {
  await apiFetch<unknown>(`/api/notes/${id}/`, { method: "DELETE" });
}
