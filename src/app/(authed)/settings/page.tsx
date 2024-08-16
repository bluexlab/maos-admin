import AppFrame from "~/app/_components/app-frame";
import SettingList from "~/app/_components/settings/setting-list";
import { getServerAuthSession } from "~/server/auth";

export default async function Page() {
  const session = await getServerAuthSession();

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <SettingList session={session!} />
    </AppFrame>
  );
}
