"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SBAContent() {
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
      <Progress step={2} label="SBA Loan Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">SBA Loan Application</h2>
        <p className="mb-6 text-sm text-gray-500">
          Government-backed loans up to $5M. Best rates available for qualifying businesses.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="SBA Loan Type" required>
            <Sel value={v.sbaLoanType ?? ""} onChange={set("sbaLoanType")} placeholder="Select SBA program" required options={[
              "SBA 7(a) — General purpose",
              "SBA 504 — Real estate & equipment",
              "SBA Express — Fast funding up to $500K",
              "SBA Microloan — Up to $50K",
            ]} />
          </Field>

          <Field label="Loan Purpose" required>
            <Sel value={v.loanPurpose ?? ""} onChange={set("loanPurpose")} placeholder="Select purpose" required options={[
              "Working capital",
              "Real estate purchase",
              "Equipment purchase",
              "Business acquisition",
              "Debt refinancing",
              "Expansion / renovation",
            ]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Years in Business" required>
              <input required type="number" min="2" value={v.yearsInBusiness ?? ""} onChange={(e) => setV((p) => ({ ...p, yearsInBusiness: e.target.value }))} placeholder="5" className={INPUT} />
            </Field>
            <Field label="Number of Full-Time Employees" required>
              <input required type="number" min="1" value={v.employees ?? ""} onChange={(e) => setV((p) => ({ ...p, employees: e.target.value }))} placeholder="12" className={INPUT} />
            </Field>
          </div>

          <Field label="Business Real Estate" required>
            <Sel value={v.realEstate ?? ""} onChange={set("realEstate")} placeholder="Select" required options={[
              "Own — no mortgage",
              "Own — with mortgage",
              "Lease",
              "Home-based",
            ]} />
          </Field>

          <Field label="Have you previously had an SBA loan?">
            <Sel value={v.priorSba ?? ""} onChange={set("priorSba")} placeholder="Select" options={[
              "No",
              "Yes — paid in full",
              "Yes — currently active",
              "Yes — defaulted",
            ]} />
          </Field>

          <Field label="Describe How You Will Use the Funds" required>
            <textarea required rows={3} value={v.useOfFunds ?? ""} onChange={(e) => setV((p) => ({ ...p, useOfFunds: e.target.value }))} placeholder="Provide specific detail on how the loan proceeds will be used..." className={`${INPUT} h-auto`} />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-400 underline hover:text-gray-600">
              Back
            </button>
            <SubmitBtn />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SBAPage() {
  return <Suspense fallback={<Spinner />}><SBAContent /></Suspense>;
}

const INPUT = "flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

function Sel({ value, onChange, placeholder, options, required }: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[]; required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
      >
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
