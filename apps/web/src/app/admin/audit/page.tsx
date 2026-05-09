export const dynamic = "force-dynamic";

import { prisma } from "@trinity/db";

export default async function AdminAuditPage() {
  let logs: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = [];

  try {
    logs = await prisma.auditLog.findMany({
      orderBy: { ts: "desc" },
      take: 100,
      include: { actor: { select: { email: true, role: true } } },
    });
  } catch {
    // DB not configured
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">Last 100 system events.</p>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">No audit events yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Entity</th>
                <th className="px-6 py-3">Application</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.ts).toLocaleString("en-US")}
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-600">
                    {log.actor?.email ?? "system"}
                  </td>
                  <td className="px-6 py-3">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-600">
                    {log.entity} <span className="text-gray-400">#{log.entityId.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {log.applicationId ? log.applicationId.slice(0, 8) + "..." : "-"}
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
