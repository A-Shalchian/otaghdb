"use client";

import { startTransition, useActionState, useState } from "react";
import { ErrorText, primaryButton, secondaryButton } from "@/components/form";
import type { PlaceTree } from "@/lib/places";
import { deleteItem, updateItem, type ItemFormState } from "./actions";
import { AiFieldInputs, KeptFieldInputs, type AiFields, type KeptFields } from "./item-fields";
import { PlacePicker, type PlaceValue } from "./place-picker";

const initialState: ItemFormState = { error: null };

export function ItemEditForm({
  itemId,
  tree,
  ai: initialAi,
  kept,
  place,
}: {
  itemId: number;
  tree: PlaceTree;
  ai: AiFields;
  kept: KeptFields;
  place: PlaceValue;
}) {
  const [state, formAction, saving] = useActionState(updateItem.bind(null, itemId), initialState);
  const [ai, setAi] = useState(initialAi);
  const [deleting, setDeleting] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-4"
    >
      <AiFieldInputs values={ai} onChange={(patch) => setAi((current) => ({ ...current, ...patch }))} />
      <PlacePicker
        tree={tree}
        initial={place}
        category={ai.category}
        clothingType={ai.clothingType || null}
        excludeContainerId={itemId}
      />
      <KeptFieldInputs initial={kept} />

      {state.error ? <ErrorText>{state.error}</ErrorText> : null}
      {state.saved && !saving ? <p className="text-sm text-accent">Saved.</p> : null}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (!window.confirm("Delete this item and its photos?")) return;
            setDeleting(true);
            startTransition(() => deleteItem(itemId));
          }}
          className={`${secondaryButton} text-red-700 dark:text-red-400`}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </form>
  );
}
