import { Suspense } from "react";
import { RoomOverview } from "@/features/furniture/room-overview";

export default function RoomPage({ params }: PageProps<"/app/rooms/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 rounded-2xl border border-line bg-card" />}>
      <RoomOverview params={params} />
    </Suspense>
  );
}
