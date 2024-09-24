import type { users } from "~/drizzle/schema";
import type { Session } from "next-auth";
import { type TestDbType } from "../fixtures/db-fixtures";
import { withValidUser } from "../contexts/users";

export const buildTestSession = ({ user }: { user: typeof users.$inferSelect }) =>
  ({
    user: {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
    },
  }) as unknown as Session;

export const useSession = async (db: TestDbType) => {
  const { user } = await withValidUser(db);
  return { session: buildTestSession({ user }), user };
};
