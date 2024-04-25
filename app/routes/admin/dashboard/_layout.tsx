import { Button } from "@/components/ui/button";
import { Outlet } from "@remix-run/react";

export default function AdminDashboard() {
  return (
    <div>
      <header>
        <Button>Logout</Button>
      </header>
      Hello Admin Dashboard Layout
      <Outlet />
    </div>
  );
}
