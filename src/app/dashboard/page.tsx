"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type User, type Installation, type BillingInfo, type PlanTier, type PrReview, type ReviewsPage } from "@/lib/api";
import { env } from "next-runtime-env";

// ── Plan definitions (mirrors landing page) ──────────────────────────────────

type Plan = {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number | null;
  annualTotal: number | null; // exact yearly charge — never calculated
  devs: number;
  repos: number | null; // null = unlimited
  prsPerMonth: number;
  overageRate: number;
  features: string[];
  popular?: boolean;
  founderOnly?: boolean;
  priceIdMonthly: string;
  priceIdAnnual: string | null;
};

const PLANS: Plan[] = [
  {
    id: "founding_solo",
    name: "Founding Member",
    monthlyPrice: 9,
    annualMonthlyPrice: null,
    annualTotal: null,
    devs: 1,
    repos: 1,
    prsPerMonth: 30,
    overageRate: 0.5,
    features: ["1 repo", "30 PRs/month", "TypeScript + React analysis", "GitHub inline comments", "14-day free trial"],
    founderOnly: true,
    priceIdMonthly: env("NEXT_PUBLIC_PADDLE_PRICE_FOUNDING_SOLO") ?? "",
    priceIdAnnual: null,
  },
  {
    id: "solo",
    name: "Solo",
    monthlyPrice: 19,
    annualMonthlyPrice: 16,
    annualTotal: 190,
    devs: 1,
    repos: 1,
    prsPerMonth: 30,
    overageRate: 0.5,
    features: ["1 repo", "30 PRs/month", "TypeScript + React analysis", "GitHub inline comments", "14-day free trial"],
    priceIdMonthly: env("NEXT_PUBLIC_PADDLE_PRICE_SOLO_MONTHLY") ?? "",
    priceIdAnnual: env("NEXT_PUBLIC_PADDLE_PRICE_SOLO_ANNUAL") ?? "",
  },
  {
    id: "duo",
    name: "Duo",
    monthlyPrice: 39,
    annualMonthlyPrice: 33,
    annualTotal: 390,
    devs: 2,
    repos: 3,
    prsPerMonth: 80,
    overageRate: 0.4,
    features: ["3 repos", "80 PRs/month", "Full stack analysis", "GitHub inline comments", "14-day free trial"],
    priceIdMonthly: env("NEXT_PUBLIC_PADDLE_PRICE_DUO_MONTHLY") ?? "",
    priceIdAnnual: env("NEXT_PUBLIC_PADDLE_PRICE_DUO_ANNUAL") ?? "",
  },
  {
    id: "small_team",
    name: "Small Team",
    monthlyPrice: 79,
    annualMonthlyPrice: 66,
    annualTotal: 790,
    devs: 5,
    repos: null,
    prsPerMonth: 200,
    overageRate: 0.3,
    features: ["Unlimited repos", "200 PRs/month", "Team pattern tracking", "Priority review queue", "14-day free trial"],
    popular: true,
    priceIdMonthly: env("NEXT_PUBLIC_PADDLE_PRICE_SMALL_TEAM_MONTHLY") ?? "",
    priceIdAnnual: env("NEXT_PUBLIC_PADDLE_PRICE_SMALL_TEAM_ANNUAL") ?? "",
  },
  {
    id: "studio",
    name: "Studio",
    monthlyPrice: 149,
    annualMonthlyPrice: 124,
    annualTotal: 1490,
    devs: 15,
    repos: null,
    prsPerMonth: 600,
    overageRate: 0.25,
    features: ["Unlimited repos", "600 PRs/month", "HIPAA Mode (coming soon)", "Team analytics dashboard", "14-day free trial"],
    priceIdMonthly: env("NEXT_PUBLIC_PADDLE_PRICE_STUDIO_MONTHLY") ?? "",
    priceIdAnnual: env("NEXT_PUBLIC_PADDLE_PRICE_STUDIO_ANNUAL") ?? "",
  },
];

const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 5,
  founding_solo: 30,
  solo: 30,
  duo: 80,
  small_team: 200,
  studio: 600,
};

const TIER_ORDER: PlanTier[] = ["free", "founding_solo", "solo", "duo", "small_team", "studio"];

function tierRank(t: PlanTier) {
  return TIER_ORDER.indexOf(t);
}

// ── Paddle checkout helper ────────────────────────────────────────────────────

function openPaddleCheckout(priceId: string, user: User) {
  const Paddle = (window as any).Paddle;
  if (!Paddle) {
    alert("Paddle.js is still loading — please try again in a moment.");
    return;
  }
  Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email: user.email ?? undefined },
    customData: { userId: user.id },
  });
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [installs, setInstalls] = useState<Installation[]>([]);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [reviewsPage, setReviewsPage] = useState<ReviewsPage | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"repos" | "billing" | "reviews">("repos");

  const APP_URL = env("NEXT_PUBLIC_GITHUB_APP_INSTALL_URL") ?? "#";

  useEffect(() => {
    Promise.all([api.me(), api.installations(), api.billing.info()])
      .then(([u, i, b]) => { setUser(u); setInstalls(i); setBilling(b); })
      .catch((e) => {
        if (e.message.includes("401")) {
          router.push("/login");
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (activeTab !== "reviews" || reviewsPage) return;
    setReviewsLoading(true);
    api.reviews(1)
      .then(setReviewsPage)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [activeTab, reviewsPage]);

  async function logout() {
    await api.logout();
    window.location.href = "/";
  }

  if (loading) return <Screen><Spinner /></Screen>;
  if (error) return <Screen><p className="text-[var(--red)]">error: {error}</p></Screen>;
  if (!user) { router.push("/login"); return null; }

  const totalRepos = installs.flatMap((i) => i.repositories).filter((r) => r.active).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* header */}
      <header className="border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="var(--accent)"/>
            <circle cx="9.5" cy="7.5" r="2.3" fill="white"/>
            <circle cx="18.5" cy="7.5" r="2.3" fill="white"/>
            <circle cx="14" cy="20.5" r="2.3" fill="white"/>
            <path d="M9.5 9.8 C9.5 15.5 14 15 14 18.2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M18.5 9.8 C18.5 15.5 14 15 14 18.2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-[var(--text)]">MergeWell</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[var(--text-dim)]">@{user.login}</span>
          <TierBadge tier={user.planTier} />
          <button
            onClick={logout}
            className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-xs"
          >
            logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-4xl w-full mx-auto space-y-6">
        {/* stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="installations" value={installs.length} />
          <Stat label="repos watched" value={totalRepos} />
          <Stat label="prs this month" value={`${billing?.prUsedThisMonth ?? 0} / ${PLAN_LIMITS[user.planTier]}`} />
        </div>

        {/* tabs */}
        <div className="flex gap-0 border border-[var(--border)] rounded overflow-hidden w-fit">
          {(["repos", "reviews", "billing"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 text-xs uppercase tracking-wider transition-colors ${
                activeTab === t
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── REPOS TAB ── */}
        {activeTab === "repos" && (
          <div className="space-y-4">
            {installs.length === 0 && (
              <div className="border border-dashed border-[var(--border)] rounded p-6 text-center space-y-3">
                <p className="text-[var(--text-dim)]">no repositories configured yet</p>
                <a
                  href={APP_URL}
                  className="inline-block px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors text-xs"
                >
                  + configure GitHub App
                </a>
              </div>
            )}

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
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === "reviews" && (
          <ReviewsSection
            data={reviewsPage}
            loading={reviewsLoading}
            onPageChange={(p: number) => {
              setReviewsLoading(true);
              api.reviews(p)
                .then(setReviewsPage)
                .catch(() => {})
                .finally(() => setReviewsLoading(false));
            }}
          />
        )}

        {/* ── BILLING TAB ── */}
        {activeTab === "billing" && billing && (
          <BillingSection user={user!} billing={billing!} onBillingChange={setBilling} />
        )}
      </main>
    </div>
  );
}

// ── Billing Section ───────────────────────────────────────────────────────────

function BillingSection({
  user,
  billing,
  onBillingChange,
}: {
  user: User;
  billing: BillingInfo;
  onBillingChange: (b: BillingInfo) => void;
}) {
  const [annual, setAnnual] = useState(billing.billingPeriod === "year");
  const [cancelling, setCancelling] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === billing.planTier);
  const prLimit = PLAN_LIMITS[billing.planTier];
  const prsUsed = billing.prUsedThisMonth;
  const usagePct = Math.min(100, Math.round((prsUsed / prLimit) * 100));

  const isSubscribed =
    billing.subscriptionStatus === "active" ||
    billing.subscriptionStatus === "cancelling";

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You'll keep access until the end of the billing period.")) return;
    setCancelling(true);
    try {
      await api.billing.cancel();
      onBillingChange({ ...billing, subscriptionStatus: "cancelling" });
    } catch {
      alert("Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleResume() {
    setResuming(true);
    try {
      await api.billing.resume();
      onBillingChange({ ...billing, subscriptionStatus: "active" });
    } catch {
      alert("Failed to resume subscription. Please try again.");
    } finally {
      setResuming(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    // Open blank window synchronously (inside click handler) so browser allows it,
    // then set the URL once the async fetch returns.
    const win = window.open("", "_blank");
    try {
      const { url } = await api.billing.portalUrl();
      if (url && win) {
        win.location.href = url;
      } else {
        win?.close();
        alert("Portal link unavailable. Please contact support.");
      }
    } catch {
      win?.close();
      alert("Could not load billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* current plan card */}
      <div className="border border-[var(--border)] rounded p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">current plan</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{currentPlan?.name ?? billing.planTier}</span>
              <TierBadge tier={billing.planTier} />
              {billing.subscriptionStatus && (
                <StatusBadge status={billing.subscriptionStatus} />
              )}
            </div>
            {billing.subscriptionEndsAt && (
              <p className="text-[11px] text-[var(--text-dim)] mt-1">
                {billing.subscriptionStatus === "cancelling"
                  ? "Access until "
                  : "Renews "}
                {new Date(billing.subscriptionEndsAt).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </p>
            )}
            {billing.planTier === "free" && (
              <p className="text-[11px] text-[var(--text-dim)] mt-1">14-day trial · no card required</p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {isSubscribed && (
              <>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="px-3 py-1.5 text-xs border border-[var(--border)] rounded text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] transition-colors disabled:opacity-40"
                >
                  {portalLoading ? "loading..." : "manage billing"}
                </button>
                {billing.subscriptionStatus === "active" && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-3 py-1.5 text-xs border border-[var(--red)] rounded text-[var(--red)] hover:bg-[var(--red)] hover:text-white transition-colors disabled:opacity-40"
                  >
                    {cancelling ? "cancelling..." : "cancel"}
                  </button>
                )}
                {billing.subscriptionStatus === "cancelling" && (
                  <button
                    onClick={handleResume}
                    disabled={resuming}
                    className="px-3 py-1.5 text-xs border border-[var(--green)] rounded text-[var(--green)] hover:bg-[var(--green)] hover:text-white transition-colors disabled:opacity-40"
                  >
                    {resuming ? "resuming..." : "keep subscription"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* PR usage bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[var(--text-dim)]">
            <span>pr reviews this month</span>
            <span>{prsUsed} / {prLimit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${usagePct}%`,
                background: usagePct >= 90 ? "var(--red)" : usagePct >= 70 ? "#f5a623" : "var(--accent)",
              }}
            />
          </div>
          {/* currentPlan && (
            <p className="text-[10px] text-[var(--text-dim)]">
              ${currentPlan.overageRate.toFixed(2)} per extra PR
            </p>
          ) */}
        </div>
      </div>

      {/* billing period toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-xs ${!annual ? "text-[var(--text)]" : "text-[var(--text-dim)]"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          style={{
            position: "relative",
            width: 44,
            height: 24,
            borderRadius: 999,
            border: `1px solid ${annual ? "var(--accent)" : "var(--border)"}`,
            background: annual ? "var(--accent)" : "var(--surface)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              transition: "transform 0.2s",
              transform: annual ? "translateX(20px)" : "translateX(0)",
            }}
          />
        </button>
        <span className={`text-xs ${annual ? "text-[var(--text)]" : "text-[var(--text-dim)]"}`}>Annual</span>
        {annual && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--green)] text-[var(--green)]">
            save 2 months
          </span>
        )}
      </div>

      {/* plan cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            annual={annual && !plan.founderOnly}
            current={billing.planTier === plan.id}
            currentRank={tierRank(billing.planTier)}
            user={user}
          />
        ))}
      </div>

      <p className="text-[11px] text-[var(--text-dim)]">
        Billing powered by Paddle · Cancel anytime · No hidden fees
      </p>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  annual,
  current,
  currentRank,
  user,
}: {
  plan: Plan;
  annual: boolean;
  current: boolean;
  currentRank: number;
  user: User;
}) {
  const displayPrice = annual && plan.annualMonthlyPrice != null
    ? plan.annualMonthlyPrice
    : plan.monthlyPrice;

  const priceId = annual && plan.priceIdAnnual ? plan.priceIdAnnual : plan.priceIdMonthly;

  const rank = tierRank(plan.id);
  const isUpgrade = rank > currentRank;
  const isDowngrade = rank < currentRank;

  function handleSubscribe() {
    if (!priceId) {
      alert("This plan is not yet available. Check back soon!");
      return;
    }
    openPaddleCheckout(priceId, user);
  }

  return (
    <div
      className="border rounded p-4 flex flex-col gap-3 transition-all"
      style={{
        borderColor: current
          ? "var(--accent)"
          : plan.popular
          ? "rgba(124,106,255,0.4)"
          : "var(--border)",
        background: current
          ? "rgba(124,106,255,0.06)"
          : plan.popular
          ? "rgba(124,106,255,0.03)"
          : "var(--surface)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {plan.popular && !current && (
        <span
          className="absolute top-0 right-0 text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold text-white"
          style={{ background: "var(--accent)" }}
        >
          popular
        </span>
      )}
      {current && (
        <span
          className="absolute top-0 right-0 text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold text-white"
          style={{ background: "var(--green)" }}
        >
          current
        </span>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">{plan.name}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold">${displayPrice}</span>
          <span className="text-[11px] text-[var(--text-dim)]">/mo</span>
        </div>
        {annual && plan.annualTotal != null && (
          <p className="text-[10px] text-[var(--green)]">
            ${plan.annualTotal.toLocaleString()}/yr billed annually
          </p>
        )}
        {plan.founderOnly && (
          <p className="text-[10px] text-[var(--text-dim)]">price locked forever</p>
        )}
      </div>

      <ul className="space-y-1 flex-1">
        {[
          `${plan.devs} developer${plan.devs > 1 ? "s" : ""}`,
          ...plan.features,
          // `$${plan.overageRate.toFixed(2)} per extra PR`, // overage charging — future feature
        ].map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[11px] text-[var(--text-dim)]">
            <span className="text-[var(--green)] font-bold mt-px">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {!current && (
        <button
          onClick={handleSubscribe}
          className="w-full py-2 rounded text-xs font-semibold transition-colors"
          style={{
            background: isUpgrade ? "var(--accent)" : "transparent",
            color: isUpgrade ? "white" : "var(--text-dim)",
            border: isUpgrade ? "none" : "1px solid var(--border)",
          }}
        >
          {isUpgrade ? "upgrade" : isDowngrade ? "downgrade" : "select"}
        </button>
      )}

      {current && (
        <div
          className="w-full py-2 rounded text-xs text-center"
          style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}
        >
          active plan
        </div>
      )}
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

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

function TierBadge({ tier }: { tier: PlanTier }) {
  const colors: Record<PlanTier, string> = {
    free: "var(--text-dim)",
    founding_solo: "#f5a623",
    solo: "var(--accent)",
    duo: "var(--accent)",
    small_team: "var(--green)",
    studio: "var(--green)",
  };
  const labels: Record<PlanTier, string> = {
    free: "free",
    founding_solo: "founder",
    solo: "solo",
    duo: "duo",
    small_team: "team",
    studio: "studio",
  };
  const color = colors[tier];
  return (
    <span
      className="text-[10px] border rounded px-1.5 py-0.5 uppercase tracking-wider"
      style={{ borderColor: color, color }}
    >
      {labels[tier]}
    </span>
  );
}

// ── Reviews Section ───────────────────────────────────────────────────────────

function ReviewsSection({
  data,
  loading,
  onPageChange,
}: {
  data: ReviewsPage | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (loading || !data) {
    return <Screen><Spinner /></Screen>;
  }

  const statusColor: Record<string, string> = {
    completed: "var(--green)",
    failed: "var(--red)",
    processing: "#f5a623",
    pending: "var(--text-dim)",
  };

  return (
    <div className="space-y-4">
      {data.reviews.length === 0 && (
        <div className="border border-dashed border-[var(--border)] rounded p-6 text-center">
          <p className="text-[var(--text-dim)]">no reviews yet — open a pull request in a watched repo to trigger your first review</p>
        </div>
      )}

      {data.reviews.length > 0 && (
        <div className="border border-[var(--border)] rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-dim)] uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">repo</th>
                <th className="text-left px-4 py-2 font-medium">pr</th>
                <th className="text-left px-4 py-2 font-medium">commit</th>
                <th className="text-left px-4 py-2 font-medium">status</th>
                <th className="text-left px-4 py-2 font-medium">date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.reviews.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-4 py-2 text-[var(--text)]">{r.repoFullName}</td>
                  <td className="px-4 py-2 text-[var(--text-dim)]">#{r.prNumber}</td>
                  <td className="px-4 py-2 font-mono text-[var(--text-dim)]">{r.commitSha}</td>
                  <td className="px-4 py-2">
                    <span style={{ color: statusColor[r.status] ?? "var(--text-dim)" }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[var(--text-dim)]">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pages > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onPageChange(data.page - 1)}
            disabled={data.page <= 1}
            className="px-3 py-1.5 border border-[var(--border)] rounded text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 transition-colors"
          >
            prev
          </button>
          <span className="text-[var(--text-dim)]">page {data.page} of {data.pages}</span>
          <button
            onClick={() => onPageChange(data.page + 1)}
            disabled={data.page >= data.pages}
            className="px-3 py-1.5 border border-[var(--border)] rounded text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 transition-colors"
          >
            next
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "active", color: "var(--green)" },
    cancelling: { label: "cancels at period end", color: "#f5a623" },
    cancelled: { label: "cancelled", color: "var(--red)" },
    past_due: { label: "past due", color: "var(--red)" },
    paused: { label: "paused", color: "var(--text-dim)" },
  };
  const s = map[status] ?? { label: status, color: "var(--text-dim)" };
  return (
    <span
      className="text-[10px] border rounded px-1.5 py-0.5"
      style={{ borderColor: s.color, color: s.color }}
    >
      {s.label}
    </span>
  );
}
