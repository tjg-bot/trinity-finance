/**
 * Application router - handles create, update, resume, and status queries.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure, publicProcedure, assertCanAccessApplication } from "../trpc/trpc";
import { auditLog, AuditActions } from "@trinity/db/src/audit";
import { randomBytes } from "crypto";

export const applicationRouter = router({
  /**
   * Create or resume a draft application.
   * Called at the start of /apply - creates account from email/phone capture.
   */
  createDraft: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        phone: z.string(),
        referralCode: z.string().optional(),
        loanType: z.enum([
          "EQUIPMENT_FINANCING",
          "INVOICE_FACTORING",
          "INVOICE_FINANCING",
          "LINE_OF_CREDIT",
          "MCA",
          "SBA",
          "UNSURE",
          "DEBT_RELIEF",
        ]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find or create user (no login required to start)
      let user = await ctx.prisma.user.findFirst({
        where: { email: input.email, deletedAt: null },
      });

      if (!user) {
        // Create a stub user - Clerk account will be linked later
        user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            phone: input.phone,
            role: "APPLICANT",
            clerkId: `pending_${randomBytes(16).toString("hex")}`,
          },
        });
      }

      // Find referral agent
      let referralAgentId: string | undefined;
      if (input.referralCode) {
        const agent = await ctx.prisma.user.findFirst({
          where: {
            role: { in: ["AGENT", "MANAGER", "OWNER"] },
            // In production, referral codes would be stored on the user/org
          },
        });
        referralAgentId = agent?.id;
      }

      // Generate resume token
      const resumeToken = randomBytes(32).toString("hex");

      const application = await ctx.prisma.application.create({
        data: {
          loanType: input.loanType ?? "UNSURE",
          status: "DRAFT",
          applicantUserId: user.id,
          referralAgentId,
          referralCode: input.referralCode,
          resumeToken,
        },
      });

      await auditLog({
        actorUserId: user.id,
        action: AuditActions.FORM_SAVE,
        entity: "Application",
        entityId: application.id,
        applicationId: application.id,
        after: { status: "DRAFT", loanType: input.loanType },
      });

      return { applicationId: application.id, resumeToken };
    }),

  /**
   * Get application by resume token (for magic link resume).
   */
  getByResumeToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const app = await ctx.prisma.application.findUnique({
        where: { resumeToken: input.token },
        include: {
          quickApp: true,
          owners: { where: { deletedAt: null } },
          documentRequests: {
            where: { deletedAt: null },
            include: { document: true },
          },
        },
      });

      if (!app || app.deletedAt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      return app;
    }),

  /**
   * Save Quick Application (Section 1) data.
   */
  saveQuickApp: authedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        data: z.record(z.string(), z.unknown()),
        loanType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const app = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        include: { quickApp: true },
      });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });

      const quickAppData = input.data as Record<string, string | boolean | null>;

      if (app.quickApp) {
        await ctx.prisma.quickApp.update({
          where: { applicationId: input.applicationId },
          data: quickAppData as Parameters<typeof ctx.prisma.quickApp.update>[0]["data"],
        });
      } else {
        await ctx.prisma.quickApp.create({
          data: {
            applicationId: input.applicationId,
            ...(quickAppData as Parameters<typeof ctx.prisma.quickApp.create>[0]["data"]),
          } as Parameters<typeof ctx.prisma.quickApp.create>[0]["data"],
        });
      }

      // Update routing
      await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: {
          loanType: input.loanType as Parameters<typeof ctx.prisma.application.update>[0]["data"]["loanType"],
          status: "IN_REVIEW",
        },
      });

      await auditLog({
        actorUserId: ctx.dbUser.id,
        action: AuditActions.FORM_SAVE,
        entity: "Application",
        entityId: input.applicationId,
        applicationId: input.applicationId,
        after: { section: "quickApp", loanType: input.loanType },
      });

      return { success: true };
    }),

  /**
   * Get application summary for dashboard display.
   */
  getSummary: authedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const app = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId, deletedAt: null },
        include: {
          quickApp: true,
          documents: {
            where: { deletedAt: null },
            select: {
              id: true,
              docType: true,
              stoplightStatus: true,
              originalFilename: true,
              createdAt: true,
            },
          },
          documentRequests: {
            where: { deletedAt: null },
          },
          matches: {
            where: { deletedAt: null },
            orderBy: { score: "desc" },
            take: 5,
          },
          offers: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          funding: true,
        },
      });

      if (!app) throw new TRPCError({ code: "NOT_FOUND" });

      return app;
    }),

  /**
   * List applications for the authenticated user's portal.
   */
  list: authedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const role = ctx.dbUser.role;
      let where: Record<string, unknown> = { deletedAt: null };

      if (role === "APPLICANT") {
        where = { ...where, applicantUserId: ctx.dbUser.id };
      } else if (role === "AGENT") {
        where = { ...where, referralAgentId: ctx.dbUser.id };
      } else if (role === "MANAGER") {
        const membership = ctx.dbUser.memberships[0];
        if (membership?.bucketId) {
          const agentIds = (
            await ctx.prisma.orgMembership.findMany({
              where: { bucketId: membership.bucketId, tier: "AGENT", deletedAt: null },
              select: { userId: true },
            })
          ).map((m) => m.userId);
          where = { ...where, referralAgentId: { in: agentIds } };
        }
      } else if (role === "OWNER") {
        const membership = ctx.dbUser.memberships[0];
        if (membership) {
          const memberIds = (
            await ctx.prisma.orgMembership.findMany({
              where: { organizationId: membership.organizationId, deletedAt: null },
              select: { userId: true },
            })
          ).map((m) => m.userId);
          where = { ...where, referralAgentId: { in: memberIds } };
        }
      }
      // ADMIN + BANK_USER: additional filtering handled by their specific routers

      if (input.status) {
        where = { ...where, status: input.status };
      }

      const apps = await ctx.prisma.application.findMany({
        where: where as Parameters<typeof ctx.prisma.application.findMany>[0]["where"],
        include: {
          quickApp: {
            select: {
              legalBusinessName: true,
              desiredFundingAmount: true,
              ficoScore: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = apps.length > input.limit;
      const items = hasMore ? apps.slice(0, -1) : apps;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor };
    }),

  /**
   * Admin override - status change with audit.
   */
  adminSetStatus: authedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        status: z.enum([
          "DRAFT", "IN_REVIEW", "DOCS_PENDING", "UNDERWRITING",
          "MATCHED", "OFFER_SELECTED", "FUNDED", "DECLINED", "SERVICING", "STALLED",
        ]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const app = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
      });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: { status: input.status },
      });

      await auditLog({
        actorUserId: ctx.dbUser.id,
        action: AuditActions.ADMIN_OVERRIDE,
        entity: "Application",
        entityId: input.applicationId,
        applicationId: input.applicationId,
        before: { status: app.status },
        after: { status: input.status, reason: input.reason },
      });

      return { success: true };
    }),
});
