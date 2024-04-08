import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const userSchema = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password").notNull(),
  role: varchar("role", { enum: ["admin", "member"] }),
});

export const selectUserSchema = createSelectSchema(userSchema, {
  firstName: ({ firstName }) => firstName.min(1),
  lastName: ({ lastName }) => lastName.min(1),
  email: ({ email }) => email.email(),
  password: ({ password }) => password.min(8),
});
