import createClient from "openapi-fetch";
import { z } from "zod";

import { env } from "~/env";
import { getApiToken } from "~/lib/apiToken";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type paths } from "~/types/maos-core-scheme";

const createApiClient = () => createClient<paths>({ baseUrl: env.MAOS_CORE_URL });

const getAuthHeaders = async () => {
  const apiToken = await getApiToken();
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  };
};

const handleApiError = (
  operation: string,
  error: { error: string } | undefined,
  response: Response,
) => {
  console.error(`Failed to ${operation}`, error, response);
  return { error: `Failed to ${operation}: ${error?.error}, ${response.statusText}`, data: null };
};

export const deploymentRouter = createTRPCRouter({
  list: protectedProcedure.input(z.object({})).query(async ({}) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/deployments", {
      headers,
      params: { query: { page: 1, page_size: 50 } },
    });
    if (error) return handleApiError("list deployments", error, response);
    return { data: data.data };
  }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/deployments/{id}", {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) return handleApiError("get deployment", error, response);
    return { data };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.POST("/v1/admin/deployments", {
        headers,
        body: {
          ...input,
          user: ctx.session.user.email!,
        },
      });
      if (error) return handleApiError("create deployment", error, response);
      return { data: data.data };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.PATCH("/v1/admin/deployments/{id}", {
        headers,
        params: { path: { id: input.id } },
        body: { name: input.name },
      });
      if (error) return handleApiError("update deployment", error, response);
      return { data: data.data };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.DELETE("/v1/admin/deployments/{id}", {
        headers,
        params: { path: { id: input.id } },
      });
      if (error) return handleApiError("remove deployment", error, response);
      return true;
    }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        id: z.bigint(),
        configId: z.bigint(),
        minAgentVersion: z.string().optional(),
        content: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.PATCH("/v1/admin/configs/{id}", {
        headers,
        params: { path: { id: Number(input.configId) } },
        body: {
          user: ctx.session.user.email!,
          min_agent_version: input.minAgentVersion,
          content: input.content,
        },
      });
      if (error) return handleApiError("update config", error, response);
      return { data: data.data };
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.POST("/v1/admin/deployments/{id}/publish", {
        headers,
        params: { path: { id: input.id } },
        body: { user: ctx.session.user.email! },
      });
      if (error) return handleApiError("publish deployment", error, response);
      return { data: { result: "ok" } };
    }),
});
