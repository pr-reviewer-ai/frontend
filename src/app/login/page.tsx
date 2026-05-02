import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (token) {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Cookie: `token=${token.value}` },
        cache: "no-store",
      });
      if (res.ok) redirect("/dashboard");
    } catch {
      // backend unreachable — fall through to login page
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* wordmark */}
        <div>
          <p className="text-[var(--text-dim)] text-xs mb-1">// tool</p>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            pr-reviewer
          </h1>
          <p className="text-[var(--text-dim)] mt-1">
            MergeWell on every pull request.
          </p>
        </div>

        {/* features */}
        <ul className="space-y-1 text-[var(--text-dim)] text-xs">
          {[
            "reviews PRs automatically on open / push",
            "inline comments with diff context",
            "configurable rules per repo",
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-[var(--green)]">+</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={`${API}/auth/github`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          <GitHubIcon />
          Sign in with GitHub
        </a>

        <p className="text-[10px] text-center text-[var(--muted)]" style={{ color: "var(--text-dim)" }}>
          By signing in you agree to let pr-reviewer post review comments on your PRs.
        </p>
      </div>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
        -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87
        2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
        0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
        .64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82
        2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87
        3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
        0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
