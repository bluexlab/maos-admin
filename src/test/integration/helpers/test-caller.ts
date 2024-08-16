import { appRouter } from "~/server/api/root";
import { type TestDbType } from "~/test/integration/fixtures/db-fixtures";
import { type Session } from "next-auth";

const useCaller = ({ db, session }: { db: TestDbType; session: Session | null }) => {
  const caller = appRouter.createCaller({
    headers: new Headers(),
    session,
    db,
  });
  return { caller, session, db };
};

export { useCaller };
