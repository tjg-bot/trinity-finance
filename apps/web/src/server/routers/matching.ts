/**
 * Bank matching and offer router.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure, bankProcedure, assertCanAccessApplication } from "../trpc/trpc";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

export const matchingRouter = router({
  /**
   * Get top matches for an application.
   */
  getMatches: authedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const matches = await ctx.prisma.match.findMany({
        where: { applicationId: input.applicationId, deletedAt: null },
        include: {
          organization: { select: { name: true } },
          bankRule: { select: { name: true } },
          offer: true,
        },
        orderBy: { score: "desc" },
        take: 5,
      });

      // Anonymize bank names if requested
      return matches.map((m) => ({
        ...m,
        organizationName: m.isAnonymized
          ? `Lender ${String.fromCharCode(65 + matches.indexOf(m))}`
          : m.organization.name,
      }));
    }),

  /**
   * Select an offer.
   */
  selectOffer: authedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        offerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const offer = await ctx.prisma.offer.findFirst({
        where: {
          id: input.offerId,
          applicationId: input.applicationId,
          deletedAt: null,
        },
      });
      if (!offer) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.$transaction([
        ctx.prisma.offer.update({
          where: { id: input.offerId },
          data: { selectedAt: new Date() },
        }),
        ctx.prisma.application.update({
          where: { id: input.applicationId },
          data: { status: "OFFER_SELECTED" },
        }),
      ]);

      await auditLog({
        actorUserId: ctx.dbUser.id,
        action: AuditActions.OFFER_SELECTED,
        entity: "Offer",
        entityId: input.offerId,
        applicationId: input.applicationId,
        after: { offerId: input.offerId },
      });

      // Enqueue lender PDF generation job
      await enqueuePdfJob(input.applicationId, input.offerId);

      return { success: true };
    }),

  /**
   * Bank: update underwriting rules.
   */
  updateBankRule: bankProcedure
    .input(
      z.object({
        ruleId: z.string().optional(),
        name: z.string(),
        criteria: z.record(z.unknown()),
        offerTemplates: z.array(z.record(z.unknown())),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const membership = ctx.dbUser.memberships[0];
      if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

      const orgId = membership.organizationId;

      if (input.ruleId) {
        const existing = await ctx.prisma.bankRule.findFirst({
          where: { id: input.ruleId, organizationId: orgId, deletedAt: null },
        });
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        await ctx.prisma.bankRule.update({
          where: { id: input.ruleId },
          data: {
            name: input.name,
            criteria: input.criteria,
            offerTemplates: input.offerTemplates,
          },
        });
      } else {
        await ctx.prisma.bankRule.create({
          data: {
            organizationId: orgId,
            name: input.name,
            criteria: input.criteria,
            offerTemplates: input.offerTemplates,
          },
        });
      }

      return { success: true };
    }),

  /**
   * Bank: get incoming perfect files.
   */
  getBankPipeline: bankProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const membership = ctx.dbUser.memberships[0];
      if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

      const matches = await ctx.prisma.match.findMany({
        where: {
          organizationId: membership.organizationId,
          deletedAt: null,
          ...(input.status ? { status: input.status as "PROPOSED" | "OFFERED" | "SELECTED" | "DECLINED" } : {}),
        },
        include: {
          application: {
            include: {
              quickApp: {
                select: {
                  legalBusinessName: true,
                  desiredFundingAmount: true,
                  ficoScore: true,
                  annualRevenue: true,
                  loanTypeSelection: true,
                },
              },
              documents: {
                where: { stoplightStatus: "GREEN", deletedAt: null },
                select: { docType: true },
              },
            },
          },
          offer: true,
        },
        orderBy: { score: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = matches.length > input.limit;
      const items = hasMore ? matches.slice(0, -1) : matches;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor };
    }),
});

async function enqueuePdfJob(applicationId: string, offerId: string): Promise<void> {
  const { Queue } = await import("bullmq");
  const { getRedisConnection } = await import("@/lib/redis");

  const queue = new Queue("pdf-generation", { connection: getRedisConnection() });
  await queue.add(
    "generate-lender-pdf",
    { applicationId, offerId },
    { removeOnComplete: 50, removeOnFail: 100, attempts: 3 }
  );
}
