import { Suspense } from "react";
import { ListDetail } from "@/features/lists/list-pages";

export default function ListPage({ params }: PageProps<"/app/lists/[id]">) {
  return (
    <Suspense fallback={<div className="h-40 rounded-2xl border border-line bg-card" />}>
      <ListDetail params={params} />
    </Suspense>
  );
}
