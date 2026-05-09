"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";

const STAGES = [
  { key: "DRAFT",          label: "Draft",          color: "border-gray-300 bg-gray-50" },
  { key: "IN_REVIEW",      label: "In Review",      color: "border-blue-300 bg-blue-50" },
  { key: "DOCS_PENDING",   label: "Docs Pending",   color: "border-yellow-300 bg-yellow-50" },
  { key: "UNDERWRITING",   label: "Underwriting",   color: "border-purple-300 bg-purple-50" },
  { key: "MATCHED",        label: "Matched",         color: "border-indigo-300 bg-indigo-50" },
  { key: "OFFER_SELECTED", label: "Offer Selected", color: "border-orange-300 bg-orange-50" },
  { key: "FUNDED",         label: "Funded",          color: "border-green-300 bg-green-50" },
  { key: "DECLINED",       label: "Declined",        color: "border-red-300 bg-red-50" },
];

const LABEL_COLOR: Record<string, string> = {
  DRAFT:          "bg-gray-100 text-gray-600",
  IN_REVIEW:      "bg-blue-100 text-blue-700",
  DOCS_PENDING:   "bg-yellow-100 text-yellow-700",
  UNDERWRITING:   "bg-purple-100 text-purple-700",
  MATCHED:        "bg-indigo-100 text-indigo-700",
  OFFER_SELECTED: "bg-orange-100 text-orange-700",
  FUNDED:         "bg-green-100 text-green-700",
  DECLINED:       "bg-red-100 text-red-700",
};

export default function PartnerPipelinePage() {
  const { data, isLoading } = trpc.application.list.useQuery({ limit: 100 });
  const apps = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2545]">Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">All deals across every stage.</p>
        </div>
        <Link
          href="/apply"
          className="rounded-lg bg-[#C9A227] px-4 py-2 text-sm font-bold text-[#0B2545] hover:bg-[#b8911e]"
        >
          + New Application
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" />
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-lg border bg-white py-20 text-center">
          <p className="text-sm text-gray-400">No applications yet.</p>
          <Link href="/apply" className="mt-2 inline-block text-sm font-medium text-[#0B2545] underline">
            Create your first application
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Business</th>
                <th className="px-6 py-3">Loan Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {STAGES.filter((s) => apps.some((a) => a.status === s.key)).map((stage) =>
                apps
                  .filter((a) => a.status === stage.key)
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-[#0B2545]">
                        {app.quickApp?.legalBusinessName ?? "Unnamed"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {app.loanType.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ${parseFloat(app.quickApp?.desiredFundingAmount ?? "0").toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LABEL_COLOR[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/apply/vault?app=${app.id}`}
                          className="text-sm font-medium text-[#0B2545] hover:text-[#C9A227] transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stage summary */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {STAGES.map((s) => {
          const count = apps.filter((a) => a.status === s.key).length;
          return (
            <div key={s.key} className={`rounded-lg border p-3 text-center ${s.color}`}>
              <div className="text-xl font-bold text-[#0B2545]">{count}</div>
              <div className="mt-1 text-[10px] font-medium text-gray-500 leading-tight">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
