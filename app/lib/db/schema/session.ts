import { user } from "@/lib/db/schema/user";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { date, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  expirationDate: date("expirationDate", { mode: "date" }).notNull(),

  createdAt: timestamp("createdAt").defaultNow(),
  //   TODO: NEEDS INVESTIGATION
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: text("userId").references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
