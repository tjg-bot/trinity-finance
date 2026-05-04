"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UnsureContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("app");
  const appParam = appId ? `?app=${appId}` : "";

  const options = [
    {
      title: "Take the AI Qualifier",
      desc: "Answer 10 quick questions and our AI will tell you exactly which loan types you qualify for today.",
      icon: "🤖",
      href: "/apply/qualify",
      cta: "Start Qualifier",
      highlight: true,
    },
    {
      title: "Equipment Financing",
      desc: "Need to buy machinery, vehicles, or technology? Finance 100% of the cost.",
      icon: "⚙",
      href: `/apply/equipment${appParam}`,
      cta: "Apply for Equipment",
    },
    {
      title: "Line of Credit",
      desc: "Want flexible access to capital you can draw and repay as needed?",
      icon: "💳",
      href: `/apply/line-of-credit${appParam}`,
      cta: "Apply for LOC",
    },
    {
      title: "SBA Loan",
      desc: "Been in business 2+ years with decent credit? SBA offers the best rates.",
      icon: "🏛",
      href: `/apply/sba${appParam}`,
      cta: "Apply for SBA",
    },
    {
      title: "Merchant Cash Advance",
      desc: "Strong card sales? Get funded in 24–48 hours based on revenue.",
      icon: "📈",
      href: `/apply/mca${appParam}`,
      cta: "Apply for MCA",
    },
    {
      title: "Invoice Factoring",
      desc: "Sitting on unpaid invoices? Turn them into cash today.",
      icon: "📄",
      href: `/apply/factoring${appParam}`,
      cta: "Apply for Factoring",
    },
    {
      title: "Debt Relief",
      desc: "Drowning in high-interest advances or loans? We can consolidate them.",
      icon: "🛡",
      href: `/apply/debt-relief${appParam}`,
      cta: "Get Relief",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Not Sure Which Loan You Need?</h1>
        <p className="mt-2 text-gray-600">
          That is okay — most business owners aren't finance experts. Here are two ways forward.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className={`group rounded-xl border p-5 transition ${
              opt.highlight
                ? "border-[#C9A227] bg-[#0B2545] hover:bg-[#0d2d52]"
                : "border-gray-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm"
            }`}
          >
            <div className="text-2xl">{opt.icon}</div>
            <h3 className={`mt-3 font-semibold ${opt.highlight ? "text-[#C9A227]" : "text-[#0B2545]"}`}>
              {opt.title}
            </h3>
            <p className={`mt-1.5 text-sm ${opt.highlight ? "text-white/70" : "text-gray-600"}`}>
              {opt.desc}
            </p>
            <div className={`mt-4 text-sm font-medium ${opt.highlight ? "text-[#C9A227]" : "text-[#0B2545]"}`}>
              {opt.cta} →
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-sm text-gray-600">
          Rather talk to someone?{" "}
          <a href="tel:+17405550100" className="font-semibold text-[#0B2545] underline">
            (740) 555-0100
          </a>{" "}
          — we are happy to help you figure out the right fit.
        </p>
      </div>
    </div>
  );
}

export default function UnsurePage() {
  return <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" /></div>}><UnsureContent /></Suspense>;
}
