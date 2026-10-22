"use client";

import { fieldClass, Label, monoLabel } from "@/components/form";
import { CATEGORIES, CLOTHING_TYPES, DISCARD_LEVELS } from "@/lib/categories";

export type AiFields = {
  name: string;
  category: string;
  clothingType: string;
  color: string;
  tags: string;
  description: string;
  isContainer: boolean;
};

export type KeptFields = { wouldDiscard: string; whyKept: string; notes: string };

export const emptyAiFields: AiFields = {
  name: "",
  category: "other",
  clothingType: "",
  color: "",
  tags: "",
  description: "",
  isContainer: false,
};

export function AiFieldInputs({
  values,
  onChange,
  pending,
}: {
  values: AiFields;
  onChange: (patch: Partial<AiFields>) => void;
  pending?: boolean;
}) {
  const hint = pending ? "AI is looking..." : undefined;
  return (
    <>
      <Label text="Name">
        <input
          name="name"
          required
          maxLength={80}
          value={values.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder={hint ?? "black zip hoodie"}
          className={fieldClass}
        />
      </Label>

      <div className="grid grid-cols-2 gap-4">
        <Label text="Category">
          <select
            name="category"
            value={values.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className={fieldClass}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Label>
        {values.category === "clothing" ? (
          <Label text="Clothing type">
            <select
              name="clothingType"
              value={values.clothingType}
              onChange={(event) => onChange({ clothingType: event.target.value })}
              className={fieldClass}
            >
              <option value="">not sure</option>
              {CLOTHING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Label>
        ) : (
          <Label text="Color">
            <input
              name="color"
              maxLength={40}
              value={values.color}
              onChange={(event) => onChange({ color: event.target.value })}
              placeholder={hint ?? "black"}
              className={fieldClass}
            />
          </Label>
        )}
      </div>

      {values.category === "clothing" ? (
        <Label text="Color">
          <input
            name="color"
            maxLength={40}
            value={values.color}
            onChange={(event) => onChange({ color: event.target.value })}
            placeholder={hint ?? "black"}
            className={fieldClass}
          />
        </Label>
      ) : null}

      <Label text="Tags, comma separated">
        <input
          name="tags"
          maxLength={400}
          value={values.tags}
          onChange={(event) => onChange({ tags: event.target.value })}
          placeholder={hint ?? "hoodie, cotton, zip"}
          className={fieldClass}
        />
      </Label>

      <Label text="Description">
        <textarea
          name="description"
          rows={2}
          maxLength={300}
          value={values.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder={hint}
          className={fieldClass}
        />
      </Label>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="isContainer"
          checked={values.isContainer}
          onChange={(event) => onChange({ isContainer: event.target.checked })}
          className="size-4 accent-[var(--accent)]"
        />
        This holds other things (a bag, box, pouch)
      </label>
    </>
  );
}

export function KeptFieldInputs({ initial }: { initial: KeptFields }) {
  return (
    <>
      <fieldset className="flex flex-col gap-1.5">
        <legend className={`mb-1.5 ${monoLabel}`}>Would you throw it out?</legend>
        <div className="flex gap-2">
          {DISCARD_LEVELS.map((level) => (
            <label key={level} className="flex-1">
              <input
                type="radio"
                name="wouldDiscard"
                value={level}
                defaultChecked={level === initial.wouldDiscard}
                className="peer sr-only"
              />
              <span className="block cursor-pointer rounded-xl border border-line px-3 py-2 text-center text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                {level}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Label text="Why I keep it">
        <input
          name="whyKept"
          maxLength={280}
          defaultValue={initial.whyKept}
          placeholder="gift from my sister"
          className={fieldClass}
        />
      </Label>

      <Label text="Notes">
        <textarea name="notes" rows={2} maxLength={1000} defaultValue={initial.notes} className={fieldClass} />
      </Label>
    </>
  );
}
