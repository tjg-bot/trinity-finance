import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Landmark,
  Wrench,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Zap,
  Star,
  MapPin,
  Brain,
  BarChart3,
  Clock,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trinity Finance - Commercial Lending Made Simple",
  description:
    "AI-powered commercial lending platform. Equipment financing, SBA loans, lines of credit, invoice factoring and more. Portsmouth, Ohio.",
  robots: { index: true, follow: true },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B2545] text-white">
      {/* ─── NAV ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B2545]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold tracking-tight text-[#C9A227]">
              Trinity Finance
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">
              Portsmouth, Ohio
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <Link href="#products" className="transition-colors hover:text-white">
              Products
            </Link>
            <Link href="#how-it-works" className="transition-colors hover:text-white">
              How It Works
            </Link>
            <Link href="#testimonials" className="transition-colors hover:text-white">
              Testimonials
            </Link>
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/partner"
              className="hidden rounded-lg px-4 py-2 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white sm:block"
            >
              Partner Portal
            </Link>
            <Link
              href="/bank"
              className="hidden rounded-lg px-4 py-2 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white sm:block"
            >
              Bank Portal
            </Link>
            <Link
              href="/apply"
              className="rounded-xl bg-[#C9A227] px-5 py-2.5 text-sm font-bold text-[#0B2545] shadow-lg shadow-[#C9A227]/20 transition-all hover:bg-[#b8911e] hover:-translate-y-px"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[700px] w-[900px] rounded-full bg-[#C9A227] opacity-[0.035] blur-[130px]" />
          <div className="absolute left-1/4 top-20 h-[400px] w-[500px] rounded-full bg-blue-400 opacity-[0.025] blur-[100px]" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #C9A227 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid items-center gap-16 lg:grid-cols-5">
            {/* ── Left copy ── */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1.5 text-sm font-medium text-[#C9A227]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A227]" />
                Portsmouth, Ohio - Serving Businesses Nationwide
              </div>

              <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.08] text-white xl:text-6xl 2xl:text-7xl">
                Commercial Financing,
                <br />
                <span className="text-[#C9A227]">Expertly Guided.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                AI-powered underwriting meets personal expertise. Access our 50+
                lender network and go from application to funded in days - not weeks.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/apply"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#C9A227] px-8 py-4 text-base font-bold text-[#0B2545] shadow-xl shadow-[#C9A227]/25 transition-all hover:-translate-y-0.5 hover:bg-[#b8911e] hover:shadow-[#C9A227]/35"
                >
                  Start Your Application
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/apply/qualify"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#C9A227]/40 px-8 py-4 text-base font-semibold text-[#C9A227] transition-all hover:border-[#C9A227]/60 hover:bg-[#C9A227]/10"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Qualifier - 2 min
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/45">
                {[
                  "No upfront fees",
                  "48-hr pre-approval",
                  "50+ lenders",
                  "Equal opportunity lender",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#C9A227]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: Founder photo ── */}
            <div className="lg:col-span-2">
              <div className="relative mx-auto max-w-xs lg:max-w-sm">
                {/* Gold glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C9A227]/50 via-[#C9A227]/20 to-transparent opacity-80 blur-md" />

                {/* Photo frame */}
                <div className="relative overflow-hidden rounded-2xl border border-[#C9A227]/20 bg-[#071829] shadow-2xl">
                  <div className="relative h-[520px] w-full">
                    <Image
                      src="/founder.jpg"
                      alt="Founder - Trinity Finance"
                      fill
                      className="object-cover object-center"
                      priority
                    />
                    {/* Bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#071829]/90 to-transparent" />
                  </div>
                </div>

                {/* Name card */}
                <div className="absolute inset-x-6 -bottom-5 rounded-xl bg-white px-5 py-3.5 shadow-2xl shadow-black/30">
                  <div className="text-sm font-bold text-[#0B2545]">Morgan Hall</div>
                  <div className="text-xs text-gray-500">Founder &amp; Principal Broker</div>
                  <div className="mt-0.5 text-[11px] text-gray-400">
                    Trinity Finance · Portsmouth, OH
                  </div>
                </div>

                {/* Floating: 50+ lenders */}
                <div className="absolute -right-5 top-8 rounded-xl bg-[#C9A227] px-4 py-3 text-center shadow-xl shadow-[#C9A227]/30">
                  <div className="text-2xl font-bold leading-none text-[#0B2545]">50+</div>
                  <div className="mt-1 text-[10px] font-semibold text-[#0B2545]/70">
                    Lending
                    <br />
                    Partners
                  </div>
                </div>

                {/* Floating: 48hr approval */}
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0B2545] px-3 py-2.5 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#C9A227]" />
                    <span className="text-xs font-medium text-white">48hr Pre-Approval</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold tabular-nums text-[#C9A227]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-white/45">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ────────────────────────────────────────── */}
      <section id="products" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-semibold text-white">
              Financing Solutions We Offer
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              Every business is different. We match you to the right product and the
              right lender.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOAN_TYPES.map((loan) => (
              <Link
                key={loan.href}
                href={loan.href}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/40 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-[#C9A227]/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C9A227]/20 bg-[#C9A227]/10 text-[#C9A227] transition-colors group-hover:bg-[#C9A227]/20">
                  <loan.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-white transition-colors group-hover:text-[#C9A227]">
                  {loan.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {loan.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#C9A227] opacity-0 transition-opacity group-hover:opacity-100">
                  Apply now <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI ADVANTAGE ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] px-6 py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A227] opacity-[0.03] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1.5 text-sm font-medium text-[#C9A227]">
              <Zap className="h-3.5 w-3.5" />
              Powered by AI
            </div>
            <h2 className="font-serif text-4xl font-semibold text-white">
              The Trinity Advantage
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              We combine cutting-edge AI with hands-on expertise to give your
              application the best possible shot.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {AI_FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-[#071829] p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C9A227]/20 bg-[#C9A227]/10 text-[#C9A227]">
                  <f.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-semibold text-white">
              From Application to Funded
            </h2>
            <p className="mt-4 text-white/50">
              Three streamlined steps. Days, not weeks.
            </p>
          </div>

          <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-8">
            {/* Connector line */}
            <div className="absolute top-7 left-[16.66%] right-[16.66%] hidden h-px bg-gradient-to-r from-[#C9A227]/40 via-[#C9A227]/20 to-[#C9A227]/40 sm:block" />

            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C9A227] bg-[#C9A227]/10 text-[#C9A227]">
                  <step.Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-[#0B2545]">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/50">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/apply"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#C9A227] px-10 py-4 text-base font-bold text-[#0B2545] shadow-xl shadow-[#C9A227]/20 transition-all hover:-translate-y-0.5 hover:bg-[#b8911e]"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────── */}
      <section
        id="testimonials"
        className="border-t border-white/10 bg-white/[0.02] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-semibold text-white">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-white/50">Real businesses. Real results.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-white/10 bg-[#071829] p-8"
              >
                <div className="flex gap-0.5 text-[#C9A227]">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-white/60 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="mt-0.5 text-xs text-white/35">
                    {t.role} &middot; {t.company}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#16A34A]/30 bg-[#16A34A]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    {t.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#C9A227] px-8 py-16 text-center shadow-2xl shadow-[#C9A227]/20">
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/10" />

            <div className="relative">
              <h2 className="font-serif text-4xl font-semibold text-[#0B2545] lg:text-5xl">
                Ready to get funded?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-[#0B2545]/65">
                No obligation. No upfront fees. Start in under 5 minutes.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/apply"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-10 py-4 text-lg font-bold text-[#C9A227] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#0d2d52] sm:w-auto"
                >
                  Apply Now - Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/apply/qualify"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0B2545]/25 px-10 py-4 text-lg font-semibold text-[#0B2545] transition-all hover:bg-[#0B2545]/10 sm:w-auto"
                >
                  <Sparkles className="h-5 w-5" />
                  Take the AI Qualifier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="font-serif text-xl font-semibold text-[#C9A227]">
                Trinity Finance
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/35">
                AI-powered commercial lending platform connecting businesses with the
                right capital from the right lenders.
              </p>
              <div className="mt-6 flex items-start gap-2 text-sm text-white/35">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#C9A227]" />
                <span>613 Chillicothe Street, Portsmouth, Ohio 45662</span>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="mb-5 text-sm font-semibold text-white">
                Loan Products
              </div>
              <ul className="space-y-3 text-sm text-white/40">
                {FOOTER_PRODUCTS.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="transition-colors hover:text-[#C9A227]"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portals */}
            <div>
              <div className="mb-5 text-sm font-semibold text-white">
                Portals &amp; Tools
              </div>
              <ul className="space-y-3 text-sm text-white/40">
                {[
                  { label: "Apply for Financing", href: "/apply" },
                  { label: "AI Qualifier", href: "/apply/qualify" },
                  { label: "Partner Portal", href: "/partner" },
                  { label: "Bank Portal", href: "/bank" },
                  { label: "Admin Dashboard", href: "/admin" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-[#C9A227]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2025 Trinity Finance. All rights reserved.</p>
            <p>
              All applications subject to credit approval. Equal Opportunity Lender.
              256-bit SSL encryption.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── DATA ─────────────────────────────────────────────────── */

const STATS = [
  { value: "50+", label: "Lending Partners" },
  { value: "$500M+", label: "Funded to Date" },
  { value: "48hr", label: "Pre-Approval Time" },
  { value: "8", label: "Financing Products" },
];

const LOAN_TYPES = [
  {
    title: "SBA Loans",
    desc: "Up to $5M with government backing and competitive rates",
    Icon: Landmark,
    href: "/apply/sba",
  },
  {
    title: "Equipment Financing",
    desc: "Finance any business equipment with flexible terms",
    Icon: Wrench,
    href: "/apply/equipment",
  },
  {
    title: "Line of Credit",
    desc: "Flexible revolving credit for ongoing business needs",
    Icon: CreditCard,
    href: "/apply/line-of-credit",
  },
  {
    title: "Invoice Factoring",
    desc: "Turn outstanding invoices into immediate working capital",
    Icon: FileText,
    href: "/apply/factoring",
  },
  {
    title: "Invoice Financing",
    desc: "Advance against your accounts receivable",
    Icon: DollarSign,
    href: "/apply/invoice-financing",
  },
  {
    title: "Merchant Cash Advance",
    desc: "Revenue-based financing with flexible repayment",
    Icon: TrendingUp,
    href: "/apply/mca",
  },
  {
    title: "Debt Relief",
    desc: "Consolidate high-interest debt into manageable payments",
    Icon: ShieldCheck,
    href: "/apply/debt-relief",
  },
  {
    title: "Not Sure?",
    desc: "Let our AI determine the best financing fit for you",
    Icon: Sparkles,
    href: "/apply/qualify",
  },
];

const AI_FEATURES = [
  {
    title: "Intelligent Intake",
    desc: "Our 10-question AI qualifier (powered by Claude) determines the right product and routes you to the optimal path - no wasted time, no wrong applications.",
    Icon: Brain,
  },
  {
    title: "Stoplight Document Review",
    desc: "Upload once. Our AI reads, extracts, and grades each document GREEN / YELLOW / RED so you know exactly what's needed before it ever hits a lender's desk.",
    Icon: BarChart3,
  },
  {
    title: "Smart Lender Matching",
    desc: "We compare your profile against 50+ lenders' credit boxes to surface only deals that will close - maximizing approval rates and offer quality.",
    Icon: Zap,
  },
];

const STEPS = [
  {
    title: "Apply in Minutes",
    desc: "Our intelligent form pre-fills what it can and routes you to the right product automatically.",
    Icon: FileText,
  },
  {
    title: "Verify Documents",
    desc: "Upload your docs. AI verifies and grades them with a real-time stoplight system.",
    Icon: CheckCircle,
  },
  {
    title: "Get Matched & Funded",
    desc: "Review side-by-side lender offers. Select your best fit and receive funding.",
    Icon: TrendingUp,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Trinity Finance got my equipment loan approved in 36 hours. I'd been turned down twice at my bank. Their AI intake knew exactly what product I needed.",
    name: "James R.",
    role: "Owner",
    company: "Precision Metal Works LLC",
    product: "Equipment Financing",
  },
  {
    quote:
      "The document review system is incredible. I knew my file was complete before it ever hit a lender's desk. Closed on $250K SBA in 3 weeks.",
    name: "Sandra K.",
    role: "CEO",
    company: "Heritage Catering Group",
    product: "SBA 7(a) Loan",
  },
  {
    quote:
      "I was drowning in MCA debt at 60% factor rates. Morgan and the team restructured everything into one manageable payment. Changed my business.",
    name: "David M.",
    role: "Principal",
    company: "Tri-State Logistics",
    product: "Debt Relief Program",
  },
];

const FOOTER_PRODUCTS = [
  { label: "SBA Loans", href: "/apply/sba" },
  { label: "Equipment Financing", href: "/apply/equipment" },
  { label: "Line of Credit", href: "/apply/line-of-credit" },
  { label: "Invoice Factoring", href: "/apply/factoring" },
  { label: "Invoice Financing", href: "/apply/invoice-financing" },
  { label: "Merchant Cash Advance", href: "/apply/mca" },
  { label: "Debt Relief", href: "/apply/debt-relief" },
];
