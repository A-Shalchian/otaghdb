import { Suspense } from "react";
import { ListIndex } from "@/features/lists/list-pages";

export default function ListsPage() {
  return (
    <Suspense fallback={<div className="h-40 rounded-2xl border border-line bg-card" />}>
      <ListIndex />
    </Suspense>
  );
}
