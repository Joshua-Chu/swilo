import { useParams } from "@remix-run/react";

export default function ProductPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>This is product page for: {id}</h1>
    </div>
  );
}
