import { Outlet } from "@remix-run/react";

export default function CustomerAuthLayout() {
  return (
    <div>
      Customer Auth Layout
      <Outlet />
    </div>
  );
}
