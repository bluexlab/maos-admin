import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { agentRouter } from "./routers/agent";
import { deploymentRouter } from "./routers/deployment";
import { referenceConfigsRouter } from "./routers/reference_configs";
import { secretsRouter } from "./routers/secrets";
import { settingRouter } from "./routers/setting";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  agents: agentRouter,
  deployments: deploymentRouter,
  referenceConfigs: referenceConfigsRouter,
  secrets: secretsRouter,
  users: userRouter,
  settings: settingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
