import { ResultAsync } from "neverthrow";
import AgentList from "~/app/_components/agents/agent-list";
import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const session = await getServerAuthSession();
  const page = parseInt(searchParams.page) || 1;
  const agents = await api.agents.list({ page });

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Agents</h1>
      </div>
      {agents.match(
        (agents) => (
          <AgentList
            session={session!}
            agents={agents.data}
            currentPage={page}
            totalPages={agents.totalPages}
          />
        ),
        (e) => {
          return <div className="text-red-500">Error: {String(e)}</div>;
        },
      )}
    </AppFrame>
  );
}
