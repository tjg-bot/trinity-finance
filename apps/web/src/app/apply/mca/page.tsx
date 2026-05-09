"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function MCAContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("app") ?? "";
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const set = (k: string) => (val: string) => setV((p) => ({ ...p, [k]: val }));

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
          Revenue-based financing — repay as a fixed percentage of daily card sales. Fast funding, minimal requirements.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Average Monthly Card Sales" required>
              <input required type="number" min="1" value={v.monthlyCardSales ?? ""} onChange={(e) => setV((p) => ({ ...p, monthlyCardSales: e.target.value }))} placeholder="30000" className={INPUT} />
            </Field>
            <Field label="Average Monthly Deposits (All)" required>
              <input required type="number" min="1" value={v.monthlyDeposits ?? ""} onChange={(e) => setV((p) => ({ ...p, monthlyDeposits: e.target.value }))} placeholder="45000" className={INPUT} />
            </Field>
          </div>

          <Field label="Primary Payment Processor" required>
            <Sel value={v.processor ?? ""} onChange={set("processor")} placeholder="Select" required options={[
              "Square", "Stripe", "PayPal / Venmo Business", "Clover", "Toast", "Bank card terminal", "Other",
            ]} />
          </Field>

          <Field label="Do you have any existing MCAs or advances?" required>
            <Sel value={v.existingMca ?? ""} onChange={set("existingMca")} placeholder="Select" required options={[
              "No existing advances",
              "Yes — 1 active advance",
              "Yes — 2 active advances",
              "Yes — 3 or more active advances",
            ]} />
          </Field>

          {v.existingMca && v.existingMca !== "No existing advances" && (
            <Field label="Total Remaining Balance on Existing Advances">
              <input type="number" value={v.existingMcaBalance ?? ""} onChange={(e) => setV((p) => ({ ...p, existingMcaBalance: e.target.value }))} placeholder="25000" className={INPUT} />
            </Field>
          )}

          <Field label="How Long Has the Business Been Processing Card Sales?" required>
            <Sel value={v.processingHistory ?? ""} onChange={set("processingHistory")} placeholder="Select" required options={[
              "Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "2+ years",
            ]} />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-400 underline hover:text-gray-600">Back</button>
            <SubmitBtn />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MCAPage() {
  return <Suspense fallback={<Spinner />}><MCAContent /></Suspense>;
}

const INPUT = "flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

function Sel({ value, onChange, placeholder, options, required }: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[]; required?: boolean;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>{children}</div>;
}
function Progress({ step, label }: { step: number; label: string }) {
  return <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-gray-500">Step {step} of 3</span><span className="text-sm text-gray-400">{label}</span></div><div className="h-2 w-full rounded-full bg-gray-200"><div className="h-2 rounded-full bg-[#C9A227] transition-all" style={{ width: `${(step / 3) * 100}%` }} /></div></div>;
}
function SubmitBtn() {
  return <button type="submit" className="rounded-lg bg-[#0B2545] px-6 py-2.5 font-semibold text-[#C9A227] hover:bg-[#0d2d52]">Continue to Authorization</button>;
}
function Spinner() {
  return <div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" /></div>;
}
