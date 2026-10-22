import { Suspense } from "react";
import { ClosetView } from "@/features/closet/closet-view";

export default function ClosetPage({ params, searchParams }: PageProps<"/app/closet/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 rounded-2xl border border-line bg-card" />}>
      <ClosetView params={params} searchParams={searchParams} />
    </Suspense>
  );
}
