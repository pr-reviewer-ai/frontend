"use client";

import { useEffect, useState } from "react";
import { api, type User, type Installation } from "@/lib/api";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [installs, setInstalls] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const APP_URL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ?? "#";

  useEffect(() => {
    Promise.all([api.me(), api.installations()])
      .then(([u, i]) => { setUser(u); setInstalls(i); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await api.logout();
    window.location.href = "/";
  }

  if (loading) return <Screen><Spinner /></Screen>;
  if (error) return <Screen><p className="text-[var(--red)]">error: {error}</p></Screen>;
  if (!user) { window.location.href = "/"; return null; }

  const totalRepos = installs.flatMap((i) => i.repositories).filter((r) => r.active).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* top bar */}
      <header className="border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-[var(--text)]">pr-reviewer</span>
        <div className="flex items-center gap-4">
          <span className="text-[var(--text-dim)]">@{user.login}</span>
          <Badge tier={user.planTier} />
          <button
            onClick={logout}
            className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-xs"
          >
            logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto space-y-8">
        {/* stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="installations" value={installs.length} />
          <Stat label="repos watched" value={totalRepos} />
          <Stat label="plan" value={user.planTier} />
        </div>

        {/* install CTA */}
        {installs.length === 0 && (
          <div className="border border-dashed border-[var(--border)] rounded p-6 text-center space-y-3">
            <p className="text-[var(--text-dim)]">no GitHub installations yet</p>
            <a
              href={APP_URL}
              className="inline-block px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors text-xs"
            >
              + install GitHub App
            </a>
          </div>
        )}

        {/* installations list */}
        {installs.map((inst) => (
          <div key={inst.id} className="border border-[var(--border)] rounded">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                {inst.accountAvatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inst.accountAvatarUrl} alt="" className="w-5 h-5 rounded-full" />
                )}
                <span className="font-medium">{inst.accountLogin}</span>
                <span className="text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded px-1.5 py-0.5">
                  {inst.accountType.toLowerCase()}
                </span>
                {inst.suspended && (
                  <span className="text-[10px] text-[var(--red)] border border-[var(--red)] rounded px-1.5 py-0.5">
                    suspended
                  </span>
                )}
              </div>
              <span className="text-[var(--text-dim)] text-xs">
                {inst.repositories.filter((r) => r.active).length} repos
              </span>
            </div>

            <ul className="divide-y divide-[var(--border)]">
              {inst.repositories.filter((r) => r.active).map((repo) => (
                <li key={repo.id} className="flex items-center justify-between px-4 py-2">
                  <span className="text-[var(--text)]">{repo.fullName}</span>
                  <div className="flex items-center gap-2">
                    {repo.private && (
                      <span className="text-[10px] text-[var(--text-dim)]">private</span>
                    )}
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {installs.length > 0 && (
          <a
            href={APP_URL}
            className="inline-block text-xs text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
          >
            + add another installation
          </a>
        )}
      </main>
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">{children}</div>
  );
}

function Spinner() {
  return <span className="text-[var(--text-dim)] animate-pulse">loading...</span>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[var(--border)] rounded p-3">
      <p className="text-[var(--text-dim)] text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Badge({ tier }: { tier: string }) {
  const color = tier === "free" ? "var(--text-dim)" : tier === "pro" ? "var(--accent)" : "var(--green)";
  return (
    <span
      className="text-[10px] border rounded px-1.5 py-0.5 uppercase tracking-wider"
      style={{ borderColor: color, color }}
    >
      {tier}
    </span>
  );
}
