import { count, sql } from "drizzle-orm";
import { z } from "zod";

import { accounts, invitingUsers, users } from "~/drizzle/schema";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  listPaginated: protectedProcedure
    .input(z.object({ page: z.number().optional(), pageSize: z.number().optional().default(10) }))
    .query(async ({ ctx, input }) => {
      const pageNum = input.page ?? 1;
      const offset = (pageNum - 1) * input.pageSize;
      const [data, [total]] = await Promise.all([
        ctx.db.select().from(users).offset(offset).limit(input.pageSize),
        ctx.db.select({ total: count() }).from(users),
      ]);

      return { data, total: total?.total ?? 0 };
    }),

  list: protectedProcedure
    .input(z.object({ page: z.number().optional(), pageSize: z.number().optional().default(10) }))
    .query(async ({ ctx }) => {
      const data = await ctx.db.select().from(users).orderBy(users.email);
      return { data };
    }),

  invite: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const newUser = await ctx.db.insert(invitingUsers).values({
        email: input.email,
      });

      return newUser;
    }),

  remove: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.execute(sql`
        WITH deleted_user AS (
          DELETE FROM ${users}
          WHERE email = ${input.email}
          RETURNING id
        ),
        deleted_account AS (
          DELETE FROM ${accounts}
          WHERE user_id IN (SELECT id FROM deleted_user)
        ),
        deleted_inviting_user AS (
          DELETE FROM ${invitingUsers}
          WHERE email = ${input.email}
        )
        SELECT 1
      `);

      return true;
    }),
});
