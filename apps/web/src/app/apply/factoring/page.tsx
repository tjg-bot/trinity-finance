"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FactoringContent() {
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
      <Progress step={2} label="Invoice Factoring Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Invoice Factoring</h2>
        <p className="mb-6 text-sm text-gray-500">
          Sell your outstanding invoices for immediate cash — typically 80–95% upfront.
          We collect from your customers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly Invoice Volume" required>
              <input required type="number" min="1" value={v.monthlyInvoiceVolume ?? ""} onChange={set("monthlyInvoiceVolume")} placeholder="100000" className={INPUT} />
            </Field>
            <Field label="Average Invoice Amount" required>
              <input required type="number" min="1" value={v.avgInvoiceAmount ?? ""} onChange={set("avgInvoiceAmount")} placeholder="8500" className={INPUT} />
            </Field>
          </div>

          <Field label="Average Invoice Payment Terms" required>
            <select required value={v.paymentTerms ?? ""} onChange={set("paymentTerms")} className={INPUT}>
              <option value="">Select</option>
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Net 45</option>
              <option>Net 60</option>
              <option>Net 90+</option>
            </select>
          </Field>

          <Field label="Who Are Your Customers (debtors)?" required>
            <select required value={v.customerType ?? ""} onChange={set("customerType")} className={INPUT}>
              <option value="">Select</option>
              <option>Other businesses (B2B)</option>
              <option>Government / municipalities</option>
              <option>Healthcare / insurance</option>
              <option>Staffing / temp agencies</option>
              <option>Trucking / freight</option>
            </select>
          </Field>

          <Field label="How Many Active Customers?" required>
            <select required value={v.customerCount ?? ""} onChange={set("customerCount")} className={INPUT}>
              <option value="">Select</option>
              <option>1–3 customers</option>
              <option>4–10 customers</option>
              <option>11–25 customers</option>
              <option>25+ customers</option>
            </select>
          </Field>

          <Field label="Are Any Invoices Past Due?">
            <select value={v.pastDue ?? ""} onChange={set("pastDue")} className={INPUT}>
              <option value="">Select</option>
              <option>No past-due invoices</option>
              <option>Some past due (under 30 days)</option>
              <option>Some past due (30–60 days)</option>
              <option>Some past due (60+ days)</option>
            </select>
          </Field>

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}

export default function FactoringPage() {
  return <Suspense fallback={<Spinner />}><FactoringContent /></Suspense>;
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
