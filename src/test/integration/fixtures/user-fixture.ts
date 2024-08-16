import { accounts, users } from "~/drizzle/schema";
import { type TestDbType } from "../fixtures/db-fixtures";
import { sql } from "drizzle-orm";

type UserType = typeof users.$inferSelect;

export const buildUser = async ({
  db,
  email,
  name,
}: {
  db: TestDbType;
  email: string;
  name: string;
}) => {
  const [user] = (await db.execute(sql`
      WITH inserted_user AS (
        INSERT INTO ${users} (id, name, email, email_verified)
        VALUES (gen_random_uuid(), ${name}, ${email}, NOW())
        RETURNING *
      ),
      inserted_account AS (
        INSERT INTO ${accounts} (user_id, provider, provider_account_id, type)
        SELECT id, 'test', ${email}, 'oauth'
        FROM inserted_user
      )
      SELECT * FROM inserted_user
    `)) as unknown as UserType[];

  return { user: user! };
};
