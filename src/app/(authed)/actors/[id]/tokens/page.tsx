import Link from "next/link";
import ActorTokenList from "~/app/_components/actors/actor-token-list";
import AppFrame from "~/app/_components/app-frame";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  const actor = await api.actors.get({ id: parseInt(params.id) });
  const tokens = await api.actors.getTokens({ id: parseInt(params.id) });

  return (
    <AppFrame session={session}>
      {actor.match(
        (actor) => (
          <>
            <div className="flex items-center">
              <h1 className="text-lg font-semibold md:text-2xl">
                <Link className="text-blue-500 hover:text-blue-600" href="/actors">
                  Actors
                </Link>{" "}
                / {actor.name} / Tokens
              </h1>
            </div>
            {tokens.match(
              (tokens) => (
                <ActorTokenList tokens={tokens} actorId={actor.id} />
              ),
              (e) => {
                return <div className="text-red-500">Error: {String(e)}</div>;
              },
            )}
          </>
        ),
        (e) => {
          return <div className="text-red-500">Error: {String(e)}</div>;
        },
      )}
    </AppFrame>
  );
}
