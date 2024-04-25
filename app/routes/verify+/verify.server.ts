import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema/verification";
import type { VerificationTypes } from "@/services/verification.server";
import { verifyTOTP } from "@epic-web/totp";
import { and, eq, gte } from "drizzle-orm";

export const validateVerificationRouteRequest = ({
  request,
}: {
  request: Request;
}) => {
  const verifyURL = new URL(request.url);
  const type = verifyURL.searchParams.get("type");
  const target = verifyURL.searchParams.get("target");

  return type && target ? { type: type as VerificationTypes, target } : null;
};

export const isCodeValid = async ({
  target,
  type,
  otp,
}: {
  target: string;
  type: VerificationTypes;
  otp: string;
}) => {
  const verificationData = await db
    .select()
    .from(verification)
    .where(
      and(
        eq(verification.type, type),
        eq(verification.target, target),
        gte(verification.expiresAt, new Date())
      )
    );

  if (verificationData.length === 0) return false;

  const isValid = verifyTOTP({
    ...verificationData[0],
    otp,
  });

  if (!isValid) return false;

  return true;
};

export const deleteVerificationFromDatabase = async ({
  type,
  target,
}: {
  type: VerificationTypes;
  target: string;
}) => {
  await db
    .delete(verification)
    .where(and(eq(verification.type, type), eq(verification.target, target)));
};
