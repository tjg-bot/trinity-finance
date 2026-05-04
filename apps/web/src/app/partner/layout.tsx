import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  if (process.env.CLERK_SECRET_KEY) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-[#0B2545] text-white">
        <div className="p-6">
          <div className="font-bold text-[#C9A227]">Trinity Finance</div>
          <div className="mt-1 text-xs text-white/60">Partner Portal</div>
        </div>
        <nav className="px-3 pb-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 bg-gray-50">
        <header className="border-b bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Partner Dashboard</h1>
            <Link
              href="/apply"
              className="rounded-md bg-[#C9A227] px-3 py-1.5 text-xs font-semibold text-[#0B2545]"
            >
              + New Application
            </Link>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/partner", icon: "📊", label: "Dashboard" },
  { href: "/partner/pipeline", icon: "🔄", label: "Pipeline" },
  { href: "/partner/commissions", icon: "💰", label: "Commissions" },
  { href: "/partner/team", icon: "👥", label: "Team" },
];
