import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — MergeWell",
};

export default function RefundPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
      <div>
        <p className="text-[var(--text-dim)] text-xs mb-1">// legal</p>
        <h1 className="text-2xl font-bold tracking-tight">Refund Policy</h1>
        <p className="text-[var(--text-dim)] text-xs mt-2">Effective: May 2, 2026</p>
      </div>

      <Section title="TL;DR">
        <div className="border border-[var(--border)] rounded p-4 space-y-1">
          {[
            ["7-day money-back", "Full refund within 7 days of your first payment, no questions asked."],
            ["Pro-rated cancellation", "Cancel anytime; access continues until the end of the billing period. No partial refunds after day 7."],
            ["Service outages", "Credit issued for verified downtime exceeding 1 hour in a billing period."],
          ].map(([label, desc]) => (
            <div key={label as string} className="flex gap-3">
              <span className="text-[var(--accent)] shrink-0">→</span>
              <span>
                <span className="text-[var(--text)]">{label}:</span>{" "}
                <span className="text-[var(--text-dim)]">{desc}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="1. 7-Day Money-Back Guarantee">
        If you are not satisfied with MergeWell for any reason, you may request a full refund
        within <strong className="text-[var(--text)]">7 calendar days</strong> of your first
        paid subscription charge. This applies once per customer across all plans. To claim
        this, email{" "}
        <a href="mailto:billing@mergewell.dev">billing@mergewell.dev</a> with the subject
        line <em>&quot;Refund request&quot;</em> and include the email address on your account. We
        will process the refund within 5 business days.
      </Section>

      <Section title="2. Cancellation">
        You can cancel your subscription at any time from the dashboard under{" "}
        <em>Settings → Billing → Cancel plan</em>. Cancellation stops the next renewal charge.
        Your access to paid features continues until the end of the current billing period.
        We do not issue pro-rated refunds for unused days remaining in a billing period,
        except as described in Section 3.
      </Section>

      <Section title="3. Service Credits for Downtime">
        If MergeWell experiences verified downtime of more than 1 continuous hour in any
        30-day billing period, affected subscribers are eligible for a pro-rated service
        credit equal to the proportion of the billing period that was affected. Credits are
        applied to the next invoice and are not redeemable for cash. To report downtime,
        email <a href="mailto:billing@mergewell.dev">billing@mergewell.dev</a> with the
        subject line <em>&quot;Downtime credit request&quot;</em> within 14 days of the incident.
      </Section>

      <Section title="4. Annual Plans">
        Annual plans are eligible for a full refund within 7 days of purchase under the same
        money-back guarantee (Section 1). After 7 days, annual subscriptions are
        non-refundable. If you downgrade or cancel mid-year, access continues until the
        annual period ends — no partial refund is issued for remaining months.
      </Section>

      <Section title="5. Duplicate Charges">
        If you were charged more than once for the same billing period, email{" "}
        <a href="mailto:billing@mergewell.dev">billing@mergewell.dev</a> with your
        account email and the charge dates. We will verify with Paddle and refund any
        duplicate charge within 5 business days.
      </Section>

      <Section title="6. Exceptions">
        Refunds will not be issued in the following cases:
        <ul className="space-y-1 mt-2">
          {[
            "Accounts terminated for violation of the Terms of Service",
            "Requests made after the 7-day guarantee window with no applicable credit event",
            "Downgrade from a higher plan to a lower plan (access simply adjusts at next renewal)",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[var(--red)]">−</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="7. How Refunds Are Processed">
        Refunds are issued to the original payment method via Paddle, our payment processor.
        Depending on your bank, it may take 5–10 business days for the credit to appear.
        We cannot redirect refunds to a different card or account.
      </Section>

      <Section title="8. Contact">
        For any billing questions or refund requests, email{" "}
        <a href="mailto:billing@mergewell.dev">billing@mergewell.dev</a>. Please include
        your account email and a brief description of the issue.
      </Section>

      <footer className="pt-8 border-t border-[var(--border)] text-[var(--text-dim)] text-xs flex gap-6 flex-wrap">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
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
