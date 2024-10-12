import AppFrame from "~/app/_components/app-frame";
import DeploymentList from "~/app/_components/deployments/deployment-list";
import ReviewingDeploymentsList from "~/app/_components/deployments/reviewing-deployment-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  const deployments = await api.deployments.list({});
  const localSettings = await api.settings.getLocal();
  if (!session) return null;

  return (
    <AppFrame session={session}>
      <ReviewingDeploymentsList currentUserEmail={session.user.email!} />
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Latest Deployments</h1>
      </div>
      {deployments?.data ? (
        <DeploymentList
          deployments={deployments.data}
          suggestDeploymentName={localSettings.suggestDeploymentName}
        />
      ) : (
        <div className="text-red-500">Error: {deployments.error}</div>
      )}
    </AppFrame>
  );
}
