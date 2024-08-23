import { sql } from "drizzle-orm";
import { z } from "zod";

import { settings } from "~/drizzle/schema";
import { encryptApiToken } from "~/lib/apiToken";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

export const settingRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({}) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/setting", { headers });
    if (error) return handleApiError("get setting", error, response);

    return { data };
  }),

  update: protectedProcedure
    .input(
      z.object({
        apiToken: z.string().optional(),
        clusterName: z.string().optional(),
        deploymentApproveRequired: z.boolean().optional(),
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
      }
      if (input.clusterName !== undefined || input.deploymentApproveRequired !== undefined) {
        const client = createApiClient();
        const headers = await getAuthHeaders();
        const { error, response } = await client.PATCH("/v1/admin/setting", {
          headers,
          body: {
            cluster_name: input.clusterName === "" ? undefined : input.clusterName,
            deployment_approve_required: input.deploymentApproveRequired,
          },
        });
        if (error) return handleApiError("update setting", error, response);
      }
      return { data: true };
    }),
});
