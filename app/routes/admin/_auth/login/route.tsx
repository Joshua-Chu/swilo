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
import { adminLogin } from "@/services/auth.server";
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

const adminLoginSchema = z.object({
  email: z
    .string({ required_error: "Email must not be empty" })
    .email("Invalid Email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password is too short" })
    .max(100, { message: "Password is too long" }),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const adminAuthSession = await adminAuthSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = adminAuthSession.get("sessionId");
  if (sessionId) return redirect("/admin/dashboard");

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: adminLoginSchema.transform(async (data, ctx) => {
      const session = await adminLogin({ ...data });
      if (!session) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "Invalid email or password",
        });

        return z.NEVER;
      }

      return session;
    }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value?.session) {
    return json(
      {
        result: submission.reply(),
      },
      {
        status: submission.status === "error" ? 400 : 200,
      }
    );
  }

  const { sessionId, sessionExpirationDate } = submission.value.session;

  const adminAuthSession = await adminAuthSessionStorage.getSession(
    request.headers.get("cookie")
  );

  adminAuthSession.set("sessionId", sessionId);

  return redirect("/admin/dashboard", {
    headers: {
      "set-cookie": await adminAuthSessionStorage.commitSession(
        adminAuthSession,
        {
          expires: sessionExpirationDate,
        }
      ),
    },
  });
};

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "admin-login-form",
    lastResult: actionData?.result,
    constraint: getZodConstraint(adminLoginSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: adminLoginSchema });
    },
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="POST" {...getFormProps(form)}>
          <div className="grid gap-4">
            <InputField
              labelProps={{ htmlFor: fields.email.id, children: "Email" }}
              inputProps={{
                ...getInputProps(fields.email, { type: "email" }),
                autoComplete: "email",
                autoFocus: true,
              }}
              errors={fields.email.errors}
              className="grid gap-2"
            />
            <InputField
              labelProps={{ htmlFor: fields.password.id, children: "Passwrod" }}
              inputProps={{
                ...getInputProps(fields.password, { type: "password" }),
              }}
              errors={fields.password.errors}
              className="grid gap-2"
            />

            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
