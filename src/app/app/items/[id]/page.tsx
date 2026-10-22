import { Suspense } from "react";
import { ItemDetail } from "@/features/items/item-detail";

export default function ItemPage({ params }: PageProps<"/app/items/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 rounded-2xl border border-line bg-card" />}>
      <ItemDetail params={params} />
    </Suspense>
  );
}
