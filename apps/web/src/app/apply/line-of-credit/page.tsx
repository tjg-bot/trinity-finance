"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function LOCContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("app") ?? "";
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/apply/sign${applicationId ? `?app=${applicationId}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Progress step={2} label="Line of Credit Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Business Line of Credit</h2>
        <p className="mb-6 text-sm text-gray-500">
          Flexible revolving credit — draw what you need, pay interest only on what you use.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Credit Limit Requested" required>
            <select required value={v.creditLimit ?? ""} onChange={set("creditLimit")} className={INPUT}>
              <option value="">Select range</option>
              <option>$25,000 – $50,000</option>
              <option>$50,000 – $100,000</option>
              <option>$100,000 – $250,000</option>
              <option>$250,000 – $500,000</option>
              <option>$500,000+</option>
            </select>
          </Field>

          <Field label="Primary Use of the Line" required>
            <select required value={v.lineUsage ?? ""} onChange={set("lineUsage")} className={INPUT}>
              <option value="">Select</option>
              <option>Working capital / cash flow</option>
              <option>Inventory purchases</option>
              <option>Payroll bridge</option>
              <option>Seasonal fluctuations</option>
              <option>Emergency buffer</option>
              <option>Growth / opportunity fund</option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Average Monthly Revenue" required>
              <input required type="number" min="1" value={v.monthlyRevenue ?? ""} onChange={set("monthlyRevenue")} placeholder="50000" className={INPUT} />
            </Field>
            <Field label="Average Monthly Expenses">
              <input type="number" min="1" value={v.monthlyExpenses ?? ""} onChange={set("monthlyExpenses")} placeholder="35000" className={INPUT} />
            </Field>
          </div>

          <Field label="Do you have existing lines of credit?">
            <select value={v.existingLines ?? ""} onChange={set("existingLines")} className={INPUT}>
              <option value="">Select</option>
              <option>No</option>
              <option>Yes — fully available</option>
              <option>Yes — partially drawn</option>
              <option>Yes — maxed out</option>
            </select>
          </Field>

          <Field label="Business Bank (Primary Checking Account)">
            <input value={v.businessBank ?? ""} onChange={set("businessBank")} placeholder="e.g. Chase, Wells Fargo, Local Community Bank" className={INPUT} />
          </Field>

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}

export default function LineOfCreditPage() {
  return <Suspense fallback={<Spinner />}><LOCContent /></Suspense>;
}

const INPUT = "flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>{children}</div>;
}
function Progress({ step, label }: { step: number; label: string }) {
  return <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-gray-500">Step {step} of 3</span><span className="text-sm text-gray-400">{label}</span></div><div className="h-2 w-full rounded-full bg-gray-200"><div className="h-2 rounded-full bg-[#C9A227] transition-all" style={{ width: `${(step / 3) * 100}%` }} /></div></div>;
}
function SubmitBtn() {
  return <button type="submit" className="w-full rounded-lg bg-[#0B2545] py-3 font-semibold text-[#C9A227] hover:bg-[#0d2d52]">Continue to Authorization</button>;
}
function Spinner() {
  return <div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" /></div>;
}
