import { test } from "vitest";

import { type DatabaseType } from "~/drizzle";
import { spinUpTestDatabase } from "~/test/integration/helpers/test-db";

export type TestDbType = DatabaseType;

export interface DBFixtures {
  db: TestDbType;
}

export const testWithDb = test.extend<DBFixtures>({
  db: async ({}, use) => {
    await spinUpTestDatabase(async (testDb) => {
      await use(testDb);
    });
  },
});
