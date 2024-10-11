import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

type ReferenceConfigSuite = {
  actor_name: string;
  config_suites: {
    suite_name: string;
    configs: Record<string, string>;
  }[];
};

export const referenceConfigsRouter = createTRPCRouter({
  suites: protectedProcedure.query(async ({ }) => {
    const client = createApiClient();
    const headers = await getAuthHeaders();
    const { data, error, response } = await client.GET("/v1/admin/reference_config_suites", {
      headers,
    });
    if (error) return handleApiError("list reference configs", error, response);
    const uniqueSuites = [
      ...new Set(data.data.flatMap((s) => s.config_suites.map((cs) => cs.suite_name))),
    ];
    return {
      data: uniqueSuites,
    };
  }),

  list: protectedProcedure
    .input(
      z.object({
        referenceConfigs: z.array(z.string()).optional(),
        deployments: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input }) => {
      const client = createApiClient();
      const headers = await getAuthHeaders();
      const [referenceConfigs, ...deployments] = await Promise.all([
        client.GET("/v1/admin/reference_config_suites", { headers }),
        ...(input.deployments?.map((id) =>
          client.GET("/v1/admin/deployments/{id}", { headers, params: { path: { id } } }),
        ) ?? []),
      ]);

      if (referenceConfigs.error)
        return handleApiError(
          "list reference configs",
          referenceConfigs.error,
          referenceConfigs.response,
        );
      for (const deployment of deployments) {
        if (deployment.error) {
          return handleApiError("get deployment", deployment.error, deployment.response);
        }
      }

      const result = referenceConfigs.data.data.reduce(
        (acc, curr) => {
          acc[curr.actor_name] = {
            ...curr,
            config_suites: curr.config_suites.filter((cs) =>
              input.referenceConfigs?.includes(cs.suite_name),
            ),
          };
          return acc;
        },
        {} as Record<string, ReferenceConfigSuite>,
      );

      for (const deployment of deployments) {
        if (deployment.data?.configs) {
          for (const config of deployment.data.configs) {
            const { actor_name, content } = config;
            const suite_name = deployment.data.name;

            if (!result[actor_name]) {
              result[actor_name] = { actor_name, config_suites: [] };
            }
            result[actor_name].config_suites.push({ suite_name, configs: content });
          }
        }
      }

      return { data: result };
    }),
});
