import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

export const podsRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/metrics/pods", { headers });
    if (error) {
      return handleApiError("list pods metrics", error, response);
    }

    return { data: data.pods, error: null };
  }),
});
