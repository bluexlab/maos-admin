import ActorList from "~/app/_components/actors/actor-list";
import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const session = await getServerAuthSession();
  const page = parseInt(searchParams.page) || 1;
  const actors = await api.actors.list({ page });

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Actors</h1>
      </div>
      {actors.match(
        (actors) => (
          <ActorList
            session={session!}
            actors={actors.data}
            currentPage={page}
            totalPages={actors.totalPages}
          />
        ),
        (e) => {
          return <div className="text-red-500">Error: {String(e)}</div>;
        },
      )}
    </AppFrame>
  );
}
