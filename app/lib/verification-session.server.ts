import { createCookieSessionStorage } from "@remix-run/node";

// export the whole sessionStorage object
export const verificationSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "swilo-verification",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.COOKIE_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});
