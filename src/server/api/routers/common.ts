import createClient from "openapi-fetch";

import { env } from "~/env";
import { getApiToken } from "~/lib/apiToken";
import { type paths } from "~/types/maos-core-scheme";

export const createApiClient = () => createClient<paths>({ baseUrl: env.MAOS_CORE_URL });

export const getAuthHeaders = async () => {
  const apiToken = await getApiToken();
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  };
};

export const handleApiError = (
  operation: string,
  error: { error: string } | undefined,
  response: Response,
) => {
  console.error(`Failed to ${operation}`, error, response);
  return { error: `Failed to ${operation}: ${error?.error}, ${response.statusText}`, data: null };
};
