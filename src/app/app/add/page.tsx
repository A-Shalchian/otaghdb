import { Suspense } from "react";
import { AddItemLoader } from "@/features/items/add-item-loader";

export default function AddPage({ searchParams }: PageProps<"/app/add">) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Add an item</h1>
      <p className="mt-1 text-sm text-soft">
        Photo first, then where it lives. AI naming comes in the next step.
      </p>
      <Suspense fallback={<div className="mt-8 h-96 rounded-2xl border border-line bg-card" />}>
        <AddItemLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
