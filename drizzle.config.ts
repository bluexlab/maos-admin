import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  out: "./src/drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
} satisfies Config;
