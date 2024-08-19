import createClient from "openapi-fetch";
import { z } from "zod";

import { env } from "~/env";
import { getApiToken } from "~/lib/apiToken";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type paths } from "~/types/maos-core-scheme";

export const agentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().optional() }))
    .query(async ({ input }) => {
      const pageNum = input.page ?? 1;
      const apiToken = await getApiToken();
      const client = createClient<paths>({
        baseUrl: env.MAOS_CORE_URL,
      });

      const { data, error, response } = await client.GET("/v1/admin/agents", {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        params: { query: { page: pageNum } },
      });
      if (error) {
        console.error("failed to list agents", error, response);
        throw new Error(`Failed to list agent: ${error.error}, ${response.statusText}`);
      }

      return { data: data.data, totalPages: data.meta.total_pages };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const apiToken = await getApiToken();
      const client = createClient<paths>({
        baseUrl: env.MAOS_CORE_URL,
      });

      const { data, error, response } = await client.POST("/v1/admin/agents", {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: {
          name: input.name,
        },
      });
      if (error) {
        console.error("failed to create agents", error, response);
        throw new Error(`Failed to create agent: ${error.error}, ${response.statusText}`);
      }

      return data.id;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ input }) => {
      const apiToken = await getApiToken();
      const client = createClient<paths>({
        baseUrl: env.MAOS_CORE_URL,
      });

      const { error, response } = await client.PATCH(`/v1/admin/agents/{id}`, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: {
          name: input.name,
        },
        params: { path: { id: input.id } },
      });
      if (error) {
        console.error("failed to update agents", error, response);
        throw new Error(`Failed to update agent: ${error.error}, ${response.statusText}`);
      }

      return true;
    }),

  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const apiToken = await getApiToken();
    const client = createClient<paths>({
      baseUrl: env.MAOS_CORE_URL,
    });

    const { error, response } = await client.DELETE(`/v1/admin/agents/{id}`, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      params: { path: { id: input.id } },
    });
    if (error) {
      console.error("failed to remove agents", error, response);
      if (response.status === 404) {
        throw new Error(`Agent not found`);
      }
      if (response.status === 409) {
        throw new Error(`Agent is referenced by configs`);
      }
      throw new Error(`Failed to remove agent: ${error.error}, ${response.statusText}`);
    }

    return true;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
