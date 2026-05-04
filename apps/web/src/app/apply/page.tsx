"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormRenderer } from "@/components/forms/FormRenderer";
import { section1Fields } from "@trinity/forms";
import { resolveRouting } from "@trinity/forms";
import { trpc } from "@/lib/trpc";

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? undefined;

  const [step, setStep] = useState<"capture" | "form">("capture");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const createDraft = trpc.application.createDraft.useMutation();
  const saveQuickApp = trpc.application.saveQuickApp.useMutation();

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createDraft.mutateAsync({
      email,
      phone,
      referralCode: refCode,
    });
    setApplicationId(result.applicationId);
    setStep("form");

    // Save resume token to localStorage
    localStorage.setItem(`trinity_resume_${result.applicationId}`, result.resumeToken);
  };

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    if (!applicationId) return;

    const loanType = mapLoanTypeSelection(values["loanTypeSelection"] as string ?? "");

    await saveQuickApp.mutateAsync({
      applicationId,
      data: { ...values, businessEmail: email, cellPhone: phone },
      loanType,
    });

    // Route to the appropriate section
    const nextPath = resolveRouting(values);
    router.push(`${nextPath}?app=${applicationId}`);
  };

  if (step === "capture") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B2545]">Start Your Application</h1>
          <p className="mt-2 text-gray-600">
            No login required to start. We'll save your progress automatically.
          </p>
        </div>

        <form onSubmit={handleCapture} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Business Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Cell Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>

          {refCode && (
            <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Referred by partner code: <strong>{refCode}</strong>
            </div>
          )}

          <button
            type="submit"
            disabled={createDraft.isPending}
            className="w-full rounded-lg bg-[#0B2545] py-3 font-semibold text-[#C9A227] hover:bg-[#0d2d52] disabled:opacity-50"
          >
            {createDraft.isPending ? "Starting..." : "Begin Application"}
          </button>

          <p className="text-center text-xs text-gray-400">
            By continuing you agree to our Terms of Service and Privacy Policy.
            We use 256-bit encryption to protect your information.
          </p>
        </form>

        <div className="mt-6 text-center">
          <a href="/apply/qualify" className="text-sm text-[#0B2545] underline">
            Not sure what loan you need? Take our 10-question qualifier first.
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Step 1 of 2</span>
          <span className="text-sm text-gray-400">Section 1: Finance Quick Application</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 w-1/2 rounded-full bg-[#C9A227] transition-all" />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-[#0B2545]">Finance Quick Application</h2>
        <FormRenderer
          fields={section1Fields}
          onSubmit={handleFormSubmit}
          isLoading={saveQuickApp.isPending}
          submitLabel="Continue to Loan Section"
        />
      </div>
    </div>
  );
}

function mapLoanTypeSelection(selection: string): string {
  const map: Record<string, string> = {
    "Small Business Administration (SBA)": "SBA",
    "Line of Credit": "LINE_OF_CREDIT",
    "Equipment Financing": "EQUIPMENT_FINANCING",
    "Merchant Cash Advance (MCA)": "MCA",
    "Invoice Financing": "INVOICE_FINANCING",
    "Invoice Factoring": "INVOICE_FACTORING",
    "I'd Like Some Help Figuring Out What's Best": "UNSURE",
  };
  return map[selection] ?? "UNSURE";
}
