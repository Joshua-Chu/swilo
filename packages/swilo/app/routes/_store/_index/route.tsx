import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { message } = context;

  return {
    message,
  };
};

export default function StorefrontHome() {
  const { message } = useLoaderData<typeof loader>();

  console.log("message", message);
  return <div className="text-3xl text-red-600">Hello Storefrontss</div>;
}
