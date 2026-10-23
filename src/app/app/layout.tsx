import Link from "next/link";
import { Suspense } from "react";
import { AppMenu } from "@/components/app-menu";
import { Wordmark } from "@/components/wordmark";

export default function AppLayout({ children, modal }: LayoutProps<"/app">) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/app" aria-label="OtaghDB home" className="shrink-0">
            <Wordmark className="text-[1.6rem]" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/app/add"
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-opacity hover:opacity-85"
            >
              Add
            </Link>
            <Suspense fallback={<div className="h-[42px] w-[42px] rounded-full border border-line bg-card sm:w-36" />}>
              <AppMenu />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      {modal}
    </>
  );
}
