"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function InvoiceFinContent() {
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
      <Progress step={2} label="Invoice Financing Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Invoice Financing</h2>
        <p className="mb-6 text-sm text-gray-500">
          Borrow against your unpaid invoices. You keep control of collections — your customers never know.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total Outstanding A/R" required>
              <input required type="number" min="1" value={v.totalAR ?? ""} onChange={set("totalAR")} placeholder="250000" className={INPUT} />
            </Field>
            <Field label="Advance Amount Requested" required>
              <input required type="number" min="1" value={v.advanceAmount ?? ""} onChange={set("advanceAmount")} placeholder="150000" className={INPUT} />
            </Field>
          </div>

          <Field label="Average Days to Collection" required>
            <select required value={v.avgDaysToCollect ?? ""} onChange={set("avgDaysToCollect")} className={INPUT}>
              <option value="">Select</option>
              <option>Under 30 days</option>
              <option>30–45 days</option>
              <option>45–60 days</option>
              <option>60–90 days</option>
              <option>90+ days</option>
            </select>
          </Field>

          <Field label="Customer Concentration" required>
            <select required value={v.concentration ?? ""} onChange={set("concentration")} className={INPUT}>
              <option value="">Select</option>
              <option>Spread across many clients</option>
              <option>1–2 customers = 50%+ of A/R</option>
              <option>Single customer = 75%+ of A/R</option>
            </select>
          </Field>

          <Field label="Industry / Customer Type" required>
            <select required value={v.customerIndustry ?? ""} onChange={set("customerIndustry")} className={INPUT}>
              <option value="">Select</option>
              <option>Construction / contractors</option>
              <option>Staffing / HR</option>
              <option>Manufacturing</option>
              <option>Distribution / wholesale</option>
              <option>Professional services</option>
              <option>Healthcare</option>
              <option>Government</option>
              <option>Other B2B</option>
            </select>
          </Field>

          <Field label="Any Liens on Your A/R?">
            <select value={v.liensOnAR ?? ""} onChange={set("liensOnAR")} className={INPUT}>
              <option value="">Select</option>
              <option>No liens</option>
              <option>Existing lender has a blanket lien</option>
              <option>Unsure</option>
            </select>
          </Field>

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}

export default function InvoiceFinancingPage() {
  return <Suspense fallback={<Spinner />}><InvoiceFinContent /></Suspense>;
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
