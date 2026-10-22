import { Suspense } from "react";
import { ClosetIndex } from "@/features/closet/closet-index";

export default function ClosetsPage() {
  return (
    <Suspense fallback={<div className="h-40 rounded-2xl border border-line bg-card" />}>
      <ClosetIndex />
    </Suspense>
  );
}
