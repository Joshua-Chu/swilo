import { Outlet } from "@remix-run/react";

export default function Login() {
  return (
    <div>
      Hello Auth Customer
      <Outlet />
    </div>
  );
}
