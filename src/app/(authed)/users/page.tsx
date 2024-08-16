import AppFrame from "~/app/_components/app-frame";
import UserList from "~/app/_components/users/user-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const session = await getServerAuthSession();

  const page = parseInt(searchParams.page) || 1;
  const perPage = 10;
  const { data: users, total } = await api.users.list({ page });
  const totalPages = Math.ceil(total / perPage);

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Users</h1>
      </div>
      <UserList
        session={session!}
        users={users}
        currentPage={page}
        perPage={perPage}
        totalPages={totalPages}
      />
    </AppFrame>
  );
}
