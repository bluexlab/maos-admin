import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import AppFrame from "~/app/_components/app-frame";
import DeploymentLogs from "~/app/_components/deployments/deployment-logs";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const [session, deployment, result] = await Promise.all([
    getServerAuthSession(),
    api.deployments.get({ id: parseInt(params.id) }),
    api.deployments.result({ id: parseInt(params.id) }),
  ]);

  return (
    <AppFrame session={session}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/deployments" className="flex items-center text-sm">
            <ChevronLeft /> Back
          </Link>
        </Button>
        {deployment.data && (
          <h1 className="text-lg font-semibold text-gray-300 md:text-2xl">
            Deployment -<strong className="mx-1 text-white">{deployment.data.name}</strong>
          </h1>
        )}
        Result
      </div>
      {result.data && deployment.data ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-300">Status</h2>
          <div>{result.data.status}</div>

          <Separator />
          <h2 className="text-lg font-semibold text-gray-300">Error</h2>
          <div>{result.data.error}</div>

          <Separator />
          <h2 className="text-lg font-semibold text-gray-300">Logs</h2>
          {result.data.logs && (
            <DeploymentLogs logs={result.data.logs as unknown as Record<string, unknown>} />
          )}
        </div>
      ) : (
        <div className="text-red-500">Error: {String(result.error ?? deployment.error)}</div>
      )}
    </AppFrame>
  );
}
