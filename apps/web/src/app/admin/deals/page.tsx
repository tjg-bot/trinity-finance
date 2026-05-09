export const dynamic = "force-dynamic";

import { prisma } from "@trinity/db";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:          "bg-gray-100 text-gray-600",
  IN_REVIEW:      "bg-blue-100 text-blue-700",
  DOCS_PENDING:   "bg-yellow-100 text-yellow-700",
  UNDERWRITING:   "bg-purple-100 text-purple-700",
  MATCHED:        "bg-indigo-100 text-indigo-700",
  OFFER_SELECTED: "bg-orange-100 text-orange-700",
  FUNDED:         "bg-green-100 text-green-700",
  DECLINED:       "bg-red-100 text-red-700",
  STALLED:        "bg-gray-100 text-gray-500",
};

export default async function AdminDealsPage() {
  let apps: Awaited<ReturnType<typeof prisma.application.findMany>> = [];

  try {
    apps = await prisma.application.findMany({
      where: { deletedAt: null },
      include: {
        quickApp: { select: { legalBusinessName: true, desiredFundingAmount: true, ficoScore: true } },
        applicant: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    // DB not configured
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">All Deals</h1>
        <p className="mt-1 text-sm text-gray-500">{apps.length} applications in the system.</p>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        {apps.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">
            No applications yet. DB may not be connected.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Business</th>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Loan Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">FICO</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium text-[#0B2545]">
                    {app.quickApp?.legalBusinessName ?? "Unnamed"}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {app.applicant?.email ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {app.loanType.replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    ${parseFloat(app.quickApp?.desiredFundingAmount ?? "0").toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {app.quickApp?.ficoScore ?? "-"}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/apply/vault?app=${app.id}`}
                      className="text-sm font-medium text-[#0B2545] hover:text-[#C9A227] transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
