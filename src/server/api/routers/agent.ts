import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

let post = {
  id: 1,
  name: "Hello World",
};

export const agentRouter = createTRPCRouter({
  list: protectedProcedure.input(z.object({ page: z.number().optional() })).query(({ input }) => {
    const pageNum = input.page ?? 1;
    return {
      agents: [],
    };
  }),

  create: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ input }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    post = { id: post.id + 1, name: input.name };
    return post;
  }),

  getLatest: protectedProcedure.query(() => {
    return post;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
