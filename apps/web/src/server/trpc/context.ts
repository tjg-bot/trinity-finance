import { auth } from "@clerk/nextjs/server";
import { prisma } from "@trinity/db";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export async function createContext(_opts: FetchCreateContextFnOptions) {
  let clerkId: string | null = null;
  let orgId: string | null = null;

  if (clerkConfigured) {
    try {
      const session = await auth();
      clerkId = session.userId ?? null;
      orgId = session.orgId ?? null;
    } catch {
      // Clerk not available — public procedures will still work
    }
  }

  let dbUser = null;
  if (clerkId) {
    try {
      dbUser = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });
    } catch {
      // DB not connected — authed procedures will reject, public ones proceed
    }
  }

  return {
    prisma,
    clerkId,
    clerkOrgId: orgId,
    dbUser,
    req: _opts.req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
