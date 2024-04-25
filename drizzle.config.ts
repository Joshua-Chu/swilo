import "dotenv/config";
import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("ENVIRONMENT VARIABLE ERROR: DATABASE URL NOT PROVIDED");
}
export default {
  // Temporary schema dir
  schema: "./app/lib/db/schema/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
