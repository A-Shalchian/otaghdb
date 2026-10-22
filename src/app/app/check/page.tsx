import { CheckFlow } from "@/features/search/check-flow";

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Do I already own this?</h1>
      <p className="mt-1 text-sm text-soft">
        Photograph something in a store. It gets compared by look with everything you have saved.
      </p>
      <CheckFlow />
    </div>
  );
}
