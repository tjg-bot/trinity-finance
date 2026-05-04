import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Authenticated procedure - requires valid Clerk session.
 */
export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clerkId || !ctx.dbUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      dbUser: ctx.dbUser,
      clerkId: ctx.clerkId,
    },
  });
});

/**
 * Admin-only procedure.
 */
export const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
  if (ctx.dbUser.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Bank user procedure.
 */
export const bankProcedure = authedProcedure.use(async ({ ctx, next }) => {
  if (ctx.dbUser.role !== "BANK_USER" && ctx.dbUser.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Bank access required" });
  }
  return next({ ctx });
});

/**
 * Assert a user can access a given application.
 * Enforces role-based data scoping for the partner hierarchy.
 */
export async function assertCanAccessApplication(
  ctx: Context & { dbUser: NonNullable<Context["dbUser"]> },
  applicationId: string
): Promise<void> {
  const role = ctx.dbUser.role;

  if (role === "ADMIN") return; // Full access

  if (role === "APPLICANT") {
    const app = await ctx.prisma.application.findFirst({
      where: { id: applicationId, applicantUserId: ctx.dbUser.id, deletedAt: null },
    });
    if (!app) throw new TRPCError({ code: "FORBIDDEN" });
    return;
  }

  if (role === "AGENT") {
    const app = await ctx.prisma.application.findFirst({
      where: { id: applicationId, referralAgentId: ctx.dbUser.id, deletedAt: null },
    });
    if (!app) throw new TRPCError({ code: "FORBIDDEN" });
    return;
  }

  if (role === "MANAGER") {
    // Manager sees agents within their bucket
    const membership = ctx.dbUser.memberships[0];
    if (!membership?.bucketId) throw new TRPCError({ code: "FORBIDDEN" });

    const agentsInBucket = await ctx.prisma.orgMembership.findMany({
      where: { bucketId: membership.bucketId, tier: "AGENT", deletedAt: null },
      select: { userId: true },
    });
    const agentIds = agentsInBucket.map((m) => m.userId);

    const app = await ctx.prisma.application.findFirst({
      where: {
        id: applicationId,
        referralAgentId: { in: agentIds },
        deletedAt: null,
      },
    });
    if (!app) throw new TRPCError({ code: "FORBIDDEN" });
    return;
  }

  if (role === "OWNER") {
    // Owner sees entire org pipeline
    const membership = ctx.dbUser.memberships[0];
    if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

    const orgMembers = await ctx.prisma.orgMembership.findMany({
      where: { organizationId: membership.organizationId, deletedAt: null },
      select: { userId: true },
    });
    const memberIds = orgMembers.map((m) => m.userId);

    const app = await ctx.prisma.application.findFirst({
      where: {
        id: applicationId,
        referralAgentId: { in: memberIds },
        deletedAt: null,
      },
    });
    if (!app) throw new TRPCError({ code: "FORBIDDEN" });
    return;
  }

  throw new TRPCError({ code: "FORBIDDEN" });
}
