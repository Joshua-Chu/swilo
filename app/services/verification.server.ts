import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema/verification";
import { generateTOTP } from "@epic-web/totp";

export type VerificationTypes = "admin-onboarding";

const getDomainUrl = (request: Request) => {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
};

const getRedirectURL = ({
  request,
  type,
  target,
}: {
  request: Request;
  target: string;
  type: VerificationTypes;
}) => {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`);
  redirectToUrl.searchParams.set("type", type);
  redirectToUrl.searchParams.set("target", target);
  return redirectToUrl;
};

export const prepareVerification = async ({
  request,
  target,
  type,
  period = 10 * 60,
}: {
  request: Request;
  target: string;
  type: VerificationTypes;
  period?: number;
}) => {
  const verifyURL = getRedirectURL({ request, target, type });
  const redirectTo = new URL(verifyURL.toString());

  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: "SHA256",
    // Leaving off 0 and O on purpose to avoid confusing users.
    charSet: "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
    period,
  });

  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  };

  await db
    .insert(verification)
    .values(verificationData)
    .onConflictDoUpdate({
      target: [verification.target, verification.type],
      set: verificationData,
    });

  verifyURL.searchParams.set("code", otp);

  return { verifyURL, redirectTo, otp };
};
