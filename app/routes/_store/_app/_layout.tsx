import { Outlet } from "@remix-run/react";

export default function MainLayout() {
  return (
    <div>
      <div>Header</div>
      <Outlet />
      <div>Footer</div>
    </div>
  );
}
