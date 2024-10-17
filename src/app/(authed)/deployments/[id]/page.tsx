import { ChevronLeft } from "lucide-react";
import { err, ok, Result, ResultAsync } from "neverthrow";
import Link from "next/link";

import AppFrame from "~/app/_components/app-frame";
import DeploymentEditor from "~/app/_components/deployments/deployment-editor";
import DeploymentNameEditable from "~/app/_components/deployments/deployment-name-editable";
import DeploymentReviewer from "~/app/_components/deployments/deployment-reviewer";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const [
    session,
    localSettings,
    deploymentApproveRequired,
    allSuites,
    deployedDeployments,
    allActors,
  ] = await Promise.all([
    getServerAuthSession(),
    api.settings.getLocal(),
    api.settings.deploymentApproveRequired(),
    api.referenceConfigs.suites(),
    api.deployments.list({ status: "deployed" }),
    api.actors.list({}),
  ]);

  const approveRequired = deploymentApproveRequired.data ?? false;
  const deploymentId = Result.fromThrowable(
    () => parseInt(params.id),
    (e) => (e instanceof Error ? e.message : String(e)),
  );
  const deployment = await deploymentId().asyncAndThen((id) =>
    ResultAsync.fromPromise(api.deployments.get({ id }), (e) => e).andThen((result) =>
      result.data ? ok(result.data) : err(new Error(result.error)),
    ),
  );
  const activeDeploymentId = deployedDeployments.data?.[0]?.id;

  return (
    <AppFrame session={session}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/deployments" className="flex items-center text-sm">
            <ChevronLeft /> Back
          </Link>
        </Button>
        {deployment
          .map((dep) => (
            <DeploymentNameEditable key={dep.id} deploymentId={dep.id} initialName={dep.name} />
          ))
          .unwrapOr(null)}
      </div>
      {deployment.match(
        (dep) =>
          dep.status === "reviewing" && dep.reviewers.includes(session!.user.email!) ? (
            <DeploymentReviewer deploymentId={dep.id} />
          ) : (
            <DeploymentEditor
              deploymentId={dep.id}
              activeDeploymentId={activeDeploymentId}
              session={session!}
              allSuites={allSuites.data ?? []}
              preferSuites={localSettings.preferSuites ?? allSuites.data ?? []}
              allActors={allActors.map((a) => a.data).unwrapOr([])}
              approveRequired={approveRequired}
              restartable={dep.status === "deployed"}
            />
          ),
        (e) => {
          return <div className="text-red-500">Error: {String(e)}</div>;
        },
      )}
    </AppFrame>
  );
}
