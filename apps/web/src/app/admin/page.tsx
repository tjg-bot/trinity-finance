export const dynamic = "force-dynamic";

import { prisma } from "@trinity/db";

export default async function AdminDashboard() {
  let totalApps = 0, funded = 0, docsReady = 0, stalled = 0;
  let recentAuditLogs: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = [];

  try {
    [totalApps, funded, docsReady, stalled] = await Promise.all([
      prisma.application.count({ where: { deletedAt: null } }),
      prisma.application.count({ where: { status: "FUNDED", deletedAt: null } }),
      prisma.application.count({ where: { status: "UNDERWRITING", deletedAt: null } }),
      prisma.application.count({ where: { status: "STALLED", deletedAt: null } }),
    ]);
    recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { ts: "desc" },
      take: 20,
      include: { actor: { select: { email: true, role: true } } },
    });
  } catch {
    // DB not yet configured
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Admin Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Applications" value={totalApps} />
        <StatCard label="Funded" value={funded} color="text-green-600" />
        <StatCard label="In Underwriting" value={docsReady} color="text-purple-600" />
        <StatCard label="Stalled" value={stalled} color="text-red-600" />
      </div>

      {/* Recent Audit Log */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent Audit Activity</h2>
          <a href="/admin/audit" className="text-sm text-[#0B2545] underline">View all</a>
        </div>
        <div className="divide-y">
          {recentAuditLogs.map((log) => (
            <div key={log.id} className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {log.entity} #{log.entityId.slice(0, 8)}
                  </span>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>{log.actor?.email ?? "system"}</div>
                  <div>{new Date(log.ts).toLocaleString("en-US")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-[#0B2545]" }: {
  label: string; value: number; color?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
