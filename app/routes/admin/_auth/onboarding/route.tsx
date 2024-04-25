import { InputField } from "@/components/input-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminAuthSessionStorage } from "@/lib/auth/admin-session.server";
import { verificationSessionStorage } from "@/lib/verification-session.server";
import { signUp } from "@/services/auth.server";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";

const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  .max(100, { message: "Password is too long" });

const PasswordAndConfirmPasswordSchema = z
  .object({ password: PasswordSchema, confirmPassword: PasswordSchema })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "The passwords must match",
      });
    }
  });

const adminOnboardingSchema = z
  .object({
    firstName: z
      .string({ required_error: "Must not be empty" })
      .min(3, "First name too short")
      .max(100, "First name too long"),
    lastName: z
      .string({ required_error: "Must not be empty" })
      .min(3, "Last name too short")
      .max(100, "Last name too long"),
  })
  .and(PasswordAndConfirmPasswordSchema);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const verificationSession = await verificationSessionStorage.getSession(
    request.headers.get("cookie")
  );

  const verificationEmail = verificationSession.get("target");
  if (!verificationEmail) return redirect("/admin/signup");

  return json({
    email: verificationEmail,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const verificationSession = await verificationSessionStorage.getSession(
    request.headers.get("cookie")
  );

  const verificationEmail = verificationSession.get("target");
  if (!verificationEmail) return redirect("/admin/signup");

  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: adminOnboardingSchema.transform(async (data) => {
      const session = await signUp({
        email: verificationEmail,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      return { session };
    }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value.session) {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { sessionId, sessionExpirationDate } = submission.value.session;

  const adminAuthSession = await adminAuthSessionStorage.getSession(
    request.headers.get("cookie")
  );

  adminAuthSession.set("sessionId", sessionId);
  const headers = new Headers();

  headers.append(
    "set-cookie",
    await adminAuthSessionStorage.commitSession(adminAuthSession, {
      expires: sessionExpirationDate,
    })
  );

  headers.append(
    "set-cookie",
    await verificationSessionStorage.destroySession(verificationSession)
  );

  return redirect("/admin/dashboard", { headers });
};

export default function Onboarding() {
  // const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "admin-onboarding-form",
    lastResult: actionData?.result,
    constraint: getZodConstraint(adminOnboardingSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: adminOnboardingSchema });
    },
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Admin Onboarding</CardTitle>
        <CardDescription>
          Please fill out the information needed to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="POST" {...getFormProps(form)}>
          <div className="grid gap-2 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                labelProps={{
                  htmlFor: fields.firstName.id,
                  children: "First name",
                }}
                inputProps={{
                  ...getInputProps(fields.firstName, { type: "text" }),
                  autoComplete: "given-name",
                }}
                errors={fields.firstName.errors}
              />

              <InputField
                labelProps={{
                  htmlFor: fields.lastName.id,
                  children: "Last name",
                }}
                inputProps={{
                  ...getInputProps(fields.lastName, { type: "text" }),
                  autoComplete: "family-name",
                }}
                errors={fields.lastName.errors}
              />
            </div>
            <div className="grid gap-2">
              <InputField
                labelProps={{
                  htmlFor: fields.password.id,
                  children: "Password",
                }}
                inputProps={{
                  ...getInputProps(fields.password, { type: "password" }),
                }}
                errors={fields.password.errors}
              />
            </div>
            <div className="grid gap-2">
              <InputField
                labelProps={{
                  htmlFor: fields.confirmPassword.id,
                  children: "Confirm Password",
                }}
                inputProps={{
                  ...getInputProps(fields.confirmPassword, {
                    type: "password",
                  }),
                }}
                errors={fields.confirmPassword.errors}
              />
            </div>
          </div>
          <Button className="w-full">Submit</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
