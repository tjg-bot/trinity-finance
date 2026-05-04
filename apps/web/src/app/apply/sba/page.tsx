"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SBAContent() {
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
      <Progress step={2} label="SBA Loan Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">SBA Loan Application</h2>
        <p className="mb-6 text-sm text-gray-500">
          Government-backed loans up to $5M. Best rates available for qualifying businesses.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="SBA Loan Type" required>
            <select required value={v.sbaLoanType ?? ""} onChange={set("sbaLoanType")} className={INPUT}>
              <option value="">Select SBA program</option>
              <option>SBA 7(a) — General purpose</option>
              <option>SBA 504 — Real estate &amp; equipment</option>
              <option>SBA Express — Fast funding up to $500K</option>
              <option>SBA Microloan — Up to $50K</option>
            </select>
          </Field>

          <Field label="Loan Purpose" required>
            <select required value={v.loanPurpose ?? ""} onChange={set("loanPurpose")} className={INPUT}>
              <option value="">Select purpose</option>
              <option>Working capital</option>
              <option>Real estate purchase</option>
              <option>Equipment purchase</option>
              <option>Business acquisition</option>
              <option>Debt refinancing</option>
              <option>Expansion / renovation</option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Years in Business" required>
              <input required type="number" min="2" value={v.yearsInBusiness ?? ""} onChange={set("yearsInBusiness")} placeholder="5" className={INPUT} />
            </Field>
            <Field label="Number of Full-Time Employees" required>
              <input required type="number" min="1" value={v.employees ?? ""} onChange={set("employees")} placeholder="12" className={INPUT} />
            </Field>
          </div>

          <Field label="Business Real Estate" required>
            <select required value={v.realEstate ?? ""} onChange={set("realEstate")} className={INPUT}>
              <option value="">Select</option>
              <option>Own — no mortgage</option>
              <option>Own — with mortgage</option>
              <option>Lease</option>
              <option>Home-based</option>
            </select>
          </Field>

          <Field label="Have you previously had an SBA loan?">
            <select value={v.priorSba ?? ""} onChange={set("priorSba")} className={INPUT}>
              <option value="">Select</option>
              <option>No</option>
              <option>Yes — paid in full</option>
              <option>Yes — currently active</option>
              <option>Yes — defaulted</option>
            </select>
          </Field>

          <Field label="Describe How You Will Use the Funds" required>
            <textarea required rows={3} value={v.useOfFunds ?? ""} onChange={set("useOfFunds")} placeholder="Provide specific detail on how the loan proceeds will be used..." className={`${INPUT} h-auto`} />
          </Field>

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}

export default function SBAPage() {
  return <Suspense fallback={<Spinner />}><SBAContent /></Suspense>;
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
