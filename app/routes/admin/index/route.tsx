import { authSessionStorage } from "@/lib/auth/auth-session.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = authSession.get("sessionId");

  if (!sessionId) return redirect("/admin/login");

  return redirect("/admin/dashboard");
};
