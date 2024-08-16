import { describe } from "vitest";
import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { testWithDb } from "~/test/integration/fixtures/db-fixtures";
import { useCaller } from "~/test/integration/helpers/test-caller";
import { useSession } from "~/test/integration/helpers/test-session";
import { users, invitingUsers, accounts } from "~/drizzle/schema";
import { withValidUser } from "~/test/integration/contexts/users";
import { buildUser } from "~/test/integration/fixtures/user-fixture";

describe.concurrent("userRouter API", () => {
  describe("without session", () => {
    const session = null;

    testWithDb("get returns UNAUTHORIZED", async ({ expect, db }) => {
      const { caller } = useCaller({ db, session });
      await expect(
        caller.users.invite({
          email: "user@example.com",
        }),
      ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
    });
  });

  describe("with valid session", async () => {
    describe("list", () => {
      testWithDb("list all users", async ({ expect, db }) => {
        const { session } = await useSession(db);
        const { caller } = useCaller({ db, session });

        const users = await caller.users.list({});
        expect(users.total).toEqual(1);
        expect(users.data).toHaveLength(1);
      });

      testWithDb("list users with pagination", async ({ expect, db }) => {
        const { session } = await useSession(db);
        const { caller } = useCaller({ db, session });

        // Insert additional users
        await db
          .insert(users)
          .values([{ email: "user2@example.com" }, { email: "user3@example.com" }]);

        const result = await caller.users.list({ page: 1, pageSize: 2 });
        expect(result.total).toEqual(3);
        expect(result.data).toHaveLength(2);
      });
    });

    describe("invite", () => {
      testWithDb("invite a new user", async ({ expect, db }) => {
        const { session } = await useSession(db);
        const { caller } = useCaller({ db, session });

        const email = "newuser@example.com";
        const result = await caller.users.invite({ email });

        expect(result).toBeDefined();
        const invitedUser = await db
          .select()
          .from(invitingUsers)
          .where(eq(invitingUsers.email, email))
          .execute();
        expect(invitedUser).toHaveLength(1);
        expect(invitedUser[0]?.email).toEqual(email);
      });

      testWithDb("fail to invite an existing user", async ({ expect, db }) => {
        const { session } = await useSession(db);
        const { caller } = useCaller({ db, session });

        const email = "existinguser@example.com";
        await db.insert(users).values({ email });

        const result = await caller.users.invite({ email });
        expect(result).toEqual([]);
      });
    });

    describe("remove", () => {
      testWithDb("remove an existing user and their accounts", async ({ expect, db }) => {
        const { session, user } = await useSession(db);
        const { caller } = useCaller({ db, session });
        const { user: user2 } = await buildUser({ db, email: "user2@example.com", name: "User 2" });

        const result = await caller.users.remove({ email: user.email });
        expect(result).toBe(true);

        const removedUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .execute();
        expect(removedUser).toHaveLength(0);

        const removedAccounts = await db
          .select()
          .from(accounts)
          .where(eq(accounts.userId, user.id));
        expect(removedAccounts).toHaveLength(0);

        const existingUser = await db.select().from(users).where(eq(users.email, user2.email));
        expect(existingUser).toHaveLength(1);
        const existingAccount = await db
          .select()
          .from(accounts)
          .where(eq(accounts.userId, existingUser[0]!.id));
        expect(existingAccount).toHaveLength(1);
      });

      testWithDb("fail to remove a non-existing user", async ({ expect, db }) => {
        const { session } = await useSession(db);
        const { caller } = useCaller({ db, session });

        const email = "nonexistent@example.com";
        const result = await caller.users.remove({ email });
        expect(result).toBe(true);
      });
    });
  });
});
