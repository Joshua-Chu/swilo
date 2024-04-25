import { db } from "@/lib/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

const main = async () => {
  try {
    console.info(
      "=============================== running migrations ==============================="
    );
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.info(
      "=============================== migrations applied ==============================="
    );
    console.info(
      "=============================== closing connection ==============================="
    );
    // Don't forget to close the connection, otherwise the script will hang
    await client.end();
    console.info(
      "=============================== connection closed ==============================="
    );
  } catch (error) {
    console.log("error");
    console.error(error);
    await client.end();
  }
};

main();
