import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@trinity/db";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export async function createContext(_opts: FetchCreateContextFnOptions) {
  const { userId: clerkId, orgId } = await auth();

  let dbUser = null;
  if (clerkId) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });
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
