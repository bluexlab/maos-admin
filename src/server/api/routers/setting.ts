import { sql } from "drizzle-orm";
import { z } from "zod";

import { type DatabaseType } from "~/drizzle";
import { settings } from "~/drizzle/schema";
import { encryptApiToken, flushApiToken } from "~/lib/apiToken";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

export interface LocalSettingsType {
  suggestDeploymentName: boolean;
  preferSuites: string[] | null;
  hasApiToken: boolean;
}

export const settingRouter = createTRPCRouter({
  deploymentApproveRequired: protectedProcedure.query(async ({ }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/setting", { headers });
    if (error) return handleApiError("get setting", error, response);

    return { data: data.deployment_approve_required };
  }),

  getLocal: protectedProcedure.query(async ({ ctx }) => {
    const recs = await ctx.db.select().from(settings);
    return recs.reduce((acc, rec) => {
      if (rec.key === "prefer-suites") {
        acc.preferSuites = rec.value ? (JSON.parse(rec.value) as string[]) : null;
      } else if (rec.key === "suggest-deployment-name") {
        acc.suggestDeploymentName = rec.value === "true";
      } else if (rec.key === "api-token") {
        acc.hasApiToken = rec.value !== null;
      }
      return acc;
    }, { suggestDeploymentName: false, preferSuites: null, hasApiToken: false } as LocalSettingsType);
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
    await updateSetting(ctx.db, "api-token", encrypted);

    return { data: true, error: null };
  }),

  update: protectedProcedure
    .input(
      z.object({
        apiToken: z.string().optional(),
        deploymentApproveRequired: z.boolean().optional(),
        suggestDeploymentName: z.boolean().optional(),
        preferSuites: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.suggestDeploymentName !== undefined) {
        await updateSetting(ctx.db, "suggest-deployment-name", input.suggestDeploymentName ? "true" : "false");
      }

      if (input.preferSuites !== undefined) {
        await updateSetting(ctx.db, "prefer-suites", JSON.stringify(input.preferSuites));
      }

      if (input.apiToken) {
        const encrypted = await encryptApiToken(input.apiToken);
        await updateSetting(ctx.db, "api-token", encrypted);
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

      return { data: true, error: null };
    }),
});

async function updateSetting(db: DatabaseType, key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: [settings.key], set: { value, updatedAt: sql`NOW()` } });
}
