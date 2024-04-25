import { createId } from "@paralleldrive/cuid2";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const verification = pgTable(
  "verification",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    createdAt: timestamp("createdAt").defaultNow(),

    type: text("type").notNull(),
    target: text("target").notNull(),

    /// The secret key used to generate the otp
    secret: text("secret").notNull(),

    /// The algorithm used to generate the otp
    algorithm: text("algorithm").notNull(),

    /// The number of digits in the otp
    digits: integer("digits").notNull(),

    /// The number of seconds the otp is valid for
    period: integer("period").notNull(),

    /// The valid characters for the otp
    charSet: text("charSet").notNull(),

    /// When it's safe to delete this verification
    expiresAt: timestamp("expiresAt"),
  },
  (table) => ({
    typeTargetIdx: uniqueIndex("typeTargetIdx").on(table.type, table.target),
  })
);
