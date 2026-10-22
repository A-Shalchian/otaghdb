import { Suspense } from "react";
import { PixelRoomPage } from "@/features/room/pixel-room-page";

export default function PixelPage({ params }: PageProps<"/app/rooms/[id]/pixel">) {
  return (
    <Suspense fallback={<div className="aspect-[16/10] w-full rounded-xl border border-line bg-card" />}>
      <PixelRoomPage params={params} />
    </Suspense>
  );
}
