import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";

export default async function Page() {
  const session = await getServerAuthSession();

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Agents</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">You have no Agents</h3>
          <p className="text-sm text-muted-foreground">You can start selling as soon as you add an Agent.</p>
        </div>
      </div>
    </AppFrame>
  );
}
