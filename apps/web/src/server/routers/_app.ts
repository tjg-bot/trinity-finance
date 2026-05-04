import { router } from "../trpc/trpc";
import { applicationRouter } from "./application";
import { documentRouter } from "./document";
import { matchingRouter } from "./matching";
import { intakeRouter } from "./intake";
import { signatureRouter } from "./signature";
import { userRouter } from "./user";

export const appRouter = router({
  application: applicationRouter,
  document: documentRouter,
  matching: matchingRouter,
  intake: intakeRouter,
  signature: signatureRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
