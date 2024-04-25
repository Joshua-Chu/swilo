import { Outlet } from "@remix-run/react";
import { Header } from "./header";
import { SideBar } from "./side-bar";

import { adminAuthSessionStorage } from "@/lib/auth/admin-session.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const adminAuthSession = await adminAuthSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = adminAuthSession.get("sessionId");

  if (!sessionId) return redirect("/admin/login");

  return null;
};

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideBar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
