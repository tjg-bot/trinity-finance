"use client";

import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function PartnerCommissionsPage() {
  const { data } = trpc.application.list.useQuery({ limit: 100 });
  const apps = data?.items ?? [];

  const funded = apps.filter((a) => a.status === "FUNDED");
  const pipeline = apps.filter((a) =>
    !["FUNDED", "DECLINED", "DRAFT"].includes(a.status)
  );

  const totalFundedVolume = funded.reduce((sum, a) => {
    return sum + parseFloat(a.quickApp?.desiredFundingAmount ?? "0");
  }, 0);

  // Estimated commission at 1-3% of funded volume
  const estCommissionLow = totalFundedVolume * 0.01;
  const estCommissionHigh = totalFundedVolume * 0.03;

  const pipelineVolume = pipeline.reduce((sum, a) => {
    return sum + parseFloat(a.quickApp?.desiredFundingAmount ?? "0");
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Commissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your earnings summary based on funded applications.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Funded Deals"
          value={funded.length.toString()}
          icon={CheckCircle}
          color="text-green-600"
        />
        <KpiCard
          label="Total Funded Volume"
          value={`$${(totalFundedVolume / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="text-[#0B2545]"
        />
        <KpiCard
          label="Est. Commissions"
          value={`$${(estCommissionLow / 1000).toFixed(0)}K - $${(estCommissionHigh / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          color="text-[#C9A227]"
        />
        <KpiCard
          label="Pipeline Value"
          value={`$${(pipelineVolume / 1000).toFixed(0)}K`}
          icon={Clock}
          color="text-blue-600"
        />
      </div>

      {/* Funded deals table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-[#0B2545]">Funded Deals</h2>
        </div>
        {funded.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No funded deals yet.</p>
            <p className="mt-1 text-xs text-gray-300">Commission will appear here once deals close.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Business</th>
                <th className="px-6 py-3">Loan Type</th>
                <th className="px-6 py-3">Funded Amount</th>
                <th className="px-6 py-3">Est. Commission (1-3%)</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {funded.map((app) => {
                const amount = parseFloat(app.quickApp?.desiredFundingAmount ?? "0");
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-[#0B2545]">
                      {app.quickApp?.legalBusinessName ?? "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {app.loanType.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#0B2545]">
                      ${(amount * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${(amount * 0.03).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Funded
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Commission estimates are for reference only. Actual commission is subject to your agreement with Trinity Finance and is paid after lender funding confirmation.
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <Icon className={`h-5 w-5 ${color}`} />
      <div className="mt-3 text-2xl font-bold text-[#0B2545]">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
}
