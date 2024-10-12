import { concat, filter, find, flatMap, get, groupBy, includes, map, mapValues, uniq } from "lodash-es";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiClient, getAuthHeaders, handleApiError } from "./common";

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

      // Aggregate deployment suites and filter reference suites, then combine and structure them

      // Aggregate deployment and filtered reference suites
      const allSuites = concat(
        // Extract suites from deployments
        flatMap(deployments, ({ data }) =>
          data ? map(data.configs, config => ({
            actor_name: config.actor_name,
            suite_name: data.name,
            configs: config.content,
          })) : []
        ),
        // Extract and filter suites from reference configurations
        flatMap(referenceConfigs.data.data, ({ actor_name, config_suites }) =>
          map(
            filter(config_suites, cs => includes(input.referenceConfigs, cs.suite_name)),
            cs => ({
              actor_name,
              suite_name: cs.suite_name,
              configs: cs.configs,
            })
          )
        )
      );

      // Retrieve all unique suite names
      const allSuiteNames = uniq(map(allSuites, 'suite_name'));

      // Group suites by actor and suite names
      const groupedSuites = groupBy(allSuites, 'actor_name');

      // Ensure each actor has all suite names, filling missing with empty configs
      const actorsWithCompleteSuites = mapValues(groupedSuites, (suites, actor_name) => ({
        actor_name,
        config_suites: map(allSuiteNames, suite_name => ({
          suite_name,
          configs: get(find(suites, { suite_name }), 'configs', {}),
        })),
      }));

      return { data: actorsWithCompleteSuites };
    }),
});
