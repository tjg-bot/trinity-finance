"use client";

import { trpc } from "@/lib/trpc";

export default function BankDashboardPage() {
  const { data } = trpc.matching.getBankPipeline.useQuery({ limit: 20 });

  const proposed = data?.items.filter((m) => m.status === "PROPOSED").length ?? 0;
  const offered = data?.items.filter((m) => m.status === "OFFERED").length ?? 0;
  const selected = data?.items.filter((m) => m.status === "SELECTED").length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Lender Dashboard</h1>
        <p className="mt-1 text-gray-600">Incoming pre-underwritten Perfect Files</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <div className="text-2xl font-bold text-[#0B2545]">{proposed}</div>
          <div className="text-sm text-gray-500">Proposed Matches</div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="text-2xl font-bold text-[#0B2545]">{offered}</div>
          <div className="text-sm text-gray-500">Offers Extended</div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="text-2xl font-bold text-[#0B2545]">{selected}</div>
          <div className="text-sm text-gray-500">Offers Selected</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold">Incoming Perfect Files</h2>
          <a href="/bank/rules" className="text-sm text-[#0B2545] underline">
            Manage Underwriting Rules
          </a>
        </div>
        <div className="divide-y">
          {data?.items.map((match) => (
            <div key={match.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {match.application.quickApp?.legalBusinessName ?? "Unknown Business"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {match.application.quickApp?.loanTypeSelection} -
                    ${parseFloat(match.application.quickApp?.desiredFundingAmount ?? "0").toLocaleString()} requested
                  </p>
                  <p className="text-sm text-gray-500">
                    FICO: {match.application.quickApp?.ficoScore} -
                    Revenue: {match.application.quickApp?.annualRevenue}
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    {match.application.documents.length} verified documents
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0B2545]">{match.score}%</div>
                  <div className="text-xs text-gray-400">match score</div>
                  <div className={`mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    match.status === "PROPOSED" ? "bg-blue-100 text-blue-700" :
                    match.status === "OFFERED" ? "bg-yellow-100 text-yellow-700" :
                    match.status === "SELECTED" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {match.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!data?.items || data.items.length === 0) && (
            <div className="px-6 py-12 text-center text-gray-400">
              No matches yet. Update your underwriting rules to start receiving Perfect Files.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
