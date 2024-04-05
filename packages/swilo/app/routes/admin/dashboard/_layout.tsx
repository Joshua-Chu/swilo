import { Outlet } from "@remix-run/react";

export default function AdminDashboard() {
  return (
    <div>
      Hello Admin Dashboard
      <Outlet />
    </div>
  );
}
