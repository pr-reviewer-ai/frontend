"use client";

import { useState } from "react";
import { api, type ReviewComment } from "@/lib/api";

const EXAMPLE_PATCH = `@@ -1,5 +1,12 @@
 import React from 'react';
+import { useState, useEffect } from 'react';
+
+const stripeKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
+
 export default function DashboardPage() {
+  const [data, setData] = useState(null);
+  useEffect(() => { fetch('/api/data').then(r => r.json()).then(setData); }, []);
   return <div>Dashboard</div>;
 }`;

export default function TestReviewPage() {
  const [filename, setFilename] = useState("app/dashboard/page.tsx");
  const [patch, setPatch] = useState(EXAMPLE_PATCH);
  const [prTitle, setPrTitle] = useState("Test PR");
  const [repoFullName, setRepoFullName] = useState("owner/test-repo");
  const [comments, setComments] = useState<ReviewComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setComments(null);
    try {
      const result = await api.testReview({ filename, patch, prTitle, repoFullName });
      setComments(result.comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div>
        <p className="text-[var(--text-dim)] text-xs mb-1">// dev tool</p>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">test pr reviewer</h1>
        <p className="text-[var(--text-dim)] mt-1 text-xs">
          Paste a unified diff to run the AI reviewer directly — no GitHub required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="filename">
            <input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="src/components/Foo.tsx"
              className="input w-full"
            />
          </Field>
          <Field label="repo">
            <input
              value={repoFullName}
              onChange={(e) => setRepoFullName(e.target.value)}
              placeholder="owner/repo"
              className="input w-full"
            />
          </Field>
        </div>

        <Field label="pr title">
          <input
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            placeholder="Add feature X"
            className="input w-full"
          />
        </Field>

        <Field label="unified diff (patch)">
          <textarea
            value={patch}
            onChange={(e) => setPatch(e.target.value)}
            rows={14}
            spellCheck={false}
            className="input w-full font-mono resize-y"
            placeholder={"@@ -1,3 +1,7 @@\n import foo from 'foo';\n+const x = 1;\n ..."}
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "reviewing…" : "run review"}
        </button>
      </form>

      {error && (
        <div className="border border-[var(--red)] rounded p-4 text-[var(--red)] text-xs">
          <span className="font-bold">error:</span> {error}
        </div>
      )}

      {comments !== null && (
        <div className="space-y-3">
          <p className="text-[var(--text-dim)] text-xs">
            {comments.length === 0
              ? "no comments — the reviewer found nothing to flag"
              : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
          </p>
          {comments.map((c, i) => (
            <div key={i} className="border border-[var(--border)] rounded p-4 space-y-2">
              <div className="flex gap-3 text-xs text-[var(--text-dim)]">
                <span className="text-[var(--accent)]">{c.path}</span>
                <span>line {c.line}</span>
              </div>
              <p className="text-[var(--text)] text-xs leading-relaxed whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[var(--text-dim)] text-xs">{label}</label>
      {children}
    </div>
  );
}
