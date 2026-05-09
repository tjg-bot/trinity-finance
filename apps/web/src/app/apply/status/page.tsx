"use client";

import { Suspense, useState } from "react";
import { trpc } from "@/lib/trpc";

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string; action?: { label: string; href: (id: string) => string } }> = {
  DRAFT:          { label: "Draft",           color: "bg-gray-100 text-gray-700",    description: "Your application has been started but not yet submitted." },
  IN_REVIEW:      { label: "In Review",       color: "bg-blue-100 text-blue-700",    description: "Your application is being reviewed by our team." },
  DOCS_PENDING:   { label: "Documents Needed", color: "bg-yellow-100 text-yellow-700", description: "We need additional documents to proceed.", action: { label: "Upload Documents", href: (id) => `/apply/vault?app=${id}` } },
  UNDERWRITING:   { label: "Underwriting",    color: "bg-purple-100 text-purple-700", description: "Your application is being evaluated by our lending partners." },
  MATCHED:        { label: "Lender Matched",  color: "bg-indigo-100 text-indigo-700", description: "We have matched your application with lenders. Offers coming soon.", action: { label: "View Offers", href: (id) => `/apply/offers?app=${id}` } },
  OFFER_SELECTED: { label: "Offer Selected",  color: "bg-orange-100 text-orange-700", description: "You have selected a loan offer. Closing in progress." },
  FUNDED:         { label: "Funded",          color: "bg-green-100 text-green-700",   description: "Congratulations — your loan has been funded!" },
  DECLINED:       { label: "Declined",        color: "bg-red-100 text-red-700",       description: "Unfortunately we were unable to find a match at this time. Contact us to discuss options." },
  STALLED:        { label: "Needs Attention", color: "bg-gray-100 text-gray-500",     description: "Your application needs attention. Please contact us." },
};

function StatusContent() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");

  const { data, isLoading } = trpc.application.getStatusByEmail.useQuery(
    { email: query },
    { enabled: !!query }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(email.trim());
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Check Application Status</h1>
        <p className="mt-2 text-gray-600">
          Enter the email address you used to start your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbusiness.com"
          className="flex-1 h-11 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#0B2545] px-5 py-2.5 font-semibold text-[#C9A227] hover:bg-[#0d2d52] whitespace-nowrap"
        >
          Look Up
        </button>
      </form>

      {submitted && isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" />
        </div>
      )}

      {submitted && !isLoading && data && data.applications.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
          No applications found for <strong>{query}</strong>. Double-check your email or{" "}
          <a href="/apply" className="underline font-medium">start a new application</a>.
        </div>
      )}

      {data && data.applications.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-500">
            {data.applications.length} application{data.applications.length > 1 ? "s" : ""} found
          </p>
          {data.applications.map((app) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.STALLED!;
            return (
              <div key={app.id} className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {app.quickApp?.legalBusinessName ?? "Application"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {app.loanType.replace(/_/g, " ")}
                      {app.quickApp?.desiredFundingAmount
                        ? ` · $${Number(app.quickApp.desiredFundingAmount).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{cfg.description}</p>

                <div className="flex items-center justify-between border-t pt-3">
                  <p className="text-xs text-gray-400">
                    Last updated {new Date(app.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {cfg.action && (
                    <a
                      href={cfg.action.href(app.id)}
                      className="rounded-lg bg-[#0B2545] px-4 py-1.5 text-sm font-semibold text-[#C9A227] hover:bg-[#0d2d52]"
                    >
                      {cfg.action.label}
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          <p className="text-center text-sm text-gray-500">
            Need help?{" "}
            <a href="tel:+17405550100" className="text-[#0B2545] underline font-medium">(740) 555-0100</a>
          </p>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" /></div>}>
      <StatusContent />
    </Suspense>
  );
}
