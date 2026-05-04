/**
 * Lender PDF generation using pdf-lib.
 * Loads lender-specific templates, fills form fields, embeds signature,
 * appends supporting documents, and outputs a single combined PDF.
 * Audit trail logs every field mapping.
 */
import { PDFDocument, rgb, StandardFonts, type PDFPage } from "pdf-lib";
import { LENDER_MAPPINGS } from "./lenders/registry";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

export interface LenderFieldMapping {
  trinityField: string; // dot-notation path into application data
  lenderField: string;  // PDF form field name in the template
  transform?: (value: string) => string;
}

export interface PdfGenerationInput {
  lenderId: string;
  applicationData: Record<string, unknown>;
  signaturePngBytes?: Uint8Array;
  supportingDocBuffers?: Array<{ name: string; buffer: Uint8Array }>;
  actorUserId?: string;
  applicationId: string;
}

export interface PdfGenerationResult {
  pdfBytes: Uint8Array;
  fieldsMapped: number;
  lenderId: string;
}

/**
 * Generate a lender-specific PDF submission package.
 */
export async function generateLenderPdf(
  input: PdfGenerationInput
): Promise<PdfGenerationResult> {
  const mapping = LENDER_MAPPINGS[input.lenderId];

  let pdfDoc: PDFDocument;

  if (mapping?.templatePath) {
    // Load lender template if available
    const fs = await import("fs/promises");
    const templateBytes = await fs.readFile(mapping.templatePath);
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    // Generate a clean form-fill PDF from scratch
    pdfDoc = await PDFDocument.create();
  }

  const form = pdfDoc.getForm();
  let fieldsMapped = 0;
  const fieldLog: string[] = [];

  // Fill mapped fields
  if (mapping?.fields) {
    for (const fieldMap of mapping.fields) {
      const value = getNestedValue(input.applicationData, fieldMap.trinityField);
      if (value === undefined || value === null) continue;

      const strValue = fieldMap.transform
        ? fieldMap.transform(String(value))
        : String(value);

      try {
        const field = form.getTextField(fieldMap.lenderField);
        field.setText(strValue);
        fieldsMapped++;
        fieldLog.push(`${fieldMap.trinityField} -> ${fieldMap.lenderField}`);
      } catch {
        // Field not found in template - skip silently, log
        fieldLog.push(`MISSING: ${fieldMap.lenderField}`);
      }
    }
  }

  // Embed signature image if provided
  if (input.signaturePngBytes) {
    const sigImage = await pdfDoc.embedPng(input.signaturePngBytes);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    if (lastPage) {
      const { width } = lastPage.getSize();
      lastPage.drawImage(sigImage, {
        x: 72,
        y: 72,
        width: Math.min(200, sigImage.width),
        height: Math.min(60, sigImage.height),
      });
    }
  }

  // Append supporting documents
  if (input.supportingDocBuffers) {
    for (const { buffer } of input.supportingDocBuffers) {
      try {
        const supportDoc = await PDFDocument.load(buffer);
        const pages = await pdfDoc.copyPages(supportDoc, supportDoc.getPageIndices());
        for (const page of pages) {
          pdfDoc.addPage(page);
        }
      } catch {
        // Non-PDF supporting doc (JPG/PNG) - embed as image on new page
        const page = pdfDoc.addPage([612, 792]); // US Letter
        try {
          const img = await pdfDoc.embedJpg(buffer).catch(() => pdfDoc.embedPng(buffer));
          const imgDims = img.scale(1);
          const scale = Math.min(540 / imgDims.width, 720 / imgDims.height, 1);
          page.drawImage(img, {
            x: 36,
            y: 36,
            width: imgDims.width * scale,
            height: imgDims.height * scale,
          });
        } catch {
          // Can't embed - add placeholder text
          drawPlaceholderText(page, "Supporting document (unable to embed)");
        }
      }
    }
  }

  // Audit the field mappings
  await auditLog({
    actorUserId: input.actorUserId,
    action: "LENDER_PDF_GENERATED",
    entity: "Application",
    entityId: input.applicationId,
    applicationId: input.applicationId,
    after: {
      lenderId: input.lenderId,
      fieldsMapped,
      fields: fieldLog,
    },
  }).catch(() => {/* don't fail PDF generation on audit error */});

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBytes: new Uint8Array(pdfBytes),
    fieldsMapped,
    lenderId: input.lenderId,
  };
}

/**
 * Generate a Trinity-branded Credit Memo PDF using Puppeteer for HTML-to-PDF.
 */
export async function generateCreditMemoPdf(
  applicationId: string,
  creditMemo: Record<string, unknown>
): Promise<Uint8Array> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();

  const html = buildCreditMemoHtml(applicationId, creditMemo);
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "Letter",
    margin: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}

// ─── Helpers ──────────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function drawPlaceholderText(page: PDFPage, text: string): void {
  // Simple text draw - font embedding is async, use basic approach
  void page; void text; // placeholder - real impl would embed font
}

function buildCreditMemoHtml(
  applicationId: string,
  memo: Record<string, unknown>
): string {
  const strengths = (memo["strengths"] as string[] | undefined) ?? [];
  const risks = (memo["risks"] as string[] | undefined) ?? [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Source Serif 4', Georgia, serif; color: #1a1a1a; margin: 0; padding: 0; }
    .header { background: #0B2545; color: #fff; padding: 40px 48px; }
    .header h1 { margin: 0; font-size: 28px; color: #C9A227; }
    .header p { margin: 8px 0 0; font-size: 14px; color: #ccc; }
    .body { padding: 40px 48px; }
    h2 { color: #0B2545; border-bottom: 2px solid #C9A227; padding-bottom: 8px; }
    .metric-row { display: flex; gap: 32px; margin: 16px 0; }
    .metric { flex: 1; background: #f8f8f8; padding: 16px; border-radius: 6px; }
    .metric .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric .value { font-size: 24px; font-weight: 700; color: #0B2545; margin-top: 4px; }
    .tag { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 13px; margin: 4px; }
    .tag.strength { background: #DCFCE7; color: #166534; }
    .tag.risk { background: #FEF2F2; color: #991B1B; }
    .rating { font-size: 20px; font-weight: 700; padding: 12px 24px; border-radius: 6px; display: inline-block; }
    .rating.STRONG { background: #DCFCE7; color: #166534; }
    .rating.ACCEPTABLE { background: #FEF9C3; color: #713F12; }
    .rating.MARGINAL { background: #FEF3C7; color: #92400E; }
    .rating.DECLINE { background: #FEF2F2; color: #991B1B; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Trinity Finance</h1>
    <p>Credit Memo - Application #${applicationId}</p>
    <p>613 Chillicothe Street, Portsmouth, Ohio 45662</p>
  </div>
  <div class="body">
    <h2>Business Summary</h2>
    <p>${String(memo["businessSummary"] ?? "")}</p>

    <h2>Financial Highlights</h2>
    <div class="metric-row">
      <div class="metric">
        <div class="label">DSCR</div>
        <div class="value">${String(memo["dscr"] ?? "N/A")}</div>
      </div>
      <div class="metric">
        <div class="label">Debt-to-Income</div>
        <div class="value">${String(memo["debtToIncome"] ?? "N/A")}</div>
      </div>
      <div class="metric">
        <div class="label">Cash Flow Stability</div>
        <div class="value">${String(memo["cashFlowStabilityScore"] ?? "N/A")}/100</div>
      </div>
    </div>

    <h2>Strengths</h2>
    ${strengths.map((s) => `<span class="tag strength">${s}</span>`).join("")}

    <h2>Risks</h2>
    ${risks.map((r) => `<span class="tag risk">${r}</span>`).join("")}

    <h2>Recommended Deal Structure</h2>
    <p>${String(memo["recommendedStructure"] ?? "")}</p>

    <h2>Overall Rating</h2>
    <span class="rating ${String(memo["overallRating"] ?? "")}">${String(memo["overallRating"] ?? "")}</span>

    <div class="footer">
      Generated by Trinity Finance AI Underwriting Engine - ${new Date().toLocaleDateString("en-US")} -
      Confidential - Not for distribution without written consent of Trinity Finance.
    </div>
  </div>
</body>
</html>`;
}
