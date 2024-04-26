import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verificationSessionStorage } from "@/lib/verification-session.server";
import {
  deleteVerificationFromDatabase,
  isCodeValid,
  validateVerificationRouteRequest,
} from "@/routes/verify+/verify.server";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";

const VerifyRouteSchema = z.object({
  code: z
    .string({ required_error: "Code is required" })
    .min(6, { message: "Invalid code length" })
    .max(6),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const isValidRouteRequest = validateVerificationRouteRequest({ request });
  if (!isValidRouteRequest) return redirect("/");

  const code = new URL(request.url).searchParams.get("code");

  if (code)
    return json({
      code,
    });

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const isValidRouteRequest = validateVerificationRouteRequest({ request });
  if (!isValidRouteRequest) return redirect("/");

  const { target, type } = isValidRouteRequest;

  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: VerifyRouteSchema.superRefine(async (data, ctx) => {
      const isValid = await isCodeValid({
        type,
        target,
        otp: data.code,
      });

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["code"],
          message: "Invalid Code",
        });
      }
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return json(
      {
        result: submission.reply(),
      },
      {
        status: 400,
      }
    );
  }

  // Delete the verification if it is valid code and reaches this point
  await deleteVerificationFromDatabase({
    target,
    type,
  });

  const verificationSession = await verificationSessionStorage.getSession();
  verificationSession.set("target", target);

  switch (type) {
    case "admin-onboarding": {
      return redirect("/admin/onboarding", {
        headers: {
          "set-cookie": await verificationSessionStorage.commitSession(
            verificationSession
          ),
        },
      });
    }
    case "customer-onboarding": {
      return redirect("/onboarding", {
        headers: {
          "set-cookie": await verificationSessionStorage.commitSession(
            verificationSession
          ),
        },
      });
    }
  }
};

export default function VerifyRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "verify-form",
    lastResult: actionData?.result,
    constraint: getZodConstraint(VerifyRouteSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VerifyRouteSchema });
    },
    defaultValue: {
      code: loaderData?.code,
    },
  });

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <Form method="POST" {...getFormProps(form)}>
        <h1 className="font-bold mb-2">One-Time Password</h1>
        <div>
          <Input
            {...getInputProps(fields.code, {
              type: "text",
            })}
          />
        </div>
        <p className="h-4 pt-2 mb-4 text-sm text-red-500">
          {fields.code?.errors}
        </p>
        <Button className="self-start">Submit</Button>
      </Form>
    </div>
  );
}
