import { user } from "@/lib/db/schema/user";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const role = pgTable(
  "role",
  {
    name: text("name").primaryKey().notNull().unique(),
    id: text("id").$default(() => createId()),
  },
  (table) => ({
    nameIdx: uniqueIndex("nameIdx").on(table.name),
  })
);

export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),
}));
