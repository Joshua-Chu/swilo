import { Outlet } from "@remix-run/react";

export default function StorefrontLayout() {
  return (
    <div>
      Layout
      <Outlet />
    </div>
  );
}
