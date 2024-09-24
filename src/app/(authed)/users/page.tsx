import AppFrame from "~/app/_components/app-frame";
import UserList from "~/app/_components/users/user-list";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const session = await getServerAuthSession();

  const page = parseInt(searchParams.page) || 1;
  const pageSize = 20;
  const { data: users, total } = await api.users.listPaginated({ page, pageSize });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Users</h1>
      </div>
      <UserList
        session={session!}
        users={users}
        currentPage={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </AppFrame>
  );
}
