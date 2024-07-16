import { redirect } from "next/navigation";
import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/signin");
  }

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
    </AppFrame>
  );
}
