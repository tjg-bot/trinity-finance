"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Settings, Plus, CheckCircle } from "lucide-react";

const INPUT = "flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

const LOAN_TYPES = [
  "SBA 7(a)", "SBA 504", "Equipment Financing", "Line of Credit",
  "Invoice Factoring", "Invoice Financing", "Merchant Cash Advance",
];

export default function BankRulesPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    minFico: "650",
    maxFico: "850",
    minRevenue: "100000",
    maxRevenue: "",
    minLoan: "25000",
    maxLoan: "5000000",
    minTimeInBusiness: "24",
    loanTypes: [] as string[],
    states: "",
    notes: "",
  });

  const updateRule = trpc.matching.updateBankRule.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const toggleLoanType = (lt: string) => {
    setForm((p) => ({
      ...p,
      loanTypes: p.loanTypes.includes(lt)
        ? p.loanTypes.filter((x) => x !== lt)
        : [...p.loanTypes, lt],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRule.mutate({
      name: form.name || "Default Rule",
      criteria: {
        minFico: Number(form.minFico),
        maxFico: form.maxFico ? Number(form.maxFico) : undefined,
        minAnnualRevenue: Number(form.minRevenue),
        maxAnnualRevenue: form.maxRevenue ? Number(form.maxRevenue) : undefined,
        minLoanAmount: Number(form.minLoan),
        maxLoanAmount: Number(form.maxLoan),
        minMonthsInBusiness: Number(form.minTimeInBusiness),
        preferredLoanTypes: form.loanTypes,
        preferredStates: form.states ? form.states.split(",").map((s) => s.trim()) : [],
        notes: form.notes,
      },
      offerTemplates: [],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Underwriting Rules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define your credit box. We only send you files that match these criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rule name */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0B2545]">
            <Settings className="h-4 w-4" /> Rule Details
          </h2>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Rule Name</label>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. SBA Primary Box, Equipment A-Paper..."
              className={INPUT}
            />
          </div>
        </div>

        {/* FICO & Revenue */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-[#0B2545]">Credit & Revenue Requirements</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Min FICO Score</label>
              <input type="number" value={form.minFico} onChange={set("minFico")} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Max FICO Score (optional)</label>
              <input type="number" value={form.maxFico} onChange={set("maxFico")} placeholder="No maximum" className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Min Annual Revenue ($)</label>
              <input type="number" value={form.minRevenue} onChange={set("minRevenue")} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Max Annual Revenue ($)</label>
              <input type="number" value={form.maxRevenue} onChange={set("maxRevenue")} placeholder="No maximum" className={INPUT} />
            </div>
          </div>
        </div>

        {/* Loan amount & time in business */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-[#0B2545]">Loan Parameters</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Min Loan Amount ($)</label>
              <input type="number" value={form.minLoan} onChange={set("minLoan")} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Max Loan Amount ($)</label>
              <input type="number" value={form.maxLoan} onChange={set("maxLoan")} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Min Time in Business (months)</label>
              <input type="number" value={form.minTimeInBusiness} onChange={set("minTimeInBusiness")} className={INPUT} />
            </div>
          </div>
        </div>

        {/* Loan types */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-[#0B2545]">Preferred Loan Types</h2>
          <p className="mb-3 text-sm text-gray-500">Select all that apply. Leave blank to accept all types.</p>
          <div className="flex flex-wrap gap-2">
            {LOAN_TYPES.map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => toggleLoanType(lt)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  form.loanTypes.includes(lt)
                    ? "border-[#0B2545] bg-[#0B2545] text-[#C9A227]"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {lt}
              </button>
            ))}
          </div>
        </div>

        {/* States & notes */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-[#0B2545]">Geographic & Additional Preferences</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Preferred States (comma-separated, blank = all)
              </label>
              <input
                value={form.states}
                onChange={set("states")}
                placeholder="OH, KY, WV, PA..."
                className={INPUT}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Any other criteria or preferences for your underwriting team..."
                className={`${INPUT} h-auto`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateRule.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B2545] px-6 py-3 font-semibold text-[#C9A227] hover:bg-[#0d2d52] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {updateRule.isPending ? "Saving..." : "Save Underwriting Rule"}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle className="h-4 w-4" /> Rule saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
