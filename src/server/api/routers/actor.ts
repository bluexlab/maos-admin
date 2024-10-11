import { err, ok } from "neverthrow";
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
  return err(new Error(`Failed to ${operation}: ${error?.error}, ${response.statusText}`));
};

export const actorRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().optional() }))
    .query(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.GET("/v1/admin/actors", {
        headers,
        params: { query: { page: input.page ?? 1 } },
      });
      if (error) return handleApiError("list actors", error, response);
      return ok({ data: data.data, totalPages: data.meta.total_pages });
    }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET(`/v1/admin/actors/{id}`, {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) return handleApiError("get actor", error, response);
    return ok(data.data);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        role: z.enum(["agent", "portal", "service", "user", "other"]),
        deployable: z.boolean().optional(),
        configurable: z.boolean().optional(),
        migratable: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.POST("/v1/admin/actors", {
        headers,
        body: {
          name: input.name,
          role: input.role,
          deployable: input.deployable,
          configurable: input.configurable,
          migratable: input.migratable,
        },
      });
      if (error) return handleApiError("create actor", error, response);
      return ok(data.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.enum(["agent", "portal", "service", "user", "other"]).optional(),
        deployable: z.boolean().optional(),
        configurable: z.boolean().optional(),
        migratable: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.PATCH(`/v1/admin/actors/{id}`, {
        headers,
        body: {
          name: input.name,
          role: input.role,
          deployable: input.deployable,
          configurable: input.configurable,
          migratable: input.migratable,
        },
        params: { path: { id: input.id } },
      });
      if (error) return handleApiError("update actor", error, response);
      return ok(true);
    }),

  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { error, response } = await client.DELETE(`/v1/admin/actors/{id}`, {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) {
      if (response.status === 404) throw new Error("Actor not found");
      if (response.status === 409) throw new Error("Actor is referenced by configs");
      handleApiError("remove actor", error, response);
    }
    return true;
  }),

  getTokens: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/api_tokens", {
      headers,
      params: { query: { actor_id: input.id, page: 0, page_size: 1000 } },
    });
    if (error) return handleApiError("get tokens", error, response);
    return ok(data.data);
  }),

  createToken: protectedProcedure
    .input(
      z.object({
        actorId: z.number(),
        expire_at: z.number(),
        permissions: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.POST("/v1/admin/api_tokens", {
        headers,
        body: {
          actor_id: input.actorId,
          expire_at: input.expire_at,
          created_by: ctx.session.user.email!,
          permissions: input.permissions,
        },
      });
      if (error) return handleApiError("create token", error, response);
      return ok(data.id);
    }),

  removeToken: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.DELETE(`/v1/admin/api_tokens/{id}`, {
        headers,
        params: { path: { id: input.id } },
      });
      if (error) return handleApiError("remove token", error, response);
      return ok(true);
    }),
});
