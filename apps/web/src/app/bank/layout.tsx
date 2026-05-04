import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BankLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-[#0B2545] text-white">
        <div className="p-6">
          <div className="font-bold text-[#C9A227]">Trinity Finance</div>
          <div className="mt-1 text-xs text-white/60">Lender Portal</div>
        </div>
        <nav className="px-3 pb-6 space-y-1">
          {[
            { href: "/bank", icon: "📊", label: "Dashboard" },
            { href: "/bank/files", icon: "📁", label: "Perfect Files" },
            { href: "/bank/rules", icon: "⚙", label: "Underwriting Rules" },
            { href: "/bank/marketplace", icon: "🏪", label: "Marketplace" },
          ].map((item) => (
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
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
