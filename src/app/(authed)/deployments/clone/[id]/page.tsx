import { redirect } from "next/navigation";
import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  const cloneFrom = parseInt(params.id);
  let errorString: string | undefined = undefined;

  if (!session) return null;

  if (isNaN(cloneFrom)) {
    errorString = "Invalid deployment id";
  }

  const deployment = await api.deployments.get({ id: cloneFrom });
  if (deployment.error) {
    errorString = deployment.error;
  } else {
    const newDeployment = await api.deployments.create({
      name: "Clone of " + deployment.data?.name,
      cloneFrom: parseInt(params.id),
    });

    if (newDeployment.data) {
      redirect(`/deployments/${newDeployment.data.id}`);
    }
  }

  return (
    <AppFrame session={session}>
      <div className="text-red-500">{errorString}</div>
    </AppFrame>
  );
}
