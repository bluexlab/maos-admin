import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";
import { z } from "zod";

export const secretsRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/secrets", { headers });
    if (error) return handleApiError("list secrets", error, response);

    return data;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.PATCH(`/v1/admin/secrets/{name}`, {
        headers,
        params: { path: { name: input.name } },
        body: {},
      });
      if (error) return handleApiError("create secret", error, response);
      return data;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.DELETE(`/v1/admin/secrets/{name}`, {
        headers,
        params: { path: { name: input.name } },
      });
      if (error) return handleApiError("delete secret", error, response);
      return data;
    }),

  updateKey: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        key: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.PATCH(`/v1/admin/secrets/{name}`, {
        headers,
        params: { path: { name: input.name } },
        body: {
          [input.key]: input.value,
        },
      });
      if (error) return handleApiError("update secret key", error, response);
      return data;
    }),

  deleteKey: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.PATCH(`/v1/admin/secrets/{name}`, {
        headers,
        params: { path: { name: input.name } },
        body: {
          [input.key]: "",
        },
      });
      if (error) return handleApiError("update secret key", error, response);
      return data;
    }),
});
