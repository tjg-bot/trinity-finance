export const dynamic = "force-dynamic";

import { prisma } from "@trinity/db";

export default async function AdminBanksPage() {
  let orgs: Awaited<ReturnType<typeof prisma.organization.findMany>> = [];
  let rules: Awaited<ReturnType<typeof prisma.bankRule.findMany>> = [];

  try {
    [orgs, rules] = await Promise.all([
      prisma.organization.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { memberships: true, matches: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bankRule.findMany({
        where: { deletedAt: null },
        include: { organization: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch {
    // DB not configured
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Banks & Rules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lending organizations and their underwriting configurations.
        </p>
      </div>

      {/* Organizations */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-[#0B2545]">Lender Organizations ({orgs.length})</h2>
        </div>
        {orgs.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No organizations yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3">Total Matches</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium text-[#0B2545]">{org.name}</td>
                  <td className="px-6 py-3 text-gray-600">{org.type}</td>
                  <td className="px-6 py-3 text-gray-600">{org._count.memberships}</td>
                  <td className="px-6 py-3 text-gray-600">{org._count.matches}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(org.createdAt).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bank Rules */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-[#0B2545]">Underwriting Rules ({rules.length})</h2>
        </div>
        {rules.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No rules configured yet.</div>
        ) : (
          <div className="divide-y">
            {rules.map((rule) => (
              <div key={rule.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-[#0B2545]">{rule.name}</div>
                    <div className="mt-0.5 text-xs text-gray-400">{rule.organization.name}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(rule.createdAt).toLocaleDateString("en-US")}
                  </div>
                </div>
                <pre className="mt-3 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-600">
                  {JSON.stringify(rule.criteria, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
