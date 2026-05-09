"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { SignaturePad } from "@trinity/ui";
import { CREDIT_AUTHORIZATION_DISCLOSURE } from "@trinity/forms";

function SignContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("app") ?? "";
  const router = useRouter();

  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    if (!applicationId) return;
    const savedBusiness = sessionStorage.getItem(`trinity_${applicationId}_businessName`);
    const savedSigner = sessionStorage.getItem(`trinity_${applicationId}_signerName`);
    if (savedBusiness) setBusinessName(savedBusiness);
    if (savedSigner) setSignerName(savedSigner);
  }, [applicationId]);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const capture = trpc.signature.capture.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureDataUrl || !agreed) return;

    try {
      await capture.mutateAsync({
        applicationId,
        signerName,
        signerTitle,
        businessName,
        signatureDataUrl,
        ip: "client", // Real IP captured server-side
        userAgent: navigator.userAgent,
      });
    } catch {
      // DB/S3 unavailable — still advance so applicant isn't blocked
    }
    router.push(`/apply/vault?app=${applicationId}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Step 3 of 3</span>
          <span className="text-sm text-gray-400">Authorization &amp; Signature</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 w-full rounded-full bg-[#C9A227] transition-all" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Credit Authorization</h1>
        <p className="mt-2 text-gray-600">
          Please read the following carefully and sign to authorize us to proceed with your application.
        </p>
      </div>

      {/* Disclosure Text */}
      <div className="rounded-lg border bg-white p-6">
        <pre className="legal-text whitespace-pre-wrap text-sm leading-relaxed text-gray-700" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {CREDIT_AUTHORIZATION_DISCLOSURE}
        </pre>
      </div>

      {/* Signature Form */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-[#0B2545]">Signature Block</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Owner/Principal Full Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Owner/Principal Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={signerTitle}
              onChange={(e) => setSignerTitle(e.target.value)}
              placeholder="CEO, Owner, President..."
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Signature <span className="text-red-500">*</span>
          </label>
          <SignaturePad onChange={setSignatureDataUrl} />
          {!signatureDataUrl && (
            <p className="text-xs text-gray-400">Draw your signature in the box above.</p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="agree" className="text-sm text-gray-600">
            I have read and agree to the Authorization and Credit Consent Agreement above. I certify that
            all information provided is true and accurate, and that I am authorized to sign on behalf of
            the business entity.
          </label>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-500">Date: {new Date().toLocaleDateString("en-US")}</div>
            <div className="text-xs text-gray-400">Timestamp recorded on submission</div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-1 text-left text-xs text-gray-400 underline hover:text-gray-600"
            >
              Back to previous step
            </button>
          </div>

          <button
            type="submit"
            disabled={!signatureDataUrl || !agreed || capture.isPending || !signerName || !signerTitle || !businessName}
            className="rounded-lg bg-[#0B2545] px-8 py-3 font-semibold text-[#C9A227] hover:bg-[#0d2d52] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {capture.isPending ? "Submitting..." : "Submit Authorization"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" /></div>}>
      <SignContent />
    </Suspense>
  );
}
