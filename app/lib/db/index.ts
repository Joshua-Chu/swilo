import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as passwordSchema from "./schema/password";
import * as roleSchema from "./schema/role";
import * as sessionSchema from "./schema/session";
import * as userSchema from "./schema/user";
import * as verificationSchema from "./schema/verification";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = {
  ...passwordSchema,
  ...sessionSchema,
  ...userSchema,
  ...verificationSchema,
  ...roleSchema,
};

export const db = drizzle(pool, { schema });
