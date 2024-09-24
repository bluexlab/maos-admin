import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { type DatabaseType } from "~/drizzle";
import * as schema from "~/drizzle/schema";
import { env } from "~/env.js";
import { randomId } from "~/lib/utils";

export async function spinUpTestDatabase<R>(fn: (db: DatabaseType) => Promise<R>) {
  const testDatabaseName = `test_${randomId(10)}`;
  const cloneConn = postgres(env.DATABASE_URL, { max: 1 });
  const cloneDb = drizzle(cloneConn, { schema, logger: false });

  try {
    await cloneDb.execute(sql.raw(`CREATE DATABASE "${testDatabaseName}"`));

    const url = new URL(env.DATABASE_URL);
    const conn = postgres(url.toString(), {
      max: 1,
      database: testDatabaseName,
    });

    const testDb = drizzle(conn, { schema, logger: true });
    await migrate(testDb, { migrationsFolder: "./src/drizzle" });

    const res = await fn(testDb);
    await conn.end();
    return res;
  } finally {
    await dropDatabase(cloneDb, testDatabaseName);
    await cloneConn.end();
  }
}

async function dropDatabase(db: DatabaseType, databaseName: string) {
  return db.execute(sql.raw(`DROP DATABASE IF EXISTS "${databaseName}"`));
}
