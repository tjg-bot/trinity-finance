"use client";

/**
 * Offer comparison page - shows top 3-5 lender matches.
 */
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function OffersPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("app") ?? "";
  const router = useRouter();

  const { data: matchData } = trpc.matching.getMatches.useQuery(
    { applicationId },
    { enabled: !!applicationId }
  );

  const selectOffer = trpc.matching.selectOffer.useMutation({
    onSuccess: () => {
      router.push(`/apply/sign?app=${applicationId}`);
    },
  });

  if (!matchData || matchData.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-lg border bg-white p-12">
          <div className="text-4xl">🔍</div>
          <h1 className="mt-4 text-2xl font-bold text-[#0B2545]">Matching You with Lenders</h1>
          <p className="mt-2 text-gray-600">
            Our AI is analyzing your application and finding the best lender matches.
            This usually takes 2-5 minutes.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Your Lender Matches</h1>
        <p className="mt-2 text-gray-600">
          Based on your application and documents, we've found {matchData.length} matches.
          Review and select your preferred offer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matchData.map((match, idx) => {
          const terms = match.projectedTerms as {
            rate?: number;
            termMonths?: number;
            monthlyPayment?: number;
            totalCost?: number;
            timeToClose?: string;
          };

          return (
            <div
              key={match.id}
              className={`relative rounded-lg border-2 bg-white p-6 transition ${
                idx === 0 ? "border-[#C9A227]" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {idx === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A227] px-3 py-1 text-xs font-bold text-[#0B2545]">
                  Best Match
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-[#0B2545]">{match.organizationName}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-[#16A34A]"
                      style={{ width: `${match.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{match.score}% fit</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Interest Rate</span>
                  <span className="font-bold text-[#0B2545]">
                    {terms.rate ? `${terms.rate}%` : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Term</span>
                  <span className="font-medium">
                    {terms.termMonths ? `${terms.termMonths} months` : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Payment</span>
                  <span className="font-medium">
                    {terms.monthlyPayment
                      ? `$${terms.monthlyPayment.toLocaleString()}`
                      : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-medium">
                    {terms.totalCost ? `$${terms.totalCost.toLocaleString()}` : "TBD"}
                  </span>
                </div>
                {terms.timeToClose && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time to Close</span>
                    <span className="font-medium">{terms.timeToClose}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  selectOffer.mutate({
                    applicationId,
                    offerId: match.offer?.id ?? "",
                  })
                }
                disabled={!match.offer?.id || selectOffer.isPending}
                className={`mt-6 w-full rounded-lg py-3 font-semibold transition ${
                  idx === 0
                    ? "bg-[#C9A227] text-[#0B2545] hover:bg-[#b8911e]"
                    : "bg-[#0B2545] text-[#C9A227] hover:bg-[#0d2d52]"
                } disabled:opacity-50`}
              >
                {selectOffer.isPending ? "Processing..." : "Select This Offer"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500">
        Questions? Call us at{" "}
        <a href="tel:+17405550100" className="text-[#0B2545] underline">
          (740) 555-0100
        </a>
      </p>
    </div>
  );
}
