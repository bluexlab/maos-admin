import AppFrame from "~/app/_components/app-frame";
import SettingList from "~/app/_components/settings/setting-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const [session, localSettings, deploymentApproveRequired, availableSuites] = await Promise.all([
    getServerAuthSession(),
    api.settings.getLocal(),
    api.settings.deploymentApproveRequired(),
    api.referenceConfigs.suites(),
  ]);

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <SettingList
        localSettings={localSettings}
        currentDeploymentApproveRequired={deploymentApproveRequired.data ?? false}
        availableSuites={availableSuites.data ?? []}
        hasApiToken={localSettings.hasApiToken}
      />
    </AppFrame>
  );
}
