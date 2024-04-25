import { adminAuthSessionStorage } from "@/lib/auth/admin-session.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const adminAuthSession = await adminAuthSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = adminAuthSession.get("sessionId");

  if (!sessionId) return redirect("/admin/login");

  return redirect("/admin/dashboard");
};
