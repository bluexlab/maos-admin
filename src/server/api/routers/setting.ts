import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { settings } from "~/drizzle/schema";
import { encryptApiToken, flushApiToken } from "~/lib/apiToken";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

export const settingRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/setting", { headers });
    if (error) return handleApiError("get setting", error, response);

    return { data };
  }),

  suggestDeploymentName: protectedProcedure.query(async ({ ctx }) => {
    const recs = await ctx.db.select().from(settings).where(eq(settings.key, "suggest-deployment-name"));
    return { data: recs[0]?.value === "true" };
  }),

  hasApiToken: protectedProcedure.query(async ({ ctx }) => {
    const recs = await ctx.db.select().from(settings).where(eq(settings.key, "api-token"));
    return { data: recs.length > 0 };
  }),

  bootstrap: protectedProcedure.mutation(async ({ ctx }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders("bootstrap-token");
    const {
      data: actor,
      error,
      response,
    } = await client.POST("/v1/admin/actors", {
      headers,
      body: { name: "maos-admin-portal", role: "user" },
    });
    if (error) return handleApiError("bootstrap", error, response);

    const {
      data: token,
      error: tokenError,
      response: tokenResponse,
    } = await client.POST("/v1/admin/api_tokens", {
      headers,
      body: {
        actor_id: actor.id,
        expire_at: Math.floor(Date.now() / 1000) + 20 * 365 * 86400, // 20 years from now
        created_by: ctx.session.user.email!,
        permissions: ["admin"],
      },
    });
    if (tokenError) return handleApiError("bootstrap", tokenError, tokenResponse);

    const encrypted = await encryptApiToken(token.id);
    await ctx.db
      .insert(settings)
      .values({ key: "api-token", value: encrypted })
      .onConflictDoUpdate({
        target: [settings.key],
        set: { value: encrypted, updatedAt: sql`NOW()` },
      });

    return { data: true, error: null };
  }),

  update: protectedProcedure
    .input(
      z.object({
        apiToken: z.string().optional(),
        deploymentApproveRequired: z.boolean().optional(),
        suggestDeploymentName: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.apiToken) {
        const encrypted = await encryptApiToken(input.apiToken);
        await ctx.db
          .insert(settings)
          .values({ key: "api-token", value: encrypted })
          .onConflictDoUpdate({
            target: [settings.key],
            set: { value: encrypted, updatedAt: sql`NOW()` },
          });
        await flushApiToken();
      }

      if (input.deploymentApproveRequired !== undefined) {
        const client = createApiClient();
        const headers = await getAuthHeaders();
        const { error, response } = await client.PATCH("/v1/admin/setting", {
          headers,
          body: {
            deployment_approve_required: input.deploymentApproveRequired,
          },
        });
        if (error) return handleApiError("update setting", error, response);
      }

      if (input.suggestDeploymentName !== undefined) {
        await ctx.db
          .insert(settings)
          .values({
            key: "suggest-deployment-name",
            value: input.suggestDeploymentName ? "true" : "false",
          })
          .onConflictDoUpdate({
            target: [settings.key],
            set: { value: input.suggestDeploymentName ? "true" : "false", updatedAt: sql`NOW()` },
          });
      }

      return { data: true, error: null };
    }),
});
