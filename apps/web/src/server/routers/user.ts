/**
 * User router - GDPR/CCPA export, delete request, profile.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../trpc/trpc";
import { decrypt } from "@trinity/db/src/encryption";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

export const userRouter = router({
  /**
   * Get current user profile.
   */
  me: authedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.dbUser.id,
      email: ctx.dbUser.email,
      phone: ctx.dbUser.phone,
      role: ctx.dbUser.role,
      firstName: ctx.dbUser.firstName,
      lastName: ctx.dbUser.lastName,
      memberships: ctx.dbUser.memberships.map((m) => ({
        organizationName: m.organization.name,
        tier: m.tier,
        bucketId: m.bucketId,
      })),
    };
  }),

  /**
   * GDPR/CCPA: Export all user data as JSON.
   */
  export: authedProcedure.query(async ({ ctx }) => {
    const userId = ctx.dbUser.id;

    const [user, applications, signatures] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: { include: { organization: true } },
        },
      }),
      ctx.prisma.application.findMany({
        where: { applicantUserId: userId, deletedAt: null },
        include: {
          quickApp: true,
          owners: { where: { deletedAt: null } },
          documents: { where: { deletedAt: null } },
        },
      }),
      ctx.prisma.signature.findMany({
        where: { signerUserId: userId, deletedAt: null },
      }),
    ]);

    await auditLog({
      actorUserId: userId,
      action: AuditActions.USER_EXPORT,
      entity: "User",
      entityId: userId,
    });

    // Decrypt PII fields for export
    const decryptedApplications = applications.map((app) => ({
      ...app,
      owners: app.owners.map((owner) => ({
        ...owner,
        // Only export to the owner themselves
        dateOfBirth: owner.ssn ? decrypt(owner.dateOfBirth) : undefined,
        ssn: undefined, // SSN never exported, even to self
        dlNumber: undefined, // DL never exported
      })),
    }));

    return {
      user,
      applications: decryptedApplications,
      signatureCount: signatures.length,
      exportedAt: new Date().toISOString(),
    };
  }),

  /**
   * GDPR/CCPA: Request deletion (30-day soft-delete grace period).
   */
  requestDeletion: authedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.dbUser.id;

    // Check for active funded loans - cannot delete during servicing
    const activeFunding = await ctx.prisma.funding.findFirst({
      where: {
        application: {
          applicantUserId: userId,
          status: "SERVICING",
          deletedAt: null,
        },
      },
    });

    if (activeFunding) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "Account cannot be deleted while a loan is in servicing. Please contact support.",
      });
    }

    // Schedule deletion in 30 days
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await ctx.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: deletionDate },
    });

    await auditLog({
      actorUserId: userId,
      action: AuditActions.USER_DELETE_REQUEST,
      entity: "User",
      entityId: userId,
      after: { scheduledDeletion: deletionDate.toISOString() },
    });

    return {
      message: "Your account is scheduled for deletion in 30 days. Contact support to cancel.",
      scheduledDeletion: deletionDate.toISOString(),
    };
  }),
});
