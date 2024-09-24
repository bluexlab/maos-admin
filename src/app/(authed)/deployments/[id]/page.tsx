import { ChevronLeft } from "lucide-react";
import { err, ok, Result, ResultAsync } from "neverthrow";
import Link from "next/link";

import AppFrame from "~/app/_components/app-frame";
import DeploymentEditor from "~/app/_components/deployments/deployment-editor";
import DeploymentReviewer from "~/app/_components/deployments/deployment-reviewer";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const [session, settings, allSuites] = await Promise.all([
    getServerAuthSession(),
    api.settings.get(),
    api.referenceConfigs.suites(),
  ]);

  const approveRequired = settings.data?.deployment_approve_required ?? false;
  const deploymentId = Result.fromThrowable(
    () => parseInt(params.id),
    (e) => (e instanceof Error ? e.message : String(e)),
  );
  const deployment = await deploymentId().asyncAndThen((id) =>
    ResultAsync.fromPromise(api.deployments.get({ id }), (e) => e).andThen((result) =>
      result.data ? ok(result.data) : err(new Error(result.error)),
    ),
  );

  return (
    <AppFrame session={session}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/deployments" className="flex items-center text-sm">
            <ChevronLeft /> Back
          </Link>
        </Button>
        <h1 className="text-lg font-semibold text-gray-300 md:text-2xl">
          Deployment -
          <strong className="mx-1 text-white">
            {deployment.map((c) => c.name).unwrapOr("Unknown")}
          </strong>
        </h1>
      </div>
      {deployment.match(
        (dep) =>
          dep.status === "reviewing" && dep.reviewers.includes(session!.user.email!) ? (
            <DeploymentReviewer deploymentId={dep.id} />
          ) : (
            <DeploymentEditor
              deploymentId={dep.id}
              session={session!}
              allSuites={allSuites.data ?? []}
              approveRequired={approveRequired}
            />
          ),
        (e) => {
          return <div className="text-red-500">Error: {String(e)}</div>;
        },
      )}
    </AppFrame>
  );
}
