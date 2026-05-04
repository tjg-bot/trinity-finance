/**
 * Follow-up cadence processor.
 * T+0: immediate RED email/SMS
 * T+24h: reminder
 * T+72h: agent escalation
 * T+7d: mark STALLED, notify ops
 */
import type { Job } from "bullmq";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { Resend } from "resend";
import twilio from "twilio";
import { prisma } from "@trinity/db";
import {
  redDocEmailSubject, redDocEmailHtml, redDocSms,
  reminderEmailSubject, reminderEmailHtml, reminderSms,
  escalationEmailSubject, escalationEmailHtml,
  yellowDocEmailSubject, yellowDocEmailHtml,
} from "@trinity/ai/templates";
import { DOC_DISPLAY_NAMES } from "@trinity/ai/required-docs";
import type { DocType } from "@trinity/db";

interface FollowUpJobData {
  documentId: string;
  applicationId: string;
  status: "RED" | "YELLOW";
  clarificationNote?: string;
  delay: number; // 0, 24h, 72h, 7d in ms
  followUpType?: "immediate" | "reminder" | "escalation" | "stalled";
}

const connection = new IORedis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export async function followUpProcessor(job: Job<FollowUpJobData>): Promise<void> {
  const data = job.data;

  // Re-check document status - don't send if already resolved
  const doc = await prisma.document.findUnique({
    where: { id: data.documentId },
    include: {
      application: {
        include: {
          quickApp: true,
          applicant: true,
          owners: { take: 1 },
          documentRequests: {
            where: { docType: {} as DocType }, // find the matching request
          },
        },
      },
    },
  });

  if (!doc || doc.deletedAt) return;
  if (doc.stoplightStatus === "GREEN") return; // Already resolved

  const app = doc.application;
  const applicant = app.applicant;
  if (!applicant?.email) return;

  const businessName = app.quickApp?.legalBusinessName ?? "Your Business";
  const applicantName = `${app.quickApp?.firstName ?? ""} ${app.quickApp?.lastName ?? ""}`.trim() || "Applicant";
  const deepLinkUrl = `${process.env["NEXT_PUBLIC_APP_URL"] ?? "https://trinityfinance.com"}/apply/vault?app=${app.id}`;
  const docDisplayName = DOC_DISPLAY_NAMES[doc.docType] ?? doc.docType;

  const ctx = { applicantName, businessName, docType: doc.docType, docDisplayName, applicationId: app.id, deepLinkUrl };

  const resend = new Resend(process.env["RESEND_API_KEY"]);
  const twilioClient = twilio(process.env["TWILIO_ACCOUNT_SID"], process.env["TWILIO_AUTH_TOKEN"]);

  const followUpType = data.followUpType ?? "immediate";

  if (followUpType === "immediate") {
    if (data.status === "RED") {
      // Email
      await resend.emails.send({
        from: "Trinity Finance <noreply@trinityfinance.com>",
        to: applicant.email,
        subject: redDocEmailSubject(ctx),
        html: redDocEmailHtml(ctx),
      });

      // SMS
      if (applicant.phone) {
        await twilioClient.messages.create({
          body: redDocSms(ctx),
          from: process.env["TWILIO_PHONE_NUMBER"],
          to: applicant.phone,
        });
      }
    } else if (data.status === "YELLOW") {
      await resend.emails.send({
        from: "Trinity Finance <noreply@trinityfinance.com>",
        to: applicant.email,
        subject: yellowDocEmailSubject(ctx),
        html: yellowDocEmailHtml(ctx, data.clarificationNote ?? "Please provide additional information about this document."),
      });
    }

    // Schedule T+24h reminder
    const followUpQueue = new Queue("follow-up", { connection });
    await followUpQueue.add(
      "reminder-follow-up",
      { ...data, followUpType: "reminder" },
      { delay: 24 * 60 * 60 * 1000, removeOnComplete: 50, attempts: 3 }
    );
  }

  if (followUpType === "reminder") {
    if (doc.stoplightStatus !== "GREEN") {
      await resend.emails.send({
        from: "Trinity Finance <noreply@trinityfinance.com>",
        to: applicant.email,
        subject: reminderEmailSubject(ctx),
        html: reminderEmailHtml(ctx),
      });

      if (applicant.phone) {
        await twilioClient.messages.create({
          body: reminderSms(ctx),
          from: process.env["TWILIO_PHONE_NUMBER"],
          to: applicant.phone,
        });
      }

      // Schedule T+72h escalation
      const followUpQueue = new Queue("follow-up", { connection });
      await followUpQueue.add(
        "escalation-follow-up",
        { ...data, followUpType: "escalation" },
        { delay: 48 * 60 * 60 * 1000, removeOnComplete: 50, attempts: 3 } // Additional 48h = 72h total
      );
    }
  }

  if (followUpType === "escalation") {
    if (doc.stoplightStatus !== "GREEN") {
      // Notify assigned referral agent
      const agentUser = app.referralAgentId
        ? await prisma.user.findUnique({ where: { id: app.referralAgentId } })
        : null;

      if (agentUser?.email) {
        await resend.emails.send({
          from: "Trinity Finance <noreply@trinityfinance.com>",
          to: agentUser.email,
          subject: escalationEmailSubject(ctx),
          html: escalationEmailHtml({ ...ctx, agentName: `${agentUser.firstName ?? "Agent"}` }),
        });
      }

      // Also notify applicant again
      if (applicant.phone) {
        await twilioClient.messages.create({
          body: `Trinity Finance: Urgent - your ${docDisplayName} is still needed for ${businessName}. Please upload ASAP: ${deepLinkUrl}`,
          from: process.env["TWILIO_PHONE_NUMBER"],
          to: applicant.phone,
        });
      }

      // Schedule T+7d stalled
      const followUpQueue = new Queue("follow-up", { connection });
      await followUpQueue.add(
        "stalled-follow-up",
        { ...data, followUpType: "stalled" },
        { delay: 4 * 24 * 60 * 60 * 1000, removeOnComplete: 50 } // Additional 4 days = 7 total
      );
    }
  }

  if (followUpType === "stalled") {
    if (doc.stoplightStatus !== "GREEN") {
      // Mark application as STALLED
      await prisma.application.update({
        where: { id: app.id },
        data: { status: "STALLED" },
      });

      // Notify ops team
      await resend.emails.send({
        from: "Trinity Finance <noreply@trinityfinance.com>",
        to: process.env["OPS_EMAIL"] ?? "ops@trinityfinance.com",
        subject: `APPLICATION STALLED: ${businessName} (${app.id})`,
        html: `<p>Application ${app.id} for ${businessName} has been marked STALLED. Document ${docDisplayName} not uploaded after 7 days of follow-ups.</p>`,
      });
    }
  }

  // Update followUpHistory on DocumentRequest
  await prisma.documentRequest.updateMany({
    where: { applicationId: app.id, docType: doc.docType, deletedAt: null },
    data: {
      followUpCount: { increment: 1 },
      lastFollowUpAt: new Date(),
    },
  });
}
