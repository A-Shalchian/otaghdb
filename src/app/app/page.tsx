import { Suspense } from "react";
import { Inventory, InventorySkeleton } from "@/features/items/inventory";

export default function Home({ searchParams }: PageProps<"/app">) {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <Inventory searchParams={searchParams} />
    </Suspense>
  );
}
