import { createCookieSessionStorage } from "@remix-run/node";

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "swilo-admin-auth",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.COOKIE_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});
