import { Result, ResultAsync } from "neverthrow";

import { AgentConfigEditor } from "~/app/_components/agents/agent-config-editor";
import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  const agentId = Result.fromThrowable(
    () => parseInt(params.id),
    (e) => (e instanceof Error ? e.message : String(e)),
  )();
  const config = await agentId.asyncAndThen((id) =>
    ResultAsync.fromPromise(api.agents.getConfig({ id }), (e) => e).andThen((result) =>
      result.map((c) => ({ id, config: c })),
    ),
  );

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Edit Agent
          <strong className="mx-1">
            {config.map((c) => c.config.agent_name).unwrapOr("Unknown")}
          </strong>
          Config
        </h1>
      </div>
      {config.match(
        (conf) => (
          <AgentConfigEditor agentId={conf.id} config={conf.config.content} />
        ),
        (e) => {
          return <div className="text-red-500">Error: {String(e)}</div>;
        },
      )}
    </AppFrame>
  );
}
