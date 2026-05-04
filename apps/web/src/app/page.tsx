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
            <p className="text-xs text-white/60">613 Chillicothe St, Portsmouth, OH 45662</p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/apply"
              className="rounded-md bg-[#C9A227] px-4 py-2 text-sm font-semibold text-[#0B2545] transition hover:bg-[#b8911e]"
            >
              Apply Now
            </Link>
            <Link
              href="/partner"
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Partner Portal
            </Link>
            <Link
              href="/bank"
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Bank Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold text-white sm:text-6xl">
            Commercial Lending,{" "}
            <span className="text-[#C9A227]">Intelligently Done</span>
          </h1>
          <p className="mt-6 text-xl text-white/70">
            AI-powered underwriting. Real lender matches. From application to funded in days.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="w-full rounded-lg bg-[#C9A227] px-8 py-4 text-lg font-bold text-[#0B2545] transition hover:bg-[#b8911e] sm:w-auto"
            >
              Start Your Application
            </Link>
            <Link
              href="/apply/qualify"
              className="w-full rounded-lg border border-[#C9A227] px-8 py-4 text-lg font-semibold text-[#C9A227] transition hover:bg-[#C9A227]/10 sm:w-auto"
            >
              Take the 10-Question Qualifier
            </Link>
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">
            Financing Solutions We Offer
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOAN_TYPES.map((loan) => (
              <Link
                key={loan.href}
                href={loan.href}
                className="group rounded-lg border border-white/10 bg-white/5 p-6 transition hover:border-[#C9A227]/50 hover:bg-white/10"
              >
                <div className="text-3xl">{loan.icon}</div>
                <h3 className="mt-3 font-semibold text-white group-hover:text-[#C9A227]">
                  {loan.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{loan.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A227] text-lg font-bold text-[#0B2545]">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        <p>Trinity Finance - 613 Chillicothe Street, Portsmouth, Ohio 45662</p>
        <p className="mt-1">
          All applications are subject to credit approval. Equal Opportunity Lender.
        </p>
      </footer>
    </main>
  );
}

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
  { title: "Apply in Minutes", desc: "Complete our intelligent application. AI pre-fills what it can." },
  { title: "Verify Documents", desc: "Upload documents. Our AI verifies and processes them automatically." },
  { title: "Get Matched & Funded", desc: "We match you to lenders and you select your best offer." },
];
