import AppFrame from "~/app/_components/app-frame";
import DeploymentList from "~/app/_components/deployments/deployment-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  const deployments = await api.deployments.list({});

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Latest Deployments</h1>
      </div>
      {deployments?.data ? (
        <DeploymentList session={session!} deployments={deployments.data} />
      ) : (
        <div className="text-red-500">Error: {deployments.error}</div>
      )}
    </AppFrame>
  );
}
