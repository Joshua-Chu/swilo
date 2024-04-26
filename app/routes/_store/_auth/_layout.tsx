import { Outlet } from "@remix-run/react";

export default function AdminAuthLayout() {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <Outlet />
    </div>
  );
}
