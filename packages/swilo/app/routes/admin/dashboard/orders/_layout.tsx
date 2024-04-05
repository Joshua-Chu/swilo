import { Outlet } from "@remix-run/react";

export default function Orders() {
  return (
    <div>
      Admin Orders
      <Outlet />
    </div>
  );
}
