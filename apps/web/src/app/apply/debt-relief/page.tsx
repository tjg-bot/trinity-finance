"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function DebtReliefContent() {
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
      <Progress step={2} label="Debt Relief Details" />

      <div className="rounded-lg border-2 border-[#C9A227]/30 bg-[#C9A227]/5 p-4 rounded-lg">
        <p className="text-sm text-[#0B2545] font-medium">
          You are not alone. Thousands of businesses carry high-cost debt. We help consolidate
          multiple high-interest obligations into a single, manageable payment.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Business Debt Relief</h2>
        <p className="mb-6 text-sm text-gray-500">
          Consolidate high-interest MCAs, credit cards, and short-term loans into lower-rate financing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Total Debt You Want to Consolidate" required>
            <input required type="number" min="1" value={v.totalDebt ?? ""} onChange={(e) => setV((p) => ({ ...p, totalDebt: e.target.value }))} placeholder="85000" className={INPUT} />
          </Field>

          <Field label="Types of Debt (check all that apply)" required>
            <div className="space-y-2 pt-1">
              {["MCA / Cash Advance(s)", "Business Credit Cards", "Short-Term Loans", "Bank Loans", "Equipment Loans", "Other"].map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300"
                    onChange={(e) => setV((p) => {
                      const cur = p.debtTypes ? p.debtTypes.split(",") : [];
                      if (e.target.checked) return { ...p, debtTypes: [...cur, type].join(",") };
                      return { ...p, debtTypes: cur.filter((x) => x !== type).join(",") };
                    })} />
                  {type}
                </label>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Number of Active Obligations" required>
              <Sel value={v.obligationCount ?? ""} onChange={set("obligationCount")} placeholder="Select" required options={["1", "2", "3", "4", "5+"]} />
            </Field>
            <Field label="Total Monthly Payments Currently" required>
              <input required type="number" min="1" value={v.currentMonthlyPayments ?? ""} onChange={(e) => setV((p) => ({ ...p, currentMonthlyPayments: e.target.value }))} placeholder="12000" className={INPUT} />
            </Field>
          </div>

          <Field label="Are You Current on All Obligations?">
            <Sel value={v.paymentStatus ?? ""} onChange={set("paymentStatus")} placeholder="Select" options={[
              "Yes — all current", "Some 30 days past due", "Some 60+ days past due", "Currently in default",
            ]} />
          </Field>

          <Field label="What Caused the Need for Relief?" required>
            <textarea required rows={2} value={v.reliefReason ?? ""} onChange={(e) => setV((p) => ({ ...p, reliefReason: e.target.value }))} placeholder="Brief explanation of circumstances..." className={INPUT} />
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

export default function DebtReliefPage() {
  return <Suspense fallback={<Spinner />}><DebtReliefContent /></Suspense>;
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
