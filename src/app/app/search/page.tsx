import { Suspense } from "react";
import { SearchResults } from "@/features/search/search-results";

export default function SearchPage({ searchParams }: PageProps<"/app/search">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <Suspense fallback={<div className="h-40 rounded-2xl border border-line bg-card" />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
