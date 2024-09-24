import AppFrame from "~/app/_components/app-frame";
import SecretsList from "~/app/_components/secrets/secrets-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  const secrets = await api.secrets.list();

  if (!session) return null;

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Secrets</h1>
      </div>
      {secrets?.data ? (
        <SecretsList secrets={secrets.data} />
      ) : (
        <div className="text-red-500">Error: {secrets.error}</div>
      )}
    </AppFrame>
  );
}
