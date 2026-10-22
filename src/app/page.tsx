import { Suspense } from "react";
import { LandingPage } from "@/features/landing/landing-page";

export default function Landing({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={null}>
      <LandingPage searchParams={searchParams} />
    </Suspense>
  );
}
