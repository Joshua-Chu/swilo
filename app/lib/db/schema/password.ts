import { user } from "@/lib/db/schema/user";
import { pgTable, text } from "drizzle-orm/pg-core";

export const password = pgTable("password", {
  hashedPassword: text("hashedPassword").notNull(),

  userId: text("userId")
    .unique()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});
