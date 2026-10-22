import { Suspense } from "react";
import { PhonePage } from "@/features/phone/phone-page";

export default function Phone() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Open on your phone</h1>
        <p className="mt-1 text-sm text-soft">Take photos with the phone, while everything still runs on this laptop.</p>
      </div>
      <Suspense fallback={<div className="h-72 w-72 rounded-2xl border border-line bg-card" />}>
        <PhonePage />
      </Suspense>
    </div>
  );
}
