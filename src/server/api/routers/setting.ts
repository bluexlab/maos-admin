import { sql } from "drizzle-orm";
import { z } from "zod";
import { settings } from "~/drizzle/schema";
import { encryptApiToken } from "~/lib/apiToken";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const settingRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({}) => {
    return {};
  }),

  update: protectedProcedure
    .input(z.object({ apiToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const encrypted = await encryptApiToken(input.apiToken);

      await ctx.db
        .insert(settings)
        .values({ key: "api-token", value: encrypted })
        .onConflictDoUpdate({
          target: [settings.key],
          set: { value: encrypted, updatedAt: sql`NOW()` },
        });
    }),
});
