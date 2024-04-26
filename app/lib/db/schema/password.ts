import { user } from "@/lib/db/schema/user";
import { pgTable, text } from "drizzle-orm/pg-core";

export const password = pgTable("password", {
  hashedPassword: text("hashedPassword").notNull(),
  userId: text("userId")
    .primaryKey()
    .unique()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});
