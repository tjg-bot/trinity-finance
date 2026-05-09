import { Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

const PRODUCTS = [
  {
    name: "Credit Report Pull",
    desc: "Soft-pull FICO and full credit report on any applicant. Billed per pull.",
    badge: "Available",
    badgeColor: "bg-green-50 border-green-200 text-green-700",
  },
  {
    name: "Plaid Bank Feed",
    desc: "Connect directly to applicant bank accounts for 12-month transaction analysis.",
    badge: "Available",
    badgeColor: "bg-green-50 border-green-200 text-green-700",
  },
  {
    name: "Auto Title Search",
    desc: "Automated title search and lien check for equipment collateral.",
    badge: "Coming Soon",
    badgeColor: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  {
    name: "UCC Filing",
    desc: "File and manage UCC-1 financing statements directly from your dashboard.",
    badge: "Coming Soon",
    badgeColor: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  {
    name: "E-Sign Closing Package",
    desc: "Send, sign, and store closing documents digitally with audit trail.",
    badge: "Coming Soon",
    badgeColor: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  {
    name: "Servicer Integration",
    desc: "Push funded loans directly into your loan servicing system via API.",
    badge: "Enterprise",
    badgeColor: "bg-purple-50 border-purple-200 text-purple-700",
  },
];

export default function BankMarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Lender Marketplace</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add-on tools and integrations to streamline your lending operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <div
            key={product.name}
            className="flex flex-col rounded-lg border bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2545]/10">
                <Building2 className="h-5 w-5 text-[#0B2545]" />
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${product.badgeColor}`}>
                {product.badge}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-[#0B2545]">{product.name}</h3>
            <p className="mt-2 flex-1 text-sm text-gray-500">{product.desc}</p>
            {product.badge === "Available" && (
              <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:text-[#C9A227] transition-colors">
                Enable <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#C9A227]/30 bg-[#C9A227]/5 p-6">
        <p className="text-sm text-[#0B2545]">
          <strong>Enterprise integrations available.</strong> Contact Trinity Finance to discuss custom API integrations, white-label options, or volume pricing.
        </p>
        <Link
          href="mailto:lending@trinityfinance.com"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:underline"
        >
          Contact our team <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
