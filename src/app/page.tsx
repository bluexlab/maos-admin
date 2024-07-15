import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import AppFrame from "./_components/app-frame";
import { cookies, headers } from "next/headers";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/signin");
  }

  return (
    <AppFrame session={session} currentPath="/">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no products
          </h3>
          <p className="text-sm text-muted-foreground">
            You can start selling as soon as you add a product.
          </p>
        </div>
      </div>
    </AppFrame>
  );
}
