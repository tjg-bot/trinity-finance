/**
 * Plaid webhook - handle item updates and transaction alerts.
 */
import { prisma } from "@trinity/db";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json() as {
    webhook_type: string;
    webhook_code: string;
    item_id: string;
    error?: Record<string, unknown>;
  };

  // Store for replay/debug
  await prisma.webhookEvent.create({
    data: {
      source: "plaid",
      eventType: `${payload.webhook_type}.${payload.webhook_code}`,
      payload: payload as Record<string, unknown>,
    },
  });

  const { webhook_type, webhook_code, item_id } = payload;

  const connection = await prisma.plaidConnection.findFirst({
    where: { itemId: item_id, deletedAt: null },
    include: { application: true },
  });

  if (!connection) {
    return new Response("Item not found", { status: 200 });
  }

  if (webhook_type === "ITEM" && webhook_code === "ERROR") {
    await prisma.plaidConnection.update({
      where: { id: connection.id },
      data: { isActive: false },
    });

    // Create servicing event for deactivation
    await prisma.servicingEvent.create({
      data: {
        applicationId: connection.applicationId,
        eventType: "DELINQUENCY_ALERT",
        payload: { reason: "Plaid connection error", error: payload.error },
      },
    });
  }

  if (webhook_type === "TRANSACTIONS" && webhook_code === "SYNC_UPDATES_AVAILABLE") {
    // Enqueue a Plaid sync job
    await prisma.plaidConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: null }, // Will be set after sync completes
    });
  }

  return new Response("OK", { status: 200 });
}
