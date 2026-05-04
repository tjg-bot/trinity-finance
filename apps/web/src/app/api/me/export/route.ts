/**
 * GDPR/CCPA data export endpoint.
 */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@trinity/db";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { applicantUserId: user.id, deletedAt: null },
    include: {
      quickApp: true,
      owners: { where: { deletedAt: null }, select: { id: true, fullName: true, title: true } },
      documents: {
        where: { deletedAt: null },
        select: { id: true, docType: true, stoplightStatus: true, createdAt: true },
      },
    },
  });

  await auditLog({
    actorUserId: user.id,
    action: AuditActions.USER_EXPORT,
    entity: "User",
    entityId: user.id,
  });

  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    },
    applications,
    exportedAt: new Date().toISOString(),
    note: "SSN, driver's license numbers, and signature images are not included in this export for your security.",
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="trinity-finance-data-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
