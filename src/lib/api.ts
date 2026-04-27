const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export type User = {
  id: string;
  login: string;
  email: string | null;
  avatarUrl: string | null;
  planTier: "free" | "pro" | "team";
};

export type Installation = {
  id: number;
  accountLogin: string;
  accountType: string;
  accountAvatarUrl: string | null;
  suspended: boolean;
  repositories: Array<{ id: number; fullName: string; private: boolean; active: boolean }>;
};

export const api = {
  me: () => apiFetch<User>("/auth/me"),
  logout: () => apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  installations: () => apiFetch<Installation[]>("/app"),
};
