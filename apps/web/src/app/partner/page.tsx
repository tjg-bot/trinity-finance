"use client";

import { trpc } from "@/lib/trpc";

const STATUS_STAGES = [
  "DRAFT", "IN_REVIEW", "DOCS_PENDING", "UNDERWRITING", "MATCHED",
  "OFFER_SELECTED", "FUNDED", "DECLINED",
];

export default function PartnerDashboardPage() {
  const { data: apps } = trpc.application.list.useQuery({ limit: 50 });

  const byStatus = STATUS_STAGES.map((status) => ({
    status,
    count: apps?.items.filter((a) => a.status === status).length ?? 0,
  }));

  const funded = apps?.items.filter((a) => a.status === "FUNDED") ?? [];
  const activeDeals = apps?.items.filter((a) =>
    !["FUNDED", "DECLINED", "DRAFT"].includes(a.status)
  ).length ?? 0;

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard label="Active Deals" value={activeDeals.toString()} icon="🔄" />
        <KpiCard label="Funded This Month" value={funded.length.toString()} icon="✅" />
        <KpiCard
          label="Total Pipeline"
          value={`$${((apps?.items ?? []).reduce((sum, a) => {
            const amt = parseFloat(a.quickApp?.desiredFundingAmount || "0");
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0) / 1000).toFixed(0)}K`}
          icon="💰"
        />
        <KpiCard label="Declined" value={(apps?.items.filter((a) => a.status === "DECLINED").length ?? 0).toString()} icon="❌" />
      </div>

      {/* Pipeline by stage */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">Pipeline by Stage</h2>
        </div>
        <div className="grid grid-cols-4 divide-x lg:grid-cols-8">
          {byStatus.map(({ status, count }) => (
            <div key={status} className="p-4 text-center">
              <div className="text-2xl font-bold text-[#0B2545]">{count}</div>
              <div className="mt-1 text-xs text-gray-500">
                {status.replace(/_/g, " ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
        </div>
        <div className="divide-y">
          {apps?.items.slice(0, 10).map((app) => (
            <div key={app.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900">
                  {app.quickApp?.legalBusinessName ?? "Unnamed Application"}
                </p>
                <p className="text-sm text-gray-500">
                  {app.loanType.replace(/_/g, " ")} -
                  ${(parseFloat(app.quickApp?.desiredFundingAmount || "0") || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                <a
                  href={`/apply/vault?app=${app.id}`}
                  className="text-sm text-[#0B2545] underline"
                >
                  View
                </a>
              </div>
            </div>
          ))}
          {(!apps?.items || apps.items.length === 0) && (
            <div className="px-6 py-12 text-center text-gray-400">
              No applications yet.{" "}
              <a href="/apply" className="text-[#0B2545] underline">
                Create your first application
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-2xl font-bold text-[#0B2545]">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    IN_REVIEW: "bg-blue-100 text-blue-700",
    DOCS_PENDING: "bg-yellow-100 text-yellow-700",
    UNDERWRITING: "bg-purple-100 text-purple-700",
    MATCHED: "bg-indigo-100 text-indigo-700",
    OFFER_SELECTED: "bg-orange-100 text-orange-700",
    FUNDED: "bg-green-100 text-green-700",
    DECLINED: "bg-red-100 text-red-700",
    SERVICING: "bg-emerald-100 text-emerald-700",
    STALLED: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
