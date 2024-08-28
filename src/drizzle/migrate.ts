import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from "postgres";
import * as schema from './schema';

async function main() {
  console.log('Migrating database on', process.env.DATABASE_URL);
  const conn = postgres(process.env.DATABASE_URL ?? "");
  const db = drizzle(conn, { schema, logger: false });
  await migrate(db, { migrationsFolder: './drizzle' });
}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
