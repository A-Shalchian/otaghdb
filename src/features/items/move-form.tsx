"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { ErrorText, primaryButton } from "@/components/form";
import type { PlaceTree } from "@/lib/places";
import { moveItem, type MoveState } from "./actions";
import { PlacePicker, type PlaceValue } from "./place-picker";

export function MoveForm({
  itemId,
  tree,
  initial,
  category,
  clothingType,
  isContainer,
}: {
  itemId: number;
  tree: PlaceTree;
  initial: PlaceValue;
  category: string;
  clothingType: string | null;
  isContainer: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<MoveState, FormData>(moveItem.bind(null, itemId), { error: null });
  const handled = useRef<MoveState | null>(null);

  // The effect runs again when a hidden modal is shown again, so remember which
  // result already closed it.
  useEffect(() => {
    if (state.moved && handled.current !== state) {
      handled.current = state;
      router.back();
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <PlacePicker
        tree={tree}
        initial={initial}
        category={category}
        clothingType={clothingType}
        excludeContainerId={isContainer ? itemId : undefined}
      />
      {state.error ? <ErrorText>{state.error}</ErrorText> : null}
      <button type="submit" disabled={pending} className={`self-start ${primaryButton}`}>
        {pending ? "Saving..." : "Moved it"}
      </button>
    </form>
  );
}
