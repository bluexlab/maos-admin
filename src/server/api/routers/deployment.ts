import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

export const deploymentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        status: z
          .enum(["draft", "reviewing", "approved", "rejected", "deployed", "retired", "cancelled"])
          .optional(),
        reviewer: z.string().optional(),
        id: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.GET("/v1/admin/deployments", {
        headers,
        params: {
          query: {
            page: 1,
            page_size: 1000,
            status: input.status,
            reviewer: input.reviewer,
            name: input.name,
            id: input.id,
          },
        },
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

  validName: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.name) return { data: false };

      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.GET("/v1/admin/deployments", {
        headers,
        params: { query: { name: input.name } },
      });
      if (error) return handleApiError("valid name", error, response);
      const notExists = !data.data.find((d) => d.name === input.name);
      return { data: notExists };
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
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        reviewers: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { data, error, response } = await client.PATCH("/v1/admin/deployments/{id}", {
        headers,
        params: { path: { id: input.id } },
        body: { name: input.name, reviewers: input.reviewers },
      });
      if (error) return handleApiError("update deployment", error, response);
      return { data: data.data };
    }),

  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { error, response } = await client.DELETE("/v1/admin/deployments/{id}", {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) return handleApiError("remove deployment", error, response);
    return { data: { result: "ok" } };
  }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        id: z.bigint(),
        configId: z.bigint(),
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
          content: input.content,
        },
      });
      if (error) return handleApiError("update config", error, response);
      return { data: data.data };
    }),

  submit: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { error, response } = await client.POST("/v1/admin/deployments/{id}/submit", {
      headers,
      params: { path: { id: input.id } },
    });
    if (error) return handleApiError("submit deployment", error, response);
    return { data: { result: "ok" } };
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

  reject: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.POST("/v1/admin/deployments/{id}/reject", {
        headers,
        params: { path: { id: input.id } },
        body: { user: ctx.session.user.email!, reason: input.reason },
      });
      if (error) return handleApiError("publish deployment", error, response);
      return { data: { result: "ok" } };
    }),

  restart: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const { error, response } = await client.POST("/v1/admin/deployments/{id}/restart", {
        headers,
        params: { path: { id: input.id } },
        body: { user: ctx.session.user.email! },
      });
      if (error) return handleApiError("restart deployment", error, response);
      return { data: { result: "ok" } };
    }),
});
