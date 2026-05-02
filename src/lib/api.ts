import { env } from "next-runtime-env";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = env("NEXT_PUBLIC_API_URL") ?? "http://localhost:3001";
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export type PlanTier =
  | "free"
  | "founding_solo"
  | "solo"
  | "duo"
  | "small_team"
  | "studio";

export type User = {
  id: string;
  login: string;
  email: string | null;
  avatarUrl: string | null;
  planTier: PlanTier;
};

export type BillingInfo = {
  planTier: PlanTier;
  paddleSubscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
  billingPeriod: string | null;
  prUsedThisMonth: number;
};

export type Installation = {
  id: number;
  accountLogin: string;
  accountType: string;
  accountAvatarUrl: string | null;
  suspended: boolean;
  repositories: Array<{ id: number; fullName: string; private: boolean; active: boolean }>;
};

export type PrReview = {
  id: string;
  repoFullName: string;
  prNumber: number;
  commitSha: string;
  status: "pending" | "processing" | "completed" | "failed";
  reviewId: number | null;
  createdAt: string;
};

export type ReviewsPage = {
  reviews: PrReview[];
  total: number;
  page: number;
  pages: number;
};

export const api = {
  me: () => apiFetch<User>("/auth/me"),
  logout: () => apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  installations: () => apiFetch<Installation[]>("/app"),
  reviews: (page = 1) => apiFetch<ReviewsPage>(`/reviews?page=${page}&limit=20`),
  billing: {
    info: () => apiFetch<BillingInfo>("/billing/info"),
    cancel: () => apiFetch<{ ok: boolean }>("/billing/cancel", { method: "POST" }),
    resume: () => apiFetch<{ ok: boolean }>("/billing/resume", { method: "POST" }),
    portalUrl: () => apiFetch<{ url: string | null }>("/billing/portal-url"),
  },
};
