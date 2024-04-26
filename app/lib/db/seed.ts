import { role } from "@/lib/db/schema/role";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

if (!("DATABASE_URL" in process.env))
  throw new Error("DATABASE_URL not found on .env.development");

const main = async () => {
  const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(client);
  const data: (typeof role.$inferInsert)[] = [
    {
      name: "ADMIN",
    },
    {
      name: "CUSTOMER",
    },
  ];

  console.log("Seed start");
  await db.insert(role).values(data);
  console.log("Seed done");
  client.end();
};

main();
