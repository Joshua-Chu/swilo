import { InputField } from "@/components/input-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email.server";
import { prepareVerification } from "@/services/verification.server";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, redirect, useActionData } from "@remix-run/react";
import { z } from "zod";

const CustomerSignupSchema = z.object({
  email: z
    .string({ required_error: "Email should not be empty" })
    .email("Email is invalid"),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: CustomerSignupSchema.superRefine(async (val, ctx) => {
      const isExistingEmail = await db.query.user.findFirst({
        where: (users, { eq }) => eq(users.email, val.email),
      });

      if (isExistingEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "A user already exists with this email",
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

  const { email } = submission.value;
  const { verifyURL, redirectTo, otp } = await prepareVerification({
    request,
    type: "customer-onboarding",
    target: email,
  });

  // TODO: TEMPORARY IMPLEMENTATION
  // CHANGE THIS TO RESEND ONCE READY AND ADD ERROR HANDLING

  sendEmail({
    otp,
    verifyURL: verifyURL.toString(),
  });
  return redirect(redirectTo.toString());
};

export default function CustomerSignup() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "customer-signup-form",
    lastResult: actionData?.result,
    constraint: getZodConstraint(CustomerSignupSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CustomerSignupSchema });
    },
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome!</CardTitle>
        <CardDescription className="text-center">
          Let&apos;s start your journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="POST" {...getFormProps(form)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <InputField
                labelProps={{ htmlFor: fields.email.id, children: "Email" }}
                inputProps={{
                  ...getInputProps(fields.email, { type: "email" }),
                  autoFocus: true,
                  autoComplete: "email",
                }}
                errors={fields.email?.errors}
              />
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
