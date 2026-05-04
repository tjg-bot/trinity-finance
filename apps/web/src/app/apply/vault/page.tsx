"use client";

/**
 * Document Vault - stoplight status dashboard for an application.
 */
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StoplightBadge } from "@trinity/ui";
import { getRequiredDocs, DOC_DISPLAY_NAMES } from "@trinity/ai";
import type { LoanTypeKey } from "@trinity/ai";
import type { DocType } from "@trinity/db";

export default function VaultPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("app") ?? "";

  const { data: vaultData, refetch } = trpc.document.getVault.useQuery(
    { applicationId },
    { enabled: !!applicationId, refetchInterval: 10000 } // Poll every 10s
  );

  const { data: appSummary } = trpc.application.getSummary.useQuery(
    { applicationId },
    { enabled: !!applicationId }
  );

  const getUploadUrl = trpc.document.getUploadUrl.useMutation();
  const confirmUpload = trpc.document.confirmUpload.useMutation();
  const submitClarification = trpc.document.submitClarification.useMutation();

  const [uploading, setUploading] = useState<string | null>(null);
  const [clarificationInputs, setClarificationInputs] = useState<Record<string, string>>({});

  const loanType = (appSummary?.loanType ?? "UNSURE") as LoanTypeKey;
  const requiredDocTypes = getRequiredDocs(loanType);

  const getDocStatus = (docType: DocType) => {
    const docs = vaultData?.documents.filter((d) => d.docType === docType) ?? [];
    if (docs.length === 0) return "PENDING";
    const latest = docs[0]!;
    return latest.stoplightStatus;
  };

  const handleUpload = async (docType: DocType, file: File) => {
    if (!applicationId) return;
    setUploading(docType);

    try {
      const { uploadUrl, documentId } = await getUploadUrl.mutateAsync({
        applicationId,
        docType,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      // Upload directly to S3 using presigned URL
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Confirm and enqueue stoplight job
      await confirmUpload.mutateAsync({ documentId, applicationId });
      await refetch();
    } finally {
      setUploading(null);
    }
  };

  const greenCount = vaultData?.documents.filter((d) => d.stoplightStatus === "GREEN").length ?? 0;
  const totalRequired = requiredDocTypes.length;
  const allGreen = greenCount >= totalRequired;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Document Vault</h1>
        <p className="mt-1 text-gray-600">
          Upload your documents below. Our AI verifies each one automatically.
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">
            {greenCount} of {totalRequired} documents verified
          </span>
          {allGreen && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              All verified - Moving to underwriting!
            </span>
          )}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-[#16A34A] transition-all"
            style={{ width: `${totalRequired > 0 ? (greenCount / totalRequired) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {requiredDocTypes.map((docType) => {
          const status = getDocStatus(docType as DocType);
          const doc = vaultData?.documents.find((d) => d.docType === docType);
          const isUploading = uploading === docType;

          return (
            <div key={docType} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <StoplightBadge status={status as "GREEN" | "YELLOW" | "RED" | "PENDING"} />
                    <span className="font-medium text-gray-900">
                      {DOC_DISPLAY_NAMES[docType as DocType]}
                    </span>
                  </div>

                  {doc?.aiAnalysis && status === "YELLOW" && (
                    <div className="mt-3">
                      <p className="text-sm text-yellow-700">
                        {doc.clarificationNote ?? "Please provide clarification for this document."}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <textarea
                          value={clarificationInputs[docType] ?? ""}
                          onChange={(e) =>
                            setClarificationInputs((prev) => ({ ...prev, [docType]: e.target.value }))
                          }
                          placeholder="Provide your explanation here..."
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                          rows={2}
                        />
                        <button
                          onClick={() =>
                            submitClarification.mutateAsync({
                              documentId: doc.id,
                              applicationId,
                              clarificationNote: clarificationInputs[docType] ?? "",
                            })
                          }
                          className="rounded-md bg-[#EAB308] px-3 py-2 text-sm font-medium text-[#0B2545]"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}

                  {status === "RED" && (
                    <p className="mt-1 text-sm text-red-600">
                      This document needs to be re-uploaded. See your email for details.
                    </p>
                  )}

                  {doc && (
                    <p className="mt-1 text-xs text-gray-400">
                      {doc.originalFilename} - uploaded {new Date(doc.createdAt).toLocaleDateString("en-US")}
                    </p>
                  )}
                </div>

                {(status === "PENDING" || status === "RED") && (
                  <div>
                    <label className="cursor-pointer">
                      <span
                        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                          isUploading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#0B2545] text-[#C9A227] hover:bg-[#0d2d52]"
                        }`}
                      >
                        {isUploading ? "Uploading..." : status === "RED" ? "Re-upload" : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleUpload(docType as DocType, file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allGreen && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
          <h3 className="text-lg font-bold text-green-800">All Documents Verified!</h3>
          <p className="mt-2 text-green-700">
            Your application is moving to AI underwriting. You'll receive an email with lender matches shortly.
          </p>
        </div>
      )}
    </div>
  );
}
