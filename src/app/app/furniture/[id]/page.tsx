import { Suspense } from "react";
import { FurnitureDetail } from "@/features/furniture/furniture-detail";

export default function FurniturePage({ params }: PageProps<"/app/furniture/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 rounded-2xl border border-line bg-card" />}>
      <FurnitureDetail params={params} />
    </Suspense>
  );
}
