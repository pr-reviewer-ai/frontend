import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — MergeWell",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
      <div>
        <p className="text-[var(--text-dim)] text-xs mb-1">// legal</p>
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--text-dim)] text-xs mt-2">Effective: May 2, 2026</p>
      </div>

      <Section title="1. Overview">
        MergeWell (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a GitHub App that posts automated code-review
        comments on pull requests. This policy explains what data we collect, why we collect
        it, and how we protect it. We collect the minimum necessary to operate the service.
      </Section>

      <Section title="2. Data We Collect">
        <ul className="space-y-2 mt-2">
          {[
            ["GitHub identity", "Your GitHub user ID, username, and avatar URL — received when you authenticate via GitHub OAuth."],
            ["Repository metadata", "Names, IDs, and default branches of repositories you install the app on."],
            ["Pull request content", "PR titles, descriptions, and code diffs — sent to our AI model to generate review comments. We do not permanently store raw diffs."],
            ["Billing data", "Plan type and subscription status only. Payment details (card numbers, etc.) are handled exclusively by Paddle and never touch our servers."],
            ["Usage logs", "Timestamps and anonymised event counts (e.g., number of reviews run) for debugging and capacity planning."],
          ].map(([label, desc]) => (
            <li key={label as string} className="flex gap-3 text-[var(--text-dim)]">
              <span className="text-[var(--accent)] shrink-0">→</span>
              <span><span className="text-[var(--text)]">{label}:</span> {desc}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="3. How We Use Your Data">
        <ul className="space-y-1 text-[var(--text-dim)] mt-2">
          {[
            "Authenticate you and enforce access control",
            "Post review comments on pull requests you open in enrolled repositories",
            "Provide and improve the review quality of the service",
            "Send transactional emails (receipts, plan changes) — no marketing without consent",
            "Detect abuse and enforce our Terms of Service",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[var(--green)]">+</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="4. Third-Party Services">
        <ul className="space-y-2 mt-2 text-[var(--text-dim)]">
          {[
            ["GitHub", "OAuth authentication and GitHub App API. Governed by GitHub's privacy policy."],
            ["Anthropic / Claude API", "Pull request diffs are sent to Anthropic to generate review text. Anthropic does not train on API inputs by default. See Anthropic's usage policies."],
            ["Paddle", "Payment processing and subscription management. Paddle is the merchant of record. We receive only subscription status — no raw payment data."],
          ].map(([name, desc]) => (
            <li key={name as string} className="flex gap-3">
              <span className="text-[var(--accent)] shrink-0">→</span>
              <span><span className="text-[var(--text)]">{name}:</span> {desc}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="5. Data Retention">
        We retain your account data for as long as your account is active. Pull request diffs
        are processed in memory and not written to long-term storage. Usage logs are retained
        for 90 days. You can request deletion of your account and associated data at any time
        by emailing{" "}
        <a href="mailto:privacy@mergewell.dev">privacy@mergewell.dev</a>.
      </Section>

      <Section title="6. Security">
        All data in transit is encrypted with TLS 1.2+. Database at rest is encrypted. Access
        to production systems is restricted to authorised personnel and protected by MFA. We
        do not sell your data to any third party.
      </Section>

      <Section title="7. Your Rights">
        Depending on your jurisdiction you may have rights to access, correct, export, or
        delete your personal data. To exercise any of these rights, email{" "}
        <a href="mailto:privacy@mergewell.dev">privacy@mergewell.dev</a>. We will respond
        within 30 days.
      </Section>

      <Section title="8. Changes to This Policy">
        We may update this policy. Material changes will be announced via email or an
        in-app notice at least 14 days before they take effect. Continued use of the service
        after the effective date constitutes acceptance.
      </Section>

      <Section title="9. Contact">
        Questions about this policy? Email{" "}
        <a href="mailto:privacy@mergewell.dev">privacy@mergewell.dev</a>.
      </Section>

      <footer className="pt-8 border-t border-[var(--border)] text-[var(--text-dim)] text-xs flex gap-6 flex-wrap">
        <Link href="/terms">Terms of Service</Link>
        <Link href="/refund">Refund Policy</Link>
        <Link href="/login">← Back to app</Link>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-[var(--accent)]">{title}</h2>
      <div className="text-[var(--text-dim)] leading-relaxed text-xs">{children}</div>
    </section>
  );
}
