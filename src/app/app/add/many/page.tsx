import Link from "next/link";
import { Suspense } from "react";
import { AddManyLoader } from "@/features/items/add-many-loader";

export default function AddManyPage({ searchParams }: PageProps<"/app/add/many">) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add a whole drawer</h1>
          <p className="mt-1 text-sm text-soft">
            One photo of a drawer, shelf or desk. Every thing in it gets cut out and named.
          </p>
        </div>
        <Link href="/app/add" className="text-sm underline underline-offset-4">
          Add one thing instead
        </Link>
      </div>
      <Suspense fallback={<div className="mt-8 h-96 rounded-2xl border border-line bg-card" />}>
        <AddManyLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
