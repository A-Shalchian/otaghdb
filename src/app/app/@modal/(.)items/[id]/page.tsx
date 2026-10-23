import { Suspense } from "react";
import { Modal } from "@/components/modal";
import { ItemPeek } from "@/features/items/item-peek";

export default function ItemModal({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Modal label="Item">
      <Suspense fallback={<div className="h-96" />}>
        <ItemPeek params={params} />
      </Suspense>
    </Modal>
  );
}
