import AppFrame from "~/app/_components/app-frame";
import SettingList from "~/app/_components/settings/setting-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  const settings = await api.settings.get();

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <SettingList
        settings={{
          deploymentApproveRequired: settings.data?.deployment_approve_required,
        }}
      />
    </AppFrame>
  );
}
