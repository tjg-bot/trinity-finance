"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function MCAContent() {
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
      <Progress step={2} label="Merchant Cash Advance Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Merchant Cash Advance</h2>
        <p className="mb-6 text-sm text-gray-500">
          Revenue-based financing — repay as a fixed percentage of daily card sales.
          Fast funding, minimal requirements.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Average Monthly Card Sales" required>
              <input required type="number" min="1" value={v.monthlyCardSales ?? ""} onChange={set("monthlyCardSales")} placeholder="30000" className={INPUT} />
            </Field>
            <Field label="Average Monthly Deposits (All)" required>
              <input required type="number" min="1" value={v.monthlyDeposits ?? ""} onChange={set("monthlyDeposits")} placeholder="45000" className={INPUT} />
            </Field>
          </div>

          <Field label="Primary Payment Processor" required>
            <select required value={v.processor ?? ""} onChange={set("processor")} className={INPUT}>
              <option value="">Select</option>
              <option>Square</option>
              <option>Stripe</option>
              <option>PayPal / Venmo Business</option>
              <option>Clover</option>
              <option>Toast</option>
              <option>Bank card terminal</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label="Do you have any existing MCAs or advances?" required>
            <select required value={v.existingMca ?? ""} onChange={set("existingMca")} className={INPUT}>
              <option value="">Select</option>
              <option>No existing advances</option>
              <option>Yes — 1 active advance</option>
              <option>Yes — 2 active advances</option>
              <option>Yes — 3 or more active advances</option>
            </select>
          </Field>

          {v.existingMca && v.existingMca !== "No existing advances" && (
            <Field label="Total Remaining Balance on Existing Advances">
              <input type="number" value={v.existingMcaBalance ?? ""} onChange={set("existingMcaBalance")} placeholder="25000" className={INPUT} />
            </Field>
          )}

          <Field label="How Long Has the Business Been Processing Card Sales?" required>
            <select required value={v.processingHistory ?? ""} onChange={set("processingHistory")} className={INPUT}>
              <option value="">Select</option>
              <option>Less than 3 months</option>
              <option>3–6 months</option>
              <option>6–12 months</option>
              <option>1–2 years</option>
              <option>2+ years</option>
            </select>
          </Field>

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}

export default function MCAPage() {
  return <Suspense fallback={<Spinner />}><MCAContent /></Suspense>;
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
