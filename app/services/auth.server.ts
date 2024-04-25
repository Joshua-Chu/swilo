import { db } from "@/lib/db";
import { password as passwordSchema } from "@/lib/db/schema/password";
import { session as sessionSchema } from "@/lib/db/schema/session";
import { user as userSchema } from "@/lib/db/schema/user";
import bcrypt from "bcryptjs";

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

const getPasswordHash = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

export const signUp = async ({
  firstName,
  lastName,
  password,
  email,
}: {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}) => {
  const hashedPassword = await getPasswordHash(password);
  const session = await db.transaction(async (tx) => {
    const user = await tx
      .insert(userSchema)
      .values({ firstName, lastName, email })
      .returning({ userId: userSchema.id });

    const userId = user[0].userId;

    await tx.insert(passwordSchema).values({
      hashedPassword,
      userId,
    });

    const session = await tx
      .insert(sessionSchema)
      .values({
        userId,
        expirationDate: getSessionExpirationDate(),
      })
      .returning({
        sessionId: sessionSchema.id,
        sessionExpirationDate: sessionSchema.expirationDate,
      });

    return session[0];
  });

  return session;
};
