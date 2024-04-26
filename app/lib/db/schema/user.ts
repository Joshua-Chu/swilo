import { password } from "@/lib/db/schema/password";
import { role } from "@/lib/db/schema/role";
import { session } from "@/lib/db/schema/session";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  email: text("email").unique().notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  role: text("role").references(() => role.name),
});

export const userRelations = relations(user, ({ one, many }) => ({
  password: one(password, {
    fields: [user.id],
    references: [password.userId],
  }),
  sessions: many(session),
}));
