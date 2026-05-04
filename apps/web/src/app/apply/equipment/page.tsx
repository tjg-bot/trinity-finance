"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function EquipmentContent() {
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
      <Progress step={2} label="Equipment Financing Details" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-[#0B2545]">Equipment Financing</h2>
        <p className="mb-6 text-sm text-gray-500">
          Finance new or used equipment. Up to 100% of the purchase price.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Equipment Description" required>
            <input required value={v.equipmentDescription ?? ""} onChange={set("equipmentDescription")} placeholder="2024 Caterpillar 320 Excavator" className={INPUT} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New or Used?" required>
              <select required value={v.equipmentCondition ?? ""} onChange={set("equipmentCondition")} className={INPUT}>
                <option value="">Select</option>
                <option>New</option>
                <option>Used</option>
                <option>Refurbished</option>
              </select>
            </Field>
            <Field label="Equipment Purchase Price" required>
              <input required type="number" min="1000" value={v.equipmentCost ?? ""} onChange={set("equipmentCost")} placeholder="75000" className={INPUT} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vendor / Seller Name" required>
              <input required value={v.vendorName ?? ""} onChange={set("vendorName")} placeholder="ABC Equipment Co." className={INPUT} />
            </Field>
            <Field label="Desired Term (months)">
              <select value={v.desiredTerm ?? ""} onChange={set("desiredTerm")} className={INPUT}>
                <option value="">Select</option>
                {[24, 36, 48, 60, 72, 84].map((m) => <option key={m}>{m} months</option>)}
              </select>
            </Field>
          </div>

          <Field label="Equipment Purpose / How It Will Be Used" required>
            <textarea required rows={3} value={v.equipmentPurpose ?? ""} onChange={set("equipmentPurpose")} placeholder="Describe how this equipment will generate revenue..." className={INPUT} />
          </Field>

          <Field label="Do you have a down payment available?">
            <select value={v.downPayment ?? ""} onChange={set("downPayment")} className={INPUT}>
              <option value="">Select</option>
              <option>No down payment</option>
              <option>5-10%</option>
              <option>10-20%</option>
              <option>20%+</option>
            </select>
          </Field>

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  return <Suspense fallback={<Spinner />}><EquipmentContent /></Suspense>;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const INPUT = "flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Progress({ step, label }: { step: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className="h-2 rounded-full bg-[#C9A227] transition-all" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
    </div>
  );
}

function SubmitBtn() {
  return (
    <button type="submit" className="w-full rounded-lg bg-[#0B2545] py-3 font-semibold text-[#C9A227] hover:bg-[#0d2d52]">
      Continue to Authorization
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545] border-t-transparent" />
    </div>
  );
}
