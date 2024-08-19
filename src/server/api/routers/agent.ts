import createClient from "openapi-fetch";
import { z } from "zod";
import { Result, err, ok } from "neverthrow";

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
  return err(new Error(`Failed to ${operation}: ${error?.error}, ${response.statusText}`));
};

export const agentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().optional() }))
    .query(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.GET("/v1/admin/agents", {
        headers,
        params: { query: { page: input.page ?? 1 } },
      });
      if (error) return handleApiError("list agents", error, response);
      return ok({ data: data.data, totalPages: data.meta.total_pages });
    }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET(`/v1/admin/agents/{id}`, {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) return handleApiError("get agent", error, response);
    return ok(data.data);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.POST("/v1/admin/agents", {
        headers,
        body: { name: input.name },
      });
      if (error) return handleApiError("create agent", error, response);
      return ok(data.id);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.PATCH(`/v1/admin/agents/{id}`, {
        headers,
        body: { name: input.name },
        params: { path: { id: input.id } },
      });
      if (error) return handleApiError("update agent", error, response);
      return ok(true);
    }),

  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { error, response } = await client.DELETE(`/v1/admin/agents/{id}`, {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) {
      if (response.status === 404) throw new Error("Agent not found");
      if (response.status === 409) throw new Error("Agent is referenced by configs");
      handleApiError("remove agent", error, response);
    }
    return true;
  }),

  getConfig: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();

    const { data, error, response } = await client.GET(`/v1/admin/agents/{id}/config`, {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) {
      if (response.status === 404) {
        const { data, error, response } = await client.GET(`/v1/admin/agents/{id}`, {
          headers,
          params: { path: { id: input.id } },
        });
        if (error) return handleApiError("get agent config", error, response);
        return ok({
          agent_id: data.data.id,
          agent_name: data.data.name,
          content: {},
        });
      }
      return handleApiError("get agent config", error, response);
    }
    return ok(data.data);
  }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.record(z.string()),
        minAgentVersion: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.POST(`/v1/admin/agents/{id}/config`, {
        headers,
        body: {
          content: input.content,
          user: ctx.session.user.email!,
          min_agent_version: input.minAgentVersion ? input.minAgentVersion : undefined,
        },
        params: { path: { id: input.id } },
      });
      if (error) return handleApiError("update agent config", error, response);
      return ok(true);
    }),
});
