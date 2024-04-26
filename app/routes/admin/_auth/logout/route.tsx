import { authSessionStorage } from "@/lib/auth/auth-session.server";
import { db } from "@/lib/db";
import { session } from "@/lib/db/schema/session";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";

export const loader = () => {
  return redirect("/admin/dashboard");
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );

  const sessionId = authSession.get("sessionId");

  if (sessionId) {
    await db.delete(session).where(eq(session.id, sessionId));
  }

  return redirect("/admin/login", {
    headers: {
      "set-cookie": await authSessionStorage.destroySession(authSession),
    },
  });
};
