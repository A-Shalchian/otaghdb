import Link from "next/link";
import { Suspense } from "react";
import { AddItemLoader } from "@/features/items/add-item-loader";

export default function AddPage({ searchParams }: PageProps<"/app/add">) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add one thing</h1>
          <p className="mt-1 text-sm text-soft">Photo first. The AI cuts it out and names it, you choose where it lives.</p>
        </div>
        <Link href="/app/add/many" className="text-sm underline underline-offset-4">
          Photograph a whole drawer instead
        </Link>
      </div>
      <Suspense fallback={<div className="mt-8 h-96 rounded-2xl border border-line bg-card" />}>
        <AddItemLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
