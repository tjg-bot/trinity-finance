"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FactoringContent() {
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
      <Progress step={2} label="Invoice Factoring Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Invoice Factoring</h2>
        <p className="mb-6 text-sm text-gray-500">
          Sell your outstanding invoices for immediate cash — typically 80–95% upfront. We collect from your customers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly Invoice Volume" required>
              <input required type="number" min="1" value={v.monthlyInvoiceVolume ?? ""} onChange={(e) => setV((p) => ({ ...p, monthlyInvoiceVolume: e.target.value }))} placeholder="100000" className={INPUT} />
            </Field>
            <Field label="Average Invoice Amount" required>
              <input required type="number" min="1" value={v.avgInvoiceAmount ?? ""} onChange={(e) => setV((p) => ({ ...p, avgInvoiceAmount: e.target.value }))} placeholder="8500" className={INPUT} />
            </Field>
          </div>

          <Field label="Average Invoice Payment Terms" required>
            <Sel value={v.paymentTerms ?? ""} onChange={set("paymentTerms")} placeholder="Select" required options={[
              "Net 15", "Net 30", "Net 45", "Net 60", "Net 90+",
            ]} />
          </Field>

          <Field label="Who Are Your Customers (debtors)?" required>
            <Sel value={v.customerType ?? ""} onChange={set("customerType")} placeholder="Select" required options={[
              "Other businesses (B2B)", "Government / municipalities",
              "Healthcare / insurance", "Staffing / temp agencies", "Trucking / freight",
            ]} />
          </Field>

          <Field label="How Many Active Customers?" required>
            <Sel value={v.customerCount ?? ""} onChange={set("customerCount")} placeholder="Select" required options={[
              "1–3 customers", "4–10 customers", "11–25 customers", "25+ customers",
            ]} />
          </Field>

          <Field label="Are Any Invoices Past Due?">
            <Sel value={v.pastDue ?? ""} onChange={set("pastDue")} placeholder="Select" options={[
              "No past-due invoices", "Some past due (under 30 days)",
              "Some past due (30–60 days)", "Some past due (60+ days)",
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

export default function FactoringPage() {
  return <Suspense fallback={<Spinner />}><FactoringContent /></Suspense>;
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
