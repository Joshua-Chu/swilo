import { useParams } from "@remix-run/react";

export default function OrderId() {
  const { id } = useParams();

  return (
    <div>
      <h1>Order Id: {id}</h1>
    </div>
  );
}
