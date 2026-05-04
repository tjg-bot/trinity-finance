/**
 * Agentic intake router - 10-question Claude Haiku conversation.
 */
import { z } from "zod";
import { router, publicProcedure } from "../trpc/trpc";
import { runAgenticIntake } from "@trinity/ai";

export const intakeRouter = router({
  /**
   * Send a message to the agentic intake AI.
   * Maintains conversation history on the client side.
   */
  chat: publicProcedure
    .input(
      z.object({
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await runAgenticIntake(input.history, input.message);
      return result;
    }),
});
