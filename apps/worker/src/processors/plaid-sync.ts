/**
 * Phase 3 - Plaid sync processor.
 * Pulls daily balances, detects evergreen triggers.
 * (Scaffold - activate when Plaid credentials configured)
 */
import type { Job } from "bullmq";
import { prisma } from "@trinity/db";
import { decrypt } from "@trinity/db/src/encryption";

interface PlaidSyncJobData {
  applicationId: string;
  plaidConnectionId: string;
}

export async function plaidSyncProcessor(job: Job<PlaidSyncJobData>): Promise<void> {
  const { applicationId, plaidConnectionId } = job.data;

  const connection = await prisma.plaidConnection.findUnique({
    where: { id: plaidConnectionId, deletedAt: null },
    include: {
      application: {
        include: { funding: true },
      },
    },
  });

  if (!connection || !connection.isActive) return;

  // Decrypt Plaid access token
  const accessToken = decrypt(connection.accessToken);

  // In production: call Plaid API to get transactions and balances
  // const plaidClient = new PlaidApi(...);
  // const response = await plaidClient.transactionsSync({ access_token: accessToken });

  // Update last sync timestamp
  await prisma.plaidConnection.update({
    where: { id: plaidConnectionId },
    data: { lastSyncAt: new Date() },
  });

  // Evergreen trigger check (simplified)
  // In production: compute rolling 90-day revenue average from transactions
  const mockRevenue90Day = 100000; // placeholder
  const prevRevenue90Day = 80000; // placeholder - would come from prior sync

  const revenueGrowth = (mockRevenue90Day - prevRevenue90Day) / prevRevenue90Day;

  if (revenueGrowth >= 0.2) {
    // 20%+ growth - trigger refinance alert
    await prisma.servicingEvent.create({
      data: {
        applicationId,
        eventType: "EVERGREEN_TRIGGER",
        payload: {
          trigger: "REVENUE_GROWTH",
          growthPercent: Math.round(revenueGrowth * 100),
          message: `Revenue up ${Math.round(revenueGrowth * 100)}% over 90 days - eligible for refinance/expansion`,
        },
      },
    });
  }

  // Check if loan paid down 50%+
  if (connection.application.funding) {
    const originalAmount = connection.application.funding.amount;
    // In production: compute remaining balance from payment history
    const estimatedBalance = originalAmount * 0.45; // placeholder

    if (estimatedBalance / originalAmount <= 0.5) {
      await prisma.servicingEvent.create({
        data: {
          applicationId,
          eventType: "REFINANCE_TRIGGER",
          payload: {
            trigger: "LOAN_PAID_DOWN_50",
            remainingBalance: estimatedBalance,
            originalAmount,
            message: "Loan paid down 50%+ - eligible for step-up loan",
          },
        },
      });
    }
  }

  void accessToken; // will be used in full implementation
}
