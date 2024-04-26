import { db } from "@/lib/db";
import { password as passwordSchema } from "@/lib/db/schema/password";
import { session as sessionSchema } from "@/lib/db/schema/session";
import { user as userSchema } from "@/lib/db/schema/user";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

const getPasswordHash = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

const verifyAdminPassword = async ({
  password,
  email,
}: {
  password: string;
  email: string;
}) => {
  const adminUser = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  if (adminUser.length === 0) return null;

  const adminUserId = adminUser[0].id;

  const adminUserPassword = await db
    .select()
    .from(passwordSchema)
    .where(eq(passwordSchema.userId, adminUserId))
    .limit(1);

  if (adminUserPassword.length === 0) return null;

  const isValid = await bcrypt.compare(
    password,
    adminUserPassword[0].hashedPassword
  );

  if (!isValid) return null;

  return { userId: adminUserId };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await verifyAdminPassword({ email, password });
  if (!user) return null;

  const session = await db
    .insert(sessionSchema)
    .values({
      userId: user.userId,
      expirationDate: getSessionExpirationDate(),
    })
    .returning({
      sessionId: sessionSchema.id,
      sessionExpirationDate: sessionSchema.expirationDate,
    });

  if (session.length === 0) return null;

  const _session = session[0];
  return {
    session: {
      ..._session,
    },
  };
};

export const adminSignup = async ({
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
      .values({ firstName, lastName, email, role: "ADMIN" })
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

export const customerSignup = async ({
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
      .values({ firstName, lastName, email, role: "CUSTOMER" })
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
