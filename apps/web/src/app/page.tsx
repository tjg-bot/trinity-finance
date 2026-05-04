import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trinity Finance - Commercial Lending Made Simple",
  robots: { index: true, follow: true },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B2545]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <span className="text-xl font-bold text-[#C9A227]">Trinity Finance</span>
            <p className="text-xs text-white/50">613 Chillicothe St, Portsmouth, OH 45662</p>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/partner"
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Partner Portal
            </Link>
            <Link
              href="/bank"
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Bank Portal
            </Link>
            <Link
              href="/apply"
              className="rounded-md bg-[#C9A227] px-4 py-2 text-sm font-bold text-[#0B2545] transition hover:bg-[#b8911e]"
            >
              Apply Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero - Tyler as centrepiece */}
      <section className="px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-16 lg:grid-cols-5">

            {/* Left copy */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-1.5 text-sm font-medium text-[#C9A227]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A227]" />
                Portsmouth, Ohio — Serving Businesses Nationwide
              </div>

              <h1 className="mt-6 text-5xl font-bold leading-[1.1] text-white xl:text-6xl">
                Commercial Financing,
                <br />
                <span className="text-[#C9A227]">Expertly Guided.</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
                AI-powered underwriting meets personal expertise and a 50+ lender network.
                From application to funded in days — not weeks.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/apply"
                  className="rounded-xl bg-[#C9A227] px-8 py-4 text-lg font-bold text-[#0B2545] shadow-lg transition hover:bg-[#b8911e]"
                >
                  Start Your Application
                </Link>
                <Link
                  href="/apply/qualify"
                  className="rounded-xl border border-[#C9A227]/60 px-8 py-4 text-lg font-semibold text-[#C9A227] transition hover:bg-[#C9A227]/10"
                >
                  10-Question Qualifier
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6 text-sm text-white/60">
                {["No upfront fees", "48-hr pre-approval", "50+ lenders", "Equal opportunity lender"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <span className="text-[#C9A227]">✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Photo centrepiece */}
            <div className="lg:col-span-2">
              <div className="relative mx-auto max-w-xs lg:max-w-sm">
                {/* Gold glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C9A227] via-[#C9A227]/40 to-transparent opacity-70 blur-sm" />

                {/* Photo frame */}
                <div className="relative overflow-hidden rounded-2xl border border-[#C9A227]/30 bg-[#0a1e3d] shadow-2xl">
                  <div className="relative h-[500px] w-full">
                    <Image
                      src="/founder.jpg"
                      alt="Morgan Hall, Founder — Trinity Finance"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                    {/* Subtle bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a1e3d]/80 to-transparent" />
                  </div>
                </div>

                {/* Name card */}
                <div className="absolute -bottom-5 inset-x-4 rounded-xl bg-white px-5 py-3.5 shadow-2xl">
                  <div className="font-bold text-[#0B2545]">Morgan Hall</div>
                  <div className="text-sm text-gray-500">Founder &amp; Principal</div>
                  <div className="mt-0.5 text-xs text-gray-400">Trinity Finance · Portsmouth, OH</div>
                </div>

                {/* Stats badge */}
                <div className="absolute -right-4 top-6 rounded-xl bg-[#C9A227] px-4 py-3 shadow-xl">
                  <div className="text-2xl font-bold text-[#0B2545]">50+</div>
                  <div className="text-xs font-semibold text-[#0B2545]/70">Lending<br />Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="mt-12 border-y border-white/10 bg-white/5 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#C9A227]">{stat.value}</div>
                <div className="mt-1 text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-center text-3xl font-bold text-white">
            Financing Solutions We Offer
          </h2>
          <p className="mb-12 text-center text-white/60">
            Every business is different. We match you to the right product and lender.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOAN_TYPES.map((loan) => (
              <Link
                key={loan.href}
                href={loan.href}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-[#C9A227]/50 hover:bg-white/10"
              >
                <div className="text-3xl">{loan.icon}</div>
                <h3 className="mt-3 font-semibold text-white group-hover:text-[#C9A227] transition">
                  {loan.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{loan.desc}</p>
                <div className="mt-4 text-xs text-[#C9A227] opacity-0 group-hover:opacity-100 transition">
                  Apply now →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/10 bg-white/5 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-3xl font-bold text-white">How It Works</h2>
          <p className="mb-14 text-center text-white/60">Three steps from application to funded.</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C9A227] bg-[#C9A227]/10 text-xl font-bold text-[#C9A227]">
                  {i + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-white/10 px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white">Ready to get funded?</h2>
          <p className="mt-4 text-white/60">
            No obligation. No upfront fees. Start in under 5 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="w-full rounded-xl bg-[#C9A227] px-10 py-4 text-lg font-bold text-[#0B2545] transition hover:bg-[#b8911e] sm:w-auto"
            >
              Apply Now — Free
            </Link>
            <Link
              href="/apply/qualify"
              className="w-full rounded-xl border border-[#C9A227]/50 px-10 py-4 text-lg font-semibold text-[#C9A227] transition hover:bg-[#C9A227]/10 sm:w-auto"
            >
              Not Sure? Take the Qualifier
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        <p>Trinity Finance — 613 Chillicothe Street, Portsmouth, Ohio 45662</p>
        <p className="mt-1">
          All applications are subject to credit approval. Equal Opportunity Lender.
          Your information is protected by 256-bit SSL encryption.
        </p>
      </footer>
    </main>
  );
}

const STATS = [
  { value: "50+", label: "Lending Partners" },
  { value: "8", label: "Loan Products" },
  { value: "48hr", label: "Pre-Approval Time" },
  { value: "$5M+", label: "Max Facility Size" },
];

const LOAN_TYPES = [
  { title: "SBA Loans", desc: "Up to $5M with government backing", icon: "🏛", href: "/apply/sba" },
  { title: "Equipment Financing", desc: "Finance any business equipment", icon: "⚙", href: "/apply/equipment" },
  { title: "Line of Credit", desc: "Flexible revolving credit facility", icon: "💳", href: "/apply/line-of-credit" },
  { title: "Invoice Factoring", desc: "Turn invoices into immediate cash", icon: "📄", href: "/apply/factoring" },
  { title: "Invoice Financing", desc: "Advance against your A/R", icon: "💰", href: "/apply/invoice-financing" },
  { title: "Merchant Cash Advance", desc: "Revenue-based financing", icon: "📈", href: "/apply/mca" },
  { title: "Debt Relief", desc: "Consolidate high-interest debt", icon: "🛡", href: "/apply/debt-relief" },
  { title: "Not Sure?", desc: "Let our AI find your best fit", icon: "🤖", href: "/apply/qualify" },
];

const STEPS = [
  {
    title: "Apply in Minutes",
    desc: "Complete our intelligent application. AI pre-fills what it can and routes you to the right product automatically.",
  },
  {
    title: "Verify Documents",
    desc: "Upload your documents. Our AI verifies and processes them with a GREEN / YELLOW / RED stoplight system.",
  },
  {
    title: "Get Matched & Funded",
    desc: "We match you to the best-fit lenders. Review offers side by side and select the one that works for you.",
  },
];
