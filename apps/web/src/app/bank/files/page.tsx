"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FileText, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUSES = ["PROPOSED", "OFFERED", "SELECTED", "DECLINED"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PROPOSED:  { label: "Proposed",  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   icon: Clock },
  OFFERED:   { label: "Offered",   color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: FileText },
  SELECTED:  { label: "Selected",  color: "text-green-700",  bg: "bg-green-50 border-green-200",  icon: CheckCircle },
  DECLINED:  { label: "Declined",  color: "text-red-700",    bg: "bg-red-50 border-red-200",      icon: XCircle },
};

export default function BankFilesPage() {
  const [activeStatus, setActiveStatus] = useState<Status | "ALL">("ALL");

  const { data, isLoading } = trpc.matching.getBankPipeline.useQuery({
    limit: 50,
    status: activeStatus === "ALL" ? undefined : activeStatus,
  });

  const items = data?.items ?? [];

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = data?.items.filter((i) => i.status === s).length ?? 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Perfect Files</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pre-underwritten applications matched to your credit box.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveStatus("ALL")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            activeStatus === "ALL"
              ? "bg-[#0B2545] text-[#C9A227]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({items.length})
        </button>
        {STATUSES.map((s) => {
          const meta = STATUS_META[s];
          return (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeStatus === s
                  ? "bg-[#0B2545] text-[#C9A227]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {meta.label} ({counts[s] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No Perfect Files in this category yet.</p>
            <p className="mt-1 text-xs text-gray-300">
              Configure your underwriting rules to start receiving matched files.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Business</th>
                <th className="px-6 py-3">Loan Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">FICO</th>
                <th className="px-6 py-3">Docs</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((match) => {
                const meta = STATUS_META[match.status as Status] ?? STATUS_META.PROPOSED;
                const StatusIcon = meta.icon;
                return (
                  <tr key={match.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-[#0B2545]">
                      {match.application.quickApp?.legalBusinessName ?? "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {match.application.quickApp?.loanTypeSelection?.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${parseFloat(match.application.quickApp?.desiredFundingAmount ?? "0").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {match.application.quickApp?.ficoScore ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        {match.application.documents.length} green
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-gray-200">
                          <div
                            className="h-1.5 rounded-full bg-[#C9A227]"
                            style={{ width: `${match.score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[#0B2545]">{match.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.bg} ${meta.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
